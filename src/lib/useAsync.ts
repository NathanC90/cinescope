// One place for the fetch lifecycle: loading, error, and aborting the previous request
// so a slow response can't overwrite a newer one (the classic search race condition).
import { useState, useEffect } from "react";

interface State<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

/**
 * Runs `task` whenever `deps` change, passing it an AbortSignal.
 * Pass `skip` to stay idle (e.g. an empty search box).
 */
export function useAsync<T>(
  task: (signal: AbortSignal) => Promise<T>,
  deps: unknown[],
  skip = false,
): State<T> {
  const [state, setState] = useState<State<T>>({ data: null, loading: !skip, error: null });

  useEffect(() => {
    if (skip) {
      setState({ data: null, loading: false, error: null });
      return;
    }

    const controller = new AbortController();
    setState((s) => ({ ...s, loading: true, error: null }));

    task(controller.signal).then(
      (data) => {
        if (!controller.signal.aborted) setState({ data, loading: false, error: null });
      },
      (err: unknown) => {
        if (controller.signal.aborted) return; // superseded, not a real failure
        const message = err instanceof Error ? err.message : "Something went wrong.";
        setState({ data: null, loading: false, error: message });
      },
    );

    return () => controller.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, skip]);

  return state;
}
