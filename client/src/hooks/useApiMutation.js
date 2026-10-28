import { useCallback, useRef, useState } from "react";

/**
 * Изменяющий запрос (запись, покупка, отмена): держит loading/error
 * и отдаёт результат вызывающему коду, не решая за него, что делать дальше.
 *
 * @param {(...args: unknown[]) => Promise<unknown>} mutator
 */
export function useApiMutation(mutator) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const mutatorRef = useRef(mutator);
  mutatorRef.current = mutator;

  const reset = useCallback(() => setError(null), []);

  const run = useCallback(async (...args) => {
    setLoading(true);
    setError(null);

    try {
      return await mutatorRef.current(...args);
    } catch (cause) {
      setError(cause);
      throw cause;
    } finally {
      setLoading(false);
    }
  }, []);

  return { run, loading, error, reset };
}
