const express = require('express');
const ytdl = require('ytdl-core');

const app = express();

app.use(express.json());

app.get('/getaudio/:yid', async (req, res) => {
    const videoID = req.params.yid;
    let result = new Array();
    ytdl.getInfo(videoID, (err, info) => {
        if (err) {
            res.status(400).json({
                status: false,
                errorMessage: "Invalid video id."
            });
        } else {
            const audioFormats = ytdl.filterFormats(info.formats, 'audioonly');
            if (audioFormats.length > 0) {
                audioFormats.forEach(audioItem => {
                    let temp = {};
                    temp['audioBitrate'] = audioItem.audioBitrate;
                    temp['url'] = audioItem.url;
                    result.push(temp);
                });
            }
            if (result.length > 0) {
                res.status(200).json({
                    status: true,
                    audio: result
                });
            } else {
                res.status(404).json({
                    status: false,
                    errorMessage: "Sorry,No audio found."
                });
            }
        }
    });
});

const port = process.env.PORT || 7000;
app.listen(port, () => console.log(`Server started on ${port}`));