# Zen Manga

Zen Manga is a lightweight manga app using the api.mangadex.org API. Leveraging this API we can serve the latest manga and its chapters quickly and efficiently.

This is a mobile-first webapp written with the Nuxt framework.

## Tech Stack

* **Runtime:** Nuxt (Vue), Pinia, Iconify, Vue Router
* **Data Sources:** `api.mangadex.org`
* **Deployment:** GitHub Actions, GitHub Pages

### API General Usage

Find the latest manga on the platform by using `/manga?includes[]=cover_art`. Each manga's cover art can be found under the `relationships` property for each manga where the `cover_art` is the `type`. This object should have an attributes property with a fileName property under that which is the cover-filename. From here the URL is `https://uploads.mangadex.org/covers/:manga-id/:cover-filename.256.jpg` which is a 256px wide cover image.

After someone selects a manga get the chapter feed by using `/manga/8f0747c9-6a6c-490f-9f7e-90ebc9fe82c4/feed`. After a user selects a chapter the images for that chapter can be found under `/at-home/server/:chapter-id` where the property `chapter.dataSaver` is the array of chapters to use.

### Development Guidelines

* Use the theme definition colors in `/app/assets/styles/theme.css` as css variables
* Use the styles from `/app/assets/styles/typography.css`
* Add new css variables or font styles as needed instead of creating one-off colors or text styles in components
* Create reusable components instead of one-off implementations. Put them in `/app/components/[category]/[component].vue` so they're automatically imported by Nuxt.
* Use Iconify icons as much as possible. Those icons look like this: `<Icon name="mdi:book-open-blank-variant-outline" />`
* Use the Pinia data stores in `/app/stores/*.ts` to manage app state and user data
* Persist data in local storage to ensure the website behaves like an app

## App Flow

### 📂 I. Discovery & Browsing Pages (The Gateway)

These pages are the primary entry points for new users.

#### 1. Homepage (/)

> Goal: Provide immediate content recommendations and set up the "sticky" personalized experience using client-side data. Core Content:

🔥 Quick Start / Continue Reading: (The most prominent element). If the user has previously visited the site (tracked via Local Storage), display the series and chapter they were last on. If no data, show a prompt: "New here? Explore our top genres!"
Featured Carousel: High-profile titles or marketing spotlights.
Curated Recommendation Feeds: Dynamic blocks based on immediate API data:
✨ Trending Now: (High-velocity content).
⭐ Favorites Showcase: A block showing titles that have been "favorited" by other users or the user in this session.
📰 Recent Updates: Feed of new chapter releases across the catalog.
Genre Quick Links: Visual links to the top 5-10 genres to guide exploration.

#### 2. Genre/Category Browse Page (/genre/:genre-tag)

> Goal: Deep filtering and organized content discovery. Core Content:

Filtering Sidebar: Robust filter set (Genre, Demographic, Status, Tags).
Genre Synopsis: Text describing the genre to help users decide.
Title Grid: Visually appealing list of results. Each card is a self-contained entry providing: Title, Cover Art, Rating, and a prominent "Read Now" CTA.

#### 3. Search Results Page (/search?q=query)

> Goal: Handling direct and specific lookups efficiently. Core Content:

Search Bar: Active element for refining the query.
Filtering Sidebar: Allows users to narrow down search results instantly.
Results List/Grid: Clear, structured display of all matching titles.

### 📖 II. Core Content Pages (The Consumption Loop)

These pages are the engine of the app. The user must pass through these pages to read the content.

#### 4. Series Information Page (/series/:series-id)

> Goal: The ultimate source of truth for a title. Must convince the user to read. Content:

Hero: Title, Author, Artist, Cover Art, Rating, Status.
Synopsis: Detailed plot summary.
Chapter Index: The master list. A clean, navigable, reverse-chronological list of all chapters. Each entry includes:
Chapter Number and Title.
Release Date.
Crucial CTA: "Read Chapter X" (links to the Reader Page).
Key Functionality: A simple "❤️ Favorite" button that saves the series ID to the user's local session state.

#### 5. Chapter Reader Page (/series/:series-id/chapter/:chapter-id)

> Goal: Deliver the images flawlessly in a distraction-free environment. Content:

The Viewer: Primary focus. Optimized display of manga images.
Navigation: Top/Bottom sticky bar with titles and easy access to "Previous Chapter" and "Next Chapter."
UX Controls: Reading Mode selector (Dark/Light) and Zoom/Image quality settings.
Session Tracking: When the user views this page, the client-side logic must immediately update the "Last Read" state.
