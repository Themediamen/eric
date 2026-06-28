const express = require('express');
const ytdl = require('@distube/ytdl-core');
const cors = require('cors');
const app = express();

app.use(cors());

app.get('/download', async (req, res) => {
    try {
        const URL = req.query.URL;
        if (!ytdl.validateURL(URL)) {
            return res.status(400).send('Ongeldige URL');
        }

        const info = await ytdl.getInfo(URL);
        const title = info.videoDetails.title.replace(/[^\w\s]/gi, '');

        res.header('Content-Disposition', `attachment; filename="${title}.mp4"`);
        ytdl(URL, { format: 'mp4', quality: 'highest' }).pipe(res);
    } catch (err) {
        console.error(err);
        res.status(500).send('Er is iets misgegaan tijdens het downloaden.');
    }
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Server draait op poort ${port}`));
