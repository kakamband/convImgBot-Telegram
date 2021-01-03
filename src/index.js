const express = require('express');
const ImageValidator = require('./imageValidator');

const app = express();

require('dotenv').config({
  path: process.env.NODE_ENV === 'dev' ? '.env.dev' : '.env',
});

const ConvImgBot = require('./convImgBot');

function main() {
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  app.get('/', (req, res) => {
    res.send('Application is running!');
  });

  // New telegram message
  app.post('/new-message', async (req, res) => {
    const { message } = req.body;

    if (message) {
      const convImgBot = new ConvImgBot(message);
      const imageValidator = new ImageValidator(message);

      if (process.env.NODE_ENV === 'dev') {
        if (message.chat.username !== 'phbase12') {
          await convImgBot.sendMessage('Hi! Im in development now, try again later');
          return res.end();
        }
      }

      if (message.text) {
        await convImgBot.sendMessage('Hi! Give me a image file to convert');
        return res.end();
      }

      const isValidFile = await imageValidator.checkIfFileIsValid();

      if (!isValidFile) {
        await convImgBot.sendMessage(imageValidator.error);
        return res.end();
      }

      convImgBot
        .getFileAttributes()
        .then((resolve) => resolve.getFile())
        .then((resolve) => resolve.convertImage())
        .then((resolve) => resolve.sendFile())
        .catch((reject) => res.end());

      return res.end();
    }
    return res.end();
  });

  app.listen(process.env.PORT || 80, () => {
    console.log('Server is running');
  });
}

main();
