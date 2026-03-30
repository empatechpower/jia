interface LogoProps {
  variant?: "light" | "dark";
  className?: string;
}

export default function Logo({ variant = "light", className = "" }: LogoProps) {
  const src =
    variant === "light"
      ? "/images/JIA_Logo_White.png"
      : "/images/JIA_Logo_Black.png";

  return (
    <img
      src={src}
      alt="Company logo"
      className={`shrink-0 object-contain ${className}`}
    />
  );
}
