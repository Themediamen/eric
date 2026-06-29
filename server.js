const express = require('express');
const ytdl = require('@distube/ytdl-core');
const cors = require('cors');
const app = express();

app.use(cors());

app.get('/download', async (req, res) => {
    try {
        const URL = req.query.URL;
        if (!URL || !ytdl.validateURL(URL)) {
            return res.status(400).send('Ongeldige YouTube URL.');
        }

        const info = await ytdl.getInfo(URL);
        const title = info.videoDetails.title.replace(/[^\w\s]/gi, '').trim() || 'video';

        // Filter specifiek op 'audioandvideo' zodat het bestand direct klaar is voor download
        res.header('Content-Disposition', `attachment; filename="${title}.mp4"`);
        res.header('Content-Type', 'video/mp4');

        ytdl(URL, { 
            filter: 'audioandvideo',
            quality: 'highest'
        }).pipe(res);

    } catch (err) {
        console.error("Fout tijdens downloaden:", err);
        res.status(500).send(`Er is iets misgegaan op de server: ${err.message}`);
    }
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Server actief op poort ${port}`));
