import './config';
import { PORT } from './config';
import app from './app';

let server: ReturnType<typeof app.listen>;

export function start() {
  server = app.listen(PORT, () => console.log(`Server ready on port ${PORT}.`));
  return server;
}

export async function close() {
  return new Promise<void>((resolve) => {
    console.log('Closing server');
    if (server && server.listening) {
      server.close((err) => {
        if (err) console.error(err);
        resolve();
      });
    } else resolve();
  });
}

export async function restart() {
  await close();
  return start();
}

export function getServer() {
  return server;
}

export { PORT };

export const endpoint = `http://localhost:${PORT}`;