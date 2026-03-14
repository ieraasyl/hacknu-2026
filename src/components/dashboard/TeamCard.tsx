import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { ConfirmButton } from '@/components/ui/confirm-button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import type { TeamData } from '@/lib/team.server';

export type TeamCardProps = {
  team: {
    data: TeamData | null;
    loading: boolean;
    isCaptain: boolean;
    inviteUrl: string;
  };
  createForm: {
    name: string;
    setName: (v: string) => void;
    loading: boolean;
    error: string | null;
    onSubmit: (e: React.FormEvent) => void;
  };
  joinForm: {
    input: string;
    setInput: (v: string) => void;
    loading: boolean;
    error: string | null;
    onSubmit: (e: React.FormEvent) => void;
  };
  actions: {
    copied: boolean;
    onCopyLink: () => void;
    loading: string | null;
    error: string | null;
    onKick: (targetUserId: string) => void;
    onLeave: () => void;
    onDissolve: () => void;
  };
};

export default function TeamCard({ team, createForm, joinForm, actions }: TeamCardProps) {
  const { t } = useTranslation();
  const { data: teamData, loading: teamLoading, isCaptain, inviteUrl } = team;
  const {
    name: createName,
    setName: setCreateName,
    loading: createLoading,
    error: createError,
    onSubmit: handleCreate,
  } = createForm;
  const {
    input: joinInput,
    setInput: setJoinInput,
    loading: joinLoading,
    error: joinError,
    onSubmit: handleJoin,
  } = joinForm;
  const {
    copied,
    onCopyLink: handleCopyLink,
    loading: actionLoading,
    error: actionError,
    onKick: handleKick,
    onLeave: handleLeave,
    onDissolve: handleDissolve,
  } = actions;

  return (
    <Card className="border-hacknu-border bg-hacknu-dark-card">
      <CardHeader className="border-b border-hacknu-border">
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-full bg-hacknu-purple/60" />
          <div className="h-3 w-3 rounded-full bg-hacknu-purple/30" />
          <div className="h-3 w-3 rounded-full bg-hacknu-purple/10" />
          <span className="ml-2 text-xs text-hacknu-text-muted">team.sh</span>
        </div>
      </CardHeader>
      <CardContent className="pt-4">
        {teamLoading ? (
          <div className="space-y-3 py-4">
            <div className="h-4 w-48 animate-pulse rounded bg-hacknu-border" />
            <div className="h-4 w-64 animate-pulse rounded bg-hacknu-border" />
          </div>
        ) : teamData ? (
          <div className="space-y-4">
            <div>
              <p className="mb-1 text-xs tracking-wider text-hacknu-text-muted uppercase">
                {t('dashboard.inviteLink')}
              </p>
              <div className="flex items-center gap-2">
                <code className="flex-1 truncate rounded border border-hacknu-border bg-hacknu-dark px-2 py-1 text-xs text-hacknu-text-muted">
                  {inviteUrl}
                </code>
                <Button
                  size="sm"
                  variant="outline"
                  className="shrink-0 border-hacknu-border text-xs tracking-wider text-hacknu-text-muted uppercase hover:border-hacknu-green/50 hover:text-hacknu-green"
                  onClick={handleCopyLink}
                >
                  {copied ? t('dashboard.copied') : t('dashboard.copy')}
                </Button>
              </div>
            </div>

            <Separator className="border-hacknu-border" />

            <div>
              <p className="mb-2 text-xs tracking-wider text-hacknu-text-muted uppercase">
                {t('dashboard.members', { count: teamData.members.length })}
              </p>
              <ul className="space-y-2">
                {teamData.members.map((member) => (
                  <li
                    key={member.id}
                    className="flex items-center justify-between gap-2 font-mono text-sm"
                  >
                    <span className="flex items-center gap-2 truncate">
                      <span className="text-hacknu-green">{'>'}</span>
                      <span className="truncate text-hacknu-text">{member.fullName}</span>
                      {member.isCaptain && (
                        <span className="rounded border border-hacknu-purple/40 px-1 py-0.5 text-xs text-hacknu-purple">
                          {t('dashboard.captain')}
                        </span>
                      )}
                    </span>
                    {isCaptain && !member.isCaptain && (
                      <ConfirmButton
                        label={t('dashboard.kick')}
                        confirmLabel={t('dashboard.confirmAction')}
                        onConfirm={() => handleKick(member.id)}
                        loading={actionLoading === member.id}
                        loadingLabel="..."
                        variant="outline"
                        size="sm"
                        className="shrink-0 border-hacknu-border px-2 text-xs tracking-wider text-hacknu-text-muted uppercase hover:border-red-500/50 hover:text-red-400"
                      />
                    )}
                  </li>
                ))}
                {Array.from({ length: 4 - teamData.members.length }).map((_, i) => (
                  <li key={`empty-${i}`} className="font-mono text-sm text-hacknu-text-muted/40">
                    <span className="mr-2 text-hacknu-text-muted/40">{'>'}</span>
                    {t('dashboard.emptySlot')}
                  </li>
                ))}
              </ul>
            </div>

            {actionError && <p className="text-xs text-red-400">[error] {actionError}</p>}

            <div className="flex justify-end pt-2">
              {isCaptain ? (
                <ConfirmButton
                  label={t('dashboard.dissolveTeam')}
                  confirmLabel={t('dashboard.confirmAction')}
                  onConfirm={handleDissolve}
                  loading={actionLoading === 'dissolve'}
                  loadingLabel={t('dashboard.dissolving')}
                  variant="outline"
                  size="sm"
                  className="border-red-500/30 text-xs tracking-wider text-red-400/70 uppercase hover:border-red-500 hover:text-red-400"
                />
              ) : (
                <ConfirmButton
                  label={t('dashboard.leaveTeam')}
                  confirmLabel={t('dashboard.confirmAction')}
                  onConfirm={handleLeave}
                  loading={actionLoading === 'leave'}
                  loadingLabel={t('dashboard.leaving')}
                  variant="outline"
                  size="sm"
                  className="border-hacknu-border text-xs tracking-wider text-hacknu-text-muted uppercase hover:border-red-500/50 hover:text-red-400"
                />
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-6 py-2">
            <div>
              <p className="mb-3 text-xs tracking-wider text-hacknu-text-muted uppercase">
                {t('dashboard.createTeam')}
              </p>
              <form onSubmit={handleCreate} className="flex gap-2">
                <Input
                  placeholder={t('dashboard.teamNamePlaceholder')}
                  value={createName}
                  onChange={(e) => setCreateName(e.target.value)}
                  disabled={createLoading}
                  className="flex-1 border-hacknu-border bg-hacknu-dark font-mono text-xs text-hacknu-text placeholder:text-hacknu-text-muted/50"
                />
                <Button
                  type="submit"
                  disabled={createLoading || !createName.trim()}
                  className="shrink-0 bg-hacknu-green text-xs font-bold tracking-wider text-hacknu-dark uppercase hover:bg-hacknu-green/80"
                >
                  {createLoading ? '...' : t('dashboard.create')}
                </Button>
              </form>
              {createError && <p className="mt-1 text-xs text-red-400">[error] {createError}</p>}
            </div>

            <Separator className="border-hacknu-border" />

            <div>
              <p className="mb-3 text-xs tracking-wider text-hacknu-text-muted uppercase">
                {t('dashboard.joinTeam')}
              </p>
              <form onSubmit={handleJoin} className="flex gap-2">
                <Input
                  placeholder={t('dashboard.joinPlaceholder')}
                  value={joinInput}
                  onChange={(e) => setJoinInput(e.target.value)}
                  disabled={joinLoading}
                  className="flex-1 border-hacknu-border bg-hacknu-dark font-mono text-xs text-hacknu-text placeholder:text-hacknu-text-muted/50"
                />
                <Button
                  type="submit"
                  disabled={joinLoading || !joinInput.trim()}
                  className="shrink-0 border border-hacknu-border bg-transparent text-xs tracking-wider text-hacknu-purple uppercase hover:border-hacknu-purple/50 hover:bg-hacknu-purple/10"
                >
                  {joinLoading ? '...' : t('dashboard.join')}
                </Button>
              </form>
              {joinError && <p className="mt-1 text-xs text-red-400">[error] {joinError}</p>}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
