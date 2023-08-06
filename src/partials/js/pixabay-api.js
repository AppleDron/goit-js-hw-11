import axios from 'axios';
import Notiflix from 'notiflix';

const API_KEY = '38643327-b21eba955d11258ba4dd60ade';
const BASE_URL = 'https://pixabay.com/api/';

export const getImages = async (value, page, perPage) => {
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

  //   console.log(response.data);
  return response.data;
};
