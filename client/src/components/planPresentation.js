/**
 * Витринное представление тарифа.
 *
 * API отдаёт только коммерческие данные (slug, название, охват, цена, срок),
 * а картинки браслетов лежат во фронтенде. Этот модуль — единственное место,
 * где данные API превращаются в пропсы карточки: сама карточка остаётся
 * «глупой» и ничего не знает про формат ответа сервера.
 */

const PLAN_IMAGES = ["/light.png", "/infinity.png", "/premium.png", "/student.png"];

const SCOPE_LABELS = {
  club: "Один клуб",
  network: "Вся сеть",
};

const SCOPE_FEATURES = {
  club: "Доступ в один выбранный клуб",
  network: "Доступ во все клубы сети",
};

const priceFormatter = new Intl.NumberFormat("ru-RU", { maximumFractionDigits: 0 });

export function formatPrice(value) {
  return priceFormatter.format(Math.round(Number(value) || 0));
}

export function toPlanCard(plan, index = 0) {
  const price = Number(plan.price) || 0;
  const months = Number(plan.duration_months) || 0;

  return {
    id: plan.id,
    slug: plan.slug,
    title: plan.title,
    scope: plan.scope,
    scopeLabel: plan.scope_display || SCOPE_LABELS[plan.scope] || "",
    price,
    pricePerMonth: months > 0 ? Math.round(price / months) : price,
    durationMonths: months,
    image: PLAN_IMAGES[index % PLAN_IMAGES.length],
    // Клубный тариф без клуба сервер не примет — карточка должна спросить клуб.
    requiresClub: plan.scope === "club",
    features: [
      SCOPE_FEATURES[plan.scope] || plan.scope_display,
      months > 0 ? `Срок действия — ${months} мес.` : null,
      `Полная стоимость — ${formatPrice(price)} ₽`,
    ].filter(Boolean),
  };
}

export function toPlanCards(plans) {
  return (plans || []).map(toPlanCard);
}
