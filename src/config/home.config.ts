
export const homeLayout = {
  hero: {
    showLeftCategory: true,
    showCenterSlider: true,
    showRightPromo: true,
  },
  rails: [
    { type: "category", title: "Shop by Category", limit: 12 },
    {
      type: "products",
      key: "discounted",
      title: "Hot Deals",
      query: { discounted: "true", limit: 12 },
    },
    {
      type: "products",
      key: "featured",
      title: "Editor’s Picks",
      query: { featured: "true", sort: "createdAt:desc", limit: 12 },
    },
    {
      type: "products",
      key: "latest",
      title: "New Arrivals",
      query: { sort: "createdAt:desc", limit: 12 },
    },
  ],
} as const;
