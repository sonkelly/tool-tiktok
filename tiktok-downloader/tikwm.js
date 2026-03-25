const axios = require("axios");

async function getDownloadLink(videoUrl) {
    for (let i = 0; i < 3; i++) {
        try {
            const res = await axios.get("https://www.tikwm.com/api/", {
                params: { url: videoUrl }
            });

            if (res.data.data) {
                return {
                    mp4_nowm: res.data.data.play,
                    title: res.data.data.title
                };
            }
        } catch (e) {}

        await new Promise(r => setTimeout(r, 1000));
    }

    throw new Error("TikWM failed");
}

module.exports = getDownloadLink;