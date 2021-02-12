import express from 'express'
import axios from 'axios'
import schedule from 'node-schedule';
import cheerio from 'cheerio'
import fs from 'fs'

let app = express()
const SPECIAL_PRODUCT = 'five elephant'

const rule = new schedule.RecurrenceRule();
rule.minute = 0;

const checkIfSpecialProduct = (productsStr, search) => {
  return productsStr.toLowerCase().includes(search.toLowerCase())
}

const fetchProducts = async ({mock = false}) => {
  let page
  if(mock){
    page = {data: fs.readFileSync('./page.html', {encoding: "utf8", flag:'r'})}
  } else {
    page = await axios.get('https://www.coffeedesk.pl/search/five%20elephant/')
  }
  const $ = cheerio.load(page.data)
  return $('.product-title > a')
}

const containsSpecialProduct = async () => {
  const products = await fetchProducts({mock: true})
  return checkIfSpecialProduct(products, SPECIAL_PRODUCT)
}

(async () => {
  const res = await containsSpecialProduct()
  console.log(res)
})()


let server = app.listen(3000, () => {
  console.log(`server running at port http://localhost/${server.address().port}`)
})
