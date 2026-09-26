export function WarehouseIllustration() {
  return (
    <svg
      viewBox="0 0 420 260"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="w-full max-w-md text-white"
      aria-hidden
    >
      {/* ground shadow */}
      <ellipse cx="210" cy="238" rx="170" ry="12" fill="white" fillOpacity="0.12" />

      {/* racking unit */}
      <g fillOpacity="0.9">
        {/* uprights */}
        <rect x="30" y="40" width="8" height="180" rx="2" fill="white" fillOpacity="0.35" />
        <rect x="182" y="40" width="8" height="180" rx="2" fill="white" fillOpacity="0.35" />
        {/* shelves */}
        <rect x="30" y="58" width="160" height="6" rx="2" fill="white" fillOpacity="0.35" />
        <rect x="30" y="118" width="160" height="6" rx="2" fill="white" fillOpacity="0.35" />
        <rect x="30" y="178" width="160" height="6" rx="2" fill="white" fillOpacity="0.35" />

        {/* boxes - top shelf */}
        <rect x="40" y="26" width="34" height="30" rx="3" fill="white" />
        <rect x="48" y="34" width="18" height="4" rx="1" fill="#ea580c" />
        <rect x="80" y="18" width="40" height="38" rx="3" fill="white" fillOpacity="0.92" />
        <rect x="90" y="30" width="20" height="4" rx="1" fill="#ea580c" />
        <rect x="128" y="30" width="30" height="26" rx="3" fill="white" fillOpacity="0.85" />

        {/* boxes - middle shelf */}
        <rect x="42" y="82" width="44" height="34" rx="3" fill="white" fillOpacity="0.92" />
        <rect x="54" y="94" width="20" height="4" rx="1" fill="#ea580c" />
        <rect x="94" y="90" width="32" height="26" rx="3" fill="white" fillOpacity="0.8" />
        <rect x="134" y="78" width="36" height="38" rx="3" fill="white" />
        <rect x="144" y="92" width="16" height="4" rx="1" fill="#ea580c" />

        {/* boxes - bottom shelf */}
        <rect x="40" y="140" width="38" height="36" rx="3" fill="white" fillOpacity="0.85" />
        <rect x="86" y="146" width="46" height="30" rx="3" fill="white" />
        <rect x="98" y="158" width="22" height="4" rx="1" fill="#ea580c" />
        <rect x="140" y="142" width="30" height="34" rx="3" fill="white" fillOpacity="0.9" />
      </g>

      {/* pallet on the floor */}
      <g fillOpacity="0.9">
        <rect x="20" y="222" width="70" height="8" rx="2" fill="white" fillOpacity="0.4" />
        <rect x="26" y="230" width="6" height="8" fill="white" fillOpacity="0.3" />
        <rect x="78" y="230" width="6" height="8" fill="white" fillOpacity="0.3" />
      </g>

      {/* forklift */}
      <g transform="translate(220, 0)">
        {/* forks */}
        <rect x="0" y="188" width="52" height="6" rx="2" fill="white" fillOpacity="0.7" />
        <rect x="0" y="200" width="52" height="6" rx="2" fill="white" fillOpacity="0.7" />
        {/* lifted pallet + box */}
        <rect x="4" y="150" width="46" height="34" rx="3" fill="white" />
        <rect x="16" y="162" width="22" height="5" rx="1" fill="#ea580c" />
        {/* mast */}
        <rect x="52" y="70" width="8" height="140" rx="2" fill="white" fillOpacity="0.55" />
        <rect x="66" y="70" width="8" height="140" rx="2" fill="white" fillOpacity="0.55" />
        {/* body */}
        <path
          d="M60 150 H150 a10 10 0 0 1 10 10 v30 a10 10 0 0 1 -10 10 H90 l-20 20 v-20 H60 a8 8 0 0 1 -8 -8 v-34 a8 8 0 0 1 8 -8 Z"
          fill="white"
        />
        <rect x="96" y="128" width="46" height="30" rx="4" fill="white" />
        {/* wheels */}
        <circle cx="82" cy="212" r="14" fill="#7c2d12" />
        <circle cx="82" cy="212" r="6" fill="white" />
        <circle cx="150" cy="212" r="14" fill="#7c2d12" />
        <circle cx="150" cy="212" r="6" fill="white" />
      </g>
    </svg>
  );
}
