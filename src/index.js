import express from 'express'
import axios from 'axios'
import schedule from 'node-schedule';
import cheerio from 'cheerio'

let app = express()
const SPECIAL_PRODUCT = 'five elephant'

const rule = new schedule.RecurrenceRule();
rule.minute = 0;

const checkIfSpecialProduct = (productsStr, search) => {
  return productsStr.toLowerCase().includes(search.toLowerCase())
}

const fetchProducts = async () => {
  const res = await axios.get('https://www.coffeedesk.pl/kawa/')
  const $ = cheerio.load(res.data)
  return $('.product-title > a').text()
}

const containsSpecialProduct = async () => {
  const products = await fetchProducts()
  return checkIfSpecialProduct(products, SPECIAL_PRODUCT)
}

(async () => {
  const res = await containsSpecialProduct()
})()


let server = app.listen(3000, () => {
  console.log(`server running at port http://localhost/${server.address().port}`)
})
