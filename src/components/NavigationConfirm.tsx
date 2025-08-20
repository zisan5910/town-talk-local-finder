import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface NavigationConfirmProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  description?: string;
}

const NavigationConfirm = ({ 
  isOpen, 
  onClose, 
  onConfirm,
  title = "আপনি কি নিশ্চিত?",
  description = "আপনি কি সত্যিই এই পেজ ছেড়ে যেতে চান?"
}: NavigationConfirmProps) => {
  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent className="sm:max-w-md">
        <AlertDialogHeader>
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-full bg-orange-100 flex items-center justify-center">
              <AlertTriangle className="h-4 w-4 text-orange-600" />
            </div>
            <AlertDialogTitle className="text-lg">{title}</AlertDialogTitle>
          </div>
          <AlertDialogDescription className="text-sm text-muted-foreground">
            {description}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex gap-2 sm:gap-2">
          <AlertDialogCancel onClick={onClose} className="flex-1">
            বাতিল
          </AlertDialogCancel>
          <AlertDialogAction 
            onClick={onConfirm}
            className="flex-1 bg-black text-white hover:bg-gray-800"
          >
            হ্যাঁ, যেতে চাই
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default NavigationConfirm;