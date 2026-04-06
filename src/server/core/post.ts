<<<<<<< HEAD
import { reddit } from '@devvit/web/server';
=======
import { reddit, context } from '@devvit/web/server';
>>>>>>> 67678da7dda8f3ef01a0dd7906262bba9f8c3d8c

export const createPost = async () => {
  return await reddit.submitCustomPost({
    title: 'feed-automator',
<<<<<<< HEAD
=======
    subredditName: context.subredditName,
>>>>>>> 67678da7dda8f3ef01a0dd7906262bba9f8c3d8c
  });
};
