import dotenv from 'dotenv';
import express from 'express';
import { checkProductUpdates } from './checkProductsUpdates';
import * as email from './email';
import logger from './logger';

dotenv.config();

const app = express();

app.get('/', async (req, res) => {
  try {
    await checkProductUpdates();
    res.send('Check done');
  } catch (e) {
    logger.error(e);
    res.status('500').send('Server error');
  }
});

app.get('/email', async (req, res) => {
  try {
    await email.send('Test email');
    res.send('Emails sent successfully');
  } catch (e) {
    logger.error(e);
    res.status('500').send('Server error');
  }
});

const server = app.listen(process.env.PORT || 3000, () => {
  console.log(
    `server running at port http://localhost/${server.address().port}`,
  );
});
