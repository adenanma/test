/**
 * ============================================================
 * YouTube Portfolio Gallery
 * Vanilla JavaScript
 * ============================================================
 */

/* ============================================================
   CONFIGURATION
   ============================================================ */

/**
 * ============================================================
 * >>>>>>>>>>>>>>>>>>>>>>>>> PERHATIAN <<<<<<<<<<<<<<<<<<<<<<<<<<
 *
 * GANTI STRING DI BAWAH INI DENGAN YOUTUBE DATA API v3 KEY
 * MILIK ANDA.
 *
 * Contoh:
 * const YOUTUBE_API_KEY = "AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXX";
 *
 * JANGAN mengubah nama variabelnya.
 * ============================================================
 */
const YOUTUBE_API_KEY = "AIzaSyApCVwvjgWTZgyRPUaz_ymIpujS6afCjjw";

/* Channel */
const CHANNEL_ID = "UCb6kJDbtnvyl8YtQmRnecfg";

/* Jumlah video yang ingin ditampilkan */
const MAX_RESULTS = 24;

/* API Endpoint */
const API_ENDPOINT = "https://www.googleapis.com/youtube/v3/search";

/* ============================================================
   DOM
============================================================ */

const loadingState = document.getElementById("loading-state");
const errorState = document.getElementById("error-state");
const videoGrid = document.getElementById("video-grid");

/* ============================================================
   INITIALIZATION
============================================================ */

document.addEventListener("DOMContentLoaded", init);

async function init() {
    console.log(
        "%cYouTube Portfolio Gallery Initialized",
        "color:green;font-weight:bold;"
    );

    if (
        !YOUTUBE_API_KEY ||
        YOUTUBE_API_KEY === "AIzaSyApCVwvjgWTZgyRPUaz_ymIpujS6afCjjw"
    ) {
        console.error(
            "YouTube API Key belum diisi.\n\nSilakan isi variabel:\nconst YOUTUBE_API_KEY = 'API_KEY_ANDA';"
        );

        showError(
            "YouTube API Key belum dikonfigurasi."
        );

        return;
    }

    showLoading();

    try {
        const videos = await fetchVideos();

        hideLoading();

        renderVideos(videos);
    } catch (error) {
        console.error(error);

        hideLoading();

        showError(
            "Gagal mengambil data video dari YouTube."
        );
    }
}

/* ============================================================
   FETCH API
============================================================ */

async function fetchVideos() {
    const params = new URLSearchParams({
        key: YOUTUBE_API_KEY,
        channelId: CHANNEL_ID,
        part: "snippet",
        order: "date",
        type: "video",
        maxResults: MAX_RESULTS
    });

    const response = await fetch(
        `${API_ENDPOINT}?${params.toString()}`
    );

    if (!response.ok) {
        throw new Error(
            `HTTP Error ${response.status}`
        );
    }

    const data = await response.json();

    return data.items;
}

/* ============================================================
   RENDER
============================================================ */

function renderVideos(videos) {
    videoGrid.innerHTML = "";

    if (!videos.length) {
        showError("Tidak ada video ditemukan.");
        return;
    }

    const fragment = document.createDocumentFragment();

    videos.forEach((video) => {
        fragment.appendChild(createVideoCard(video));
    });

    videoGrid.appendChild(fragment);
}

/* ============================================================
   CARD
============================================================ */

function createVideoCard(video) {
    const {
        title,
        thumbnails,
        publishedAt
    } = video.snippet;

    const videoId = video.id.videoId;

    const article = document.createElement("article");
    article.className = "video-card";

    article.innerHTML = `
        <a
            href="https://www.youtube.com/watch?v=${videoId}"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="${escapeHtml(title)}"
        >

            <div class="video-thumbnail">
                <img
                    src="${getThumbnail(thumbnails)}"
                    alt="${escapeHtml(title)}"
                    loading="lazy"
                >
            </div>

            <div class="video-content">

                <h3 class="video-title">
                    ${escapeHtml(title)}
                </h3>

                <p class="video-description">
                    ${formatDate(publishedAt)}
                </p>

            </div>

        </a>
    `;

    return article;
}

/* ============================================================
   HELPERS
============================================================ */

function getThumbnail(thumbnails) {
    return (
        thumbnails.high?.url ||
        thumbnails.medium?.url ||
        thumbnails.default?.url
    );
}

function formatDate(dateString) {
    const date = new Date(dateString);

    return new Intl.DateTimeFormat("id-ID", {
        day: "2-digit",
        month: "short",
        year: "numeric"
    }).format(date);
}

function escapeHtml(text) {
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
}

/* ============================================================
   STATE
============================================================ */

function showLoading() {
    loadingState.hidden = false;
    errorState.hidden = true;
}

function hideLoading() {
    loadingState.hidden = true;
}

function showError(message) {
    hideLoading();

    errorState.hidden = false;
    errorState.innerHTML = `<p>${message}</p>`;
}

/* ============================================================
   OPTIONAL
============================================================ */

window.addEventListener("error", (event) => {
    console.error("Global Error:", event.error);
});

window.addEventListener("unhandledrejection", (event) => {
    console.error(
        "Unhandled Promise Rejection:",
        event.reason
    );
});