/* eslint-disable import/prefer-default-export */
import axios from 'axios';
import cheerio from 'cheerio';
import fs from 'fs';
import * as email from './email';
import logger from './logger';

const isProduction = process.env.NODE_ENV === 'production';
const URL = 'https://www.exploretock.com/noma';

const fetchProducts = async ({ mock = false }) => {
  let page;
  if (mock) {
    page = {
      data: fs.readFileSync('./page.html', { encoding: 'utf8', flag: 'r' }),
    };
  } else {
    try {
      page = await axios.get(URL);
    } catch (e) {
      logger.error(e);
      page = { data: null };
    }
  }
  return page.data;
};

export const getSoldOutOccurrences = async () => {
  const productsRes = await fetchProducts({ mock: !isProduction });
  const $ = cheerio.load(productsRes);

  const soldOutOccurrences = $('span:contains("Sold Out")').length;

  return soldOutOccurrences;
};

const sendProductsUpdates = () => {
  email.send(`
     NOMA RESERVATIONS ARE AVAILABLE!!!!!!!
    `);
};

export const checkProductUpdates = async () => {
  const products = await getSoldOutOccurrences();
  if (products < 3) {
    sendProductsUpdates();
    logger.info('NOMA RESERVATIONS ARE AVAILABLE!!!!!!!');
    return;
  }
  logger.info('No updates');
};

(() => checkProductUpdates())();
