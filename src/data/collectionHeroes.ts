import womenHeroImg from '../assets/images/women_banner_sharp_1789201003284.jpg';
import womenHeroWebp from '../assets/images/women_banner_sharp_1789201003284.webp';
import womenHeroMobileWebp from '../assets/images/women_banner_sharp_1789201003284_mobile.webp';

import menHeroImg from '../assets/images/men_banner_sharp_1789201020990.jpg';
import menHeroWebp from '../assets/images/men_banner_sharp_1789201020990.webp';
import menHeroMobileWebp from '../assets/images/men_banner_sharp_1789201020990_mobile.webp';

import shoesHeroImg from '../assets/images/shoes_banner_sharp_1789201041631.jpg';
import shoesHeroWebp from '../assets/images/shoes_banner_sharp_1789201041631.webp';
import shoesHeroMobileWebp from '../assets/images/shoes_banner_sharp_1789201041631_mobile.webp';

import bagsHeroImg from '../assets/images/bags_banner_sharp_1789201058458.jpg';
import bagsHeroWebp from '../assets/images/bags_banner_sharp_1789201058458.webp';
import bagsHeroMobileWebp from '../assets/images/bags_banner_sharp_1789201058458_mobile.webp';

import accessoriesHeroImg from '../assets/images/acc_banner_sharp_1789201071570.jpg';
import accessoriesHeroWebp from '../assets/images/acc_banner_sharp_1789201071570.webp';
import accessoriesHeroMobileWebp from '../assets/images/acc_banner_sharp_1789201071570_mobile.webp';

import newArrivalsHeroImg from '../assets/images/new_banner_sharp_1789201088133.jpg';
import newArrivalsHeroWebp from '../assets/images/new_banner_sharp_1789201088133.webp';
import newArrivalsHeroMobileWebp from '../assets/images/new_banner_sharp_1789201088133_mobile.webp';

import saleHeroImg from '../assets/images/sale_banner_sharp_1789201105674.jpg';
import saleHeroWebp from '../assets/images/sale_banner_sharp_1789201105674.webp';
import saleHeroMobileWebp from '../assets/images/sale_banner_sharp_1789201105674_mobile.webp';

import watchesHeroImg from '../assets/images/watch_banner_sharp_1789201124799.jpg';
import watchesHeroWebp from '../assets/images/watch_banner_sharp_1789201124799.webp';
import watchesHeroMobileWebp from '../assets/images/watch_banner_sharp_1789201124799_mobile.webp';

import shopHeroImg from '../assets/images/shop_banner_sharp_1789201139959.jpg';
import shopHeroWebp from '../assets/images/shop_banner_sharp_1789201139959.webp';
import shopHeroMobileWebp from '../assets/images/shop_banner_sharp_1789201139959_mobile.webp';

export interface CollectionHeroData {
  id: string;
  label: string;
  title: string;
  description: string;
  cta: string;
  image: string;
  imageWebp: string;
  imageMobileWebp: string;
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
    imageWebp: womenHeroWebp,
    imageMobileWebp: womenHeroMobileWebp,
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
    imageWebp: menHeroWebp,
    imageMobileWebp: menHeroMobileWebp,
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
    imageWebp: shoesHeroWebp,
    imageMobileWebp: shoesHeroMobileWebp,
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
    imageWebp: bagsHeroWebp,
    imageMobileWebp: bagsHeroMobileWebp,
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
    imageWebp: accessoriesHeroWebp,
    imageMobileWebp: accessoriesHeroMobileWebp,
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
    imageWebp: newArrivalsHeroWebp,
    imageMobileWebp: newArrivalsHeroMobileWebp,
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
    imageWebp: saleHeroWebp,
    imageMobileWebp: saleHeroMobileWebp,
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
    imageWebp: watchesHeroWebp,
    imageMobileWebp: watchesHeroMobileWebp,
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
    imageWebp: shopHeroWebp,
    imageMobileWebp: shopHeroMobileWebp,
    alt: 'Haute couture editorial campaign portrait in historic European palazzo',
    themeBg: '#EFE8DF',
  },
};

export function getCollectionHero(categoryKey: string): CollectionHeroData {
  const normalized = categoryKey.toLowerCase().trim();
  return COLLECTION_HEROES[normalized] || COLLECTION_HEROES.shop;
}
