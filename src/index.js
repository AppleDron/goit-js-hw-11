import './partials/js/pixabay-api';
import { getImages } from './partials/js/pixabay-api';
import Notiflix from 'notiflix';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';

const form = document.querySelector('.search-form');
const galleryEl = document.querySelector('.gallery');
const simpleLightBox = new SimpleLightbox('.gallery a');
const btnLoadMore = document.querySelector('.load-more');
btnLoadMore.style.display = 'none';

let searchValue = '';
let page = 1;
let perPage = 40;

form.addEventListener('submit', handlerSearchPhotos);
btnLoadMore.addEventListener('click', onLoad);
btnLoadMore.hidden = true;

function handlerSearchPhotos(evt) {
  evt.preventDefault();

  page = 1;
  galleryEl.innerHTML = '';
  searchValue = evt.currentTarget.elements.searchQuery.value.trim();
  Notiflix.Loading.standard();

  if (searchValue === '') {
    Notiflix.Notify.failure(
      'The search string cannot be empty. Please specify your search query.'
    );
    Notiflix.Loading.remove();
    return;
  }

  getImages(searchValue, page, perPage)
    .then(data => {
      if (data.totalHits === 0) {
        Notiflix.Notify.failure(
          'Sorry, there are no images matching your search query. Please try again.'
        );
        Notiflix.Loading.remove();
      } else {
        page = 1;
        Notiflix.Loading.remove();
        Notiflix.Notify.success(`Hooray! We found ${data.totalHits} images.`);
        createMarkup(data.hits);

        const totalPages = Math.ceil(data.totalHits / perPage);

        if (page === totalPages) {
          Notiflix.Notify.failure(
            "We're sorry, but you've reached the end of search results."
          );
          btnLoadMore.hidden = true;
        } else {
          btnLoadMore.style.display = 'block';
        }

        simpleLightBox.refresh();
      }
    })
    .catch(error => console.log(error))
    .finally(() => {
      form.reset();
    });
}

function onLoad() {
  page += 1;

  getImages(searchValue, page, perPage)
    .then(data => {
      createMarkup(data.hits);

      const totalPages = Math.ceil(data.totalHits / perPage);

      if (page === totalPages) {
        Notiflix.Notify.failure(
          "We're sorry, but you've reached the end of search results."
        );
        btnLoadMore.style.display = 'none';
      }
      simpleLightBox.refresh();
    })
    .catch(err => {
      console.log(err);
    });
}

function createMarkup(arr) {
  if (!galleryEl) {
    return;
  }

  const markup = arr
    .map(
      ({
        webformatURL,
        largeImageURL,
        tags,
        likes,
        views,
        comments,
        downloads,
        user,
      }) => {
        return `<a href="${largeImageURL}">
        <div class="photo-card">
        
            <div class="card-header">
      <p class="card-username">${user}</p>
      <p class="card-views">${views} views</p>
    </div>

            <img src="${webformatURL}" alt="${tags}" loading="lazy" class="card-img"/>
            <div class="info">
                <p class="likes">
                    Likes<b>${likes}</b>
                </p>

                <p class="info-item">
                    Downloads<b>${downloads}</b>
                </p>
                <p class="comments">
                    Comments<b>${comments}</b>
                </p>
            </div>
</div></a>`;
      }
    )
    .join('');

  galleryEl.insertAdjacentHTML('beforeend', markup);

  if (page === 1) {
    simpleLightBox.refresh();
  }
}
