
import { useState, useEffect } from "react";
import { Product } from "@/types/Product";
import { Toaster, toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import ProductGrid from "@/components/ProductGrid";
import ProductModal from "@/components/ProductModal";
import ProductDetailPage from "@/components/ProductDetailPage";
import Search from "@/pages/Search";
import Contact from "@/pages/Contact";
import CartPage from "@/components/CartPage";
import WishlistPage from "@/components/WishlistPage";
import BottomNav from "@/components/BottomNav";
import { useOfflineStorage } from "@/hooks/useOfflineStorage";

interface CartItem {
  product: Product;
  size: string;
  quantity: number;
}

const Index = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [wishlist, setWishlist] = useState<number[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState<string>("home");
  const [searchTerm, setSearchTerm] = useState("");
	const [categories, setCategories] = useState<string[]>([]);
	const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const { addOfflineAction } = useOfflineStorage();

  useEffect(() => {
    // Fetch products from API
    const fetchProducts = async () => {
      try {
        const response = await fetch("/api/products");
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setProducts(data);

				// Extract categories with proper type casting
				const uniqueCategories = [...new Set(data.map((product: Product) => product.category))] as string[];
				setCategories(uniqueCategories);
      } catch (error) {
        console.error("Could not fetch products:", error);
        toast.error("Failed to load products.");
      }
    };

    fetchProducts();

    // Load cart items from localStorage
    const storedCart = localStorage.getItem("cart");
    if (storedCart) {
      setCartItems(JSON.parse(storedCart));
    }

    // Load wishlist items from localStorage
    const storedWishlist = localStorage.getItem("wishlist");
    if (storedWishlist) {
      setWishlist(JSON.parse(storedWishlist));
    }
  }, []);

  useEffect(() => {
    // Save cart items to localStorage
    localStorage.setItem("cart", JSON.stringify(cartItems));
  }, [cartItems]);

  useEffect(() => {
    // Save wishlist items to localStorage
    localStorage.setItem("wishlist", JSON.stringify(wishlist));
  }, [wishlist]);

  // Add scroll to top for navigation functions
  const handleHomeClick = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setCurrentPage("home");
  };

  const handleSearchClick = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setCurrentPage("search");
  };

  const handleCartClick = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setCurrentPage("cart");
  };

  const handleContactClick = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setCurrentPage("contact");
  };

  const handleWishlistClick = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setCurrentPage("wishlist");
  };

  const handleAddToCart = (product: Product, size: string) => {
    const existingItem = cartItems.find((item) => item.product.id === product.id && item.size === size);

    if (existingItem) {
      const updatedCart = cartItems.map((item) =>
        item.product.id === product.id && item.size === size
          ? { ...item, quantity: item.quantity + 1 }
          : item
      );
      setCartItems(updatedCart);
    } else {
      setCartItems([...cartItems, { product, size, quantity: 1 }]);
    }

    toast.success(`${product.name} added to cart!`);
    addOfflineAction('add-to-cart', { productId: product.id, size });
  };

  const handleUpdateQuantity = (productId: number, size: string, quantity: number) => {
    if (quantity <= 0) {
      // Remove the item from the cart if quantity is zero
      const updatedCart = cartItems.filter(
        (item) => !(item.product.id === productId && item.size === size)
      );
      setCartItems(updatedCart);
      localStorage.setItem("cart", JSON.stringify(updatedCart)); // Update localStorage
      toast.info("Item removed from cart.");
      return;
    }

    const updatedCart = cartItems.map((item) =>
      item.product.id === productId && item.size === size
        ? { ...item, quantity: quantity }
        : item
    );
    setCartItems(updatedCart);
    localStorage.setItem("cart", JSON.stringify(updatedCart)); // Update localStorage
  };

  const handleToggleWishlist = (productId: number) => {
    const inWishlist = wishlist.includes(productId);

    if (inWishlist) {
      const updatedWishlist = wishlist.filter((id) => id !== productId);
      setWishlist(updatedWishlist);
      localStorage.setItem("wishlist", JSON.stringify(updatedWishlist));
      toast.info("Removed from wishlist.");
      addOfflineAction('remove-from-wishlist', { productId });
    } else {
      const updatedWishlist = [...wishlist, productId];
      setWishlist(updatedWishlist);
      localStorage.setItem("wishlist", JSON.stringify(updatedWishlist));
      toast.success("Added to wishlist!");
      addOfflineAction('add-to-wishlist', { productId });
    }
  };

  const handleProductClick = (product: Product) => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setSelectedProduct(product);
    setCurrentPage("product");
  };

  const handleSearch = (term: string) => {
    setSearchTerm(term);
    addOfflineAction('search-query', { term });
  };

	const handleCategoryChange = (category: string | null) => {
		setSelectedCategory(category);
	};

  const filteredProducts = products.filter((product) => {
    const searchTermLower = searchTerm.toLowerCase();
    const matchesSearchTerm =
      product.name.toLowerCase().includes(searchTermLower) ||
      product.description.toLowerCase().includes(searchTermLower);
		const matchesCategory = !selectedCategory || product.category === selectedCategory;
    return matchesSearchTerm && matchesCategory;
  });

  const renderPage = () => {
    switch (currentPage) {
      case "search":
        return (
          <Search
            products={filteredProducts}
            onBack={handleHomeClick}
            onAddToCart={handleAddToCart}
            wishlist={wishlist}
            onToggleWishlist={handleToggleWishlist}
            onProductClick={handleProductClick}
            onHomeClick={handleHomeClick}
            onCartClick={handleCartClick}
            onContactClick={handleContactClick}
            cartCount={cartItems.reduce((sum, item) => sum + item.quantity, 0)}
          />
        );
      case "contact":
        return (
          <Contact
            onBack={handleHomeClick}
            onHomeClick={handleHomeClick}
            onSearchClick={handleSearchClick}
            onCartClick={handleCartClick}
            cartCount={cartItems.reduce((sum, item) => sum + item.quantity, 0)}
          />
        );
      case "cart":
        return (
          <CartPage
            items={cartItems}
            onUpdateQuantity={handleUpdateQuantity}
            onClose={handleHomeClick}
            onHomeClick={handleHomeClick}
            onSearchClick={handleSearchClick}
            onContactClick={handleContactClick}
            cartCount={cartItems.reduce((sum, item) => sum + item.quantity, 0)}
            wishlist={wishlist}
            onToggleWishlist={handleToggleWishlist}
          />
        );
      case "wishlist":
        return (
          <WishlistPage
            products={filteredProducts.filter(p => wishlist.includes(p.id))}
            wishlist={wishlist}
            onProductClick={handleProductClick}
            onToggleWishlist={handleToggleWishlist}
            onAddToCart={handleAddToCart}
            onBack={handleHomeClick}
          />
        );
      case "product":
        return selectedProduct ? (
          <ProductDetailPage
            product={selectedProduct}
            allProducts={products}
            wishlist={wishlist}
            onToggleWishlist={handleToggleWishlist}
            onAddToCart={handleAddToCart}
            onBack={handleHomeClick}
            onProductClick={handleProductClick}
            onHomeClick={handleHomeClick}
            onSearchClick={handleSearchClick}
            onCartClick={handleCartClick}
            onContactClick={handleContactClick}
            cartCount={cartItems.reduce((sum, item) => sum + item.quantity, 0)}
          />
        ) : null;
      default:
        return (
          <div className="min-h-screen bg-white">
            {/* Header */}
            <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-100">
              <div className="flex items-center justify-between px-4 py-3">
                <h1 className="text-lg font-extralight tracking-wide">
                  Netlistore
                </h1>
                <div className="flex items-center space-x-2">
                  <Button variant="outline" size="sm" onClick={handleWishlistClick}>
                    Wishlist ({wishlist.length})
                  </Button>
                </div>
              </div>
            </header>

						{/* Category Buttons */}
						<div className="px-4 py-2 flex overflow-x-auto gap-2">
							<Button
								variant="outline"
								size="sm"
								className={`${selectedCategory === null ? 'bg-black text-white hover:bg-gray-800' : 'hover:bg-gray-50'}`}
								onClick={() => handleCategoryChange(null)}
							>
								All
							</Button>
							{categories.map((category) => (
								<Button
									key={category}
									variant="outline"
									size="sm"
									className={`${selectedCategory === category ? 'bg-black text-white hover:bg-gray-800' : 'hover:bg-gray-50'}`}
									onClick={() => handleCategoryChange(category)}
								>
									{category}
								</Button>
							))}
						</div>

            {/* Search Bar */}
            <div className="container py-4">
              <Input
                type="search"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                className="w-full max-w-md mx-auto"
              />
            </div>

            {/* Product Grid */}
            <div className="container px-4">
              {filteredProducts.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20">
                  <h3 className="text-lg font-light mb-2">No products found</h3>
                  <p className="text-gray-500 text-sm mb-6">
                    Try adjusting your search or filters.
                  </p>
                </div>
              ) : (
                <ProductGrid
                  products={filteredProducts}
                  wishlist={wishlist}
                  onProductClick={handleProductClick}
                  onToggleWishlist={handleToggleWishlist}
                  onAddToCart={handleAddToCart}
                />
              )}
            </div>

            {/* Bottom Navigation */}
            <BottomNav 
              cartCount={cartItems.reduce((sum, item) => sum + item.quantity, 0)}
              onHomeClick={handleHomeClick}
              onSearchClick={handleSearchClick}
              onCartClick={handleCartClick}
              onContactClick={handleContactClick}
              activeTab="home"
            />
          </div>
        );
    }
  };

  return (
    <>
      {renderPage()}
      <ProductModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        product={selectedProduct}
        wishlist={wishlist}
        onToggleWishlist={handleToggleWishlist}
        onAddToCart={handleAddToCart}
      />
      <Toaster />
    </>
  );
};

export default Index;
