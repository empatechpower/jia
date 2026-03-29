/**
 * Logo component.
 * In production, replace `src` with your real hosted asset.
 * The dark variant uses inline SVG so it renders correctly on light backgrounds.
 */

interface LogoProps {
  /** Light variant (white) is used on dark/image backgrounds. */
  variant?: "light" | "dark";
  className?: string;
}

// SVG path data kept outside the component to avoid re-creation on every render.
const RECT_PATH =
  "M2.48623 4.97245L36.8413 2.48623L71.1963 4.97245L68.7101 59.4451L36.8413 61.9296L4.97245 59.4451L2.48623 4.97245Z";
const VECTOR_1 =
  "M28 14L36 28L44 14H28Z";
const VECTOR_8 =
  "M24 28H48V44H24V28Z";
const VECTOR_9 =
  "M28 44L36 58L44 44H28Z";
const VECTOR_7 =
  "M20 20L28 36H20V20Z";
const ELLIPSE =
  "M52 36C52 38.2 50.2 40 48 40C45.8 40 44 38.2 44 36C44 33.8 45.8 32 48 32C50.2 32 52 33.8 52 36Z";

export default function Logo({ variant = "light", className = "" }: LogoProps) {
  const fill = variant === "light" ? "white" : "#1C1B1F";
  const stroke = variant === "light" ? "white" : "#1C1B1F";

  return (
    <div
      className={`shrink-0 ${variant === "light" ? "h-[40px] w-[48px] md:h-[62px] md:w-[74px]" : "h-[40px] w-[48px] md:h-[50px] md:w-[60px]"} ${className}`}
    >
      <svg
        className="block size-full"
        fill="none"
        preserveAspectRatio="none"
        viewBox="0 0 73.6826 61.9296"
      >
        <path d={RECT_PATH} stroke={stroke} strokeWidth="4.97245" />
        <path
          clipRule="evenodd"
          d={VECTOR_1}
          fill={fill}
          fillRule="evenodd"
        />
        <path
          clipRule="evenodd"
          d={VECTOR_8}
          fill={fill}
          fillRule="evenodd"
        />
        <path
          clipRule="evenodd"
          d={VECTOR_9}
          fill={fill}
          fillRule="evenodd"
        />
        <path
          clipRule="evenodd"
          d={VECTOR_7}
          fill={fill}
          fillRule="evenodd"
        />
        <path
          clipRule="evenodd"
          d={ELLIPSE}
          fill={fill}
          fillRule="evenodd"
        />
      </svg>
    </div>
  );
}
