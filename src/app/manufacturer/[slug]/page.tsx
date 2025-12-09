import ManufacturerView from "@/components/manufacturer/ManufacturerView";

export default async function ManufacturerPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const decodedSlug = decodeURIComponent(slug);
  return <ManufacturerView slug={decodedSlug} />;
}