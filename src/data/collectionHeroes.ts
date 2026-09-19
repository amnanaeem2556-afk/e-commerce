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
    label: "WOMEN",
    title: 'Women’s Collection',
    description: 'Sophisticated silhouettes in fluid Como silk and double-faced cashmere.',
    cta: 'Shop Women',
    image: womenHeroImg,
    alt: 'Luxury female model in embroidered champagne silk couture gown beside stone columns in golden sunlight',
    themeBg: '#EFE8DF',
  },
  men: {
    id: 'men',
    label: "MEN",
    title: 'Men’s Sartorial',
    description: 'Deconstructed Italian tailoring and virgin wool coats engineered with precision.',
    cta: 'Shop Men',
    image: menHeroImg,
    alt: 'Luxury gentleman wearing tailored camel wool coat in sunlit palazzo courtyard',
    themeBg: '#EFE8DF',
  },
  shoes: {
    id: 'shoes',
    label: 'FOOTWEAR',
    title: 'Handcrafted Shoes',
    description: 'Blake-stitched French calfskin loafers and burnished suede boots.',
    cta: 'Shop Shoes',
    image: shoesHeroImg,
    alt: 'Artisan burnished calfskin penny loafers and suede boots on travertine plinth',
    themeBg: '#EFE8DF',
  },
  bags: {
    id: 'bags',
    label: 'LEATHER GOODS',
    title: 'Bags & Totes',
    description: 'Full-grain Tuscan vachetta leather bags with custom palladium hardware.',
    cta: 'Shop Bags',
    image: bagsHeroImg,
    alt: 'Handcrafted luxury leather handbag in warm cognac tan on limestone plinth',
    themeBg: '#EFE8DF',
  },
  accessories: {
    id: 'accessories',
    label: 'ACCESSORIES',
    title: 'Fine Accessories',
    description: 'Combed cashmere stoles, Japanese optics, and refined precious accents.',
    cta: 'Shop Accessories',
    image: accessoriesHeroImg,
    alt: 'Fine luxury watches, scarves, sunglasses, and hammered gold cuff on Italian marble slab',
    themeBg: '#EFE8DF',
  },
  new_arrivals: {
    id: 'new_arrivals',
    label: 'NEW SEASON',
    title: 'New Arrivals',
    description: 'The latest limited-run creations crafted in our Northern Italy and Lahore ateliers.',
    cta: 'Explore New Arrivals',
    image: newArrivalsHeroImg,
    alt: 'High fashion models wearing latest seasonal cashmere and silk outerwear on architectural staircase',
    themeBg: '#EFE8DF',
  },
  sale: {
    id: 'sale',
    label: 'ARCHIVE',
    title: 'Archive Sale',
    description: 'Curated seasonal selection of iconic archival pieces with courtesy savings.',
    cta: 'Shop Archive',
    image: saleHeroImg,
    alt: 'Iconic luxury model in camel cashmere cape coat walking through neoclassical colonnade',
    themeBg: '#EFE8DF',
  },
  watches: {
    id: 'watches',
    label: 'HOROLOGY',
    title: 'Luxury Timepieces',
    description: 'Swiss-automatic calibres with anti-reflective sapphire crystals.',
    cta: 'Discover Watches',
    image: watchesHeroImg,
    alt: 'Swiss automatic chronograph timepiece in warm atelier lighting',
    themeBg: '#EFE8DF',
  },
  shop: {
    id: 'shop',
    label: 'COLLECTIONS',
    title: 'All Collections',
    description: 'The complete Lumora catalog, from Como silks to Neapolitan tailoring and leatherworks.',
    cta: 'Explore Catalog',
    image: shopHeroImg,
    alt: 'Haute couture editorial campaign portrait in historic European palazzo',
    themeBg: '#EFE8DF',
  },
};

export function getCollectionHero(categoryKey: string): CollectionHeroData {
  const normalized = categoryKey.toLowerCase().trim();
  return COLLECTION_HEROES[normalized] || COLLECTION_HEROES.shop;
}
