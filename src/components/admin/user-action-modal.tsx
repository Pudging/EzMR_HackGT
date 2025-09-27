"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

type UserActionLog = {
  id: string;
  action: "ACCESS" | "CREATE" | "UPDATE" | "DELETE" | "LOGIN" | "LOGOUT";
  resource: string;
  resourceId?: string | null;
  method?: string | null;
  route?: string | null;
  ip?: string | null;
  userAgent?: string | null;
  success: boolean;
  createdAt: string;
  metadata?: unknown;
};

export function UserActionModalTrigger({
  userId,
  userName,
}: {
  userId: string;
  userName: string | null | undefined;
}) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [logs, setLogs] = useState<UserActionLog[]>([]);
  const [error, setError] = useState<string | null>(null);

  const fetchLogs = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(`/api/admin/users/${userId}/logs?limit=20`, {
        method: "GET",
        headers: { "content-type": "application/json" },
      });
      if (!res.ok) {
        throw new Error(`Failed to fetch logs: ${res.status}`);
      }
      const data = (await res.json()) as { logs: UserActionLog[] };
      setLogs(data.logs);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    if (open) void fetchLogs();
  }, [open, fetchLogs]);

  const displayName = useMemo(() => userName ?? "User", [userName]);

  return (
    <>
      <Button variant="outline" size="sm" onClick={() => setOpen(true)}>
        View Details
      </Button>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setOpen(false)}
          />
          <Card className="relative z-10 w-[95vw] max-w-2xl">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>{displayName} – Recent Actions</CardTitle>
              <Button variant="ghost" size="sm" onClick={() => setOpen(false)}>
                Close
              </Button>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-muted-foreground text-sm">Loading…</div>
              ) : error ? (
                <div className="text-sm text-red-600">{error}</div>
              ) : logs.length === 0 ? (
                <div className="text-muted-foreground text-sm">
                  No recent actions.
                </div>
              ) : (
                <div className="max-h-[60vh] space-y-3 overflow-auto pr-2">
                  {logs.map((log) => (
                    <div key={log.id} className="rounded-md border p-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Badge variant={log.success ? "default" : "outline"}>
                            {log.action}
                          </Badge>
                          <span className="text-sm">
                            {log.resource}
                            {log.resourceId ? ` (${log.resourceId})` : ""}
                          </span>
                        </div>
                        <span className="text-muted-foreground text-xs">
                          {new Date(log.createdAt).toLocaleString()}
                        </span>
                      </div>
                      <div className="text-muted-foreground mt-2 grid grid-cols-1 gap-1 text-xs sm:grid-cols-2">
                        {log.route ? (
                          <div>
                            <span className="font-medium">Route:</span>{" "}
                            {log.route}
                          </div>
                        ) : null}
                        {log.method ? (
                          <div>
                            <span className="font-medium">Method:</span>{" "}
                            {log.method}
                          </div>
                        ) : null}
                        {log.ip ? (
                          <div>
                            <span className="font-medium">IP:</span> {log.ip}
                          </div>
                        ) : null}
                        {log.userAgent ? (
                          <div className="truncate">
                            <span className="font-medium">UA:</span>{" "}
                            {log.userAgent}
                          </div>
                        ) : null}
                      </div>
                      {log.metadata ? (
                        <pre className="bg-muted mt-2 rounded p-2 text-xs break-words whitespace-pre-wrap">
                          {JSON.stringify(log.metadata, null, 2)}
                        </pre>
                      ) : null}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </>
  );
}
