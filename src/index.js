import './partials/js/pixabay-api';
import { getImages } from './partials/js/pixabay-api';
import Notiflix from 'notiflix';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';

const form = document.querySelector('.search-form');
const galleryEl = document.querySelector('.gallery');
const target = document.querySelector('.js-guard');
let simpleLightBox;
let searchValue = '';
let page = 1;
let perPage = 40;

let options = {
  root: null,
  rootMargin: '400px',
  threshold: 1.0,
};
let observer = new IntersectionObserver(onLoad, options);

form.addEventListener('submit', handlerSearchPhotos);

function handlerSearchPhotos(evt) {
  evt.preventDefault();

  galleryEl.innerHTML = '';
  target.hidden = true;
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
        simpleLightBox = new SimpleLightbox('.gallery a').refresh();
        observer.observe(target);
        target.hidden = false;
      }
    })
    .catch(error => console.log(error))
    .finally(() => {
      form.reset();
    });
}

function onLoad(entries, observer) {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      page += 1;

      getImages(searchValue, page, perPage)
        .then(data => {
          createMarkup(data.hits);
          simpleLightBox = new SimpleLightbox('.gallery a').refresh();

          const totalPages = Math.ceil(data.totalHits / perPage);

          if (page >= totalPages) {
            Notiflix.Notify.failure(
              "We're sorry, but you've reached the end of search results."
            );

            observer.unobserve(target);
            page = 1;
          }
        })
        .catch(err => console.log(err));
    }
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
}
