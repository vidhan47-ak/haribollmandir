import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Footer from "@/components/sections/Footer";
import CollectionContent from "@/components/grantha/CollectionContent";
import {
  getCollections,
  getCollection,
  estimateReadingMinutes,
  type ArticleRef,
} from "@/lib/grantha";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return getCollections().map((collection) => ({ slug: collection.slug }));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const collection = getCollection(slug);
  if (!collection) return { title: "Collection — Grantha Mandir" };
  return {
    title: `${collection.title} | Grantha Mandir`,
    description: collection.description,
  };
}

export default async function CollectionPage({ params }: PageProps) {
  const { slug } = await params;
  const collection = getCollection(slug);
  if (!collection) notFound();

  const articles: ArticleRef[] = collection.articles.map((article) => ({
    ...article,
    collectionSlug: collection.slug,
    collectionTitle: collection.title,
    kind: collection.kind,
    pdfUrl: collection.pdfUrl,
    readingMinutes: estimateReadingMinutes(article.blocks),
  }));

  const totalMinutes = articles.reduce((sum, a) => sum + a.readingMinutes, 0);

  return (
    <>
      <CollectionContent
        collection={collection}
        articles={articles}
        totalMinutes={totalMinutes}
      />
      <Footer />
    </>
  );
}
