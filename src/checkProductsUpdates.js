/* eslint-disable import/prefer-default-export */
import axios from 'axios';
import cheerio from 'cheerio';
import fs from 'fs';
import * as email from './email';
import logger from './logger';
import Database from './db';

const db = new Database();
const isProduction = process.env.NODE_ENV === 'production';
const URL = 'https://www.coffeedesk.pl/search/five%20elephant/';

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

export const getProductsData = async () => {
  const productsRes = await fetchProducts({ mock: !isProduction });
  const $ = cheerio.load(productsRes);
  const products = $('.product-box');
  const productsFound = [];

  products.each((i, e) => {
    const title = $(e).find('a').text().replace(/\s\s+/g, '');
    const url = $(e).find('img').attr('src');
    const id = url.match(/(?<=medium\/).*?(?=\.)/gm)[0];
    const isUnavailable = $(e).find('.product-image').hasClass('unavailable');
    productsFound.push({
      id, url, title, isAvailable: !isUnavailable,
    });
  });

  return productsFound;
};

const findNewProducts = async (products, dbKey) => {
  try {
    const oldProducts = await db.get(dbKey);
    return products.filter(
      (product) => (!oldProducts.some((old) => old.id === product.id)) && product.isAvailable,
    );
  } catch (e) {
    logger.error(e);
    return [];
  }
};

const sendProductsUpdates = (newProducts, newAvailableProducts) => {
  const newProductsCount = newProducts.length;
  const newAvailableProductsCount = newAvailableProducts.length;
  if (newProductsCount && newAvailableProductsCount) {
    email.send(`
      Now available ${newProductsCount} new coffee${newProductsCount > 1 ? 's' : ''}! 
      <br/>
      ${newProducts.map((p) => `${p.title};
      <br/>
      <img src="${p.url}" width="400px" />
      <br/>
      `)}
    `);
  } else if (newAvailableProductsCount) {
    email.send(`{
      Now available again your special coffee! 
      <br/>
      ${newProducts.map((p) => `${p.title}:
      <br/>
      <img src="${p.url}" width="400px" />
      <br/>
      `)}
    `);
  }
};

export const checkProductUpdates = async () => {
  const products = await getProductsData();
  const availableProducts = products.filter((p) => p.isAvailable);

  const newProducts = await findNewProducts(products, 'products');
  const newAvailableProducts = await findNewProducts(availableProducts, 'availableProducts');

  sendProductsUpdates(newProducts, newAvailableProducts);
  try {
    await db.add('products', products);
    await db.add('availableProducts', availableProducts);
  } catch (e) {
    logger.error(e);
  }
};

(() => checkProductUpdates())();
