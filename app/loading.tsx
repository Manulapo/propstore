import AppLogo from "@/components/shared/app-logo";
import { Loader2 } from "lucide-react";

const Loading = () => {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        width: "100vw",
        height: "100vh",
      }}
    >
      <AppLogo size={60} className="mb-4" hasLogoName={true} />
      <Loader2
        height={50}
        width={50}
        className="animate-spin text-muted-foreground opacity-60"
      />
    </div>
  );
};

export default Loading;
