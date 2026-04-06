# feed-automator

A Reddit Devvit app that automatically fetches RSS/Atom feeds and posts new articles to a subreddit.

## Features

- Fetches RSS and Atom feeds from configurable URLs
- Posts new articles automatically to a target subreddit
- Deduplication via Redis (articles are only posted once)
- Moderator-configurable settings (feed URLs, target subreddit) via the Devvit app settings panel
- Built with [Devvit](https://developers.reddit.com/), [Hono](https://hono.dev/), and [TypeScript](https://www.typescriptlang.org/)

## Setup

> Requires Node 22+

1. Install dependencies: `npm install`
2. Log in to Devvit: `npm run login`
3. Deploy the app: `npm run deploy`

## Moderator Configuration

After installing the app in your subreddit, go to:

**Reddit → Your Subreddit → Mod Tools → Installed Apps → feed-automator → Settings**

Configure:

- **RSS Feed URLs** — comma-separated list of RSS/Atom feed URLs to fetch
- **Target Subreddit** — the subreddit name (without `r/`) where articles will be posted

## Commands

- `npm run dev` — Start a live development/playtest session
- `npm run build` — Build client and server
- `npm run deploy` — Type-check, lint, test, and upload a new version
- `npm run launch` — Publish the app for public review
- `npm run login` — Log the CLI into Reddit

## How It Works

A scheduler runs every 10 minutes and calls `/internal/tasks/rss-fetch`. For each configured feed URL, the app fetches and parses the RSS/Atom XML, checks Redis to see if each article has already been posted, and submits new ones as link posts to the target subreddit.
