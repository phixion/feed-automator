import { Hono } from 'hono';
import { XMLParser } from 'fast-xml-parser';
import { reddit, redis, settings } from '@devvit/web/server';

export const tasks = new Hono();

tasks.post('/rss-fetch', async (c) => {
  try {
    const rssUrlsRaw = ((await settings.get('rss_urls')) as string) || '';
    const targetSubreddit =
      ((await settings.get('target_subreddit')) as string) || '';

    const feedUrls = rssUrlsRaw
      .split(',')
      .map((url) => url.trim())
      .filter((url) => url !== '');

    if (feedUrls.length === 0) {
      console.log('No RSS-Urls configured');
      return c.json({ status: 'success', message: 'No URLs' }, 200);
    }

    const parser = new XMLParser({
      ignoreAttributes: false,
      parseAttributeValue: true,
    });

    for (const url of feedUrls) {
      try {
        console.log(`checking feed: ${url}`);
        const response = await fetch(url);
        if (!response.ok) throw new Error(`HTTP Error: ${response.status}`);

        const xml = await response.text();
        const parsed = parser.parse(xml);

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        let items: any[] = [];
        if (parsed.rss?.channel?.item) {
          items = Array.isArray(parsed.rss.channel.item)
            ? parsed.rss.channel.item
            : [parsed.rss.channel.item];
        } else if (parsed.feed?.entry) {
          items = Array.isArray(parsed.feed.entry)
            ? parsed.feed.entry
            : [parsed.feed.entry];
        }

        for (const item of items.slice(0, 5)) {
          const title = item.title?.trim?.() || item.title;
          const link = item.link?.trim?.() || item.link || item.url || item.id;

          if (link && title) {
            const redisKey = `posted:${link}`;
            const alreadyPosted = await redis.get(redisKey);

            if (!alreadyPosted) {
              try {
                await reddit.submitPost({
                  title: String(title),
                  subredditName: targetSubreddit,
                  url: String(link),
                });
                await redis.set(redisKey, 'true', {
                  expiration: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
                });
                console.log(`successfully posted: ${title}`);
              } catch (postError) {
                console.error(`failed to post "${title}":`, postError);
              }
            }
          }
        }
      } catch (error) {
        console.error(`error with URL ${url}:`, error);
      }
    }

    return c.json({ status: 'success' }, 200);
  } catch (error) {
    console.error('Error in rss-fetch task:', error);
    return c.json({ status: 'error', error: String(error) }, 500);
  }
});
