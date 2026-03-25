const express = require("express");
const scrapeProfile = require("./scraper");
const getDownloadLink = require("./tikwm");
const downloadFromUrl = require("./downloader");
const fs = require("fs");
const path = require("path");

const SINGLE_FOLDER = "D:/MMO/Videos/LamAnhDay";

let downloadPath = require("path").join(__dirname, "downloads");

const app = express();
app.use(express.json());
app.use(express.static("public"));

// đảm bảo thư mục downloads tồn tại
const downloadDir = path.join(__dirname, "downloads");
if (!fs.existsSync(downloadDir)) {
    fs.mkdirSync(downloadDir);
}

let videoStore = [];

async function retry(fn, times = 3) {
    for (let i = 0; i < times; i++) {
        try {
            return await fn();
        } catch (e) {
            if (i === times - 1) throw e;
        }
    }
}

app.post("/scan", async(req, res) => {
    try {
        const url = req.body.url;
        let delay = parseInt(req.body.delay);
        if (isNaN(delay)) delay = 30;
        console.log("Delay received:", delay);

        console.log("delay: ", delay)
        const videos = await retry(() => scrapeProfile(url, delay), 3);
        const map = new Map();
        videos.forEach(v => map.set(v.url, v));

        videoStore = Array.from(map.values()); // 👈 QUAN TRỌNG

        console.log("Saved videos:", videoStore.length);

        res.json(videoStore);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

app.post("/set-folder", (req, res) => {
    const fs = require("fs");

    const newPath = req.body.path;

    if (!fs.existsSync(newPath)) {
        return res.status(400).json({ error: "Folder không tồn tại" });
    }

    downloadPath = newPath;

    console.log("Set download folder:", downloadPath);

    res.json({ ok: true });
});

app.post("/get-video-info", async(req, res) => {
    try {
        const axios = require("axios");

        const response = await axios.get("https://www.tikwm.com/api/", {
            params: { url: req.body.url }
        });

        const data = response.data.data;

        res.json({
            title: data.title,
            thumbnail: data.cover,
            mp4: data.hdplay || data.play
        });

    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// app.post("/download-single", async(req, res) => {
//     try {
//         const axios = require("axios");

//         const { url, title } = req.body;

//         // gọi lại API TikWM
//         const response = await axios.get("https://www.tikwm.com/api/", {
//             params: { url }
//         });

//         const data = response.data.data;

//         // ưu tiên HD
//         const videoUrl = data.hdplay || data.mp4_nowm || data.play;

//         await downloadFromUrl(videoUrl, title || data.title, SINGLE_FOLDER);

//         res.json({ ok: true });

//     } catch (e) {
//         res.status(500).json({ error: e.message });
//     }
// });

app.get("/download-single", async(req, res) => {
    try {
        const axios = require("axios");

        const url = req.query.url; // 👈 sửa ở đây

        if (!url) {
            return res.status(400).json({ error: "Missing url" });
        }

        const response = await axios.get("https://www.tikwm.com/api/", {
            params: { url }
        });

        const data = response.data.data;

        const videoUrl = data.hdplay || data.mp4_nowm || data.play;

        const videoStream = await axios({
            url: videoUrl,
            method: "GET",
            responseType: "stream"
        });

        res.setHeader(
            "Content-Disposition",
            `attachment; filename="${Date.now()}.mp4"`
        );

        videoStream.data.pipe(res);

    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});



// download 1 video
app.post("/download", async(req, res) => {
    const { url, title } = req.body;

    try {
        const data = await getDownloadLink(url);
        const videoUrl = data.hdplay || data.mp4_nowm || data.play;
        await downloadFromUrl(videoUrl, title, downloadPath);

        res.json({ status: "done" });
    } catch (e) {
        res.status(500).json({ status: "error", error: e.message });
    }
});

function sleep(ms) {
    return new Promise(r => setTimeout(r, ms));
}

app.post("/download-all", async(req, res) => {
    let results = [];

    for (let v of videoStore) {
        try {
            const data = await getDownloadLink(v.url);
            const videoUrl = data.hdplay || data.mp4_nowm || data.play;
            await downloadFromUrl(videoUrl, v.title, downloadPath);

            results.push({ url: v.url, status: "done" });
        } catch (e) {
            results.push({ url: v.url, status: "error" });
        }

        // delay chống block
        await sleep(1000 + Math.random() * 2000);
    }

    res.json(results);
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log("Server running on port " + PORT);
});