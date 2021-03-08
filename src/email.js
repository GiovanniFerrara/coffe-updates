/* eslint-disable import/prefer-default-export */
import recipient from '../recipients.json';
import logger from './logger';

const mailjet = require('node-mailjet').connect(
  process.env.MJ_APIKEY_PUBLIC,
  process.env.MJ_APIKEY_PRIVATE,
);

const isProduction = process.env.NODE_ENV === 'production';

export const send = async (text) => {
  if (isProduction) {
    mailjet.post('send', { version: 'v3.1' }).request({
      Messages: [
        {
          From: {
            Email: 'gianmarco.ferrara@gmail.com',
            Name: 'Giovanni',
          },
          To: recipient.list,
          TemplateID: 2413952,
          TemplateLanguage: true,
          Subject: 'New Coffee for you!',
          Variables: {
            event: text,
          },
        },
      ],
    });
  } else {
    logger.info(`Email sent: ${text}`);
  }
};
