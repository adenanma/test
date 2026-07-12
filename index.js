/**
 * ==========================================================================
 * KONFIGURASI APLIKASI
 * ==========================================================================
 */
const CONFIG = {
    // [!] PERHATIAN: Masukkan API Key YouTube Anda di variabel API_KEY di bawah ini.
    // Console log pengingat:
    // console.log("Pastikan YOUTUBE API KEY 'AIzaSyApCVwvjgWTZgyRPUaz_ymIpujS6afCjjw' sudah terpasang di objek CONFIG.");
    API_KEY: 'AIzaSyApCVwvjgWTZgyRPUaz_ymIpujS6afCjjw', 
    CHANNEL_ID: 'UCb6kJDbtnvyl8YtQmRnecfg',
    MAX_RESULTS: 12, // Jumlah maksimal video yang dirender
    BASE_URL: 'https://www.googleapis.com/youtube/v3/search'
};

/**
 * ==========================================================================
 * REFERENSI ELEMEN DOM
 * ==========================================================================
 */
const DOM = {
    grid: document.getElementById('video-grid'),
    loadingState: document.getElementById('loading-state'),
    errorState: document.getElementById('error-state'),
    retryBtn: document.getElementById('retry-btn')
};

/**
 * ==========================================================================
 * STATE MANAGEMENT (MANIPULASI UI)
 * ==========================================================================
 */
const uiState = {
    showLoading: () => {
        DOM.loadingState.removeAttribute('hidden');
        DOM.errorState.setAttribute('hidden', '');
        DOM.grid.innerHTML = '';
    },
    showError: () => {
        DOM.loadingState.setAttribute('hidden', '');
        DOM.errorState.removeAttribute('hidden');
    },
    showSuccess: () => {
        DOM.loadingState.setAttribute('hidden', '');
        DOM.errorState.setAttribute('hidden', '');
    }
};

/**
 * ==========================================================================
 * UTILITAS (FORMATTER)
 * ==========================================================================
 */
function formatDate(isoDateString) {
    const date = new Date(isoDateString);
    const options = { day: '2-digit', month: 'short', year: 'numeric' };
    return date.toLocaleDateString('id-ID', options);
}

/**
 * ==========================================================================
 * API FETCH LOGIC
 * ==========================================================================
 */
async function fetchYouTubeVideos() {
    // Parameter: channelId, snippet (data umum), urutkan berdasarkan tanggal (terbaru)
    const url = `${CONFIG.BASE_URL}?key=${CONFIG.API_KEY}&channelId=${CONFIG.CHANNEL_ID}&part=snippet,id&order=date&maxResults=${CONFIG.MAX_RESULTS}`;

    try {
        const response = await fetch(url);
        
        if (!response.ok) {
            throw new Error(`HTTP Error: ${response.status} - ${response.statusText}`);
        }

        const data = await response.json();
        
        // Filter hanya untuk tipe 'video' (mengabaikan channel/playlist jika terbawa)
        const videos = data.items.filter(item => item.id.kind === 'youtube#video');
        return videos;

    } catch (error) {
        console.error("Gagal mengambil data dari YouTube API:", error);
        throw error; // Lempar error agar bisa ditangkap oleh inisiator
    }
}

/**
 * ==========================================================================
 * DOM RENDERING LOGIC
 * ==========================================================================
 */
function renderVideoCards(videos) {
    if (!videos || videos.length === 0) {
        DOM.grid.innerHTML = '<p style="grid-column: 1 / -1; text-align: center; font-weight: 500;">Tidak ada video yang ditemukan.</p>';
        uiState.showSuccess();
        return;
    }

    // Map data array menjadi string HTML
    const htmlString = videos.map(video => {
        const videoId = video.id.videoId;
        const { title, publishedAt, thumbnails } = video.snippet;
        const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;
        // Menggunakan resolusi medium/high untuk thumbnail
        const thumbnailUrl = thumbnails.high ? thumbnails.high.url : thumbnails.medium.url;

        return `
            <article class="video-card">
                <a href="${videoUrl}" target="_blank" rel="noopener noreferrer" style="text-decoration: none; color: inherit; display: block; height: 100%;">
                    <img src="${thumbnailUrl}" alt="Thumbnail dari ${title}" loading="lazy">
                    <h2>${title}</h2>
                    <p style="padding: 0 1.2rem 1.2rem; font-weight: 500; font-size: 0.9rem; opacity: 0.85;">
                        Diunggah: ${formatDate(publishedAt)}
                    </p>
                </a>
            </article>
        `;
    }).join('');

    DOM.grid.innerHTML = htmlString;
    uiState.showSuccess();
}

/**
 * ==========================================================================
 * INITIALIZATION & EVENT LISTENERS
 * ==========================================================================
 */
async function initGallery() {
    uiState.showLoading();
    
    try {
        const videos = await fetchYouTubeVideos();
        renderVideoCards(videos);
    } catch (error) {
        uiState.showError();
    }
}

// Jalankan saat dokumen selesai diload
document.addEventListener('DOMContentLoaded', initGallery);

// Event listener untuk tombol coba lagi saat error
DOM.retryBtn.addEventListener('click', initGallery);