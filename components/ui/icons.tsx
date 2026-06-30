// Small inline SVG icon set. 16x16 viewBox, 1.5 stroke, currentColor.
// Sized with Tailwind via `className`.

type IconProps = {
  className?: string;
};

const baseProps = {
  viewBox: "0 0 16 16",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.5,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true,
};

export function PlusIcon({ className }: IconProps) {
  return (
    <svg {...baseProps} className={className}>
      <path d="M8 3.5v9M3.5 8h9" />
    </svg>
  );
}

export function SignOutIcon({ className }: IconProps) {
  return (
    <svg {...baseProps} className={className}>
      <path d="M9.5 3H5a1.5 1.5 0 0 0-1.5 1.5v7A1.5 1.5 0 0 0 5 13h4.5" />
      <path d="M11 5.5 13.5 8 11 10.5" />
      <path d="M13.5 8h-6" />
    </svg>
  );
}

export function CheckIcon({ className }: IconProps) {
  return (
    <svg {...baseProps} className={className}>
      <path d="m3.5 8.5 3 3 6-7" />
    </svg>
  );
}

export function ArrowRightIcon({ className }: IconProps) {
  return (
    <svg {...baseProps} className={className}>
      <path d="M3.5 8h9" />
      <path d="m9 4.5 3.5 3.5L9 11.5" />
    </svg>
  );
}
