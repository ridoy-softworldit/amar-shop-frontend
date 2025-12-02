
import CategoryView from "@/components/category/CategoryView";

export default function CategoryPage({ params }: { params: { slug: string } }) {
  const slug = decodeURIComponent(params.slug);
  return <CategoryView slug={slug} />;
}
