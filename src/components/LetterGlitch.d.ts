interface LetterGlitchProps {
  glitchColors?: string[];
  glitchSpeed?: number;
  centerVignette?: boolean;
  outerVignette?: boolean;
  smooth?: boolean;
  characters?: string;
}

declare const LetterGlitch: React.FC<LetterGlitchProps>;
export default LetterGlitch;
