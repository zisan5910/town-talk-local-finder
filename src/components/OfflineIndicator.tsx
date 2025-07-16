
import { useOffline } from "@/hooks/useOffline";
import { useOfflineStorage } from "@/hooks/useOfflineStorage";
import { Wifi, WifiOff, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

const OfflineIndicator = () => {
  const isOffline = useOffline();
  const { offlineActions } = useOfflineStorage();

  if (!isOffline) return null;

  const handleRetry = () => {
    window.location.reload();
  };

  return (
    <div className="fixed top-0 left-0 right-0 bg-red-500 text-white text-center py-2 text-sm z-50 flex items-center justify-center gap-2 px-4">
      <WifiOff className="h-4 w-4 flex-shrink-0" />
      <span className="flex-1 min-w-0">
        You are offline. {offlineActions > 0 && `${offlineActions} actions will sync when online.`}
      </span>
      <Button
        variant="ghost"
        size="sm"
        className="h-6 px-2 text-white hover:bg-red-600 flex-shrink-0"
        onClick={handleRetry}
      >
        <RefreshCw className="h-3 w-3" />
      </Button>
    </div>
  );
};

export default OfflineIndicator;
