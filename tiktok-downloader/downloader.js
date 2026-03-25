const axios = require("axios");
const fs = require("fs");
const path = require("path");

// async function downloadFromUrl(fileUrl, name) {
//     const safeName = name ?
//         name.replace(/[^\w\d]/g, "_").slice(0, 50) :
//         Date.now();

//     const filePath = path.join(__dirname, "downloads", safeName + ".mp4");

//     const response = await axios({
//         url: fileUrl,
//         method: "GET",
//         responseType: "stream"
//     });

//     const writer = fs.createWriteStream(filePath);
//     response.data.pipe(writer);

//     return new Promise((resolve, reject) => {
//         writer.on("finish", resolve);
//         writer.on("error", reject);
//     });
// }

async function downloadFromUrl(fileUrl, name, folder) {
    const fs = require("fs");
    const path = require("path");

    const safeName = name ?
        name.replace(/[^\w\d]/g, "_").slice(0, 50) :
        Date.now();

    const filePath = path.join(folder, safeName + ".mp4");

    const response = await axios({
        url: fileUrl,
        method: "GET",
        responseType: "stream"
    });

    const writer = fs.createWriteStream(filePath);
    response.data.pipe(writer);

    return new Promise((resolve, reject) => {
        writer.on("finish", resolve);
        writer.on("error", reject);
    });
}

module.exports = downloadFromUrl;