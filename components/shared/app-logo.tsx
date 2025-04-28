import { APP_NAME } from "@/lib/constants";
import Image from "next/image";

const AppLogo = async ({ size = 48 }: { size?: number }) => {
    const iconSize = size || 48;
  return (
    <Image
      src="/images/logo.svg"
      height={iconSize}
      width={iconSize}
      priority={true}
      alt={`${APP_NAME} Logo`}
      className="dark:invert"
    />
  );
};

export default AppLogo;
