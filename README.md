# Feed Automator

A powerful Reddit app that automates posting content from RSS feeds to your subreddit.

## Features

- RSS Feed Integration: Add multiple RSS feeds to automatically post content
- Flexible Scheduling: Choose posting frequency (Hourly, Daily, Weekly)
- Easy Management: Simple UI to add, configure, and delete feeds
- Secure: All feeds stored securely in Redis
- Modern UI: Built with React 19 and Tailwind CSS 4

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Development

```bash
npm run dev
```

This starts a dev server where you can test your app on Reddit in real-time.

### 3. Build

```bash
npm run build
```

Compiles both client and server code.

### 4. Deploy

```bash
npm run type-check  # Check types and lint
npm run build       # Build the app
npx devvit upload   # Upload to your dev subreddit
```

## Usage

### For Moderators

1. **Install the App**: Add Feed Automator to your subreddit via the Reddit Developer Console
2. **Configure Feeds**:
   - Go to your subreddit moderation settings
   - Click "Manage Feeds" in the app menu
   - Add feed name, URL, and schedule
3. **Create Posts**: Use "Create a new post" to manually post from configured feeds
4. **Automatic Posting**: Feeds will post automatically based on your configured schedule

### Example Feeds

- **ccc.de**: `https://www.ccc.de/de/rss/updates.xml`
- **netzplotik.org**: `https://netzpolitik.org/feed/`
- **noyb.eu**: `https://noyb.eu/de/rss`
  |

## API Endpoints

### Feed Management

- `GET /api/feeds` - Get all configured feeds
- `DELETE /api/feeds/:index` - Remove a feed by index
- `POST /internal/form/settings-submit` - Add a new feed

### Menu Actions

- `POST /internal/menu/post-create` - Manually create a post
- `POST /internal/menu/settings` - Open settings modal

## Legal

- [Privacy Policy](https://phixion.github.io/feed-automator/privacy-policy.html)
- [Terms and Conditions](https://phixion.github.io/feed-automator/terms-and-conditions.html)

## Development Notes

- Feeds are stored per-subreddit in Redis
- Form validation ensures no duplicate feed URLs
- All API endpoints require moderator permissions
- Images and media are hosted on Reddit's servers
