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
