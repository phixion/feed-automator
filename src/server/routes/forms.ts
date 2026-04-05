import { Hono } from 'hono';
import type { UiResponse } from '@devvit/web/shared';
import { context } from '@devvit/web/server';

type ExampleFormValues = {
  message?: string;
};

type FeedItem = {
  name: string;
  url: string;
  schedule: string; // e.g., "daily", "hourly", "weekly"
};

export const forms = new Hono();

forms.post('/example-submit', async (c) => {
  const { message } = await c.req.json<ExampleFormValues>();
  const trimmedMessage = typeof message === 'string' ? message.trim() : '';

  return c.json<UiResponse>(
    {
      showToast: trimmedMessage
        ? `Form says: ${trimmedMessage}`
        : 'Form submitted with no message',
    },
    200
  );
});

forms.post('/settings-submit', async (c) => {
  try {
    const formData = await c.req.json<FeedItem>();
    const { name, url, schedule } = formData;

    if (!name || !url || !schedule) {
      return c.json<UiResponse>(
        {
          showToast: 'Please fill in all fields',
        },
        400
      );
    }

    const redis = context.redis;
    const subredditName = context.subredditName;

    // Get existing feeds
    const existingFeeds = await redis.get(`feeds:${subredditName}`);
    const feeds: FeedItem[] = existingFeeds ? JSON.parse(existingFeeds) : [];

    // Check for duplicates
    if (feeds.some((f) => f.url === url)) {
      return c.json<UiResponse>(
        {
          showToast: 'This feed URL already exists',
        },
        400
      );
    }

    // Add new feed
    feeds.push({ name, url, schedule });
    await redis.set(`feeds:${subredditName}`, JSON.stringify(feeds));

    return c.json<UiResponse>(
      {
        showToast: `Feed "${name}" added successfully!`,
      },
      200
    );
  } catch (error) {
    console.error('Error saving settings:', error);
    return c.json<UiResponse>(
      {
        showToast: 'Error saving settings',
      },
      500
    );
  }
});

forms.get('/settings-get', async (c) => {
  try {
    const redis = context.redis;
    const subredditName = context.subredditName;

    const existingFeeds = await redis.get(`feeds:${subredditName}`);
    const feeds: FeedItem[] = existingFeeds ? JSON.parse(existingFeeds) : [];

    return c.json(feeds, 200);
  } catch (error) {
    console.error('Error retrieving settings:', error);
    return c.json([], 500);
  }
});
