
import { useState, useEffect } from 'react';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation, useNavigate } from "react-router-dom";
import PWAInstallPopup from "@/components/PWAInstallPopup";
import ExternalRedirect from "@/components/ExternalRedirect";
import NavigationConfirm from "@/components/NavigationConfirm";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

// Component to handle navigation blocking
function LocationTracker() {
  const location = useLocation();
  const navigate = useNavigate();
  const [showNavConfirm, setShowNavConfirm] = useState(false);
  const [pendingNavigation, setPendingNavigation] = useState<string | null>(null);
  
  useEffect(() => {
    // Save current location
    localStorage.setItem('currentPage', location.pathname);
  }, [location]);

  useEffect(() => {
    // Block navigation attempts
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = '';
      return '';
    };

    // Block back button
    const handlePopState = (e: PopStateEvent) => {
      e.preventDefault();
      setShowNavConfirm(true);
      setPendingNavigation('back');
      // Push the current state back to prevent actual navigation
      window.history.pushState(null, '', location.pathname);
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('popstate', handlePopState);

    // Push initial state to handle back button
    window.history.pushState(null, '', location.pathname);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('popstate', handlePopState);
    };
  }, [location]);

  const handleConfirmNavigation = () => {
    setShowNavConfirm(false);
    if (pendingNavigation === 'back') {
      window.history.back();
    }
    setPendingNavigation(null);
  };

  const handleCancelNavigation = () => {
    setShowNavConfirm(false);
    setPendingNavigation(null);
  };
  
  return (
    <NavigationConfirm 
      isOpen={showNavConfirm}
      onClose={handleCancelNavigation}
      onConfirm={handleConfirmNavigation}
    />
  );
}

const App = () => {
  useEffect(() => {
    // Restore last page on refresh
    const currentPage = localStorage.getItem('currentPage');
    if (currentPage && window.location.pathname === '/' && currentPage !== '/') {
      window.history.replaceState(null, '', currentPage);
    }
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <PWAInstallPopup />
        <ExternalRedirect />
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <LocationTracker />
          <Routes>
            <Route path="/" element={<Index />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
