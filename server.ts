import 'zone.js/node';

import express from 'express';
import { join } from 'path';
import { existsSync } from 'fs';
import { renderApplication } from '@angular/platform-server';
import bootstrap from './src/main.server';

// The Express app is exported so that it can be used by serverless Functions.
export function app(): express.Express {
  const server = express();
  const distFolder = join(process.cwd(), 'dist/sistudo-fitness/browser');
  const indexHtml = existsSync(join(distFolder, 'index.original.html'))
    ? 'index.original.html'
    : 'index.html';

  // Example Express Rest API endpoints
  // server.get('/api/**', (req, res) => { });
  // Serve static files from /browser
  server.get('*.*', express.static(distFolder, {
    maxAge: '1y'
  }));

  // All regular routes use the Universal engine
  server.get('*', async (req, res) => {
    try {
      const html = await renderApplication(bootstrap, {
        document: join(distFolder, indexHtml),
        url: req.originalUrl,
      });
      res.send(html);
    } catch (err) {
      res.status(500).send(err instanceof Error ? err.message : err);
    }
  });

  return server;
}

function run(): void {
  const port = process.env['PORT'] || 4000;

  // Start up the Node server
  const server = app();
  server.listen(port, () => {
    console.log(`Node Express server listening on http://localhost:${port}`);
  });
}

run();
