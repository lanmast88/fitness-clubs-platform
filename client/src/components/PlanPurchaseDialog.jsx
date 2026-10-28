import { useState } from "react";

/**
 * Выбор клуба при покупке клубного тарифа.
 * Сервер отклонит клубный тариф без клуба и сетевой — с клубом,
 * поэтому диалог показывается только для scope === "club".
 */
function PlanPurchaseDialog({ plan, clubs, loading, error, onConfirm, onCancel }) {
  const [clubId, setClubId] = useState("");

  // Клубы приходят асинхронно, уже после монтирования диалога, поэтому
  // выбор по умолчанию вычисляем, а не фиксируем в начальном состоянии.
  const selectedClubId = clubId || String(clubs?.[0]?.id ?? "");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div className="w-full max-w-md rounded-3xl border border-white/10 bg-[#0A0B10] p-6 shadow-[0_24px_60px_rgba(0,0,0,0.6)]">
        <h3 className="text-xl font-semibold text-white">Тариф «{plan.title}»</h3>
        <p className="mt-2 text-sm text-slate-400">
          Этот тариф действует в одном клубе — выберите, в каком.
        </p>

        <label className="mt-6 flex flex-col gap-2 text-sm text-slate-300">
          Клуб
          <select
            value={selectedClubId}
            onChange={(event) => setClubId(event.target.value)}
            className="rounded-xl border border-white/10 bg-[#0A0B10]/60 px-4 py-3 text-base text-white focus:outline-none focus:ring-2 focus:ring-[#9D50BB]/60"
          >
            {(clubs || []).map((club) => (
              <option key={club.id} value={club.id}>
                {club.name}
              </option>
            ))}
          </select>
        </label>

        {error && <p className="mt-4 text-sm text-rose-300">{error.message}</p>}

        <div className="mt-6 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-full border border-white/20 px-5 py-2 text-sm text-slate-200 transition hover:bg-white/10"
          >
            Отмена
          </button>
          <button
            type="button"
            disabled={loading || !selectedClubId}
            onClick={() => onConfirm(Number(selectedClubId))}
            className="rounded-full bg-[#9D50BB] px-5 py-2 text-sm font-semibold text-white shadow-[0_0_18px_rgba(157,80,187,0.45)] transition hover:shadow-[0_0_26px_rgba(157,80,187,0.6)] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Оформляем…" : "Оформить"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default PlanPurchaseDialog;
