
import { useOffline } from "@/hooks/useOffline";
import { useOfflineStorage } from "@/hooks/useOfflineStorage";
import { WifiOff, Wifi } from "lucide-react";

const OfflineIndicator = () => {
  const isOffline = useOffline();
  const { offlineActions } = useOfflineStorage();

  if (!isOffline) return null;

  return (
    <div className="fixed top-0 left-0 right-0 bg-red-500 text-white text-center py-2 px-4 text-xs sm:text-sm z-50 flex items-center justify-center gap-2 shadow-lg">
      <WifiOff className="h-4 w-4 flex-shrink-0" />
      <span className="truncate">
        You are offline. {offlineActions > 0 && `${offlineActions} actions will sync when online.`}
      </span>
    </div>
  );
};

export default OfflineIndicator;
