const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');

const addon = express();

const manifest = {
    id: 'org.stremio.bitsearch',
    version: '1.0.0',
    name: 'Bitsearch Addon',
    description: 'Fetches torrent links from bitsearch.to',
    resources: ['stream'],
    types: ['movie', 'series'],
    idPrefixes: ['tt']
};

addon.get('/manifest.json', (req, res) => {
    res.json(manifest);
});

addon.get('/stream/:type/:id.json', async (req, res) => {
    const { type, id } = req.params;
    const imdbId = id.replace('tt', '');

    try {
        const response = await axios.get(`https://bitsearch.to/search?q=${imdbId}`);
        const html = response.data;
        const $ = cheerio.load(html);

        const streams = [];
        $('a.magnet-link').each((index, element) => {
            const titleElement = $(element).closest('tr').find('td.title').text();
            const magnet = $(element).attr('href');
            if (magnet && titleElement && titleElement.includes('ITA')) {
                streams.push({
                    title: titleElement.trim(),
                    url: magnet,
                    isFree: true
                });
            }
        });

        res.json({ streams });
    } catch (error) {
        console.error(error);
        res.json({ streams: [] });
    }
});

const port = process.env.PORT || 7000;
addon.listen(port, () => {
    console.log(`Add-on running at http://localhost:${port}`);
});
