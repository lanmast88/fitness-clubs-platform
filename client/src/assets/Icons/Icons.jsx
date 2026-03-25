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

const GroupTraining = ({ className = "w-6 h-6" }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="currentColor"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M14 13a3.954 3.954 0 0 0 .142 1H9.858A3.954 3.954 0 0 0 10 13zm-3.5-4h3a2.486 2.486 0 0 1 1.945.949 3.992 3.992 0 0 1 .839-.547A3.485 3.485 0 0 0 13.5 8h-3a3.485 3.485 0 0 0-2.784 1.402 3.992 3.992 0 0 1 .84.547A2.486 2.486 0 0 1 10.5 9zM9 4a3 3 0 1 1 3 3 3.003 3.003 0 0 1-3-3zm1 0a2 2 0 1 0 2-2 2.002 2.002 0 0 0-2 2zM4.5 17h3a3.504 3.504 0 0 1 3.5 3.5V23H1v-2.5A3.504 3.504 0 0 1 4.5 17zm0 1A2.503 2.503 0 0 0 2 20.5V22h8v-1.5A2.503 2.503 0 0 0 7.5 18zM6 16a3 3 0 1 1 3-3 3.003 3.003 0 0 1-3 3zm0-1a2 2 0 1 0-2-2 2.002 2.002 0 0 0 2 2zm17 5.5V23H13v-2.5a3.504 3.504 0 0 1 3.5-3.5h3a3.504 3.504 0 0 1 3.5 3.5zm-1 0a2.503 2.503 0 0 0-2.5-2.5h-3a2.503 2.503 0 0 0-2.5 2.5V22h8zM21 13a3 3 0 1 1-3-3 3.003 3.003 0 0 1 3 3zm-1 0a2 2 0 1 0-2 2 2.002 2.002 0 0 0 2-2z" />
    <path fill="none" d="M0 0h24v24H0z" />
  </svg>
);

const SpaZone = ({ className = "w-6 h-6" }) => (
  <svg
    className={className}
    viewBox="0 0 512 512"
    xmlns="http://www.w3.org/2000/svg"
    fill="currentColor"
  >
    <path
      d="M382.988,237.57a251.854,251.854,0,0,0-102.8-180.91L251.657,36,224.922,56.79A250.836,250.836,0,0,0,128.643,237.5,176.226,176.226,0,0,0,96,234.451H16V300c0,97.047,78.953,176,176,176H320c97.047,0,176-78.953,176-176V234.451H416A176.161,176.161,0,0,0,382.988,237.57ZM244.568,82.05,252.343,76l9.08,6.575a219.732,219.732,0,0,1,90.163,164.079A177.028,177.028,0,0,0,256,337.171a177.022,177.022,0,0,0-95.824-90.6A217.523,217.523,0,0,1,244.568,82.05ZM240,444H192c-79.4,0-144-64.6-144-144V266.451H96c79.4,0,144,64.6,144,144ZM464,300c0,79.4-64.6,144-144,144H272V410.451c0-79.4,64.6-144,144-144h48Z"
    />
  </svg>
);

const WorkHours = ({ className = "w-6 h-6" }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5" />
    <path
      d="M12 8V12L14.5 14.5"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const Parking = ({ className = "w-6 h-6" }) => (
  <svg
    className={className}
    fill="currentColor"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M12,6H9A1,1,0,0,0,8,7V17a1,1,0,0,0,2,0V14h2a4,4,0,0,0,0-8Zm0,6H10V8h2a2,2,0,0,1,0,4ZM19,2H5A3,3,0,0,0,2,5V19a3,3,0,0,0,3,3H19a3,3,0,0,0,3-3V5A3,3,0,0,0,19,2Zm1,17a1,1,0,0,1-1,1H5a1,1,0,0,1-1-1V5A1,1,0,0,1,5,4H19a1,1,0,0,1,1,1Z" />
  </svg>
);

const TwoStory = ({ className = "w-6 h-6" }) => (
  <svg
    className={className}
    fill="currentColor"
    version="1.1"
    id="Layer_1"
    xmlns="http://www.w3.org/2000/svg"
    xmlns:xlink="http://www.w3.org/1999/xlink"
    viewBox="0 0 512 512"
    xml:space="preserve"
  >
    <g>
      <g>
        <path
          d="M425.567,28.444c-5.236,0-8.382,4.161-8.382,9.397v85.418h-67.002c-5.236,0-8.85,4.633-8.85,9.869v75.464h-76.951
			c-5.236,0-8.382,4.105-8.382,9.341v75.992h-76.428c-5.236,0-8.905,4.165-8.905,9.402v75.932H93.715
			c-5.236,0-8.382,4.633-8.382,9.869v75.464H0v18.963h93.715c5.236,0,10.581-3.858,10.581-9.094v-76.24h75.275
			c5.236,0,10.058-3.858,10.058-9.094v-76.24h74.752c5.236,0,10.581-4.325,10.581-9.561v-75.772h75.22
			c5.236,0,10.113-4.385,10.113-9.622v-75.712h65.271c5.236,0,10.581-3.858,10.581-9.094V47.407H512V28.444H425.567z"
        />
      </g>
    </g>
    <g>
      <g>
        <path
          d="M425.567,293.926h-56.889c-5.236,0-9.481,4.245-9.481,9.482s4.245,9.482,9.481,9.482h29.417l-55.083,55.042
			c-3.704,3.704-3.704,9.682,0,13.385c1.852,1.852,4.278,2.767,6.704,2.767c2.426,0,5.402-0.931,7.254-2.783l60.216-59.672v38.583
			c0,5.236,4.245,9.482,9.482,9.482s9.481-4.246,9.481-9.482v-56.889C436.148,298.087,430.803,293.926,425.567,293.926z"
        />
      </g>
    </g>
  </svg>
);

export {
  CheckIcon,
  MinusIcon,
  InfoIcon,
  GroupTraining,
  SpaZone,
  WorkHours,
  Parking,
  TwoStory,
};
