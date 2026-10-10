# Feed Reader

Feed Reader is a front-end solution to the [RSS Feed Reader challenge on Frontend Mentor](https://www.frontendmentor.io/challenges/rss-feed-reader). It presents a polished dashboard for keeping up with articles from multiple sources, with filtering, search, saved items, and several ways to browse a feed.

The project is built with plain HTML, CSS, and JavaScript. It is a self-contained interface prototype: articles and feed sources are sample data held in the browser while the page is open. It does not currently connect to RSS or Atom URLs, save state between reloads, or send email.

## Features

- Browse a sample article feed from technology, design, and development sources.
- Filter articles by category or source, and switch to the saved-items view.
- Search article titles, descriptions, and source names as you type. Press `/` to focus search and `Escape` to leave it.
- Mark individual articles or all visible articles as read.
- Save and unsave articles for the current session.
- Change between list, grid, and compact layouts.
- Sort articles from newest to oldest or oldest to newest.
- Load a set of sample new articles from the “new items” banner.
- Explore the Digest and Discover interface views.
- Switch between light and dark themes; the initial theme follows the operating system preference.
- Use the reset option in the account menu to restore the initial demo.

The page loads the Inter font from Google Fonts. If that request is unavailable, it falls back to system fonts.

## Project files

| File         | Purpose                                                                      |
| ------------ | ---------------------------------------------------------------------------- |
| `index.html` | Dashboard structure, navigation, controls, and article-feed container.       |
| `styles.css` | Layout, responsive styling, themes, and component states.                    |
| `scripts.js` | Sample feed data, rendering, filtering, sorting, and interface interactions. |

## Implementation notes

The interface is rendered and updated directly in the browser with vanilla JavaScript; no framework or external JavaScript dependency is required. The sample article data is initialized when the page loads, and actions such as saving, marking read, loading new items, and changing the theme operate on that in-memory state. Reloading the page resets the demo.

The “Add feed,” refresh, digest email, discover-follow, and feed-health controls are demonstration interactions. They provide interface feedback but do not make network requests or subscribe to real services.

## Challenge

This project was created as a solution to Frontend Mentor’s [RSS Feed Reader challenge](https://www.frontendmentor.io/challenges/rss-feed-reader). The challenge provided an opportunity to build a feed-reading dashboard and practice structuring an interface with multiple navigation states, article actions, display modes, and light and dark styling.
