const express = require('express');
const cors = require('cors');
const ytdl = require('@distube/ytdl-core');

const app = express();
const PORT = 3000;

// Zorg ervoor dat onze HTML pagina met deze server mag praten
app.use(cors());

app.get('/download', async (req, res) => {
    try {
        const videoURL = req.query.URL;

        // Controleer of de link geldig is
        if (!ytdl.validateURL(videoURL)) {
            return res.status(400).send('Ongeldige YouTube URL');
        }

        // Haal de video informatie op (zoals de titel)
        const info = await ytdl.getBasicInfo(videoURL);
        const title = info.videoDetails.title.replace(/[^\w\s]/gi, ''); // Verwijder speciale tekens uit titel

        // Vertel de browser dat dit een bestand is dat gedownload moet worden
        res.header('Content-Disposition', `attachment; filename="${title}.mp4"`);

        // Download de video en stuur deze direct door naar de gebruiker
        ytdl(videoURL, {
            format: 'mp4',
            quality: 'highest'
        }).pipe(res);

    } catch (error) {
        console.error('Fout bij het downloaden:', error);
        res.status(500).send('Er is iets misgegaan tijdens het downloaden.');
    }
});

app.listen(PORT, () => {
    console.log(`Server draait succesvol op http://localhost:${PORT}`);
});
