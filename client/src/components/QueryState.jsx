/**
 * Единое отображение состояний загрузки/ошибки/пустого списка.
 * Страницы описывают только успешный случай.
 */
function QueryState({ loading, error, isEmpty = false, emptyText = "Пока ничего нет.", onRetry, children }) {
  if (loading) {
    return <p className="py-6 text-sm text-slate-400">Загружаем данные…</p>;
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 p-4">
        <p className="text-sm text-rose-200">{error.message}</p>
        {onRetry && (
          <button
            type="button"
            onClick={onRetry}
            className="mt-3 rounded-full border border-white/20 px-4 py-1.5 text-xs font-medium text-slate-100 transition hover:bg-white/10"
          >
            Повторить
          </button>
        )}
      </div>
    );
  }

  if (isEmpty) {
    return <p className="py-6 text-sm text-slate-400">{emptyText}</p>;
  }

  return children;
}

export default QueryState;
