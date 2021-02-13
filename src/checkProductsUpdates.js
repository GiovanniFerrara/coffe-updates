import axios from 'axios'
import cheerio from 'cheerio'
import fs from 'fs'
import low from 'lowdb'
import FileSync from 'lowdb/adapters/FileSync'
import dotenv from 'dotenv'
import * as email from './email'

dotenv.config()
const adapter = new FileSync('db.json')
const db = low(adapter)
const isProduction = process.env.NODE_ENV === 'production'
const URL = 'https://www.coffeedesk.pl/search/five%20elephant/'

const fetchProducts = async ({mock = false}) => {
  let page
  if(mock){
    page = {data: fs.readFileSync('./page.html', {encoding: "utf8", flag:'r'})}
  } else {
    page = await axios.get(URL)
  }
  return page.data
}

export const getProductsDetails = async () => {
  const productsRes = await fetchProducts({mock: !isProduction})
  const $ = cheerio.load(productsRes)
  const unavailable =  $('.product-box').children('.unavailable').length
  const totalProducts = $('.product-box').length
  return {availableProducts: totalProducts - unavailable, totalProducts}
}

const checkProductUpdates = async () => {
  const {availableProducts, totalProducts} = await getProductsDetails()
  console.log('Checking products: ', {availableProducts, totalProducts})

  const totalProductsPrev = await db.get('totalProducts').value()
  const availableProductsPrev = await db.get('availableProducts').value()

  if(availableProducts > availableProductsPrev){
    await db.set('availableProducts', availableProducts).write()
    email.send(`there are new available Five Elephant! ${availableProducts} in total!`)
  }

  if(totalProducts > totalProductsPrev){
    await db.set('totalProducts', totalProducts).write()
    email.send(`there are new available Five Elephant! ${availableProducts} in total!`)
  }
}

checkProductUpdates()