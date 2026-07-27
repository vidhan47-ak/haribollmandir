import Footer from "@/components/sections/Footer";
import LibraryContent from "@/components/grantha/LibraryContent";
import {
  getCollections,
  getAllArticles,
} from "@/lib/grantha";
import { romanizeArticleForSearch } from "@/lib/translit";

export default function GranthaMandirPage() {
  const collections = getCollections();
  const articles = getAllArticles();

  // Featured: the first article of the collection flagged featured, else newest.
  const featuredCollection =
    collections.find((c) => c.featured) ?? collections[0];
  const featured = articles.find(
    (a) => a.collectionSlug === featuredCollection?.slug,
  );

  // Recently added: articles from collections sorted by addedAt (newest first).
  const addedOrder = new Map(
    [...collections]
      .sort((a, b) => (b.addedAt ?? "").localeCompare(a.addedAt ?? ""))
      .map((c, i) => [c.slug, i] as const),
  );
  const recent = [...articles]
    .sort(
      (a, b) =>
        (addedOrder.get(a.collectionSlug) ?? 0) -
        (addedOrder.get(b.collectionSlug) ?? 0),
    )
    .slice(0, 8);

  // The library floor renders only titles/excerpts/metadata — never article
  // bodies. Strip `blocks` (and the collections' nested articles) before handing
  // data to the client component; shipping all 459 full bodies made this
  // navigation take ~15s.
  // Romanise Devanāgarī into a search index (computed from the full body,
  // BEFORE blocks are stripped) so a Latin query like "madhav" surfaces
  // Devanāgarī bhajans containing माधव.
  const lightArticles = articles.map((a) => ({
    ...a,
    roman: romanizeArticleForSearch(a),
    blocks: [],
  }));
  const lightCollections = collections.map((c) => ({ ...c, articles: [] }));

  return (
    <>
      <LibraryContent
        collections={lightCollections}
        articles={lightArticles}
        featured={
          featured
            ? { ...featured, roman: romanizeArticleForSearch(featured), blocks: [] }
            : undefined
        }
        recent={recent.map((a) => ({
          ...a,
          roman: romanizeArticleForSearch(a),
          blocks: [],
        }))}
      />
      <Footer />
    </>
  );
}
