const express = require('express');
const ytdl = require('ytdl-core');
const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path;
const ffmpeg = require('fluent-ffmpeg');

const app = express();

app.use(express.json());

app.get('', (req, res) => {
    res.json({
        to_get_audio_stream_list: {
            method: "GET",
            endpoint: "/api/audiostreamlist/:yid"
        },
        to_get_downloadable_audio: {
            method: "GET",
            endpoint: "/api/downloadaudio/:yid"
        }
    });
});

app.get('/api/audiostreamlist/:yid', (req, res) => {
    const videoID = req.params.yid;
    let result = new Array();
    if (ytdl.validateID(videoID)) {
        ytdl.getInfo(videoID, (err, info) => {
            if (err) {
                console.error(err);
                res.status(404).json({
                    status: false,
                    errorMessage: "This audio is unavailable."
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
    } else {
        res.status(404).json({
            status: false,
            errorMessage: "This audio is unavailable."
        });
    }
});

app.get('/api/downloadaudio/:yid', (req, res) => {
    const videoID = req.params.yid;
    if (ytdl.validateID(videoID)) {
        const stream = ytdl(videoID, {
            quality: 'highestaudio',
            filter: 'audioonly'
        });
        res.setHeader('Content-disposition', 'attachment; filename=' + videoID + '.mp3');
        res.setHeader('Content-type', 'audio/mpeg');
        ffmpeg({
                source: stream
            })
            .setFfmpegPath(ffmpegPath)
            .withAudioCodec('libmp3lame')
            .toFormat('mp3')
            .on('end', () => console.log('finished'))
            .on('error', err => {
                console.log(err.message);
                res.status(500).json({
                    status: false,
                    errorMessage: err.message
                });
            })
            .pipe(res, {
                end: true
            });
    } else {
        res.status(404).json({
            status: false,
            errorMessage: "This audio is unavailable."
        });
    }
});

const port = process.env.PORT || 7000;
app.listen(port, () => console.log(`Server started on ${port}`));