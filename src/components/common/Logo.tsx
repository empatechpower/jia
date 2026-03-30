interface LogoProps {
  variant?: "light" | "dark";
  className?: string;
}

export default function Logo({ variant = "light", className = "" }: LogoProps) {
  const src =
    variant === "light"
      ? "/src/assets/JIA_Logo_White.png"
      : "/src/assets/Jia_Logo.png";

  return (
    <img
      src={src}
      alt="Company logo"
      className={`shrink-0 object-contain ${className}`}
    />
  );
}
