# Requirements Document

## Introduction

This feature adds the complete relevant devotional teaching archive from bbtirtha.org to the existing Grantha Mandir library through a one-time, source-adapter-based import. The imported archive includes text and audio teachings by every attributed teacher or author, preserves source language and provenance, and uses the established Grantha Mandir library and reader experience. Operational website material is excluded. Production rendering uses normalized local content and does not crawl source pages at runtime.

## Glossary

- **BBTirtha_Importer**: The one-time ingestion subsystem that discovers, snapshots, parses, normalizes, validates, and reports on content from bbtirtha.org.
- **Grantha_Mandir**: The existing Next.js library and reader system that loads normalized JSON content from `content/grantha`.
- **BBTirtha_Archive**: Publicly reachable content on bbtirtha.org that is allowed by the site's published access controls and the configured acquisition policy.
- **Archive_Item**: A unique source page or media record discovered in the BBTirtha_Archive.
- **Discovery_Manifest**: The frozen, machine-readable inventory of Archive_Items considered during an import run and used as the coverage denominator.
- **Relevant_Teaching_Content**: Hari-kathā, lectures, articles, chapters, kīrtanas, audio teachings, letters, blog teachings, and related devotional instruction, regardless of attributed teacher or author.
- **Operational_Content**: Calendars, event listings, announcements, navigation, site chrome, archive index pages without standalone teaching content, administrative pages, and unrelated organizational material.
- **Source_Category**: The category stated by the source, including Harikatha, Article, Chapter, Kirtan, Audio, Letter, or Blog.
- **Content_Kind**: An existing Grantha Mandir content type: `patrika`, `book`, `lecture`, `article`, or `kirtan`.
- **Source_Adapter**: An origin-specific ingestion component that emits the normalized ingestion contract without requiring origin-specific frontend behavior.
- **Source_Snapshot**: An immutable local set of permitted source HTML, metadata, media, and a Discovery_Manifest used as input to normalization.
- **Normalized_Entry**: A Grantha Mandir item produced from an Archive_Item and stored in the local JSON content model.
- **Audio_First_Entry**: A Normalized_Entry whose primary teaching content is playable audio and whose body contains only source-authored text or a Reviewed_Transcript when available.
- **Reviewed_Transcript**: A transcript published by the source or explicitly approved by a human curator; unreviewed machine-generated speech-to-text is not a Reviewed_Transcript.
- **Canonical_Source_URL**: The preferred source URL for an Archive_Item after deterministic URL normalization and source-declared canonical resolution.
- **Stable_Source_ID**: A source-provided immutable item identifier, when one is available.
- **Stable_Entry_ID**: A deterministic identifier derived from the source origin plus Stable_Source_ID, or from the Canonical_Source_URL when the source provides no Stable_Source_ID.
- **Ingestion_Provenance**: Metadata containing the source origin, Canonical_Source_URL, available Stable_Source_ID, Source_Snapshot identifier, acquisition timestamp recorded by the snapshot, and Source_Adapter version.
- **Content_Availability**: An explicit state of `text`, `text-and-audio`, `audio-only`, or `media-unavailable`.
- **External_Media_Reference**: A stable source-hosted media URL, media type, and provenance used when permitted local mirroring is unavailable.
- **Variant_Group**: A set of separate Normalized_Entries that represent translations or alternate-language recordings of the same teaching.
- **Confident_Variant_Match**: A relationship established by an explicit source cross-reference, a shared source identifier, or a curator-approved mapping in the import manifest.
- **Curator_Override**: Version-controlled curator data that replaces an automatically inferred tag, category mapping, language, attribution, or Variant_Group assignment.
- **Tag_Vocabulary**: The established Grantha Mandir tags: Guru Tattva, Krishna, Radha, Mahaprabhu, Nityananda, Harinam, Bhakti, Rasa, Jagannath, Rath Yatra, Ekadashi, Festivals, Srimad Bhagavatam, Bhagavad Gita, Chaitanya Charitamrita, Gaudiya History, Vaisnava Etiquette, and Questions & Answers.
- **Terminal_Outcome**: Exactly one import result for each Archive_Item: `imported`, `skipped`, `duplicate`, or `failed`.
- **Grouping_Disposition**: An orthogonal report value of `ungrouped`, `variant-member`, or `duplicate-of`.
- **Coverage_Report**: Machine-readable JSON and human-readable Markdown that reconcile discovery and import outcomes and provide totals by Source_Category, language, and attributed teacher or author.
- **Dry_Run**: An import execution that performs discovery or reads a Source_Snapshot, parses, normalizes, validates, and reports without modifying normalized production content or mirrored production media.
- **Legacy_Grantha_Content**: Grantha Mandir JSON that existed before this feature and does not contain the optional fields introduced for this import.
- **Presentation_Baseline**: The existing Grantha Mandir cards, article and lecture headers, reader layout, navigation, personal reading features, responsive behavior, reduced-motion behavior, and accessibility conventions.
- **Permitted_Acquisition**: Access allowed by robots directives, unauthenticated public access, source terms or permissions, and curator-configured acquisition rules, without bypassing access controls.

## Assumptions

1. Archive completeness is measured against the Discovery_Manifest produced from all permitted archive indexes and reachable internal archive links at the time the Source_Snapshot is created.
2. The default acquisition limits are one in-flight request per host, at least 1,000 milliseconds between request starts per host, a 30-second request timeout, and no more than three total attempts for a transient failure.
3. A language unsupported by reliable source metadata or deterministic detection is stored with the code `und` and the label `Undetermined`; source text remains unchanged.
4. Variant grouping requires a Confident_Variant_Match; title similarity alone is insufficient.
5. Audio may remain externally hosted when local mirroring is not permitted or cannot complete, while all page content and metadata remain local.
6. Normalization may standardize whitespace and remove site chrome but does not editorially rewrite, translate, or summarize source teaching text.

## Requirements

### Requirement 1: Complete Teaching Archive Discovery

**User Story:** As a Grantha Mandir curator, I want every permitted devotional teaching item discovered, so that the imported library represents the complete relevant archive rather than a single teacher or category.

#### Acceptance Criteria

1. WHEN a one-time archive import begins, THE BBTirtha_Importer SHALL create a Discovery_Manifest containing every Archive_Item reachable through permitted archive indexes and internal archive links.
2. THE BBTirtha_Importer SHALL evaluate Harikatha, Article, Chapter, Kirtan, Audio, Letter, and Blog Source_Categories for Relevant_Teaching_Content.
3. WHEN an Archive_Item contains Relevant_Teaching_Content, THE BBTirtha_Importer SHALL include the Archive_Item regardless of the attributed teacher or author.
4. IF an Archive_Item contains Operational_Content, THEN THE BBTirtha_Importer SHALL assign the Archive_Item a `skipped` Terminal_Outcome with an operational-content reason.
5. IF a page contains only navigation, site chrome, or duplicate archive-listing content, THEN THE BBTirtha_Importer SHALL assign the page a `skipped` Terminal_Outcome with a non-content-page reason.
6. WHEN discovery and normalization finish, THE BBTirtha_Importer SHALL assign exactly one Terminal_Outcome to every Archive_Item in the Discovery_Manifest.

### Requirement 2: Compliant and Resilient Acquisition

**User Story:** As a site operator, I want acquisition to respect source controls and survive interruptions, so that the archive is imported responsibly without corrupting valid output.

#### Acceptance Criteria

1. WHEN the BBTirtha_Importer evaluates a source URL, THE BBTirtha_Importer SHALL request the URL only when Permitted_Acquisition allows the request.
2. WHILE acquiring from one host, THE BBTirtha_Importer SHALL limit acquisition to one in-flight request and at least 1,000 milliseconds between request starts.
3. WHEN the BBTirtha_Importer starts a remote request, THE BBTirtha_Importer SHALL terminate the request after 30 seconds without a completed response.
4. IF a request fails with a network error, HTTP 408, HTTP 429, or HTTP 5xx response, THEN THE BBTirtha_Importer SHALL limit retry processing to three total attempts for the URL.
5. WHEN a response provides a valid `Retry-After` value, THE BBTirtha_Importer SHALL wait at least the specified interval before the next attempt to the same host.
6. IF an Archive_Item requires authentication, a paywall, an anti-bot bypass, or another access-control bypass, THEN THE BBTirtha_Importer SHALL assign the Archive_Item a `skipped` Terminal_Outcome with an access-restricted reason.
7. WHEN permitted source HTML or media is acquired, THE BBTirtha_Importer SHALL record the acquired resource in the Source_Snapshot before normalization uses the resource.
8. IF acquisition stops before completion, THEN THE BBTirtha_Importer SHALL resume from recorded completion state without reacquiring completed resources whose snapshot checksums remain valid.
9. IF an acquisition or normalization run fails, THEN THE BBTirtha_Importer SHALL retain the last fully validated normalized production output without partial replacement.

### Requirement 3: Text and Structural Fidelity

**User Story:** As a reader, I want source teachings preserved faithfully, so that language, meaning, attribution, and reading structure remain trustworthy.

#### Acceptance Criteria

1. WHEN a text Archive_Item is normalized, THE BBTirtha_Importer SHALL preserve the source title with only deterministic whitespace normalization.
2. WHEN source attribution is present, THE BBTirtha_Importer SHALL preserve every stated author, speaker, translator, or contributor attribution associated with the teaching.
3. IF source attribution is absent, THEN THE BBTirtha_Importer SHALL label the attribution as source-unattributed without inferring a person.
4. WHEN a source publication or delivery date is present, THE BBTirtha_Importer SHALL preserve the date value and the date precision supplied by the source.
5. WHEN a text Archive_Item contains teaching body content, THE BBTirtha_Importer SHALL preserve all teaching text in source order after excluding Operational_Content.
6. WHEN source content contains headings, paragraphs, verses, poems, quotations, dividers, or list items, THE BBTirtha_Importer SHALL preserve the element boundaries and source order using supported reading blocks.
7. WHEN a verse provides original script, transliteration, translation, or reference text, THE BBTirtha_Importer SHALL preserve each available part in a distinct corresponding field.
8. WHEN source content uses Sanskrit, Bengali, Hindi, or another writing system, THE BBTirtha_Importer SHALL preserve the source Unicode text without transliteration or translation generated by the import process.
9. WHEN meaningful emphasis is representable by the existing reading schema, THE BBTirtha_Importer SHALL preserve the emphasized text and emphasis boundary.
10. IF the source provides no excerpt, THEN THE BBTirtha_Importer SHALL derive the excerpt deterministically from the first substantial source-authored body text.

### Requirement 4: Audio-First Content and Media Handling

**User Story:** As a listener, I want audio teachings represented as complete in-site entries, so that teachings without transcripts remain useful and attributable.

#### Acceptance Criteria

1. WHEN an Archive_Item contains audio without a Reviewed_Transcript, THE BBTirtha_Importer SHALL create an Audio_First_Entry with title, attribution, available date, Source_Category, tags, language, description, Ingestion_Provenance, and `audio-only` Content_Availability.
2. THE BBTirtha_Importer SHALL populate transcript or body text only from source-authored text or a Reviewed_Transcript.
3. WHERE Permitted_Acquisition allows media mirroring, THE BBTirtha_Importer SHALL store the acquired audio in the Source_Snapshot with a checksum and media type.
4. IF permitted media mirroring cannot complete or is not authorized, THEN THE BBTirtha_Importer SHALL store an External_Media_Reference and the associated Ingestion_Provenance.
5. WHEN playable media is available, THE Grantha_Mandir SHALL provide an in-site player on the Normalized_Entry page.
6. IF a referenced media resource is unavailable during playback, THEN THE Grantha_Mandir SHALL preserve the locally stored page content and present an accessible media-unavailable state.
7. WHERE the source permits a downloadable media asset, THE Grantha_Mandir SHALL expose the established download control for the asset.
8. THE Grantha_Mandir SHALL render every Audio_First_Entry as a complete in-site reader page rather than an outbound-link-only record.

### Requirement 5: Language Preservation and Teaching Variants

**User Story:** As a multilingual reader, I want languages labeled and related variants grouped, so that I can find the appropriate version without losing each version's identity.

#### Acceptance Criteria

1. WHEN reliable source evidence identifies a language, THE BBTirtha_Importer SHALL store a normalized language code and a human-readable language label on the Normalized_Entry.
2. IF reliable source evidence does not identify a language, THEN THE BBTirtha_Importer SHALL store the language code `und` and the label `Undetermined`.
3. WHEN two or more Archive_Items satisfy a Confident_Variant_Match, THE BBTirtha_Importer SHALL assign the resulting Normalized_Entries one stable Variant_Group identifier.
4. WHILE a Normalized_Entry belongs to a Variant_Group, THE BBTirtha_Importer SHALL retain the Normalized_Entry's independent language, content, media, attribution, date, and Ingestion_Provenance.
5. IF no Confident_Variant_Match exists, THEN THE BBTirtha_Importer SHALL assign the Normalized_Entry an `ungrouped` Grouping_Disposition.
6. WHEN a reader opens a Variant_Group member, THE Grantha_Mandir SHALL identify every available group member by language and content or media type.
7. WHERE a Curator_Override defines a Variant_Group relationship, THE BBTirtha_Importer SHALL apply the Curator_Override on subsequent runs.

### Requirement 6: Stable Identity, Duplicate Control, and Idempotency

**User Story:** As a maintainer, I want stable identities and repeatable output, so that rerunning an import cannot create duplicate items or unstable routes.

#### Acceptance Criteria

1. WHEN a Stable_Source_ID is available, THE BBTirtha_Importer SHALL derive the Stable_Entry_ID from the source origin and Stable_Source_ID.
2. IF a Stable_Source_ID is unavailable, THEN THE BBTirtha_Importer SHALL derive the Stable_Entry_ID from the source origin and Canonical_Source_URL.
3. THE BBTirtha_Importer SHALL derive slugs from stable snapshot data and resolve slug collisions with Stable_Entry_ID data.
4. WHEN the same Source_Snapshot, configuration, Source_Adapter version, and Curator_Overrides are processed more than once, THE BBTirtha_Importer SHALL produce byte-identical normalized JSON content files.
5. WHEN normalized output is regenerated from an unchanged Source_Snapshot, THE BBTirtha_Importer SHALL preserve collection order, entry order, Stable_Entry_ID values, and slugs.
6. WHEN duplicate detection finds the same Stable_Source_ID, Canonical_Source_URL, or deterministic content fingerprint more than once, THE BBTirtha_Importer SHALL emit one canonical Normalized_Entry and classify each redundant Archive_Item as `duplicate`.
7. WHEN a `duplicate` Terminal_Outcome is assigned, THE BBTirtha_Importer SHALL record the canonical Stable_Entry_ID in the `duplicate-of` Grouping_Disposition.
8. WHEN a successful import is rerun against unchanged inputs, THE BBTirtha_Importer SHALL leave the count of Normalized_Entries unchanged.

### Requirement 7: Provenance, Schema Evolution, and Runtime Isolation

**User Story:** As a curator, I want every item traceable and backward compatible, so that source authenticity is auditable without disrupting existing Grantha content.

#### Acceptance Criteria

1. THE BBTirtha_Importer SHALL store a Canonical_Source_URL and Ingestion_Provenance on every Normalized_Entry.
2. WHEN a Stable_Source_ID is available, THE BBTirtha_Importer SHALL store the Stable_Source_ID on the Normalized_Entry.
3. WHEN a Source_Category is available, THE BBTirtha_Importer SHALL preserve the Source_Category separately from the mapped Content_Kind.
4. THE BBTirtha_Importer SHALL represent language, source metadata, Ingestion_Provenance, External_Media_Reference, Variant_Group, Content_Availability, and Stable_Entry_ID as backward-compatible schema extensions.
5. WHEN Legacy_Grantha_Content is loaded after the schema extension, THE Grantha_Mandir SHALL preserve the pre-feature rendering and behavior of the Legacy_Grantha_Content.
6. THE Source_Adapter SHALL emit the shared normalized ingestion contract without requiring bbtirtha.org-specific component or route behavior in Grantha_Mandir.
7. WHILE serving an imported page in production, THE Grantha_Mandir SHALL render teaching content and metadata entirely from normalized local content.
8. WHERE a Normalized_Entry uses an External_Media_Reference, THE Grantha_Mandir SHALL request only the referenced media during user-initiated playback and shall render page content without a source-site HTML or API request.

### Requirement 8: Classification, Tags, and Curator Control

**User Story:** As a reader, I want imported teachings classified consistently, so that existing filters and related-content discovery remain useful.

#### Acceptance Criteria

1. WHEN an Archive_Item is normalized, THE BBTirtha_Importer SHALL map the Archive_Item to one existing Content_Kind while retaining the Source_Category.
2. WHEN automatic classification assigns tags, THE BBTirtha_Importer SHALL select tags only from the Tag_Vocabulary.
3. WHEN source metadata or teaching text satisfies a configured unambiguous mapping for a Tag_Vocabulary concept, THE BBTirtha_Importer SHALL assign the corresponding tag.
4. THE BBTirtha_Importer SHALL provide configured mappings for every concept in the Tag_Vocabulary.
5. WHERE a Curator_Override supplies tags, THE BBTirtha_Importer SHALL use the curator-supplied tags in place of automatic tags for the overridden Normalized_Entry.
6. WHERE a Curator_Override supplies a category, language, attribution, or Variant_Group assignment, THE BBTirtha_Importer SHALL preserve the override across unchanged reruns.

### Requirement 9: Grantha Mandir Discovery and Reading Experience

**User Story:** As a Grantha Mandir visitor, I want imported teachings to behave like established library content, so that browsing, reading, listening, and returning to content feel consistent.

#### Acceptance Criteria

1. WHEN a Normalized_Entry is imported, THE Grantha_Mandir SHALL present the Normalized_Entry through the Presentation_Baseline card appropriate to the mapped Content_Kind.
2. THE Grantha_Mandir SHALL index imported title, attribution, Source_Category, Content_Kind, tags, language, description or excerpt, and available body or Reviewed_Transcript text for search.
3. WHEN a search query matches an indexed field unique to a Normalized_Entry, THE Grantha_Mandir SHALL include the Normalized_Entry in the search results.
4. WHEN an existing Grantha Mandir filter matches an imported Content_Kind or tag, THE Grantha_Mandir SHALL include the matching Normalized_Entry in the filtered result set.
5. WHEN a reader opens an imported entry, THE Grantha_Mandir SHALL display the title, attribution, available date, Source_Category, language, and source provenance link in the Presentation_Baseline header and metadata areas.
6. WHEN an imported entry contains readable body text, THE Grantha_Mandir SHALL calculate and display reading time using the established Grantha Mandir calculation.
7. WHEN a reader bookmarks an imported entry or records reading progress, THE Grantha_Mandir SHALL persist the state through the established bookmark and reading-progress behavior.
8. WHEN previous or next content exists in the deterministic collection order, THE Grantha_Mandir SHALL expose the established previous or next navigation control.
9. WHEN related imported or legacy content shares tags, category, or collection context, THE Grantha_Mandir SHALL include the content in the established related-content ranking.
10. WHEN a reader invokes sharing for an imported entry, THE Grantha_Mandir SHALL share the stable local Grantha Mandir route for the entry.
11. WHERE an imported entry has playable or downloadable media, THE Grantha_Mandir SHALL expose the applicable Presentation_Baseline audio or download controls.

### Requirement 10: Accessibility, Responsiveness, and Interaction Reliability

**User Story:** As a reader using different devices or accessibility settings, I want imported content to remain operable and legible, so that the expanded archive does not reduce the quality of the existing experience.

#### Acceptance Criteria

1. THE Grantha_Mandir SHALL render imported library and reader interfaces in conformance with WCAG 2.2 Level AA criteria applicable to the feature.
2. WHEN an imported page is operated with a keyboard, THE Grantha_Mandir SHALL provide keyboard access to search, filters, variant selection, bookmarks, navigation, sharing, audio, and download controls that are present.
3. WHEN an imported page displays an interactive control, THE Grantha_Mandir SHALL expose an accessible name and a visible focus indicator for the control.
4. WHEN the reader's `prefers-reduced-motion` setting requests reduced motion, THE Grantha_Mandir SHALL suppress nonessential Presentation_Baseline motion on imported library and reader views.
5. WHEN an imported library or reader page is rendered at viewport widths of 320, 768, or 1280 CSS pixels, THE Grantha_Mandir SHALL keep teaching text and present controls usable without horizontal page overflow.
6. WHEN a Normalized_Entry has a known language code, THE Grantha_Mandir SHALL expose the language code through applicable document or content language metadata.
7. IF an external media request times out or fails, THEN THE Grantha_Mandir SHALL present a keyboard-accessible failure state without blocking locally stored text, metadata, navigation, or bookmark controls.

### Requirement 11: Coverage, Failure Reporting, and Dry Run

**User Story:** As a curator, I want reconciled machine-readable and human-readable reports before publication, so that omissions and failures can be reviewed objectively.

#### Acceptance Criteria

1. WHEN an import or Dry_Run completes, THE BBTirtha_Importer SHALL produce a JSON Coverage_Report and a Markdown Coverage_Report from the same result records.
2. THE BBTirtha_Importer SHALL include one record per Archive_Item in each Coverage_Report with source URL, available Stable_Source_ID, detected Source_Category, language, attribution, Terminal_Outcome, Grouping_Disposition, reason, and resulting Stable_Entry_ID when applicable.
3. THE BBTirtha_Importer SHALL include discovered, imported, skipped, duplicate, grouped, and failed totals in each Coverage_Report.
4. THE BBTirtha_Importer SHALL include outcome totals grouped by Source_Category, language, and attributed teacher or author in each Coverage_Report.
5. WHEN a Coverage_Report is generated, THE BBTirtha_Importer SHALL reconcile the discovered total exactly to the sum of imported, skipped, duplicate, and failed Terminal_Outcomes.
6. WHEN an Archive_Item receives a `skipped`, `duplicate`, or `failed` Terminal_Outcome, THE BBTirtha_Importer SHALL record a non-empty reason and source URL.
7. WHEN a Normalized_Entry belongs to a Variant_Group, THE BBTirtha_Importer SHALL count the Normalized_Entry as imported and separately count the `variant-member` Grouping_Disposition.
8. WHILE operating in Dry_Run mode, THE BBTirtha_Importer SHALL leave normalized production content and mirrored production media byte-for-byte unchanged.
9. WHEN Dry_Run and write mode process identical inputs, THE BBTirtha_Importer SHALL report identical planned item outcomes, identifiers, slugs, grouping, and totals.

### Requirement 12: Verification and Acceptance Quality

**User Story:** As a maintainer, I want repeatable automated and visual checks, so that content coverage, parser behavior, schema compatibility, and presentation regressions are detected before publication.

#### Acceptance Criteria

1. WHEN the Source_Adapter test suite runs, THE BBTirtha_Importer SHALL verify discovery, category inclusion, Operational_Content exclusion, metadata extraction, language extraction, and media extraction against committed fixtures.
2. WHEN the parser test suite runs, THE BBTirtha_Importer SHALL verify headings, paragraphs, verses, original scripts, transliteration, translation, quotations, lists, meaningful emphasis, and source order against committed fixtures that contain those structures.
3. WHEN schema validation runs, THE BBTirtha_Importer SHALL validate every generated Normalized_Entry and representative Legacy_Grantha_Content against the backward-compatible schema.
4. WHEN deterministic fixture validation runs twice with identical inputs, THE BBTirtha_Importer SHALL produce byte-identical normalized JSON output on both runs.
5. WHEN idempotency validation writes identical fixture input twice, THE BBTirtha_Importer SHALL report zero additional Normalized_Entries and zero changed stable slugs on the second write.
6. WHEN duplicate-detection fixtures contain repeated source identifiers, canonical URLs, or content fingerprints, THE BBTirtha_Importer SHALL identify the expected canonical and duplicate records.
7. WHEN content coverage validation runs, THE BBTirtha_Importer SHALL fail validation if any Discovery_Manifest item lacks a report record or if report reconciliation differs from zero.
8. WHEN link and media validation runs, THE BBTirtha_Importer SHALL record the checked status of every Canonical_Source_URL and local or external media reference without changing normalized content.
9. WHEN visual acceptance checks run, THE Grantha_Mandir SHALL provide reviewable mobile and desktop renders for at least one imported entry from every available Source_Category and Content_Availability state.
10. WHEN Dry_Run acceptance validation runs, THE BBTirtha_Importer SHALL verify unchanged production output checksums and the presence of both Coverage_Report formats.

### Requirement 13: One-Time Import Boundaries

**User Story:** As a product owner, I want the feature boundaries explicit, so that the import expands Grantha Mandir without becoming a synchronization service or redesign project.

#### Acceptance Criteria

1. THE BBTirtha_Importer SHALL expose the archive acquisition and normalization process as a manually initiated one-time operation.
2. WHEN a completed Source_Snapshot becomes outdated, THE BBTirtha_Importer SHALL require a new manually initiated run to acquire later source changes.
3. THE Grantha_Mandir SHALL retain the Presentation_Baseline for imported entries without an origin-specific library or reader redesign.
4. THE BBTirtha_Importer SHALL limit generated teaching text to source-authored content and Reviewed_Transcripts.

## Out of Scope

- Scheduled, recurring, or runtime synchronization with bbtirtha.org.
- Runtime crawling of source HTML or source APIs by the production application.
- Bypassing authentication, paywalls, anti-bot controls, robots restrictions, or other access restrictions.
- Unreviewed machine-generated transcripts, translations, transliterations, summaries, or inferred attribution.
- Importing calendars, events, announcements, navigation, site chrome, administrative pages, duplicate listing pages, or unrelated operational content as Grantha entries.
- Replacing or redesigning the established Grantha Mandir library and reader experience.
- Editorial correction of source teachings beyond deterministic whitespace normalization and removal of site chrome.
