import { Hono } from 'hono';
import { context, redis, reddit } from '@devvit/web/server';
import type {
  DecrementResponse,
  IncrementResponse,
  InitResponse,
} from '../../shared/api';

type ErrorResponse = {
  status: 'error';
  message: string;
};

type FeedItem = {
  name: string;
  url: string;
  schedule: string;
};

export const api = new Hono();

api.get('/init', async (c) => {
  const { postId } = context;

  if (!postId) {
    console.error('API Init Error: postId not found in devvit context');
    return c.json<ErrorResponse>(
      {
        status: 'error',
        message: 'postId is required but missing from context',
      },
      400
    );
  }

  try {
    const [count, username] = await Promise.all([
      redis.get('count'),
      reddit.getCurrentUsername(),
    ]);

    return c.json<InitResponse>({
      type: 'init',
      postId: postId,
      count: count ? parseInt(count) : 0,
      username: username ?? 'anonymous',
    });
  } catch (error) {
    console.error(`API Init Error for post ${postId}:`, error);
    let errorMessage = 'Unknown error during initialization';
    if (error instanceof Error) {
      errorMessage = `Initialization failed: ${error.message}`;
    }
    return c.json<ErrorResponse>(
      { status: 'error', message: errorMessage },
      400
    );
  }
});

api.post('/increment', async (c) => {
  const { postId } = context;
  if (!postId) {
    return c.json<ErrorResponse>(
      {
        status: 'error',
        message: 'postId is required',
      },
      400
    );
  }

  const count = await redis.incrBy('count', 1);
  return c.json<IncrementResponse>({
    count,
    postId,
    type: 'increment',
  });
});

api.post('/decrement', async (c) => {
  const { postId } = context;
  if (!postId) {
    return c.json<ErrorResponse>(
      {
        status: 'error',
        message: 'postId is required',
      },
      400
    );
  }

  const count = await redis.incrBy('count', -1);
  return c.json<DecrementResponse>({
    count,
    postId,
    type: 'decrement',
  });
});

// Feed management endpoints
api.get('/feeds', async (c) => {
  try {
    const subredditName = context.subredditName;
    const feeds = await redis.get(`feeds:${subredditName}`);
    return c.json<FeedItem[]>(feeds ? JSON.parse(feeds) : [], 200);
  } catch (error) {
    console.error('Error retrieving feeds:', error);
    return c.json<ErrorResponse>(
      { status: 'error', message: 'Failed to retrieve feeds' },
      500
    );
  }
});

api.delete('/feeds/:index', async (c) => {
  try {
    const subredditName = context.subredditName;
    const index = parseInt(c.req.param('index'));

    if (isNaN(index)) {
      return c.json<ErrorResponse>(
        { status: 'error', message: 'Invalid feed index' },
        400
      );
    }

    const feedsData = await redis.get(`feeds:${subredditName}`);
    const feeds: FeedItem[] = feedsData ? JSON.parse(feedsData) : [];

    if (index < 0 || index >= feeds.length) {
      return c.json<ErrorResponse>(
        { status: 'error', message: 'Feed not found' },
        404
      );
    }

    const removedFeed = feeds.splice(index, 1)[0];
    await redis.set(`feeds:${subredditName}`, JSON.stringify(feeds));

    return c.json(
      { message: `Feed "${removedFeed.name}" removed successfully` },
      200
    );
  } catch (error) {
    console.error('Error deleting feed:', error);
    return c.json<ErrorResponse>(
      { status: 'error', message: 'Failed to delete feed' },
      500
    );
  }
});
