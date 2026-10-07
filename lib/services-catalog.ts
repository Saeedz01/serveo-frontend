import type { LucideIcon } from "lucide-react";
import {
  Flame,
  Hammer,
  PaintRoller,
  Sparkles,
  Trees,
  Truck,
  Wrench,
} from "lucide-react";

export type ServiceCategory = {
  id: string;
  label: string;
  icon: LucideIcon;
};

export type CatalogService = {
  id: string;
  title: string;
  priceLabel: string;
  imageSrc: string;
  imageAlt: string;
  categoryId: string;
};

export const serviceCategories: ServiceCategory[] = [
  { id: "assembly", label: "Assembly", icon: Wrench },
  { id: "moving", label: "Moving", icon: Truck },
  { id: "cleaning", label: "Cleaning", icon: Sparkles },
  { id: "outdoor", label: "Outdoor Help", icon: Trees },
  { id: "repairs", label: "Home Repairs", icon: Hammer },
  { id: "painting", label: "Painting", icon: PaintRoller },
  { id: "trending", label: "Trending", icon: Flame },
];

export const catalogServices: CatalogService[] = [
  {
    id: "furniture-assembly",
    title: "Furniture Assembly",
    priceLabel: "Projects starting at $49",
    imageSrc:
      "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=800&q=80",
    imageAlt: "Wooden furniture pieces ready for assembly",
    categoryId: "assembly",
  },
  {
    id: "ikea-assembly",
    title: "IKEA Assembly",
    priceLabel: "Projects starting at $55",
    imageSrc: "/services/ikea-assembly.jpg",
    imageAlt: "IKEA-style shelving and furniture ready for assembly",
    categoryId: "assembly",
  },

  {
    id: "desk-assembly",
    title: "Desk Assembly",
    priceLabel: "Projects starting at $45",
    imageSrc:
      "https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?auto=format&fit=crop&w=800&q=80",
    imageAlt: "Modern desk setup in a home office",
    categoryId: "assembly",
  },
  {
    id: "bookshelf-assembly",
    title: "Bookshelf Assembly",
    priceLabel: "Projects starting at $49",
    imageSrc:
      "https://images.unsplash.com/photo-1594620302200-9a762244a156?auto=format&fit=crop&w=800&q=80",
    imageAlt: "Books arranged on a wooden bookshelf",
    categoryId: "assembly",
  },
  {
    id: "help-moving",
    title: "Help Moving",
    priceLabel: "Projects starting at $67",
    imageSrc:
      "https://images.unsplash.com/photo-1600518464441-9154a4dea21b?auto=format&fit=crop&w=800&q=80",
    imageAlt: "Movers carrying boxes during a home move",
    categoryId: "moving",
  },
  {
    id: "flat-rate-move",
    title: "Flat-Rate Move",
    priceLabel: "Flat rate from $139",
    imageSrc:
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80",
    imageAlt: "Home exterior ready for a moving day",
    categoryId: "moving",
  },
  {
    id: "heavy-lifting",
    title: "Heavy Lifting",
    priceLabel: "Projects starting at $59",
    imageSrc:
      "https://images.unsplash.com/photo-1600880292203-757bb62b4baf?auto=format&fit=crop&w=800&q=80",
    imageAlt: "People carefully moving furniture indoors",
    categoryId: "moving",
  },
  {
    id: "apartment-move-in",
    title: "Apartment Move-In",
    priceLabel: "Projects starting at $79",
    imageSrc:
      "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=800&q=80",
    imageAlt: "Bright apartment living room during move-in",
    categoryId: "moving",
  },
  {
    id: "home-cleaning",
    title: "Home & Apartment Cleaning",
    priceLabel: "Projects starting at $49",
    imageSrc:
      "https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=800&q=80",
    imageAlt: "Professional cleaning a bright home interior",
    categoryId: "cleaning",
  },
  {
    id: "deep-cleaning",
    title: "Deep Cleaning",
    priceLabel: "Projects starting at $89",
    imageSrc:
      "https://images.unsplash.com/photo-1527515637462-cff94eecc1ac?auto=format&fit=crop&w=800&q=80",
    imageAlt: "Clean kitchen counters after a deep clean",
    categoryId: "cleaning",
  },
  {
    id: "move-out-cleaning",
    title: "Move-Out Cleaning",
    priceLabel: "Projects starting at $99",
    imageSrc:
      "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=800&q=80",
    imageAlt: "Spotless bathroom after a move-out clean",
    categoryId: "cleaning",
  },
  {
    id: "yard-work",
    title: "Yard Work",
    priceLabel: "Projects starting at $55",
    imageSrc:
      "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?auto=format&fit=crop&w=800&q=80",
    imageAlt: "Person tending a green garden yard",
    categoryId: "outdoor",
  },
  {
    id: "lawn-care",
    title: "Lawn Care",
    priceLabel: "Projects starting at $49",
    imageSrc:
      "https://images.unsplash.com/photo-1558904541-efa843a96f01?auto=format&fit=crop&w=800&q=80",
    imageAlt: "Freshly maintained green lawn",
    categoryId: "outdoor",
  },
  {
    id: "garden-cleanup",
    title: "Garden Cleanup",
    priceLabel: "Projects starting at $65",
    imageSrc:
      "https://images.unsplash.com/photo-1466692476866-aef1dfb1e735?auto=format&fit=crop&w=800&q=80",
    imageAlt: "Garden beds being cleaned and organized",
    categoryId: "outdoor",
  },
  {
    id: "plumbing",
    title: "Minor Plumbing Repairs",
    priceLabel: "Projects starting at $74",
    imageSrc:
      "https://images.unsplash.com/photo-1607472586893-edb57bdc0e39?auto=format&fit=crop&w=800&q=80",
    imageAlt: "Plumbing tools near a home sink",
    categoryId: "repairs",
  },
  {
    id: "electrical",
    title: "Electrical Help",
    priceLabel: "Projects starting at $69",
    imageSrc:
      "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=800&q=80",
    imageAlt: "Electrician working on a wall outlet",
    categoryId: "repairs",
  },
  {
    id: "door-lock-fixes",
    title: "Door & Lock Fixes",
    priceLabel: "Projects starting at $59",
    imageSrc:
      "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=800&q=80",
    imageAlt: "Close-up of a residential door lock",
    categoryId: "repairs",
  },
  {
    id: "interior-painting",
    title: "Interior Painting",
    priceLabel: "Projects starting at $99",
    imageSrc:
      "https://images.unsplash.com/photo-1562259949-e8e7689d7828?auto=format&fit=crop&w=800&q=80",
    imageAlt: "Paint roller applying color to an interior wall",
    categoryId: "painting",
  },
  {
    id: "accent-wall",
    title: "Accent Wall Painting",
    priceLabel: "Projects starting at $79",
    imageSrc:
      "https://images.unsplash.com/photo-1589939705384-5185137a7f0f?auto=format&fit=crop&w=800&q=80",
    imageAlt: "Freshly painted accent wall in a living space",
    categoryId: "painting",
  },
  {
    id: "smart-home",
    title: "Smart Home Setup",
    priceLabel: "Projects starting at $69",
    imageSrc:
      "https://images.unsplash.com/photo-1558002038-1055907df827?auto=format&fit=crop&w=800&q=80",
    imageAlt: "Smart home devices on a modern shelf",
    categoryId: "trending",
  },
  {
    id: "closet-organization",
    title: "Closet Organization",
    priceLabel: "Projects starting at $59",
    imageSrc:
      "https://images.unsplash.com/photo-1616594039964-ae9021a400a0?auto=format&fit=crop&w=800&q=80",
    imageAlt: "Neatly organized closet shelves",
    categoryId: "trending",
  },
  {
    id: "holiday-decorating",
    title: "Holiday Decorating",
    priceLabel: "Projects starting at $75",
    imageSrc:
      "https://images.unsplash.com/photo-1512389142860-9c449e58a543?auto=format&fit=crop&w=800&q=80",
    imageAlt: "Festive holiday decorations in a home",
    categoryId: "trending",
  },
];

export function filterCatalogServices({
  categoryId,
  query,
}: {
  categoryId?: string;
  query?: string;
}) {
  const normalizedQuery = query?.trim().toLowerCase() ?? "";

  return catalogServices.filter((service) => {
    const matchesCategory = categoryId
      ? service.categoryId === categoryId
      : true;
    const matchesQuery = normalizedQuery
      ? service.title.toLowerCase().includes(normalizedQuery) ||
        service.priceLabel.toLowerCase().includes(normalizedQuery)
      : true;

    return matchesCategory && matchesQuery;
  });
}
