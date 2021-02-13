import express from 'express'
import low from 'lowdb'
import FileSync from 'lowdb/adapters/FileSync'
import dotenv from 'dotenv'
import { getProductsDetails } from './checkProductsUpdates'

dotenv.config()
const adapter = new FileSync('db.json')
const db = low(adapter)
const isProduction = process.env.NODE_ENV === 'production'
// everyday, every 3 hours, from 7 to 22 for prod or every 5 secs for dev
const scheduleTime = isProduction ? '0 7-23/3 * * *' : '*/5 * * * * *' 

let app = express()
const URL = 'https://www.coffeedesk.pl/search/five%20elephant/'

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
