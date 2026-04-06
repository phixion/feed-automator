import { reddit, context } from '@devvit/web/server';

export const createPost = async () => {
  return await reddit.submitCustomPost({
    title: 'feed-automator',
    subredditName: context.subredditName,
  });
};
