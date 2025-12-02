export type Banner = {
  _id: string;
  image: string;
  title: string;
  subtitle: string;
  discount?: string;
  status: "ACTIVE" | "HIDDEN";
  sort: number;
  position: "hero" | "side";
  createdAt?: string;
  updatedAt?: string;
  category?: string | { _id: string; slug?: string; title?: string };
};
