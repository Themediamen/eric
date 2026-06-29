const express = require('express');
const ytdl = require('@distube/ytdl-core');
const cors = require('cors');
const fs = require('fs'); // Toegevoegd om bestanden te kunnen lezen
const app = express();

app.use(cors());

// Probeer de cookies in te laden en een YouTube-agent aan te maken
let agent;
try {
    if (fs.existsSync('./cookies.json')) {
        const cookies = JSON.parse(fs.readFileSync('./cookies.json', 'utf8'));
        agent = ytdl.createAgent(cookies);
        console.log('✅ Cookies succesvol geladen! Bot-beveiliging wordt omzeild.');
    } else {
        console.log('⚠️ Geen cookies.json gevonden. Downloaden kan mislukken door YouTube bot-beveiliging.');
    }
} catch (err) {
    console.error('❌ Fout bij het inladen van cookies.json:', err.message);
}

app.get('/download', async (req, res) => {
    try {
        const URL = req.query.URL;
        if (!URL || !ytdl.validateURL(URL)) {
            return res.status(400).send('Ongeldige YouTube URL.');
        }

        // Voeg de agent toe aan de opties als deze succesvol is geladen
        const options = agent ? { agent } : {};

        // Haal info op mét de cookie-agent
        const info = await ytdl.getInfo(URL, options);
        const title = info.videoDetails.title.replace(/[^\w\s]/gi, '').trim() || 'video';

        res.header('Content-Disposition', `attachment; filename="${title}.mp4"`);
        res.header('Content-Type', 'video/mp4');

        // Start de download mét de cookie-agent
        ytdl(URL, { 
            filter: 'audioandvideo',
            quality: 'highest',
            ...options // Dit plakt de agent instellingen erbij
        }).pipe(res);

    } catch (err) {
        console.error("Fout tijdens downloaden:", err);
        res.status(500).send(`Er is iets misgegaan op de server: ${err.message}`);
    }
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Server actief op poort ${port}`));
