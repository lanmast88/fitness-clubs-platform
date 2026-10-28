import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Загрузка данных из API: один источник состояния loading/error/data
 * для всех страниц, чтобы не повторять useEffect + три useState.
 *
 * @param {(signal: AbortSignal) => Promise<unknown>} fetcher
 * @param {unknown[]} deps — при их изменении запрос повторяется
 * @param {{ enabled?: boolean, initialData?: unknown }} options
 */
export function useApiQuery(fetcher, deps = [], { enabled = true, initialData = null } = {}) {
  const [data, setData] = useState(initialData);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(enabled);
  const [reloadToken, setReloadToken] = useState(0);

  // Храним fetcher в ref: его пересоздание в рендере не должно перезапускать запрос.
  const fetcherRef = useRef(fetcher);
  fetcherRef.current = fetcher;

  const reload = useCallback(() => setReloadToken((token) => token + 1), []);

  useEffect(() => {
    if (!enabled) {
      setLoading(false);
      return undefined;
    }

    const controller = new AbortController();
    let active = true;

    setLoading(true);
    setError(null);

    fetcherRef
      .current(controller.signal)
      .then((result) => {
        if (active) setData(result);
      })
      .catch((cause) => {
        if (active && cause?.name !== "AbortError") setError(cause);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
      controller.abort();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, reloadToken, ...deps]);

  return { data, error, loading, reload, setData };
}
