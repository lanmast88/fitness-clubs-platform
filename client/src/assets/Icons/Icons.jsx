const CheckIcon = () => (
  <svg
    className="w-4 h-4 text-white drop-shadow-[0_0_6px_rgba(157,80,187,0.7)]"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={3}
      d="M5 13l4 4L19 7"
    />
  </svg>
);

const MinusIcon = () => (
  <svg
    className="w-4 h-4 text-slate-400 drop-shadow-[0_0_6px_rgba(157,80,187,0.35)]"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={3}
      d="M20 12H4"
    />
  </svg>
);

const InfoIcon = () => (
  <svg
    className="w-4 h-4 text-slate-300 cursor-help drop-shadow-[0_0_8px_rgba(157,80,187,0.6)]"
    fill="currentColor"
    viewBox="0 0 24 24"
  >
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z" />
  </svg>
);

export { CheckIcon, MinusIcon, InfoIcon };
