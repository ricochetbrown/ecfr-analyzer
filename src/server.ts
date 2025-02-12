import {
  AngularNodeAppEngine,
  createNodeRequestHandler,
  isMainModule,
  writeResponseToNodeResponse,
} from '@angular/ssr/node';
import express from 'express';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const serverDistFolder = dirname(fileURLToPath(import.meta.url));
const browserDistFolder = resolve(serverDistFolder, '../browser');

const app = express();
const angularApp = new AngularNodeAppEngine();

// @ts-ignore
app.get('/api/agencies', async (req, res) => {
    const response = await fetch('https://www.ecfr.gov/api/admin/v1/agencies.json');
    const data = await response.json();
    res.json(data);
});

// @ts-ignore
app.get('/api/titles', async (req, res) => {
    const response = await fetch('https://www.ecfr.gov/api/versioner/v1/titles.json');
    const data = await response.json();
    res.json(data);
});

// @ts-ignore
app.get('/api/text/:date/:title/:chapter', async (req, res) => {
    const { date, title, chapter } = req.params;
    const response = await fetch(`https://www.ecfr.gov/api/versioner/v1/full/${date}/title-${title}.xml?chapter=${chapter}`);
    const data = await response.text();
    res.json(data);
});

// @ts-ignore
app.get('/api/corrections/:title', async (req, res) => {
    const { title } = req.params;
    const response = await fetch(`https://www.ecfr.gov/api/admin/v1/corrections/title/${title}.json`);
    const data = await response.json();
    res.json(data);
});

// @ts-ignore
app.get('/api/search/daily/:slug', async (req, res) => {
    const { slug } = req.params;
    const response = await fetch(`https://www.ecfr.gov/api/search/v1/counts/daily?agency_slugs%5B%5D=${slug}`);
    const data = await response.json();
    res.json(data);
});

// @ts-ignore
app.get('/api/search/titles/:slug', async (req, res) => {
    const { slug } = req.params;
    const response = await fetch(`https://www.ecfr.gov/api/search/v1/counts/titles?agency_slugs%5B%5D=${slug}`);
    const data = await response.json();
    res.json(data);
});

// @ts-ignore
app.get('/api/search/results/:slug/:query', async (req, res) => {
    const { slug, query } = req.params;
    const response = await fetch(`https://www.ecfr.gov/api/search/v1/results?query=${query}&agency_slugs%5B%5D=${slug}`);
    const data = await response.json();
    res.json(data);
});

/**
 * Serve static files from /browser
 */
app.use(
  express.static(browserDistFolder, {
    maxAge: '1y',
    index: false,
    redirect: false,
  }),
);

/**
 * Handle all other requests by rendering the Angular application.
 */
app.use('/**', (req, res, next) => {
  angularApp
    .handle(req)
    .then((response) =>
      response ? writeResponseToNodeResponse(response, res) : next(),
    )
    .catch(next);
});

/**
 * Start the server if this module is the main entry point.
 * The server listens on the port defined by the `PORT` environment variable, or defaults to 4000.
 */
if (isMainModule(import.meta.url)) {
  const port = process.env['PORT'] || 4000;
  app.listen(port, () => {
    console.log(`Node Express server listening on http://localhost:${port}`);
  });
}

/**
 * Request handler used by the Angular CLI (for dev-server and during build) or Firebase Cloud Functions.
 */
export const reqHandler = createNodeRequestHandler(app);
