import React, { useState, useMemo, useEffect } from 'react';
import {
  SlidersHorizontal,
  X,
  Search,
  ChevronDown,
  Check,
  RotateCcw,
  Star,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Clock,
  Layers
} from 'lucide-react';
import { useShop } from '../context/ShopContext';
import { PRODUCTS, CATEGORIES_META } from '../data/products';
import { INITIAL_REVIEWS } from '../data/reviews';
import { ProductCard } from '../components/ProductCard';
import { FilterState, Product, PageType } from '../types';
import { formatPKR } from '../data/constants';
import { getCollectionHero } from '../data/collectionHeroes';
import { CollectionHeroBanner } from '../components/CollectionHeroBanner';

interface ShopPageProps {
  initialCategory?: string | null;
  pageTitle?: string;
  pageSubtitle?: string;
  filterOnlySale?: boolean;
  filterOnlyNew?: boolean;
}

export const ShopPage: React.FC<ShopPageProps> = ({
  initialCategory = null,
  pageTitle,
  pageSubtitle,
  filterOnlySale = false,
  filterOnlyNew = false,
}) => {
  const {
    selectedCategoryFilter,
    setSelectedCategoryFilter,
    setCurrentPage,
    setIsSizeGuideOpen,
  } = useShop();

  // Determine the active category strictly
  // If initialCategory is passed (e.g. from routes 'men', 'women', etc.), use that.
  // Otherwise use selectedCategoryFilter. If both are null/empty, we are on "All Catalog".
  const activeCategory = (initialCategory !== undefined && initialCategory !== null)
    ? initialCategory
    : (selectedCategoryFilter || '');

  // Category metadata for banners & editorial content
  const categoryMeta = useMemo(() => {
    if (!activeCategory) return null;
    return CATEGORIES_META.find((c) => c.id === activeCategory) || null;
  }, [activeCategory]);

  // STRICT ISOLATION: Base product pool
  // When activeCategory is set, show ONLY products matching that category!
  // "Keep 'All Catalog' as the only page that displays products from every category."
  const baseCategoryProducts = useMemo(() => {
    if (!activeCategory) {
      return PRODUCTS;
    }
    return PRODUCTS.filter((p) => p.category === activeCategory);
  }, [activeCategory]);

  // Derived subcategories strictly from the base product pool
  const availableSubcategories = useMemo(() => {
    const subs = new Set<string>();
    baseCategoryProducts.forEach((p) => {
      if (p.subCategory) subs.add(p.subCategory);
    });
    return Array.from(subs);
  }, [baseCategoryProducts]);

  // Derived sizes strictly from the base product pool
  const availableSizes = useMemo(() => {
    const sizesSet = new Set<string>();
    baseCategoryProducts.forEach((p) => {
      p.sizes.forEach((s) => sizesSet.add(s));
    });
    return Array.from(sizesSet);
  }, [baseCategoryProducts]);

  // Derived colors strictly from the base product pool
  const availableColors = useMemo(() => {
    const colorMap = new Map<string, string>();
    baseCategoryProducts.forEach((p) => {
      p.colors.forEach((c) => {
        if (!colorMap.has(c.name)) {
          colorMap.set(c.name, c.hex);
        }
      });
    });
    return Array.from(colorMap.entries()).map(([name, hex]) => ({ name, hex }));
  }, [baseCategoryProducts]);

  // Calculate dynamic min/max price for the active category
  const priceBounds = useMemo(() => {
    if (baseCategoryProducts.length === 0) return { min: 10000, max: 150000 };
    const prices = baseCategoryProducts.map((p) => p.price);
    return {
      min: Math.min(...prices),
      max: Math.max(...prices),
    };
  }, [baseCategoryProducts]);

  // Filter state
  const [filters, setFilters] = useState<FilterState>({
    category: activeCategory,
    subCategory: '',
    minPrice: 0,
    maxPrice: 160000,
    sizes: [],
    colors: [],
    minRating: 0,
    availability: 'all',
    collection: '',
    discountOnly: filterOnlySale,
    newOnly: filterOnlyNew,
    sort: 'featured',
    searchQuery: '',
  });

  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);

  // Collections present in active product pool
  const availableCollections = useMemo(() => {
    const cols = new Set<string>();
    baseCategoryProducts.forEach((p) => {
      if (p.collection) cols.add(p.collection);
    });
    return Array.from(cols);
  }, [baseCategoryProducts]);

  // Category-specific reviews strictly matching products in baseCategoryProducts
  const categoryReviews = useMemo(() => {
    const productIds = new Set(baseCategoryProducts.map((p) => p.id));
    return INITIAL_REVIEWS.filter((r) => productIds.has(r.productId));
  }, [baseCategoryProducts]);

  // Dynamic filtering over baseCategoryProducts
  const filteredProducts = useMemo(() => {
    return baseCategoryProducts.filter((product) => {
      // Sub-category filter
      if (filters.subCategory && product.subCategory !== filters.subCategory) {
        return false;
      }
      // Price range
      if (product.price < filters.minPrice || product.price > filters.maxPrice) {
        return false;
      }
      // Sizes (strictly category-relevant)
      if (filters.sizes.length > 0 && !filters.sizes.some((s) => product.sizes.includes(s))) {
        return false;
      }
      // Colors
      if (
        filters.colors.length > 0 &&
        !filters.colors.some((c) =>
          product.colors.some((pc) => pc.name.toLowerCase() === c.toLowerCase())
        )
      ) {
        return false;
      }
      // Rating
      if (filters.minRating > 0 && product.rating < filters.minRating) {
        return false;
      }
      // Availability
      if (filters.availability === 'in_stock' && !product.inStock) {
        return false;
      }
      // Collection
      if (filters.collection && product.collection !== filters.collection) {
        return false;
      }
      // Discount only
      if (filters.discountOnly && !product.isSale && (!product.discountPercent || product.discountPercent <= 0)) {
        return false;
      }
      // New only
      if (filters.newOnly && !product.isNew) {
        return false;
      }
      // Search Query
      if (filters.searchQuery.trim()) {
        const q = filters.searchQuery.toLowerCase().trim();
        const matchesName = product.name.toLowerCase().includes(q);
        const matchesSub = product.subtitle.toLowerCase().includes(q);
        const matchesTag = product.tags.some((t) => t.toLowerCase().includes(q));
        if (!matchesName && !matchesSub && !matchesTag) return false;
      }

      return true;
    }).sort((a, b) => {
      switch (filters.sort) {
        case 'newest':
          return (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0);
        case 'bestseller':
          return (b.isBestSeller ? 1 : 0) - (a.isBestSeller ? 1 : 0);
        case 'price_asc':
          return a.price - b.price;
        case 'price_desc':
          return b.price - a.price;
        case 'rating_desc':
          return b.rating - a.rating;
        case 'featured':
        default:
          return (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0);
      }
    });
  }, [baseCategoryProducts, filters]);

  const toggleSize = (size: string) => {
    setFilters((prev) => ({
      ...prev,
      sizes: prev.sizes.includes(size)
        ? prev.sizes.filter((s) => s !== size)
        : [...prev.sizes, size],
    }));
  };

  const toggleColor = (colorName: string) => {
    setFilters((prev) => ({
      ...prev,
      colors: prev.colors.includes(colorName)
        ? prev.colors.filter((c) => c !== colorName)
        : [...prev.colors, colorName],
    }));
  };

  const resetFilters = () => {
    setFilters({
      category: activeCategory,
      subCategory: '',
      minPrice: 0,
      maxPrice: 160000,
      sizes: [],
      colors: [],
      minRating: 0,
      availability: 'all',
      collection: '',
      discountOnly: false,
      newOnly: false,
      sort: 'featured',
      searchQuery: '',
    });
  };

  const hasActiveFilters =
    filters.subCategory !== '' ||
    filters.minPrice > 0 ||
    filters.maxPrice < 160000 ||
    filters.sizes.length > 0 ||
    filters.colors.length > 0 ||
    filters.minRating > 0 ||
    filters.availability !== 'all' ||
    filters.collection !== '' ||
    filters.discountOnly ||
    filters.newOnly ||
    filters.searchQuery !== '';

  // Navigating to All Catalog or switching category cleanly
  const handleCategorySwitch = (catId: string | null) => {
    if (catId) {
      setSelectedCategoryFilter(catId);
      setCurrentPage(catId as PageType);
    } else {
      setSelectedCategoryFilter(null);
      setCurrentPage('shop');
    }
  };

  const dynamicTitle =
    pageTitle ||
    (categoryMeta
      ? categoryMeta.title
      : 'The Complete Catalogue');

  const dynamicSubtitle =
    pageSubtitle ||
    (categoryMeta
      ? categoryMeta.subtitle
      : 'Explore the full spectrum of haute couture tailoring, high horology, handcrafted footwear, and Tuscan leather objets.');

  // Breadcrumb current label
  const breadcrumbCurrent = useMemo(() => {
    if (filters.discountOnly || filterOnlySale) return 'Sale';
    if (filters.newOnly || filterOnlyNew) return 'New Arrivals';
    if (filters.subCategory && filters.subCategory.toLowerCase() === 'bags') return 'Bags';
    if (categoryMeta) return categoryMeta.name;
    return null;
  }, [filters.discountOnly, filterOnlySale, filters.newOnly, filterOnlyNew, filters.subCategory, categoryMeta]);

  // Determine current hero banner based on active category, filter, or subcategory
  const currentHero = useMemo(() => {
    if (filters.discountOnly || filterOnlySale) {
      return getCollectionHero('sale');
    }
    if (filters.newOnly || filterOnlyNew) {
      return getCollectionHero('new_arrivals');
    }
    if (filters.subCategory && filters.subCategory.toLowerCase() === 'bags') {
      return getCollectionHero('bags');
    }
    if (activeCategory) {
      return getCollectionHero(activeCategory);
    }
    return getCollectionHero('shop');
  }, [activeCategory, filters.discountOnly, filters.newOnly, filters.subCategory, filterOnlySale, filterOnlyNew]);

  const handleHeroCta = () => {
    if (currentHero.id === 'sale') {
      setFilters((p) => ({ ...p, discountOnly: true }));
    } else if (currentHero.id === 'new_arrivals') {
      setFilters((p) => ({ ...p, newOnly: true }));
    } else if (currentHero.id === 'bags') {
      setFilters((p) => ({ ...p, subCategory: 'Bags' }));
    } else if (currentHero.id === 'women' && activeCategory !== 'women') {
      handleCategorySwitch('women');
    } else if (currentHero.id === 'men' && activeCategory !== 'men') {
      handleCategorySwitch('men');
    } else if (currentHero.id === 'shoes' && activeCategory !== 'shoes') {
      handleCategorySwitch('shoes');
    } else if (currentHero.id === 'accessories' && activeCategory !== 'accessories') {
      handleCategorySwitch('accessories');
    } else if (currentHero.id === 'watches' && activeCategory !== 'watches') {
      handleCategorySwitch('watches');
    }

    const catalogEl = document.getElementById('collection-catalog');
    if (catalogEl) {
      catalogEl.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Category Tab Links for quick switching
  const allCategoryTabs = [
    { id: null, label: 'All Catalog', count: PRODUCTS.length },
    { id: 'women', label: 'Women', count: PRODUCTS.filter((p) => p.category === 'women').length },
    { id: 'men', label: 'Men', count: PRODUCTS.filter((p) => p.category === 'men').length },
    { id: 'watches', label: 'Watches', count: PRODUCTS.filter((p) => p.category === 'watches').length },
    { id: 'shoes', label: 'Shoes', count: PRODUCTS.filter((p) => p.category === 'shoes').length },
    { id: 'accessories', label: 'Accessories', count: PRODUCTS.filter((p) => p.category === 'accessories').length },
  ];

  const FilterControlsContent = (
    <div className="space-y-6 text-xs text-[#2B1D17]">
      {/* Category Salon Switcher */}
      <div className="space-y-2">
        <label className="text-[11px] uppercase tracking-widest text-[#6B4A3A] font-semibold block">
          Salon Collection
        </label>
        <div className="space-y-1">
          {allCategoryTabs.map((tab) => {
            const isSelected = (!tab.id && !activeCategory) || (tab.id === activeCategory);
            return (
              <button
                key={tab.label}
                onClick={() => handleCategorySwitch(tab.id)}
                className={`w-full text-left py-2 px-2.5 flex items-center justify-between transition-all cursor-pointer text-xs ${
                  isSelected
                    ? 'bg-[#2B1D17] text-[#FAF6F0] font-semibold'
                    : 'hover:bg-[#E7D6C1]/40 text-[#2B1D17]'
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`text-[10px] font-mono ${
                    isSelected ? 'text-[#C48A5A]' : 'text-[#6B4A3A]'
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Subcategory (Strictly Category-Specific) */}
      {availableSubcategories.length > 0 && (
        <div className="space-y-2 pt-3 border-t border-[#E7D6C1]/60">
          <div className="flex items-center justify-between">
            <label className="text-[11px] uppercase tracking-widest text-[#6B4A3A] font-semibold block">
              {categoryMeta ? `${categoryMeta.name} Category` : 'Garment & Objets'}
            </label>
            {filters.subCategory && (
              <button
                onClick={() => setFilters((p) => ({ ...p, subCategory: '' }))}
                className="text-[10px] text-[#C48A5A] hover:underline"
              >
                All
              </button>
            )}
          </div>
          <div className="space-y-1">
            <button
              onClick={() => setFilters((prev) => ({ ...prev, subCategory: '' }))}
              className={`w-full text-left py-1.5 px-2 flex items-center justify-between transition-colors cursor-pointer ${
                filters.subCategory === ''
                  ? 'bg-[#E7D6C1]/60 text-[#2B1D17] font-semibold'
                  : 'hover:bg-[#E7D6C1]/30 text-[#6B4A3A]'
              }`}
            >
              <span>View All {categoryMeta ? categoryMeta.name : 'Types'}</span>
              {filters.subCategory === '' && <Check className="w-3.5 h-3.5 text-[#2B1D17]" />}
            </button>
            {availableSubcategories.map((sub) => (
              <button
                key={sub}
                onClick={() => setFilters((prev) => ({ ...prev, subCategory: sub }))}
                className={`w-full text-left py-1.5 px-2 flex items-center justify-between transition-colors cursor-pointer ${
                  filters.subCategory === sub
                    ? 'bg-[#2B1D17] text-[#FAF6F0] font-semibold'
                    : 'hover:bg-[#E7D6C1]/30 text-[#2B1D17]'
                }`}
              >
                <span>{sub}</span>
                {filters.subCategory === sub && <Check className="w-3.5 h-3.5 text-[#C48A5A]" />}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Sizing Filter (Strictly Category-Specific) */}
      {availableSizes.length > 0 && (
        <div className="space-y-2 pt-3 border-t border-[#E7D6C1]/60">
          <div className="flex items-center justify-between">
            <label className="text-[11px] uppercase tracking-widest text-[#6B4A3A] font-semibold block">
              {activeCategory === 'watches'
                ? 'Case Diameter'
                : activeCategory === 'shoes'
                ? 'Shoe Size (EU)'
                : activeCategory === 'accessories'
                ? 'Dimensions / Fit'
                : 'Tailored Size'}
            </label>
            {activeCategory && activeCategory !== 'watches' && (
              <button
                onClick={() => setIsSizeGuideOpen(true)}
                className="text-[10px] text-[#C48A5A] hover:underline"
              >
                Size Guide
              </button>
            )}
          </div>
          <div className="flex flex-wrap gap-1.5">
            {availableSizes.map((sz) => {
              const isSelected = filters.sizes.includes(sz);
              return (
                <button
                  key={sz}
                  onClick={() => toggleSize(sz)}
                  className={`px-2.5 py-1 text-[11px] border transition-colors cursor-pointer ${
                    isSelected
                      ? 'border-[#2B1D17] bg-[#2B1D17] text-[#FAF6F0] font-semibold'
                      : 'border-[#E7D6C1] hover:border-[#2B1D17] bg-[#FAF6F0] text-[#2B1D17]'
                  }`}
                >
                  {sz}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Search inside catalog */}
      <div className="space-y-2 pt-3 border-t border-[#E7D6C1]/60">
        <label className="text-[11px] uppercase tracking-widest text-[#6B4A3A] font-semibold block">
          Keyword Search
        </label>
        <div className="relative">
          <input
            type="text"
            value={filters.searchQuery}
            onChange={(e) => setFilters((prev) => ({ ...prev, searchQuery: e.target.value }))}
            placeholder={
              categoryMeta
                ? `Search ${categoryMeta.name.toLowerCase()} pieces...`
                : 'Search catalog...'
            }
            className="w-full bg-[#FAF6F0] border border-[#E7D6C1] py-2 pl-8 pr-3 text-xs text-[#2B1D17] placeholder:text-[#6B4A3A]/60 focus:outline-none focus:border-[#2B1D17]"
          />
          <Search className="w-3.5 h-3.5 text-[#6B4A3A] absolute left-2.5 top-2.5" />
          {filters.searchQuery && (
            <button
              onClick={() => setFilters((prev) => ({ ...prev, searchQuery: '' }))}
              className="absolute right-2 top-2 text-[#6B4A3A] hover:text-[#2B1D17]"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Color Palette (Strictly Category-Specific) */}
      {availableColors.length > 0 && (
        <div className="space-y-2 pt-3 border-t border-[#E7D6C1]/60">
          <label className="text-[11px] uppercase tracking-widest text-[#6B4A3A] font-semibold block">
            Luxury Palette
          </label>
          <div className="flex flex-wrap gap-2">
            {availableColors.map((color) => {
              const isSelected = filters.colors.includes(color.name);
              return (
                <button
                  key={color.name}
                  onClick={() => toggleColor(color.name)}
                  className={`flex items-center gap-1.5 px-2.5 py-1 text-[11px] border transition-all cursor-pointer ${
                    isSelected
                      ? 'border-[#2B1D17] bg-[#2B1D17] text-[#FAF6F0]'
                      : 'border-[#E7D6C1] hover:border-[#6B4A3A] bg-[#FAF6F0]'
                  }`}
                >
                  <span
                    className="w-3 h-3 rounded-full border border-black/10 shrink-0"
                    style={{ backgroundColor: color.hex }}
                  />
                  <span>{color.name}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Price Range */}
      <div className="space-y-3 pt-3 border-t border-[#E7D6C1]/60">
        <div className="flex items-center justify-between">
          <label className="text-[11px] uppercase tracking-widest text-[#6B4A3A] font-semibold">
            Price Ceiling
          </label>
          <span className="text-[11px] text-[#C48A5A] font-semibold">
            {formatPKR(filters.maxPrice)}
          </span>
        </div>
        <input
          type="range"
          min="15000"
          max="160000"
          step="5000"
          value={filters.maxPrice}
          onChange={(e) => setFilters((prev) => ({ ...prev, maxPrice: Number(e.target.value) }))}
          className="w-full accent-[#2B1D17] cursor-pointer"
        />
        <div className="flex justify-between text-[10px] text-[#6B4A3A]">
          <span>PKR 15,000</span>
          <span>PKR 160,000</span>
        </div>
      </div>

      {/* Collections */}
      {availableCollections.length > 0 && (
        <div className="space-y-2 pt-3 border-t border-[#E7D6C1]/60">
          <label className="text-[11px] uppercase tracking-widest text-[#6B4A3A] font-semibold block">
            Maison Capsule
          </label>
          <select
            value={filters.collection}
            onChange={(e) => setFilters((prev) => ({ ...prev, collection: e.target.value }))}
            className="w-full bg-[#FAF6F0] border border-[#E7D6C1] p-2 text-xs text-[#2B1D17] focus:outline-none cursor-pointer"
          >
            <option value="">All Maison Capsules</option>
            {availableCollections.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Availability & Toggles */}
      <div className="space-y-2 pt-3 border-t border-[#E7D6C1]/60">
        <label className="text-[11px] uppercase tracking-widest text-[#6B4A3A] font-semibold block">
          Curated Toggles
        </label>
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-xs cursor-pointer">
            <input
              type="checkbox"
              checked={filters.availability === 'in_stock'}
              onChange={(e) =>
                setFilters((prev) => ({
                  ...prev,
                  availability: e.target.checked ? 'in_stock' : 'all',
                }))
              }
              className="accent-[#2B1D17]"
            />
            <span>Immediate Dispatch (In Stock)</span>
          </label>

          <label className="flex items-center gap-2 text-xs cursor-pointer">
            <input
              type="checkbox"
              checked={filters.discountOnly}
              onChange={(e) => setFilters((prev) => ({ ...prev, discountOnly: e.target.checked }))}
              className="accent-[#2B1D17]"
            />
            <span>Privileged Archive Deals</span>
          </label>

          <label className="flex items-center gap-2 text-xs cursor-pointer">
            <input
              type="checkbox"
              checked={filters.newOnly}
              onChange={(e) => setFilters((prev) => ({ ...prev, newOnly: e.target.checked }))}
              className="accent-[#2B1D17]"
            />
            <span>New Season Releases</span>
          </label>
        </div>
      </div>

      {/* Reset Filter Button */}
      {hasActiveFilters && (
        <button
          onClick={resetFilters}
          className="w-full mt-4 flex items-center justify-center gap-1.5 py-2.5 border border-[#6B4A3A] text-xs font-semibold uppercase tracking-wider text-[#6B4A3A] hover:bg-[#6B4A3A] hover:text-[#FAF6F0] transition-colors cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset Refinements</span>
        </button>
      )}
    </div>
  );

  return (
    <div className="w-full">
      {/* Category Navigation Breadcrumb & Back to All */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-5 pb-3">
        <div className="flex items-center justify-between text-xs text-[#6B4A3A]">
          <div className="flex items-center gap-2 uppercase tracking-widest text-[11px]">
            <button
              onClick={() => setCurrentPage('home')}
              className="hover:text-[#2B1D17] transition-colors cursor-pointer"
            >
              Home
            </button>
            <span>/</span>
            <button
              onClick={() => handleCategorySwitch(null)}
              className={`transition-colors cursor-pointer ${
                !breadcrumbCurrent ? 'text-[#2B1D17] font-semibold' : 'hover:text-[#2B1D17]'
              }`}
            >
              Shop
            </button>
            {breadcrumbCurrent && (
              <>
                <span>/</span>
                <span className="text-[#2B1D17] font-bold tracking-wider uppercase">
                  {breadcrumbCurrent}
                </span>
              </>
            )}
          </div>

          {activeCategory || filters.discountOnly || filters.newOnly || filters.subCategory ? (
            <button
              onClick={() => {
                handleCategorySwitch(null);
                setFilters((p) => ({ ...p, discountOnly: false, newOnly: false, subCategory: '' }));
              }}
              className="inline-flex items-center gap-1.5 text-[11px] uppercase tracking-wider text-[#C48A5A] hover:text-[#2B1D17] font-medium transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Return to All Catalog</span>
            </button>
          ) : (
            <span className="text-[11px] uppercase tracking-wider text-[#6B4A3A]">
              Showing all salons ({PRODUCTS.length} creations)
            </span>
          )}
        </div>
      </div>

      {/* Premium Editorial Hero Banner - placed immediately below breadcrumb navigation */}
      <CollectionHeroBanner hero={currentHero} onCtaClick={handleHeroCta} />

      {/* Main Catalog Section */}
      <div id="collection-catalog" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        {/* Quick Subcategory Filter Pills (Category Specific) */}
        {availableSubcategories.length > 0 && (
          <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-6 scrollbar-none border-b border-[#E7D6C1]/60">
            <span className="text-[11px] uppercase tracking-widest text-[#6B4A3A] font-semibold shrink-0 mr-1">
              Sub-Collection:
            </span>
            <button
              onClick={() => setFilters((prev) => ({ ...prev, subCategory: '' }))}
              className={`px-3 py-1.5 text-xs whitespace-nowrap transition-colors cursor-pointer ${
                filters.subCategory === ''
                  ? 'bg-[#2B1D17] text-[#FAF6F0] font-semibold'
                  : 'bg-[#FAF6F0] border border-[#E7D6C1] text-[#2B1D17] hover:border-[#2B1D17]'
              }`}
            >
              All {categoryMeta ? categoryMeta.name : 'Items'} ({baseCategoryProducts.length})
            </button>
            {availableSubcategories.map((sub) => {
              const count = baseCategoryProducts.filter((p) => p.subCategory === sub).length;
              const isSelected = filters.subCategory === sub;
              return (
                <button
                  key={sub}
                  onClick={() => setFilters((prev) => ({ ...prev, subCategory: isSelected ? '' : sub }))}
                  className={`px-3 py-1.5 text-xs whitespace-nowrap transition-colors cursor-pointer ${
                    isSelected
                      ? 'bg-[#2B1D17] text-[#FAF6F0] font-semibold'
                      : 'bg-[#FAF6F0] border border-[#E7D6C1] text-[#2B1D17] hover:border-[#2B1D17]'
                  }`}
                >
                  {sub} ({count})
                </button>
              );
            })}
          </div>
        )}

      {/* Filter & Sort Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8 pb-4 border-b border-[#E7D6C1]">
        {/* Mobile Filter Button */}
        <button
          onClick={() => setIsMobileFiltersOpen(true)}
          className="lg:hidden flex items-center gap-2 bg-[#2B1D17] text-[#FAF6F0] px-4 py-2.5 text-xs tracking-wider uppercase font-medium"
        >
          <SlidersHorizontal className="w-3.5 h-3.5" />
          <span>Refine ({filteredProducts.length})</span>
        </button>

        {/* Counter and Active Chips */}
        <div className="flex items-center flex-wrap gap-2 text-xs">
          <span className="text-xs text-[#6B4A3A] mr-2">
            Showing <strong className="text-[#2B1D17] font-semibold">{filteredProducts.length}</strong> of{' '}
            {baseCategoryProducts.length} creations
          </span>

          {filters.subCategory && (
            <span className="inline-flex items-center gap-1 bg-[#E7D6C1]/60 px-2.5 py-1 text-[#2B1D17]">
              Type: {filters.subCategory}
              <X
                className="w-3 h-3 cursor-pointer hover:text-[#C48A5A]"
                onClick={() => setFilters((p) => ({ ...p, subCategory: '' }))}
              />
            </span>
          )}

          {filters.sizes.map((s) => (
            <span key={s} className="inline-flex items-center gap-1 bg-[#E7D6C1]/60 px-2.5 py-1 text-[#2B1D17]">
              Size: {s}
              <X className="w-3 h-3 cursor-pointer hover:text-[#C48A5A]" onClick={() => toggleSize(s)} />
            </span>
          ))}

          {filters.colors.map((c) => (
            <span key={c} className="inline-flex items-center gap-1 bg-[#E7D6C1]/60 px-2.5 py-1 text-[#2B1D17]">
              Color: {c}
              <X className="w-3 h-3 cursor-pointer hover:text-[#C48A5A]" onClick={() => toggleColor(c)} />
            </span>
          ))}

          {filters.discountOnly && (
            <span className="inline-flex items-center gap-1 bg-[#E7D6C1]/60 px-2.5 py-1 text-[#2B1D17]">
              Archive Deals
              <X
                className="w-3 h-3 cursor-pointer hover:text-[#C48A5A]"
                onClick={() => setFilters((p) => ({ ...p, discountOnly: false }))}
              />
            </span>
          )}

          {hasActiveFilters && (
            <button
              onClick={resetFilters}
              className="text-xs text-[#C48A5A] hover:underline font-semibold ml-2 cursor-pointer"
            >
              Clear All
            </button>
          )}
        </div>

        {/* Sort Dropdown */}
        <div className="flex items-center gap-2 ml-auto">
          <span className="text-xs text-[#6B4A3A] font-medium hidden sm:inline">Sort By:</span>
          <div className="relative">
            <select
              value={filters.sort}
              onChange={(e) => setFilters((prev) => ({ ...prev, sort: e.target.value as any }))}
              className="appearance-none bg-[#FAF6F0] border border-[#E7D6C1] py-2 pl-3 pr-8 text-xs text-[#2B1D17] font-medium focus:outline-none cursor-pointer"
            >
              <option value="featured">Featured Curations</option>
              <option value="newest">Newest Releases</option>
              <option value="bestseller">Best Selling</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="rating_desc">Highest Rated</option>
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-[#6B4A3A] absolute right-2.5 top-3 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Main Layout: Desktop Sidebar + Product Grid */}
      <div className="flex gap-8 items-start">
        {/* Desktop Sidebar Filters */}
        <aside className="hidden lg:block w-64 shrink-0 bg-white border border-[#E2D4C3] p-5 sticky top-24 shadow-[0_4px_24px_rgba(43,29,23,0.06)]">
          <div className="flex items-center justify-between pb-3 border-b border-[#EFE5D8] mb-5">
            <span className="font-sans text-base font-semibold text-[#1F140E]">Refine Atelier</span>
            <SlidersHorizontal className="w-4 h-4 text-[#7A6253]" />
          </div>
          {FilterControlsContent}
        </aside>

        {/* Product Cards Grid: Desktop 4, Tablet 3, Mobile 2 */}
        <div className="flex-1">
          {filteredProducts.length === 0 ? (
            <div className="py-20 text-center bg-white border border-[#E2D4C3] p-8 shadow-xs">
              <h3 className="font-heading text-2xl sm:text-3xl text-[#1F140E] tracking-[0.03em] leading-none">No Products Found</h3>
              <p className="text-xs text-[#523B2F] mt-2 max-w-sm mx-auto">
                No pieces found matching your specific size, color, or price refinements within this category.
              </p>
              <button
                onClick={resetFilters}
                className="mt-5 bg-[#1F140E] text-[#FAF6F0] px-6 py-2.5 text-xs uppercase tracking-widest font-semibold hover:bg-[#A66838] transition-colors cursor-pointer shadow-xs"
              >
                Reset Refinements
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
              {filteredProducts.map((product, idx) => (
                <ProductCard key={product.id} product={product} priority={idx < 8} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* CATEGORY-SPECIFIC REVIEWS SECTION */}
      {categoryReviews.length > 0 && (
        <section className="mt-20 pt-12 border-t border-[#E2D4C3]">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
            <div>
              <span className="text-[10px] uppercase tracking-[0.25em] text-[#A66838] font-semibold">
                Verified Atelier Patrons
              </span>
              <h2 className="font-heading text-3xl sm:text-4xl text-[#1F140E] tracking-[0.03em] leading-none mt-1">
                {categoryMeta ? `${categoryMeta.name} Reviews` : 'Customer Reviews'}
              </h2>
              <p className="text-xs text-[#523B2F] mt-1">
                Authentic perspectives on tactile materials, tailored drape, and horological precision.
              </p>
            </div>

            <div className="flex items-center gap-2 text-xs text-[#1F140E]">
              <div className="flex text-[#A66838]">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-3.5 h-3.5 fill-current" />
                ))}
              </div>
              <span className="font-semibold">4.9 / 5.0 Average Satisfaction</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {categoryReviews.slice(0, 3).map((rev) => {
              const matchedProduct = PRODUCTS.find((p) => p.id === rev.productId);
              return (
                <div
                  key={rev.id}
                  className="bg-white border border-[#E2D4C3] p-6 flex flex-col justify-between shadow-xs hover:border-[#A66838] transition-all"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <div className="flex text-[#A66838]">
                        {[...Array(rev.rating)].map((_, i) => (
                          <Star key={i} className="w-3.5 h-3.5 fill-current" />
                        ))}
                      </div>
                      <span className="text-[10px] text-[#7A6253] font-medium">{rev.date}</span>
                    </div>

                    <h4 className="font-sans text-sm font-semibold text-[#1F140E] mb-2 leading-snug">
                      "{rev.title}"
                    </h4>

                    <p className="text-xs text-[#3D2B22] leading-relaxed mb-4 font-light">
                      {rev.comment}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-[#EFE5D8] flex items-center justify-between">
                    <div>
                      <p className="text-xs font-semibold text-[#1F140E]">{rev.author}</p>
                      <p className="text-[10px] text-[#7A6253]">{rev.city}</p>
                    </div>

                    {matchedProduct && (
                      <span className="text-[10px] bg-[#FAF6F0] border border-[#E2D4C3] px-2 py-0.5 text-[#1F140E] truncate max-w-[120px] font-medium">
                        {matchedProduct.name}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}
      </div>

      {/* Mobile Drawer / Modal */}
      {isMobileFiltersOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="fixed inset-0 bg-[#2B1D17]/70 backdrop-blur-xs"
            onClick={() => setIsMobileFiltersOpen(false)}
          />
          <div className="fixed inset-y-0 right-0 max-w-xs w-full bg-[#FAF6F0] shadow-2xl p-6 overflow-y-auto flex flex-col justify-between z-50">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-[#E7D6C1] mb-6">
                <div>
                  <span className="font-sans text-lg font-bold text-[#2B1D17]">
                    {categoryMeta ? `${categoryMeta.name} Refinements` : 'Filter Catalog'}
                  </span>
                  <p className="text-[10px] text-[#6B4A3A]">
                    {filteredProducts.length} pieces matching
                  </p>
                </div>
                <button
                  onClick={() => setIsMobileFiltersOpen(false)}
                  className="p-1 text-[#2B1D17] hover:text-[#C48A5A]"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              {FilterControlsContent}
            </div>

            <div className="pt-6 border-t border-[#E7D6C1] mt-6">
              <button
                onClick={() => setIsMobileFiltersOpen(false)}
                className="w-full bg-[#2B1D17] text-[#FAF6F0] py-3 text-xs uppercase tracking-widest font-semibold cursor-pointer"
              >
                Apply Filters ({filteredProducts.length})
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
