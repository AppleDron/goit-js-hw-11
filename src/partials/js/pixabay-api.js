import axios from 'axios';
import Notiflix from 'notiflix';

const API_KEY = '38643327-b21eba955d11258ba4dd60ade';
const BASE_URL = 'https://pixabay.com/api/';

export const getImages = async (value, page, perPage) => {
  try {
    const response = await axios.get(`${BASE_URL}`, {
      params: {
        key: API_KEY,
        q: value,
        image_type: 'photo',
        orientation: 'horizontal',
        safesearch: true,
        page: page,
        per_page: perPage,
      },
    });

    return response.data;
  } catch {
    if (error) {
      console.log('Помилка від сервера:', error.response.data);
    } else {
      console.log('Щось пішло не так:', error.message);
    }
  }
};
