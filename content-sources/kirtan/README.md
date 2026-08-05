# Sree Bhakti Ballabh Tirtha Goswami Maharaj — Kirtana Archive

Prepared on 2026-08-05 (Asia/Singapore) from public religious archives and YouTube, relying on the permission and licences stated by the requester.

## What is included

- 4 verified MPEG audio files (about 15.5 MB total).
- `MANIFEST.csv` with titles, source URLs, byte sizes, durations, and SHA-256 hashes.
- `catalogs/bbtirtha_official_catalog.tsv`: 20 entries from the official Srila Gurudev Kirtan Album.
- `catalogs/krishnacast_catalog.tsv`: 40 KrishnaCast records explicitly credited to Sree Bhakti Ballabh Tirtha Goswami Maharaj.
- `catalogs/youtube_catalog.tsv`: 25 YouTube links: the complete 10-video dedicated playlist plus 15 additional relevant results.

## Retrieval notes

- Three audio files came from the Bhaktivedanta Memorial Library collection page: https://bvmlu.org/audio/SBBTM/index.html
- One audio file came from KrishnaCast. KrishnaCast displays a Creative Commons BY-NC-ND 2.5 notice on its kirtan archive: https://creativecommons.org/licenses/by-nc-nd/2.5/
- The official B.B. Tirtha album was indexed at https://www.bbtirtha.org/EN/collection/15. Its direct media requests later returned a site-verification page instead of audio, so those invalid responses were excluded.
- Seven newest official album item pages (1891, 1892, 1893, 1894, 1895, 1897, and 1898) were also behind the site's verification loop and are marked in the official catalog.
- KrishnaCast's catalog remained visible, but most direct MP3 requests returned the same kind of verification HTML during collection. Only KR152 was retrieved and verified before that block.
- YouTube's public interface did not offer exportable audio files. The ZIP therefore contains exact titles, durations, video IDs, and links only for YouTube items.
- The Memorial Library's `0806SriKrishnaChaitanya.mp3` is a valid MP3 but the server currently returns only 10.5 seconds, while the catalog describes a 7:34 / 10.4 MB recording. It is retained with that warning rather than silently discarded.

## Scope

“All recordings on the internet” cannot be guaranteed because sources change, some recordings are duplicated or renamed, and some pages were blocked during collection. This snapshot documents every source checked and makes inaccessible items visible in the catalogs rather than presenting the four downloaded files as a complete historical corpus.

## Folder layout

```text
audio/
  bhaktivedanta_memorial_library/
  krishnacast/
catalogs/
MANIFEST.csv
README.md
```
