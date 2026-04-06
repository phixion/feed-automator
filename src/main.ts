import { Devvit, SettingScope, Context } from '@devvit/public-api';
import { XMLParser } from 'fast-xml-parser';

Devvit.configure({
  redditAPI: true,
  http: true,
  redis: true,
});

// 1. Definition der Einstellungen (Interface für Moderatoren)
Devvit.addSettings([
  {
    type: 'string',
    name: 'rss_urls',
    label: 'RSS Feed URLs (Comma seperated)',
    defaultValue:
      'https://www.tagesschau.de/xml/rss2, https://feeds.heise.de/heise/newsticker',
    scope: SettingScope.Installation,
  },
  {
    type: 'string',
    name: 'target_subreddit',
    label: 'Target Subreddit',
    defaultValue: 'mein_test_sub',
    scope: SettingScope.Installation,
  },
]);

Devvit.addSchedulerJob({
  name: 'rss_fetch_job',
  cron: '*/10 * * * *', // Run every 10 minutes
  onRun: async (_, context) => {
    // 2. Einstellungen abrufen
    const settings = await context.settings.getAll();
    const rssUrlsRaw = (settings['rss_urls'] as string) || '';
    const targetSubreddit = (settings['target_subreddit'] as string) || '';

    // URLs säubern und in ein Array umwandeln
    const feedUrls = rssUrlsRaw
      .split(',')
      .map((url) => url.trim())
      .filter((url) => url !== '');

    if (feedUrls.length === 0) {
      console.log('No RSS-Urls configured');
      return;
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

        // Handle both RSS and Atom feeds
        let items: Array<{
          title?: string;
          link?: string;
          url?: string;
          id?: string;
        }> = [];

        if (parsed.rss?.channel?.item) {
          // RSS format
          items = Array.isArray(parsed.rss.channel.item)
            ? parsed.rss.channel.item
            : [parsed.rss.channel.item];
        } else if (parsed.feed?.entry) {
          // Atom format
          items = Array.isArray(parsed.feed.entry)
            ? parsed.feed.entry
            : [parsed.feed.entry];
        }

        for (const item of items.slice(0, 5)) {
          const title = item.title?.trim?.() || item.title;
          const link = item.link?.trim?.() || item.link || item.url || item.id;

          if (link && title) {
            const redisKey = `posted:${link}`;
            const alreadyPosted = await context.redis.get(redisKey);

            if (!alreadyPosted) {
              try {
                await context.reddit.submitPost({
                  title: String(title),
                  subredditName: targetSubreddit,
                  url: String(link),
                });

                await context.redis.set(redisKey, 'true', {
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
  },
});

Devvit.addTrigger({
  event: 'AppInstall',
  onEvent: async (_, context) => {
    // Job is scheduled automatically via cron in addSchedulerJob
    console.log('Feed automator app installed');
  },
});

// Settings UI
Devvit.addMenuItem({
  label: 'Configure Feed Automator',
  location: 'subreddit',
  forUserType: 'moderator',
  onPress: async (_, context) => {
    context.ui.showForm(settingsForm);
  },
});

const settingsForm = Devvit.createForm(
  {
    title: 'Feed Automator Settings',
    fields: [
      {
        type: 'paragraph',
        name: 'rss_urls',
        label: 'RSS Feed URLs (Comma seperated)',
        defaultValue:
          'https://www.tagesschau.de/xml/rss2, https://feeds.heise.de/heise/newsticker',
      },
      {
        type: 'string',
        name: 'target_subreddit',
        label: 'Target Subreddit',
        defaultValue: 'mein_test_sub',
      },
    ],
  },
  async (event, context) => {
    await context.settings.set('rss_urls', String(event.values.rss_urls || ''));
    await context.settings.set(
      'target_subreddit',
      String(event.values.target_subreddit || '')
    );
    context.ui.showToast('Settings saved successfully!');
  }
);

export default Devvit;
