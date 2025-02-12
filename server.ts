const express = require('express');
const app = express();
// @ts-ignore
const fetch = require('node-fetch');

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

app.listen(3000, () => console.log('Server running on port 3000'));
