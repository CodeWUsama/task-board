import { useState, useCallback } from 'react';

export function useShareLink() {
  const [copiedTaskId, setCopiedTaskId] = useState<string | null>(null);

  const copyShareLink = useCallback((taskId: string, projectSlug: string) => {
    if (typeof window === 'undefined') return;
    const url = new URL(window.location.origin + window.location.pathname);
    url.searchParams.set("project", projectSlug);
    url.searchParams.set("task", taskId);
    navigator.clipboard.writeText(url.toString()).then(() => {
      setCopiedTaskId(taskId);
      setTimeout(() => setCopiedTaskId(null), 2000);
    });
  }, []);

  return { copiedTaskId, copyShareLink };
}
