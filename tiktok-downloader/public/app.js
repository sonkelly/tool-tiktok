async function scan() {
    const url = document.getElementById("url").value;
    let delay = document.getElementById("delay").value;
    // nếu không nhập → default 30
    delay = parseInt(delay);

    if (isNaN(delay)) delay = 30; // 👈 default

    const res = await fetch("/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url, delay })
    });

    const data = await res.json();
    if (!Array.isArray(data)) {
        alert("Lỗi: " + (data.error || "Scan failed"));
        return;
    }
    render(data);
}

async function setFolder() {
    const path = document.getElementById("folder").value;

    if (!path) {
        alert("Nhập đường dẫn trước!");
        return;
    }

    await fetch("/set-folder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ path })
    });

    alert("Đã set folder: " + path);
}

// function render(videos) {
//     const list = document.getElementById("list");
//     list.innerHTML = "";

//     videos.forEach(v => {
//         const div = document.createElement("div");
//         div.className = "card";

//         div.innerHTML = `
//             <img class="thumb" src="${v.thumbnail}" />
//             <div class="card-body">
//                 <div class="title">${v.title}</div>

//                 <button onclick="download(this, '${v.url}', \`${v.title}\`)">
//                     Download
//                 </button>

//                 <div class="status">idle</div>
//             </div>
//         `;

//         list.appendChild(div);
//     });
// }

function render(videos) {
    const list = document.getElementById("list");
    list.innerHTML = "";

    videos.forEach(v => {
        const div = document.createElement("div");
        div.className = "card";

        div.innerHTML = `
            <img class="thumb" src="${v.thumbnail}" />

            <div class="card-body">
                <div class="left">

                <button 
                    class="download-btn"
                    data-url="${v.url}" 
                    data-title="${v.title}"
                    onclick="download(this, '${v.url}', \`${v.title}\`)">
                    Download
                </button>
                    <div class="title" onclick="copyText(this)" title="Click để copy">
                        ${v.title}
                    </div>
                    <div class="status status-idle">idle</div>
                </div>

                
            </div>
        `;

        list.appendChild(div);
    });
}

function copyText(el) {
    const text = el.innerText;

    navigator.clipboard.writeText(text);

    el.innerText = "Copied!";
    setTimeout(() => {
        el.innerText = text;
    }, 1000);
}

function setStatus(el, type, text) {
    el.className = "status " + type;
    el.innerText = text;
}

function openSingle() {
    window.open("/single.html", "_blank");
}
async function download(btn, url, title) {
    const status = btn.parentElement.querySelector(".status");

    setStatus(status, "status-downloading", "DOWNLOADING");

    try {
        await fetch("/download", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ url, title })
        });

        setStatus(status, "status-done", "DOWNLOADED");
    } catch {
        setStatus(status, "status-error", "ERROR");
    }
}

async function downloadAll() {
    const items = document.querySelectorAll(".card");

    for (let item of items) {
        const btn = item.querySelector("button");
        const status = item.querySelector(".status");

        const url = btn.getAttribute("data-url");
        const title = btn.getAttribute("data-title");

        setStatus(status, "status-downloading", "DOWNLOADING");

        try {
            await fetch("/download", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ url, title })
            });

            setStatus(status, "status-done", "DOWNLOADED");
        } catch {
            setStatus(status, "status-error", "ERROR");
        }
    }
}


// LOAD DINGLE VIDEO
let currentVideo = null;

async function loadVideo() {
    const url = document.getElementById("single-url").value;

    const res = await fetch("/get-video-info", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url })
    });

    const data = await res.json();

    if (!data || data.error) {
        alert("Load thất bại");
        return;
    }

    currentVideo = data;

    document.getElementById("single-title").innerText = data.title;
    document.getElementById("single-thumb").src = data.thumbnail;
}

// async function downloadVideo() {
//     const url = document.getElementById("single-url").value;

//     if (!url) {
//         alert("Nhập link trước!");
//         return;
//     }

//     await fetch("/download-single", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ url })
//     });

//     alert("Download xong!");
// }

function downloadVideo() {
    const url = document.getElementById("single-url").value;

    window.open(`/download-single?url=${encodeURIComponent(url)}`);
}