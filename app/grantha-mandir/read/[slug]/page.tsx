import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Footer from "@/components/sections/Footer";
import ReadingContent from "@/components/grantha/ReadingContent";
import {
  getAllArticles,
  getArticle,
  getArticleNeighbours,
  getRelatedArticles,
} from "@/lib/grantha";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return getAllArticles().map((article) => ({ slug: article.slug }));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const article = getArticle(slug);
  if (!article) return { title: "Grantha Mandir | Hariboll Mandir" };
  return {
    title: `${article.title} | Grantha Mandir`,
    description: article.excerpt,
  };
}

export default async function ReadArticlePage({ params }: PageProps) {
  const { slug } = await params;
  const article = getArticle(slug);
  if (!article) notFound();

  const { previous, next } = getArticleNeighbours(slug);
  const related = getRelatedArticles(slug, 3);

  return (
    <>
      <ReadingContent
        article={article}
        previous={previous}
        next={next}
        related={related}
      />
      <Footer />
    </>
  );
}
