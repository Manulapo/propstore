import { APP_NAME } from "@/lib/constants";
import { cn } from "@/lib/utils";
import Image from "next/image";

const AppLogo = ({
  size = 48,
  className,
  hasLogoName = false,
}: {
  size?: number;
  hasLogoName?: boolean;
  className?: string;
}) => {
  const iconSize = size || 48;
  return (
    <div className="flex items-center gap-2">
      <Image
        src="/images/logo.svg"
        height={iconSize}
        width={iconSize}
        priority={true}
        alt={`${APP_NAME} Logo`}
        className={cn("dark:invert", className)}
      />
      {hasLogoName && <h1 className="h3-bold">PropStore</h1>}
    </div>
  );
};

export default AppLogo;
