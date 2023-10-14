import axios from 'axios';
import Notiflix, { Notify } from 'notiflix';
import simpleLightbox from 'simplelightbox';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';
const searchWord = document.querySelector('#search-input');
const key = '40029260-bdd4281bc36e2562b6b60283e';
const gallery = document.querySelector('.gallery');
const urlBase = 'https://pixabay.com/api/';
const btnLoadMore = document.querySelector('#load-more');
const btnApply = document.querySelector('.search-btn');
const noMoreImages = document.querySelector('#no-more-images');
let page = 1;
const per_page = 40;
let total = 0;
let lightbox = new SimpleLightbox('.gallery a', {
  captionsData: 'alt',
  captionDelay: 200,
});
btnApply.addEventListener('click', searchImages);

function handleResponse(response) {
  const images = response.data.hits;
  const markup = images
    .map(
      image => `
      <a class="photo-card"
      href="${image.largeImageURL}">
        <img src="${image.webformatURL}" alt="${image.tags}" loading="lazy" class="photo"/>
        <div class="info">
          <p class="info-item">
            <b>Likes<br/>${image.likes}</b>
          </p>  
          <p class="info-item">
            <b>Views<br/>${image.views}</b>
          </p>
          <p class="info-item">
            <b>Comments<br/>${image.comments}</b>
          </p>
          <p class="info-item">
            <b>Downloads<br/>${image.downloads}</b>
          </p>
        </div>
      </a>`
    )
    .join('');
  gallery.innerHTML += markup;
  lightbox.refresh();
  btnLoadMore.classList.replace('hidden', 'load-More');
  noMoreImages.classList.add('hidden');
  const totalHits = response.data.totalHits;

  total = totalHits;
  page = page + 1;
  if (total < page * per_page - 1) {
    noMoreImages.classList.remove('hidden');
    btnLoadMore.classList.replace('load-More', 'hidden');
  }

  if (images.length === 0) {
    Notiflix.Notify.failure(
      'Sorry, there are no images matching your search query. Please try again.'
    );
    btnLoadMore.classList.replace('load-More', 'hidden');
  }
}

async function searchImages(event) {
  btnLoadMore.classList.replace('load-More', 'hidden');
  event.preventDefault();
  gallery.innerHTML = '';
  page = 1;
  try {
    const response = await axios.get(urlBase, {
      params: {
        key: key,
        q: searchWord.value,
        image_type: 'photo',
        orientation: 'horizontal',
        safesearch: true,
        per_page: per_page,
        page: page,
      },
    });
    handleResponse(response);
    Notify.success(`Hooray! We found ${total} images.`);
  } catch (error) {
    console.log(error);
    Notiflix.Notify.failure(
      'Sorry, there are no images matching your search query. Please try again.'
    );
  }
}

btnLoadMore.addEventListener('click', loadMoreImages);

async function loadMoreImages(event) {
  event.preventDefault();
  try {
    const response = await axios.get(urlBase, {
      params: {
        key: key,
        q: searchWord.value,
        image_type: 'photo',
        orientation: 'horizontal',
        safesearch: true,
        per_page: per_page,
        page: page,
      },
    });
    const images = response.data.hits;
    if (images.length === 0) {
      Notiflix.Notify.info('No more images to load.');
    } else {
      handleResponse(response);
      const { height: cardHeight } = document
        .querySelector('.gallery')
        .firstElementChild.getBoundingClientRect();

      window.scrollBy({
        top: cardHeight * 2,
        behavior: 'smooth',
      });
    }
  } catch (error) {
    console.log(error);
    Notiflix.Notify.failure('Failed to load more images.');
  }
}
