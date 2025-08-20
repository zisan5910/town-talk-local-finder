
import { ArrowLeft, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import ProductGrid from "@/components/ProductGrid";
import BottomNav from "@/components/BottomNav";
import { Product } from "@/types/Product";

interface WishlistPageProps {
  products: Product[];
  wishlist: number[];
  onProductClick: (product: Product) => void;
  onToggleWishlist: (productId: number) => void;
  onAddToCart: (product: Product, size: string) => void;
  onBack: () => void;
  onHomeClick: () => void;
  onSearchClick: () => void;
  onCartClick: () => void;
  onContactClick: () => void;
  cartCount: number;
}

const WishlistPage = ({ 
  products, 
  wishlist, 
  onProductClick, 
  onToggleWishlist, 
  onAddToCart, 
  onBack,
  onHomeClick,
  onSearchClick,
  onCartClick,
  onContactClick,
  cartCount
}: WishlistPageProps) => {
  const handleHomeClick = () => {
    onBack(); // Close wishlist page
    onHomeClick(); // Navigate to home
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-100">
        <div className="flex items-center justify-between px-4 py-3 max-w-7xl mx-auto">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={onBack}
              className="hover:bg-gray-50"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-xl font-light">Wishlist</h1>
          </div>
          <span className="text-sm text-gray-500">{products.length} items</span>
        </div>
      </header>

      {/* Content */}
      <div className="px-4 py-6 max-w-7xl mx-auto">
        {products.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Heart className="h-16 w-16 text-gray-200 mb-4" />
            <h3 className="text-lg font-light mb-2">Your wishlist is empty</h3>
            <p className="text-gray-500 text-sm mb-6">Save items you love to view them later</p>
            <Button 
              onClick={handleHomeClick}
              className="bg-black text-white hover:bg-gray-800 rounded-full px-8"
            >
              Start Shopping
            </Button>
          </div>
        ) : (
          <ProductGrid 
            products={products}
            wishlist={wishlist}
            onProductClick={onProductClick}
            onToggleWishlist={onToggleWishlist}
            onAddToCart={onAddToCart}
          />
        )}
      </div>

      {/* Bottom Navigation */}
      <BottomNav 
        cartCount={cartCount}
        wishlistCount={products.length}
        onHomeClick={handleHomeClick}
        onSearchClick={onSearchClick}
        onCartClick={onCartClick}
        onContactClick={onContactClick}
        onWishlistClick={() => {}}
        activeTab="wishlist"
      />
    </div>
  );
};

export default WishlistPage;
