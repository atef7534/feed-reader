# feed-reader

A small feed reader built with plain HTML, CSS and JavaScript. It loads a list of feeds from a JSON file, fetches the latest articles from each one, and lets you filter, search, read and save them.

## Project structure

```
feed-reader/
├── index.html            Page markup
├── styles.css            All styling, including light and dark themes
├── scripts.js            App logic, feed loading and interactions
├── data/
│   └── sample-feeds.json Feeds, categories and edge cases
└── README.md
```

## Running it

The app loads `data/sample-feeds.json` with `fetch`, and browsers block that when a page is opened straight from disk. Serve the folder with any static server:

```bash
cd feed-reader
python3 -m http.server
```

Then open <http://localhost:8000>. You need an internet connection, because articles are fetched live.

## Features

- **Sidebar:** All Items, Saved, categories and individual feeds, each with a live unread count.
- **Feed status:** a feed that is still loading shows `…`, and one that fails shows a red `!`. The status at the bottom of the sidebar summarizes feed health, and clicking it names any failing feeds.
- **Article list:** grouped by Today, Yesterday and date. Switch between list, grid and compact views, and sort by Newest or Oldest.
- **Reading:** click an article to open it in a new tab and mark it read. Click the blue dot to toggle read or unread. Use the bookmark icon to save an article.
- **Mark all read:** applies to the articles currently shown.
- **Search:** filters the current list as you type. Press `/` to focus it and `Esc` to leave it.
- **Refresh:** re-fetches every feed. Articles that weren't there before wait behind the "N new items" banner until you click it.
- **Digest tab:** your five newest unread articles.
- **Discover tab:** every feed with its description and notes, plus Follow and Following buttons. Unfollowed feeds disappear from the sidebar and the list.
- **Add feed (+):** paste a feed URL to follow it. Custom feeds are added under General Tech.
- **Account menu:** dark mode toggle, a shortcut to saved items, and Reset, which clears all local data.
- **Long lists:** 40 articles are shown at a time with a "Show more" button.

## How it works

1. `scripts.js` fetches `data/sample-feeds.json`, then builds the feed list from `categories` and `edgeCases`. Any feed whose `feedUrl` was already added is skipped as a duplicate and listed on the Discover tab.
2. Each feed is fetched through the free [rss2json](https://rss2json.com) API, four at a time. It converts RSS and Atom into JSON and returns about 10 items per feed.
3. Titles and descriptions are stripped of HTML, so feeds with rich markup (Hacker News, Medium, Cloudflare) display as plain text. Descriptions are trimmed to about 280 characters.
4. Read, saved, unfollowed and custom-feed state is stored in `localStorage` in your browser. Nothing is sent to a server of your own.

## Feed data format

`data/sample-feeds.json` has two top-level lists:

```json
{
  "categories": [
    {
      "name": "Frontend",
      "feeds": [
        {
          "title": "CSS-Tricks",
          "feedUrl": "https://css-tricks.com/feed/",
          "siteUrl": "https://css-tricks.com/",
          "description": "Tips, Tricks, and Techniques on using Cascading Style Sheets.",
          "format": "rss2",
          "notes": "Optional note shown on the Discover tab"
        }
      ]
    }
  ],
  "edgeCases": [
    {
      "title": "Defunct Tech Blog (dead feed)",
      "feedUrl": "https://example.com/this-feed-does-not-exist.xml",
      "format": "unknown",
      "edgeCase": "dead_url"
    }
  ]
}
```

| Field                  | Used for                                                       |
| ---------------------- | -------------------------------------------------------------- |
| `name` (category)      | Sidebar group, tag color and article tag                       |
| `title`                | Display name and the letter in the feed's colored icon         |
| `feedUrl`              | The URL that is fetched, and the key used to detect duplicates |
| `description`, `notes` | Tooltip in the sidebar and text on the Discover tab            |
| `format`               | Shown on the Discover tab (`rss2`, `atom` or `unknown`)        |

### Edge cases in the sample data

| Case                                                                   | What to expect                                                                           |
| ---------------------------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| Dead feed                                                              | Appears under "Edge Cases" with a red `!`, and the sidebar status reads "1 feed failing" |
| Duplicate feed                                                         | Skipped, and listed on the Discover tab                                                  |
| Hacker News Best                                                       | High volume, so it exercises "Show more"                                                 |
| Atom feeds (web.dev, Sidebar.io, Vercel, Simon Willison, Hugging Face) | Parsed the same way as RSS                                                               |
| Medium-based feed (UX Collective)                                      | Medium-specific markup is stripped                                                       |
| Paywalled feed (The Pragmatic Engineer)                                | Only the excerpt from the feed is shown                                                  |

## Limitations

- The free rss2json tier is rate-limited. If many feeds fail at once, wait a minute and press Refresh.
- Only recent items per feed are loaded, so the Saved list can only show saved articles that are still in a feed's latest items.
- Some feeds block cross-origin or proxy requests, and those show as failing.
- Unread counts are based on what is stored in this browser and don't sync across devices.

## Customizing

- **Add or remove feeds:** edit `data/sample-feeds.json`. Add a new category by adding an object to `categories`. Category colors live in the `CAT` object at the top of `scripts.js`, and unknown categories fall back to grey.
- **Change the API:** replace the `API` constant in `scripts.js` and adapt the `pull` function to the new response shape.
- **Change the look:** colors and spacing are CSS variables at the top of `styles.css`, with separate values for light and dark.
- **Start fresh:** use Reset in the account menu, or clear this site's data in your browser.
