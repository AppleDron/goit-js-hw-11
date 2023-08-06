import './partials/js/pixabay-api';
import { getImages } from './partials/js/pixabay-api';
import Notiflix from 'notiflix';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';

const form = document.querySelector('.search-form');
const galleryEl = document.querySelector('.gallery');
const target = document.querySelector('.js-guard');
const btnToTop = document.querySelector('.btn-to-top');
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
  searchValue = evt.currentTarget.searchQuery.value.trim();
  Notiflix.Loading.standard();

  if (searchValue === '') {
    Notiflix.Notify.failure(
      'The search string cannot be empty. Please specify your search query.'
    );
    return;
  }

  getImages(searchValue, page, perPage)
    .then(data => {
      if (!data.hits.length) {
        Notiflix.Notify.failure(
          'Sorry, there are no images matching your search query. Please try again.'
        );
      } else {
        Notiflix.Notify.success(`Hooray! We found ${data.totalHits} images.`);
        target.hidden = false;
      }

      Notiflix.Loading.remove();
      createMarkup(data.hits);
      simpleLightBox = new SimpleLightbox('.gallery a').refresh();

      observer.observe(target);
    })
    .catch(error => console.log(error))
    .finally(() => {
      form.reset();
    });
}

function onLoad(entries, observer) {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      Notiflix.Loading.standard();
      page += 1;
      getImages(searchValue, page, perPage)
        .then(data => {
          Notiflix.Loading.remove();
          createMarkup(data.hits);

          const totalPages = Math.ceil(data.totalHits / perPage);

          if (page > totalPages) {
            Notiflix.Notify.failure(
              "We're sorry, but you've reached the end of search results."
            );
          }

          // Даний код допомагає нам автоматично проскролити до нової партії картинок
          // Ми беремо перший елемент з наступної партї картинок та за допомогою методу getBoundingClientRect() отримуємо його розміри і місце розташування
          // а за допомогою методу scrollBy() скролимо від нашого поточного місця розташування на висоту вказану в cardHeight
          const { height: cardHeight } = document
            .querySelector('.gallery')
            .firstElementChild.getBoundingClientRect();

          window.scrollBy({
            top: cardHeight * 2,
            behavior: 'smooth',
          });
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
