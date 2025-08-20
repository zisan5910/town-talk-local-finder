import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ExternalLink } from "lucide-react";

const ExternalRedirect = () => {
  const [showRedirect, setShowRedirect] = useState(false);

  useEffect(() => {
    // Check if opened from social media apps or in-app browsers
    const userAgent = navigator.userAgent || navigator.vendor;
    const referrer = document.referrer;
    
    // Check for Facebook, Messenger, WhatsApp, Instagram in-app browsers
    const isInAppBrowser = 
      userAgent.includes('FBAN') || // Facebook App
      userAgent.includes('FBAV') || // Facebook App
      userAgent.includes('MessengerForiOS') || // Messenger iOS
      userAgent.includes('WhatsApp') || // WhatsApp
      userAgent.includes('Instagram') || // Instagram
      referrer.includes('facebook.com') ||
      referrer.includes('messenger.com') ||
      referrer.includes('instagram.com') ||
      referrer.includes('whatsapp.com');

    // Check if not already dismissed
    const hasDismissed = localStorage.getItem('hasSeenExternalRedirect');
    
    if (isInAppBrowser && !hasDismissed) {
      setShowRedirect(true);
    }
  }, []);

  const handleOpenInChrome = () => {
    // Add intent to open in external browser
    const currentUrl = window.location.href;
    const chromeUrl = `googlechrome://navigate?url=${encodeURIComponent(currentUrl)}`;
    const fallbackUrl = `https://www.google.com/chrome/browser/mobile/`;
    
    // Try to open in Chrome, fallback to Chrome download page
    window.location.href = chromeUrl;
    
    setTimeout(() => {
      window.open(fallbackUrl, '_blank');
    }, 1000);
    
    handleDismiss();
  };

  const handleDismiss = () => {
    localStorage.setItem('hasSeenExternalRedirect', 'true');
    setShowRedirect(false);
  };

  if (!showRedirect) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full mx-4 p-6 text-center">
        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <ExternalLink className="h-8 w-8 text-blue-600" />
        </div>
        
        <h2 className="text-xl font-semibold text-gray-900 mb-2">সেরা অভিজ্ঞতার জন্য</h2>
        <p className="text-gray-600 text-sm mb-6">Chrome-এ খুলুন</p>
        
        <div className="space-y-3">
          <Button 
            onClick={handleOpenInChrome}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl flex items-center justify-center gap-2"
          >
            <ExternalLink className="h-4 w-4" />
            Chrome-এ খুলুন
          </Button>
          
          <Button 
            onClick={handleDismiss}
            variant="outline"
            className="w-full py-3 rounded-xl border-gray-300 text-gray-700 hover:bg-gray-50"
          >
            এখানেই থাকুন
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ExternalRedirect;