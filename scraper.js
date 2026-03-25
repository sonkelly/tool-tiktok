// const { chromium } = require("playwright");

// function sleep(ms) {
//     return new Promise(r => setTimeout(r, ms));
// }

// async function autoScroll(page) {
//     let lastHeight = 0;

//     for (let i = 0; i < 20; i++) { // giới hạn max
//         await page.mouse.wheel(0, 3000);

//         await page.waitForTimeout(1500 + Math.random() * 1000);

//         // kiểm tra số video đã load
//         const count = await page.evaluate(() => {
//             return document.querySelectorAll("a[href*='/video/']").length;
//         });

//         console.log("Loaded videos:", count);

//         // nếu không tăng nữa → stop
//         if (count === lastHeight) {
//             console.log("No more new videos → stop scroll");
//             break;
//         }

//         lastHeight = count;
//     }
// }

// async function waitForCaptchaSolved(page) {
//     console.log("Checking captcha...");

//     try {
//         // đợi captcha xuất hiện (nếu có)
//         await page.waitForSelector("text=Drag the slider", { timeout: 5000 });
//         console.log("Captcha detected → waiting user solve...");

//         // đợi captcha biến mất
//         await page.waitForSelector("text=Drag the slider", {
//             state: "hidden",
//             timeout: 120000 // cho user 2 phút
//         });

//         console.log("Captcha solved!");
//     } catch {
//         console.log("No captcha");
//     }
// }

// async function scrapeProfile(url, delay = 2) {
//     if (!delay) delay = 30;
//     const browser = await chromium.launch({
//         headless: false // debug thì false
//     });

//     const context = await browser.newContext({
//         storageState: "cookies.json"
//     });
//     const page = await context.newPage();

//     // fake anti-bot
//     await page.addInitScript(() => {
//         Object.defineProperty(navigator, 'webdriver', {
//             get: () => false
//         });
//     });

//     await page.goto(url, { waitUntil: "domcontentloaded" });
//     await context.storageState({ path: "cookies.json" });
//     await waitForCaptchaSolved(page);
//     // delay như người
//     await sleep(delay * 1000);
//     // await autoScroll(page);

//     // lấy video
//     const videos = await page.evaluate(() => {
//         const links = document.querySelectorAll("a[href*='/video/']");
//         const result = [];

//         links.forEach(a => {
//             const img = a.querySelector("img");

//             if (img) {
//                 result.push({
//                     url: a.href,
//                     thumbnail: img.src,
//                     title: img.alt || ""
//                 });
//             }
//         });

//         return result;
//     });

//     await browser.close();

//     return videos;
// }

// module.exports = scrapeProfile;