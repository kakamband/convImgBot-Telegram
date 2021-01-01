const express = require('express');

const app = express();

require('dotenv').config();

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

    if (!message) {
      return res.end();
    }

    const convImgBot = new ConvImgBot(message);
    if (message.text) {
      convImgBot.sendMessage('Hi! Give me a image file to convert');
      return res.end();
    }

    const isValidFile = await convImgBot.checkIfFileIsValid();
    if (!isValidFile) {
      return res.end();
    }
    try {
      await convImgBot.getFileAttributes();
      await convImgBot.getFile();
      await convImgBot.convertImage();
      await convImgBot.sendFile();
      return res.end();
    } catch (error) {
      console.error(error);
      return res.end();
    }
  });

  app.listen(process.env.PORT || 3001, () => {
    console.log('Server is running');
  });
}

main();
