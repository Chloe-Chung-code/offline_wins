import React from "react";
import { useRouter } from "next/navigation";
import { getSessions } from "@/lib/storage";
import * as Typography from "@/components/ui/Typography";
import { formatDuration } from "@/lib/format";

export default function SessionList() {
  const router = useRouter();
  const sessions = getSessions().sort((a, b) =>
    new Date(b.startTime).getTime() - new Date(a.startTime).getTime()
  );

  // Group by Month
  const grouped = sessions.reduce((acc, session) => {
    const date = new Date(session.date);
    const monthKey = date.toLocaleDateString("en-US", { month: "long", year: "numeric" });
    if (!acc[monthKey]) acc[monthKey] = [];
    acc[monthKey].push(session);
    return acc;
  }, {} as Record<string, typeof sessions>);

  return (
    <div className="w-full space-y-8">
      {Object.entries(grouped).map(([month, monthSessions]) => (
        <div key={month}>
          <Typography.Label className="mb-4 block sticky top-0 bg-background py-2 z-10 border-b border-[#E2E8F0]">
            {month}
          </Typography.Label>
          <div className="space-y-3">
            {monthSessions.map((session) => {
                const startTime = new Date(session.startTime);
                const sessionDate = new Date(session.date);
                const hasActivities = session.activities.length > 0;
                const hasMood = session.moodRating != null;
                const hasDetails = hasActivities || hasMood;
                return (
                  <div
                    key={session.id}
                    onClick={() => router.push(`/log?edit=${session.id}`)}
                    className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl p-4 flex justify-between items-center transition-all hover:border-[#CBD5E1] cursor-pointer"
                  >
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-base font-semibold text-[#0F172A]">
                          {formatDuration(session.durationMinutes)}
                        </span>
                        {hasMood && (
                          <span className="text-sm">
                            {["😫", "😕", "😐", "😊", "🤩"][session.moodRating! - 1]}
                          </span>
                        )}
                      </div>
                      {hasActivities ? (
                        <div className="flex flex-wrap gap-1.5">
                          {session.activities.map(act => (
                            <span key={act} className="text-xs px-2 py-0.5 rounded-full bg-[#E2E8F0] text-[#475569]">
                              {act}
                            </span>
                          ))}
                        </div>
                      ) : !hasDetails && (
                        <span className="text-xs text-[#94A3B8]">Quick session</span>
                      )}
                    </div>
                    <div className="text-right">
                      <Typography.Caption className="block text-text-secondary">
                        {startTime.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}
                      </Typography.Caption>
                      <Typography.Caption className="text-text-secondary opacity-50 block">
                        {sessionDate.toLocaleDateString("en-US", { weekday: "short", day: "numeric" })}
                      </Typography.Caption>
                    </div>
                  </div>
                );
            })}
          </div>
        </div>
      ))}
      {sessions.length === 0 && (
          <div className="text-center py-12 text-text-secondary">
              <Typography.Body>No sessions recorded yet.</Typography.Body>
          </div>
      )}
    </div>
  );
}
