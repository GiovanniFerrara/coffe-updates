import express from 'express'
import axios from 'axios'
import schedule from 'node-schedule';
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
// everyday, every 3 hours, from 7 to 22 for prod or every 5 secs for dev
const scheduleTime = isProduction === 'production' ? '0 7-23/3 * * *' : '*/5 * * * * *' 

let app = express()
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

const getProductsDetails = async () => {
  const productsRes = await fetchProducts({mock: !isProduction})
  const $ = cheerio.load(productsRes)
  const unavailable =  $('.product-box').children('.unavailable').length
  const totalProducts = $('.product-box').length
  return {availableProducts: totalProducts - unavailable, totalProducts}
}

const checkForProductUpdates = async () => {
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

schedule.scheduleJob(scheduleTime, checkForProductUpdates)

app.get('/', async(req, res)=>{
  const {availableProducts, totalProducts} = await getProductsDetails()
  res.send(`
  Available Products: ${availableProducts},
  Total Products: ${totalProducts}
  `)
})

let server = app.listen(process.env.PORT || 3000, () => {
  console.log(`server running at port http://localhost/${server.address().port}`)
})
