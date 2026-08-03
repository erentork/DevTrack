export const AVATAR_OPTIONS = [
  {
    key: "orbit",
    label: "Orbit",
    gradient:
      "from-blue-600 to-cyan-400",
  },
  {
    key: "hex",
    label: "Hex",
    gradient:
      "from-indigo-600 to-blue-400",
  },
  {
    key: "grid",
    label: "Grid",
    gradient:
      "from-sky-600 to-blue-500",
  },
  {
    key: "wave",
    label: "Wave",
    gradient:
      "from-cyan-600 to-blue-500",
  },
  {
    key: "pulse",
    label: "Pulse",
    gradient:
      "from-blue-700 to-indigo-500",
  },
] as const;

export type AvatarKey =
  (typeof AVATAR_OPTIONS)[number]["key"];

type UserAvatarProps = {
  avatarKey?: string | null;
  size?: "sm" | "md" | "lg" | "xl";
  selected?: boolean;
};

const sizeClasses = {
  sm: "h-9 w-9 rounded-xl",
  md: "h-11 w-11 rounded-xl",
  lg: "h-12 w-12 rounded-2xl",
  xl: "h-20 w-20 rounded-2xl",
};

const innerRadiusClasses = {
  sm: "rounded-[11px]",
  md: "rounded-[11px]",
  lg: "rounded-[15px]",
  xl: "rounded-[15px]",
};

const iconSizeClasses = {
  sm: "h-[18px] w-[18px]",
  md: "h-[22px] w-[22px]",
  lg: "h-[26px] w-[26px]",
  xl: "h-9 w-9",
};

export default function UserAvatar({
  avatarKey,
  size = "md",
  selected = false,
}: UserAvatarProps) {
  const option =
    AVATAR_OPTIONS.find(
      (item) =>
        item.key === avatarKey
    ) ?? AVATAR_OPTIONS[0];

  return (
    <div
      className={`
        relative
        isolate
        flex
        shrink-0
        items-center
        justify-center
        overflow-hidden
        bg-slate-950
        text-white
        shadow-lg
        transition
        ${sizeClasses[size]}
        ${
          selected
            ? "ring-2 ring-blue-500/50"
            : "ring-1 ring-slate-700/80"
        }
      `}
      aria-label={`${option.label} avatar`}
    >
      <div
        className={`
          absolute
          inset-[1px]
          overflow-hidden
          bg-gradient-to-br
          ${innerRadiusClasses[size]}
          ${option.gradient}
        `}
      >
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_35%_25%,rgba(255,255,255,0.20),transparent_46%)]" />
      </div>

      <AvatarGlyph
        avatarKey={option.key}
        className={`
          relative
          z-10
          block
          ${iconSizeClasses[size]}
        `}
      />
    </div>
  );
}

function AvatarGlyph({
  avatarKey,
  className,
}: {
  avatarKey: AvatarKey;
  className: string;
}) {
  switch (avatarKey) {
    case "hex":
      return (
        <svg
          viewBox="0 0 32 32"
          className={className}
          fill="none"
          aria-hidden="true"
        >
          <path
            d="M16 6.5L24 11.25V20.75L16 25.5L8 20.75V11.25L16 6.5Z"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          <path
            d="M16 11L20 13.4V18.6L16 21L12 18.6V13.4L16 11Z"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity="0.78"
          />
        </svg>
      );

    case "grid":
      return (
        <svg
          viewBox="0 0 32 32"
          className={className}
          fill="none"
          aria-hidden="true"
        >
          <rect
            x="6"
            y="6"
            width="8"
            height="8"
            rx="2"
            stroke="currentColor"
            strokeWidth="2"
          />

          <rect
            x="18"
            y="6"
            width="8"
            height="8"
            rx="2"
            stroke="currentColor"
            strokeWidth="2"
            opacity="0.78"
          />

          <rect
            x="6"
            y="18"
            width="8"
            height="8"
            rx="2"
            stroke="currentColor"
            strokeWidth="2"
            opacity="0.78"
          />

          <rect
            x="18"
            y="18"
            width="8"
            height="8"
            rx="2"
            stroke="currentColor"
            strokeWidth="2"
          />
        </svg>
      );

    case "wave":
      return (
        <svg
          viewBox="0 0 32 32"
          className={className}
          fill="none"
          aria-hidden="true"
        >
          <path
            d="M5 12C8 8 11 8 14 12C17 16 20 16 27 9"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
          />

          <path
            d="M5 20C8 16 11 16 14 20C17 24 20 24 27 17"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            opacity="0.78"
          />
        </svg>
      );

    case "pulse":
      return (
        <svg
          viewBox="0 0 32 32"
          className={className}
          fill="none"
          aria-hidden="true"
        >
          <path
            d="M4 17H10L13 9L18 24L21 15L24 17H28"
            stroke="currentColor"
            strokeWidth="2.3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      );

    case "orbit":
    default:
      return (
        <svg
          viewBox="0 0 32 32"
          className={className}
          fill="none"
          aria-hidden="true"
        >
          <ellipse
            cx="16"
            cy="16"
            rx="9.8"
            ry="5.6"
            stroke="currentColor"
            strokeWidth="1.9"
            strokeLinecap="round"
            transform="rotate(-28 16 16)"
          />

          <ellipse
            cx="16"
            cy="16"
            rx="9.8"
            ry="5.6"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            opacity="0.72"
            transform="rotate(28 16 16)"
          />

          <circle
            cx="16"
            cy="16"
            r="2.2"
            fill="currentColor"
          />
        </svg>
      );
  }
}