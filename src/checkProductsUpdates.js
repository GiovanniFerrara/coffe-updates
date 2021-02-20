import axios from "axios";
import cheerio from "cheerio";
import fs from "fs";
import low from "lowdb";
import FileSync from "lowdb/adapters/FileSync";
import dotenv from "dotenv";
import * as email from "./email";
import logger from "./logger";

dotenv.config();
const adapter = new FileSync("db.json");
const db = low(adapter);
const isProduction = process.env.NODE_ENV === "production";
const URL = "https://www.coffeedesk.pl/search/five%20elephant/";

const fetchProducts = async ({ mock = false }) => {
  let page;
  if (mock) {
    page = {
      data: fs.readFileSync("./page.html", { encoding: "utf8", flag: "r" }),
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
  const productsRes = await fetchProducts({ mock: !isProduction});
  const $ = cheerio.load(productsRes);
  const products = $(".product-box");
  let productsFound = [];

  products.each((i, e) => {
    const title = $(e).find("a").text().replace(/\s\s+/g, "");
    const id = $(e).find("img").attr("src");
    const isUnavailable = $(e).find(".product-image").hasClass("unavailable");
    productsFound.push({ id, title, isAvailable: !isUnavailable });
  });

  return productsFound;
};

const findNewProducts = async (products, dbKey) => {
  const oldProducts = await db
    .get(dbKey)
    .toJSON();

  return products.filter(product => {
    return (!oldProducts.some(old => old.id === product.id)) && product.isAvailable
  });
};

const sendProductsUpdates = (newProducts, newAvailableProducts) => {
  const newProductsCount = newProducts.length
  const newAvailableProductsCount = newAvailableProducts.length
  if(newProductsCount && newAvailableProductsCount){
    email.send(`
      Now available ${newProductsCount} new coffee${newProductsCount > 1 ? 's': ''}! <br/>
      ${newProducts.map(p => p.title + `;
      <img src="${p.id}" width="400px" />
      <br/>
      `)}
    }`)
  } else if(newAvailableProductsCount) {
    email.send(`{
      Now available again your special coffee! <br/>
      ${newProducts.map(p => p.title + `;
      <img src="${p.id}" width="400px" />
      <br/>
      `)}
    }`)
  }
}

const checkProductUpdates = async () => {
  const products = await getProductsData();
  const availableProducts = products.filter(p => p.isAvailable)

  const newProducts = await findNewProducts(products, 'products')
  const newAvailableProducts = await findNewProducts(availableProducts, 'availableProducts')
  
  sendProductsUpdates(newProducts, newAvailableProducts)

  await db.set("products", products).write();
  await db.set("availableProducts", availableProducts).write();
};

(async () => await checkProductUpdates())();