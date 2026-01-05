import { Link } from "react-router-dom";
import logoImage from "@/assets/logo.png";
import logoTransparent from "@/assets/logo-transparent.png";

interface LogoProps {
  to?: string;
  size?: "sm" | "md" | "lg";
  showText?: boolean;
  textClassName?: string;
  className?: string;
  transparent?: boolean;
}

const sizeClasses = {
  sm: "h-8",
  md: "h-10",
  lg: "h-12",
};

export const Logo = ({
  to = "/",
  size = "md",
  showText = true,
  textClassName = "text-foreground",
  className = "",
  transparent = false,
}: LogoProps) => {
  const content = (
    <div className={`flex items-center gap-2 ${className}`}>
      <img
        src={transparent ? logoTransparent : logoImage}
        alt="BigFood Logo"
        className={`${sizeClasses[size]} w-auto object-contain`}
      />
      {showText && (
        <span className={`font-display font-bold text-xl ${textClassName}`}>
          Big<span className="text-primary">Food</span>
        </span>
      )}
    </div>
  );

  if (to) {
    return <Link to={to}>{content}</Link>;
  }

  return content;
};

export default Logo;
