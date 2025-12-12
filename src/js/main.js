import iziToast from 'izitoast';
import 'izitoast/dist/css/iziToast.min.css';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';
import axios from 'axios';

// --- TEMA DEĞİŞTİRME MANTIĞI ---
const themeToggle = document.querySelector('#theme-toggle');
const body = document.body;

document.addEventListener('DOMContentLoaded', () => {
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme === 'dark') {
    body.classList.add('dark-mode');
    themeToggle.checked = true;
  } else {
    body.classList.remove('dark-mode');
    themeToggle.checked = false;
  }
});

themeToggle.addEventListener('change', () => {
  if (themeToggle.checked) {
    body.classList.add('dark-mode');
    localStorage.setItem('theme', 'dark');
  } else {
    body.classList.remove('dark-mode');
    localStorage.setItem('theme', 'light');
  }
});

// --- TEMA MANTIĞI BİTİŞ ---

// --- DOM Seçicileri ---
const searchForm = document.querySelector('#search-form');
const galleryContainer = document.querySelector('.gallery');
const loader = document.querySelector('.loader');
const loaderText = document.querySelector('.loader-text');
const loadMoreBtn = document.querySelector('.load-more-btn');
const categoryContainer = document.querySelector('#search-categories');

// --- API ve Durum (State) Değişkenleri ---
const API_KEY = '32475203-0397f154fda8b2c2a6bae1f0a';
const PER_PAGE = 40;

let currentPage = 1;
let currentQuery = '';
let totalHits = 0;
let currentBaseUrl = 'https://pixabay.com/api/';
let currentCategoryType = 'all';

const lightbox = new SimpleLightbox('.gallery a[data-type="image"]', {
  captionsData: 'alt',
  captionDelay: 250,
});

// --- Olay Dinleyicileri ---
searchForm.addEventListener('submit', onSearchSubmit);
loadMoreBtn.addEventListener('click', onLoadMore);
categoryContainer.addEventListener('click', onCategoryClick);
galleryContainer.addEventListener('click', onGalleryClick);

// --- Galeri Tıklama Yöneticisi ---
function onGalleryClick(event) {
  const clickedLink = event.target.closest('a');
  if (!clickedLink) return;

  if (clickedLink.dataset.type === 'video') {
    event.preventDefault();
    const videoUrl = clickedLink.dataset.videoSrc;
    showVideoModal(videoUrl);
  }
}

// --- Video Modal Gösterme Fonksiyonu ---
function showVideoModal(videoUrl) {
  const modalMarkup = `
    <div class="video-modal-overlay">
      <div class="video-modal-content">
        <button class="modal-close-btn">&times;</button>
        <video src="${videoUrl}" controls autoplay></video>
      </div>
    </div>
  `;
  document.body.insertAdjacentHTML('beforeend', modalMarkup);

  const modalOverlay = document.querySelector('.video-modal-overlay');
  modalOverlay
    .querySelector('.modal-close-btn')
    .addEventListener('click', closeVideoModal);
  modalOverlay.addEventListener('click', event => {
    if (event.target === modalOverlay) {
      closeVideoModal();
    }
  });

  document.addEventListener('keydown', onEscKey);
}

// --- Video Modal Kapatma Fonksiyonu ---
function closeVideoModal() {
  const modalOverlay = document.querySelector('.video-modal-overlay');
  if (modalOverlay) {
    document.body.removeChild(modalOverlay);
  }
  document.removeEventListener('keydown', onEscKey);
}

// --- ESC Tuşu Dinleyicisi ---
function onEscKey(event) {
  if (event.key === 'Escape') {
    closeVideoModal();
  }
}

// --- Kategori Değiştirme Fonksiyonu ---
function onCategoryClick(event) {
  event.preventDefault();
  const target = event.target;

  if (target.tagName !== 'BUTTON') return;

  categoryContainer.querySelectorAll('.category-btn').forEach(btn => {
    btn.classList.remove('active');
  });
  target.classList.add('active');

  currentBaseUrl = target.dataset.url;
  currentCategoryType = target.dataset.type;

  galleryContainer.innerHTML = '';
  hideLoadMoreBtn();
  currentQuery = searchForm.elements.searchQuery.value.trim();
  if (currentQuery) {
    onSearchSubmit(new Event('submit'));
  }
}

// --- Yeni Arama Fonksiyonu ---
async function onSearchSubmit(event) {
  event.preventDefault();
  const form =
    event.currentTarget.tagName === 'FORM' ? event.currentTarget : searchForm;
  const searchQuery = form.elements.searchQuery.value.trim();

  if (!searchQuery) {
    iziToast.error({
      title: 'Hata',
      message: 'Arama kutusu boş olamaz!',
      position: 'topRight',
    });
    return;
  }

  currentQuery = searchQuery;
  currentPage = 1;
  galleryContainer.innerHTML = '';
  hideLoadMoreBtn();
  showLoader();

  try {
    const data = await fetchImages(currentQuery, currentPage);
    totalHits = data.totalHits;

    if (totalHits === 0) {
      iziToast.info({
        title: 'Bilgi',
        message:
          'Sorry, there are no images matching your search query. Please try again!',
        position: 'topRight',
      });
    } else {
      renderGallery(data.hits);
      lightbox.refresh();
      checkEndAndUpdateButton();
    }
  } catch (error) {
    handleError(error);
  } finally {
    hideLoader();
  }
}

// --- "Daha Fazla Yükle" Fonksiyonu ---
async function onLoadMore() {
  currentPage += 1;
  hideLoadMoreBtn();
  showLoader();

  try {
    const data = await fetchImages(currentQuery, currentPage);
    renderGallery(data.hits);
    lightbox.refresh();
    smoothScroll();
    checkEndAndUpdateButton();
  } catch (error) {
    handleError(error);
  } finally {
    hideLoader();
  }
}

// --- API İsteği ---
async function fetchImages(query, page) {
  const params = {
    key: API_KEY,
    q: query,
    page: page,
    per_page: PER_PAGE,
    safesearch: 'true',
  };

  if (currentCategoryType === 'video') {
    currentBaseUrl = 'https://pixabay.com/api/videos/';
  } else {
    currentBaseUrl = 'https://pixabay.com/api/';
    params.orientation = 'horizontal';
    if (currentCategoryType !== 'all') {
      params.image_type = currentCategoryType;
    }
  }

  const response = await axios.get(currentBaseUrl, { params });
  return response.data;
}

// --- Galeri Render Fonksiyonu (Kapak Görseli DÜZELTİLDİ) ---
function renderGallery(hits) {
  let markup = '';

  if (currentCategoryType === 'video') {
    markup = hits
      .map(
        ({
          videos,
          picture_id, // 👈 Kapak için kullanıyoruz
          tags,
          likes,
          views,
          comments,
          downloads,
        }) => {
          const smallVideoUrl = videos.medium.url;
          // ✅ Vimeo CDN'den kapak görseli al
          const thumbnailUrl = `https://i.vimeocdn.com/video/${picture_id}_640x360.jpg`;

          return `<li class="gallery-item">
            <a class="gallery-link" href="#" data-type="video" data-video-src="${smallVideoUrl}">
              <img class="gallery-image" src="${thumbnailUrl}" alt="${tags}" loading="lazy"/>
            </a>
            <div class="info">
              <p class="info-item"><b>Likes</b> ${likes}</p>
              <p class="info-item"><b>Views</b> ${views}</p>
              <p class="info-item"><b>Comments</b> ${comments}</p>
              <p class="info-item"><b>Downloads</b> ${downloads}</p>
            </div>
          </li>`;
        }
      )
      .join('');
  } else {
    // Resim kısmı
    markup = hits
      .map(
        ({
          webformatURL,
          largeImageURL,
          tags,
          likes,
          views,
          comments,
          downloads,
        }) => `<li class="gallery-item">
            <a class="gallery-link" href="${largeImageURL}" data-type="image">
              <img class="gallery-image" src="${webformatURL}" alt="${tags}" loading="lazy"/>
            </a>
            <div class="info">
              <p class="info-item"><b>Likes</b> ${likes}</p>
              <p class="info-item"><b>Views</b> ${views}</p>
              <p class="info-item"><b>Comments</b> ${comments}</p>
              <p class="info-item"><b>Downloads</b> ${downloads}</p>
            </div>
          </li>`
      )
      .join('');
  }

  galleryContainer.insertAdjacentHTML('beforeend', markup);
}

// --- Yardımcı Fonksiyonlar ---
function showLoader() {
  loader.classList.remove('hidden');
  loaderText.classList.remove('hidden');
}

function hideLoader() {
  loader.classList.add('hidden');
  loaderText.classList.add('hidden');
}

function showLoadMoreBtn() {
  loadMoreBtn.classList.remove('hidden');
}

function hideLoadMoreBtn() {
  loadMoreBtn.classList.add('hidden');
}

function checkEndAndUpdateButton() {
  if (currentPage * PER_PAGE >= totalHits) {
    hideLoadMoreBtn();
    if (totalHits > 0) {
      iziToast.info({
        title: 'Bilgi',
        message: "We're sorry, but you've reached the end of search results.",
        position: 'topRight',
      });
    }
  } else {
    showLoadMoreBtn();
  }
}

function smoothScroll() {
  const firstCard = galleryContainer.querySelector('.gallery-item');
  if (firstCard) {
    const { height: cardHeight } = firstCard.getBoundingClientRect();
    window.scrollBy({
      top: cardHeight * 1.5,
      behavior: 'smooth',
    });
  }
}

function handleError(error) {
  iziToast.error({
    title: 'Hata',
    message: `Bir hata oluştu: ${error.message}`,
    position: 'topRight',
  });
  console.error('Fetch Error:', error);
}
