import womenHeroImg from '../assets/images/women_banner_sharp_1789201003284.jpg';
import menHeroImg from '../assets/images/men_banner_sharp_1789201020990.jpg';
import shoesHeroImg from '../assets/images/shoes_banner_sharp_1789201041631.jpg';
import bagsHeroImg from '../assets/images/bags_banner_sharp_1789201058458.jpg';
import accessoriesHeroImg from '../assets/images/acc_banner_sharp_1789201071570.jpg';
import newArrivalsHeroImg from '../assets/images/new_banner_sharp_1789201088133.jpg';
import saleHeroImg from '../assets/images/sale_banner_sharp_1789201105674.jpg';
import watchesHeroImg from '../assets/images/watch_banner_sharp_1789201124799.jpg';
import shopHeroImg from '../assets/images/shop_banner_sharp_1789201139959.jpg';

export interface CollectionHeroData {
  id: string;
  label: string;
  title: string;
  description: string;
  cta: string;
  image: string;
  alt: string;
  themeBg?: string;
}

export const COLLECTION_HEROES: Record<string, CollectionHeroData> = {
  women: {
    id: 'women',
    label: "WOMEN'S COLLECTION",
    title: 'Timeless Elegance',
    description: 'Discover sophisticated silhouettes crafted from luxurious fabrics for the modern woman.',
    cta: 'Shop All Women',
    image: womenHeroImg,
    alt: 'Luxury female model in embroidered champagne silk couture gown beside stone columns in golden sunlight',
    themeBg: '#EFE8DF',
  },
  men: {
    id: 'men',
    label: "MEN'S SARTORIAL COLLECTION",
    title: 'Quiet Authority',
    description: 'Deconstructed Italian tailoring, virgin wool coats, and timeless silhouettes engineered with uncompromising precision.',
    cta: 'Shop All Men',
    image: menHeroImg,
    alt: 'Luxury gentleman wearing tailored camel wool coat in sunlit palazzo courtyard',
    themeBg: '#EFE8DF',
  },
  shoes: {
    id: 'shoes',
    label: 'ARTISANAL FOOTWEAR',
    title: 'Mastercrafted Soles',
    description: 'Blake-stitched French calfskin, burnished patina loafers, and supple suede Chelsea boots shaped in Venetian workshops.',
    cta: 'Shop All Shoes',
    image: shoesHeroImg,
    alt: 'Artisan burnished calfskin penny loafers and suede boots on travertine plinth',
    themeBg: '#EFE8DF',
  },
  bags: {
    id: 'bags',
    label: 'LEATHER GOODS & BAGS',
    title: 'Sculptural Form',
    description: 'Full-grain Tuscan vachetta leather bags, structured architectural totes, and hand-finished palladium hardware.',
    cta: 'Shop All Bags',
    image: bagsHeroImg,
    alt: 'Handcrafted luxury leather handbag in warm cognac tan on limestone plinth',
    themeBg: '#EFE8DF',
  },
  accessories: {
    id: 'accessories',
    label: 'HAUTE ACCESSORIES',
    title: 'The Finishing Distinction',
    description: 'Combed cashmere stoles, Japanese titanium optics, and hand-polished precious accents designed to elevate every silhouette.',
    cta: 'Shop Accessories',
    image: accessoriesHeroImg,
    alt: 'Fine luxury watches, scarves, sunglasses, and hammered gold cuff on Italian marble slab',
    themeBg: '#EFE8DF',
  },
  new_arrivals: {
    id: 'new_arrivals',
    label: 'SEASONAL EDIT 2026',
    title: 'The New Silhouette',
    description: 'Explore our latest limited-run creations, straight from the cutting tables of our Florence and Lahore master tailors.',
    cta: 'Explore New Arrivals',
    image: newArrivalsHeroImg,
    alt: 'High fashion models wearing latest seasonal cashmere and silk outerwear on architectural staircase',
    themeBg: '#EFE8DF',
  },
  sale: {
    id: 'sale',
    label: 'PRIVILEGED ARCHIVE',
    title: 'Enduring Value',
    description: 'Rare seasonal access to iconic archival garments and collector pieces offered with courtesy patronage savings.',
    cta: 'Shop Archive Deals',
    image: saleHeroImg,
    alt: 'Iconic luxury model in camel cashmere cape coat walking through neoclassical colonnade',
    themeBg: '#EFE8DF',
  },
  watches: {
    id: 'watches',
    label: 'HIGH HOROLOGY',
    title: 'Precision for Generations',
    description: 'Swiss-calibre mechanical movements, double anti-reflective sapphire crystals, and exhibition casebacks built to outlast generations.',
    cta: 'Discover Horology',
    image: watchesHeroImg,
    alt: 'Swiss automatic chronograph timepiece in warm atelier lighting',
    themeBg: '#EFE8DF',
  },
  shop: {
    id: 'shop',
    label: 'THE COMPLETE ATELIER',
    title: 'The Haute Couture Archive',
    description: 'The complete anthology of Lumora quiet luxury, from fluid Como silks to Neapolitan tailoring and Tuscan leatherworks.',
    cta: 'Explore All Creations',
    image: shopHeroImg,
    alt: 'Haute couture editorial campaign portrait in historic European palazzo',
    themeBg: '#EFE8DF',
  },
};

export function getCollectionHero(categoryKey: string): CollectionHeroData {
  const normalized = categoryKey.toLowerCase().trim();
  return COLLECTION_HEROES[normalized] || COLLECTION_HEROES.shop;
}
