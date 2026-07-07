import { createHonoServer } from 'react-router-hono-server/node';
import { app } from './hono-app.js';

export default await createHonoServer({
  app,
  defaultLogger: false,
});
