import React, { useEffect, useMemo, useRef } from 'react';
import { Canvas, useThree, type CanvasProps, type ThreeEvent } from '@react-three/fiber';
import { shaderMaterial, useTrailTexture } from '@react-three/drei';
import * as THREE from 'three';

interface GooeyFilterProps {
  id?: string;
  strength?: number;
}

interface DotMaterialUniforms {
  resolution: THREE.Vector2;
  mouseTrail: THREE.Texture | null;
  gridSize: number;
  pixelColor: THREE.Color;
}

interface SceneProps {
  gridSize: number;
  trailSize: number;
  maxAge: number;
  interpolate: number;
  easingFunction: (x: number) => number;
  pixelColor: string;
}

interface PixelTrailProps {
  gridSize?: number;
  trailSize?: number;
  maxAge?: number;
  interpolate?: number;
  easingFunction?: (x: number) => number;
  canvasProps?: Partial<CanvasProps>;
  glProps?: WebGLContextAttributes & { powerPreference?: string };
  gooeyFilter?: { id: string; strength: number };
  gooeyEnabled?: boolean;
  gooStrength?: number;
  color?: string;
  className?: string;
  eventSource?: React.RefObject<HTMLElement | null>;
  eventPrefix?: 'offset' | 'client' | 'page' | 'layer' | 'screen';
}

const GooeyFilter: React.FC<GooeyFilterProps> = ({ id = 'goo-filter', strength = 10 }) => {
  return (
    <svg className="pointer-events-none absolute z-10 overflow-hidden">
      <defs>
        <filter id={id}>
          <feGaussianBlur in="SourceGraphic" stdDeviation={strength} result="blur" />
          <feColorMatrix
            in="blur"
            type="matrix"
            values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 19 -9"
            result="goo"
          />
          <feComposite in="SourceGraphic" in2="goo" operator="atop" />
        </filter>
      </defs>
    </svg>
  );
};

type DotMaterialType = THREE.ShaderMaterial & {
  uniforms: {
    resolution: { value: THREE.Vector2 };
    mouseTrail: { value: THREE.Texture | null };
    gridSize: { value: number };
    pixelColor: { value: THREE.Color };
  };
};
type DotMaterialConstructor = new () => DotMaterialType;

const DotMaterial = shaderMaterial(
  {
    resolution: new THREE.Vector2(),
    mouseTrail: null,
    gridSize: 100,
    pixelColor: new THREE.Color('#ffffff'),
  } satisfies DotMaterialUniforms,
  `
    varying vec2 vUv;
    void main() {
      gl_Position = vec4(position.xy, 0.0, 1.0);
    }
  `,
  `
    uniform vec2 resolution;
    uniform sampler2D mouseTrail;
    uniform float gridSize;
    uniform vec3 pixelColor;

    vec2 coverUv(vec2 uv) {
      vec2 s = resolution.xy / max(resolution.x, resolution.y);
      vec2 newUv = (uv - 0.5) * s + 0.5;
      return clamp(newUv, 0.0, 1.0);
    }

    float sdfCircle(vec2 p, float r) {
        return length(p - 0.5) - r;
    }

    void main() {
      vec2 screenUv = gl_FragCoord.xy / resolution;
      vec2 uv = coverUv(screenUv);

      vec2 gridUv = fract(uv * gridSize);
      vec2 gridUvCenter = (floor(uv * gridSize) + 0.5) / gridSize;

      float trail = texture2D(mouseTrail, gridUvCenter).r;

      gl_FragColor = vec4(pixelColor, trail);
    }
  `,
);

function Scene({
  gridSize,
  trailSize,
  maxAge,
  interpolate,
  easingFunction,
  pixelColor,
}: SceneProps) {
  const size = useThree((s) => s.size);
  const viewport = useThree((s) => s.viewport);
  const invalidate = useThree((s) => s.invalidate);
  const lastMoveTime = useRef(0);

  const dotMaterial = useMemo(() => {
    const mat = new (DotMaterial as unknown as DotMaterialConstructor)();
    mat.uniforms.pixelColor.value = new THREE.Color(pixelColor);
    mat.transparent = true;
    mat.depthWrite = false;
    return mat;
  }, [pixelColor]);

  const [trail, onMove] = useTrailTexture({
    size: 256,
    radius: trailSize,
    maxAge,
    interpolate: interpolate || 0.1,
    ease: easingFunction || ((x: number) => x),
  }) as [THREE.Texture | null, (e: ThreeEvent<PointerEvent>) => void];

  useEffect(() => {
    if (!trail) return;
    const t = trail;
    // eslint-disable-next-line react-hooks/immutability
    t.minFilter = THREE.NearestFilter;
    t.magFilter = THREE.NearestFilter;
    t.wrapS = THREE.ClampToEdgeWrapping;
    t.wrapT = THREE.ClampToEdgeWrapping;
    t.needsUpdate = true;
  }, [trail]);

  const scale = Math.max(viewport.width, viewport.height) / 2;

  const handleMove = (e: ThreeEvent<PointerEvent>) => {
    lastMoveTime.current = Date.now();
    onMove(e);
    invalidate();
  };

  const decayWindowMs = Math.max(maxAge * 3, 500);
  const frameSkip = useRef(0);
  useEffect(() => {
    let rafId: number;
    const tick = () => {
      rafId = requestAnimationFrame(tick);
      if (Date.now() - lastMoveTime.current < decayWindowMs) {
        frameSkip.current += 1;
        if (frameSkip.current % 2 === 0) invalidate();
      }
    };
    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [decayWindowMs, invalidate]);

  return (
    <mesh scale={[scale, scale, 1]} onPointerMove={handleMove}>
      <planeGeometry args={[2, 2]} />
      <primitive
        object={dotMaterial}
        gridSize={gridSize}
        resolution={[size.width * viewport.dpr, size.height * viewport.dpr]}
        mouseTrail={trail}
      />
    </mesh>
  );
}

export default function PixelTrail({
  gridSize = 40,
  trailSize = 0.1,
  maxAge = 250,
  interpolate = 5,
  easingFunction = (x: number) => x,
  canvasProps = {},
  glProps = {
    antialias: false,
    powerPreference: 'high-performance',
    alpha: true,
  },
  gooeyFilter,
  gooeyEnabled,
  gooStrength,
  color = '#ffffff',
  className = '',
  eventSource,
  eventPrefix,
}: PixelTrailProps) {
  const effectiveFilter =
    gooeyEnabled === false
      ? undefined
      : gooeyFilter
        ? { ...gooeyFilter, strength: gooStrength ?? gooeyFilter.strength }
        : gooeyEnabled
          ? { id: 'goo-filter', strength: gooStrength ?? 10 }
          : undefined;

  return (
    <>
      {effectiveFilter && (
        <GooeyFilter id={effectiveFilter.id} strength={effectiveFilter.strength} />
      )}
      <Canvas
        {...canvasProps}
        gl={glProps}
        frameloop="demand"
        dpr={[1, 1]}
        eventSource={eventSource as React.RefObject<HTMLElement> | undefined}
        eventPrefix={eventPrefix ?? 'offset'}
        className={`pointer-events-none absolute inset-0 z-10 ${className}`}
        style={
          effectiveFilter
            ? { filter: `url(#${effectiveFilter.id})`, ...(canvasProps?.style || {}) }
            : canvasProps?.style
        }
      >
        <Scene
          gridSize={gridSize}
          trailSize={trailSize}
          maxAge={maxAge}
          interpolate={interpolate}
          easingFunction={easingFunction}
          pixelColor={color}
        />
      </Canvas>
    </>
  );
}
