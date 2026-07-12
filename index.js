/**
 * KONFIGURASI APLIKASI
 */
const CONFIG = {
    API_KEY: 'AIzaSyApCVwvjgWTZgyRPUaz_ymIpujS6afCjjw', 
    CHANNEL_ID: 'UCb6kJDbtnvyl8YtQmRnecfg',
    MAX_RESULTS: 50, // Ditingkatkan agar bisa menangkap berbagai jenis video
    BASE_URL: 'https://www.googleapis.com/youtube/v3/search'
};

/**
 * REFERENSI ELEMEN DOM
 */
const DOM = {
    gallerySections: document.getElementById('gallery-sections'),
    videoGrid: document.getElementById('video-grid'),
    shortsGrid: document.getElementById('shorts-grid'),
    liveGrid: document.getElementById('live-grid'),
    loadingState: document.getElementById('loading-state'),
    errorState: document.getElementById('error-state'),
    retryBtn: document.getElementById('retry-btn')
};

/**
 * STATE MANAGEMENT
 */
const uiState = {
    showLoading: () => {
        DOM.loadingState.removeAttribute('hidden');
        DOM.errorState.setAttribute('hidden', '');
        DOM.gallerySections.setAttribute('hidden', '');
    },
    showError: () => {
        DOM.loadingState.setAttribute('hidden', '');
        DOM.errorState.removeAttribute('hidden');
        DOM.gallerySections.setAttribute('hidden', '');
    },
    showSuccess: () => {
        DOM.loadingState.setAttribute('hidden', '');
        DOM.errorState.setAttribute('hidden', '');
        DOM.gallerySections.removeAttribute('hidden');
    }
};

/**
 * UTILITAS (FORMATTER)
 */
function formatDate(isoDateString) {
    const date = new Date(isoDateString);
    const options = { day: '2-digit', month: 'short', year: 'numeric' };
    return date.toLocaleDateString('id-ID', options);
}

/**
 * API FETCH LOGIC
 */
async function fetchYouTubeVideos() {
    // Meminta part snippet untuk mendeteksi tipe video
    const url = `${CONFIG.BASE_URL}?key=${CONFIG.API_KEY}&channelId=${CONFIG.CHANNEL_ID}&part=snippet,id&order=date&maxResults=${CONFIG.MAX_RESULTS}`;

    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`HTTP Error: ${response.status}`);

        const data = await response.json();
        return data.items.filter(item => item.id.kind === 'youtube#video');
    } catch (error) {
        console.error("Gagal mengambil data dari YouTube API:", error);
        throw error;
    }
}

/**
 * DOM RENDERING LOGIC
 */
function generateCardHTML(video) {
    const videoId = video.id.videoId;
    const { title, publishedAt, thumbnails } = video.snippet;
    const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;
    const thumbnailUrl = thumbnails.high ? thumbnails.high.url : thumbnails.medium.url;

    return `
        <article class="video-card">
            <a href="${videoUrl}" target="_blank" rel="noopener noreferrer" style="text-decoration: none; color: inherit; display: flex; flex-direction: column; height: 100%;">
                <img src="${thumbnailUrl}" alt="${title}" loading="lazy">
                <h2>${title}</h2>
                <p class="video-date">Diunggah: ${formatDate(publishedAt)}</p>
            </a>
        </article>
    `;
}

function renderCategory(videos, gridElement) {
    if (videos.length === 0) {
        gridElement.innerHTML = '<p style="font-weight: 500; padding: 1rem;">Belum ada video di kategori ini.</p>';
        return;
    }
    gridElement.innerHTML = videos.map(generateCardHTML).join('');
}

/**
 * PEMISAHAN KATEGORI & INISIALISASI
 */
async function initGallery() {
    uiState.showLoading();
    
    try {
        const videos = await fetchYouTubeVideos();
        
        // Memisahkan berdasarkan kriteria meta API
        const liveVideos = [];
        const shorts = [];
        const regularVideos = [];

        videos.forEach(video => {
            const isLive = video.snippet.liveBroadcastContent === 'live' || video.snippet.liveBroadcastContent === 'upcoming' || video.snippet.liveBroadcastContent === 'completed';
            const title = video.snippet.title.toLowerCase();
            const desc = video.snippet.description.toLowerCase();
            
            // Logika deteksi Shorts (API Search tidak memberikan durasi, hashtag adalah metode paling akurat tanpa fetch ganda)
            const isShorts = title.includes('#shorts') || desc.includes('#shorts');

            if (isLive) {
                liveVideos.push(video);
            } else if (isShorts) {
                shorts.push(video);
            } else {
                regularVideos.push(video);
            }
        });

        // Merender ke masing-masing grid
        renderCategory(regularVideos, DOM.videoGrid);
        renderCategory(shorts, DOM.shortsGrid);
        renderCategory(liveVideos, DOM.liveGrid);

        uiState.showSuccess();
    } catch (error) {
        uiState.showError();
    }
}

document.addEventListener('DOMContentLoaded', initGallery);
DOM.retryBtn.addEventListener('click', initGallery);