import { Card, CardContent, CardHeader } from '@/components/ui/card';
import type { Session } from '@/lib/types';
import type { Participant } from '@/db/schema';

export default function ProfileCard({
  session,
  participant,
}: {
  session: Session;
  participant: Participant;
}) {
  return (
    <Card className="mb-6 border-hacknu-border bg-hacknu-dark-card">
      <CardHeader className="border-b border-hacknu-border">
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-full bg-hacknu-green/60" />
          <div className="h-3 w-3 rounded-full bg-yellow-500/60" />
          <div className="h-3 w-3 rounded-full bg-red-500/60" />
          <span className="ml-2 text-xs text-hacknu-text-muted">profile.json</span>
        </div>
      </CardHeader>
      <CardContent>
        <pre className="overflow-x-auto text-sm leading-relaxed text-hacknu-text-muted">
          <code>
            {`{
  "name": "${participant.fullName}",
  "email": "${session.user.email}",
  "role": "participant",
  "event": "HackNU/26",
  "registered": true
}`}
          </code>
        </pre>
      </CardContent>
    </Card>
  );
}
