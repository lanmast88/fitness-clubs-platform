import { useCallback, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import { clubsApi } from "../api/clubs";
import { membershipsApi } from "../api/memberships";
import { useApiMutation } from "../hooks/useApiMutation";
import { useApiQuery } from "../hooks/useApiQuery";
import { useAuth } from "../hooks/useAuth";
import MembershipCard from "./MembershipCard";
import PlanPurchaseDialog from "./PlanPurchaseDialog";
import QueryState from "./QueryState";
import { toPlanCards } from "./planPresentation";

// Карточка (360px) + gap (24px): на столько листает слайдер за один клик.
const SLIDE_STEP = 384;

function MembershipSlide({ embedded = false }) {
  const navigate = useNavigate();
  const { isAuthenticated, isClient } = useAuth();
  const tariffsSliderRef = useRef(null);

  const [pendingPlan, setPendingPlan] = useState(null);
  const [purchasedPlanId, setPurchasedPlanId] = useState(null);

  const plansQuery = useApiQuery((signal) => membershipsApi.plans({ signal }), []);
  // Список клубов нужен только для клубных тарифов — грузим по требованию.
  const clubsQuery = useApiQuery((signal) => clubsApi.list({ signal }), [], {
    enabled: Boolean(pendingPlan),
  });

  const purchase = useApiMutation(membershipsApi.create);

  const slideTariffs = (direction) => {
    tariffsSliderRef.current?.scrollBy({
      left: direction * SLIDE_STEP,
      behavior: "smooth",
    });
  };

  const buy = useCallback(
    async (planId, clubId) => {
      await purchase.run({ planId, clubId });
      setPurchasedPlanId(planId);
      setPendingPlan(null);
    },
    [purchase],
  );

  const handleBuy = useCallback(
    (plan) => {
      if (!isAuthenticated) {
        navigate("/login", { state: { from: "/tariffs" } });
        return;
      }

      if (plan.requiresClub) {
        purchase.reset();
        setPendingPlan(plan);
        return;
      }

      buy(plan.id).catch(() => {
        // Текст ошибки показываем ниже, под заголовком секции.
      });
    },
    [buy, isAuthenticated, navigate, purchase],
  );

  const plans = toPlanCards(plansQuery.data);

  return (
    <section
      className={embedded ? "py-12" : "mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8"}
      id="tariffs"
    >
      <div className="mb-8 flex items-end justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-cyan-300">Тарифы</p>
          <h3 className="mt-2 text-3xl font-bold">Выбери свою карту</h3>
        </div>
        <div className="hidden sm:flex items-center gap-2">
          <button
            type="button"
            onClick={() => slideTariffs(-1)}
            className="h-10 w-10 rounded-full border border-[#9D50BB]/40 bg-white/5 text-slate-100 shadow-[0_0_12px_rgba(157,80,187,0.35)] transition hover:bg-white/10"
            aria-label="Прокрутить тарифы влево"
          >
            ←
          </button>
          <button
            type="button"
            onClick={() => slideTariffs(1)}
            className="h-10 w-10 rounded-full border border-[#9D50BB]/40 bg-white/5 text-slate-100 shadow-[0_0_12px_rgba(157,80,187,0.35)] transition hover:bg-white/10"
            aria-label="Прокрутить тарифы вправо"
          >
            →
          </button>
        </div>
      </div>

      {isAuthenticated && !isClient && (
        <p className="mb-4 text-sm text-amber-200">
          Абонементы оформляются только с клиентского аккаунта.
        </p>
      )}
      {purchase.error && !pendingPlan && (
        <p className="mb-4 text-sm text-rose-300">{purchase.error.message}</p>
      )}
      {purchasedPlanId && (
        <p className="mb-4 text-sm text-emerald-300">
          Абонемент оформлен — он уже в личном кабинете.
        </p>
      )}

      <QueryState
        loading={plansQuery.loading}
        error={plansQuery.error}
        isEmpty={plans.length === 0}
        emptyText="Тарифы пока не опубликованы."
        onRetry={plansQuery.reload}
      >
        <div
          ref={tariffsSliderRef}
          className="flex items-stretch gap-6 overflow-x-auto pb-3 snap-x snap-mandatory scroll-smooth [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {plans.map((plan, index) => (
            <div key={plan.id} className="snap-center shrink-0">
              <MembershipCard
                plan={plan}
                accentIndex={index}
                onBuy={handleBuy}
                busy={purchase.loading && pendingPlan?.id !== plan.id}
                disabled={isAuthenticated && !isClient}
              />
            </div>
          ))}
        </div>
      </QueryState>

      {pendingPlan && (
        <PlanPurchaseDialog
          plan={pendingPlan}
          clubs={clubsQuery.data}
          loading={purchase.loading || clubsQuery.loading}
          error={purchase.error || clubsQuery.error}
          onCancel={() => setPendingPlan(null)}
          onConfirm={(clubId) => {
            buy(pendingPlan.id, clubId).catch(() => {});
          }}
        />
      )}
    </section>
  );
}

export default MembershipSlide;
