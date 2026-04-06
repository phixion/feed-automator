import { Hono } from 'hono';
import { serve } from '@hono/node-server';
import { createServer, getServerPort } from '@devvit/web/server';
import { api } from './routes/api';
import { forms } from './routes/forms';
import { menu } from './routes/menu';
import { triggers } from './routes/triggers';
<<<<<<< HEAD
=======
import { tasks } from './routes/tasks';
>>>>>>> 67678da7dda8f3ef01a0dd7906262bba9f8c3d8c

const app = new Hono();
const internal = new Hono();

internal.route('/menu', menu);
internal.route('/form', forms);
internal.route('/triggers', triggers);
<<<<<<< HEAD
=======
internal.route('/tasks', tasks);
>>>>>>> 67678da7dda8f3ef01a0dd7906262bba9f8c3d8c

app.route('/api', api);
app.route('/internal', internal);

serve({
  fetch: app.fetch,
  createServer,
  port: getServerPort(),
});
