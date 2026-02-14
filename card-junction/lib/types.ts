export type BuyingOption = "AUCTION" | "FIXED_PRICE" | "BEST_OFFER";

export type EbayItemSummary = {
  itemId: string;
  title: string;
  itemWebUrl: string;
  image?: { imageUrl: string };
  price?: { value: string; currency: string };
  shippingOptions?: Array<{ shippingCost?: { value: string; currency: string } }>;
  buyingOptions?: BuyingOption[];
  itemEndDate?: string;
  condition?: string;
  conditionId?: string;
};

export type EbaySearchResponse = {
  href?: string;
  total?: number;
  next?: string;
  itemSummaries?: EbayItemSummary[];
};
