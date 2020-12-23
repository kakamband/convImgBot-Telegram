const express = require('express');
const app = express();
const axios = require('axios');
const { resolve } = require('path');
const fs = require('fs');
const { promisify } = require('util');
const Jimp = require('jimp');
const asyncJimp = promisify(Jimp);
const FormData = require('form-data');


function main() {
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  const TOKEN = process.env.TELEGRAM_BOT_TOKEN;
  const TELEGRAM_URL = `https://api.telegram.org/bot${TOKEN}`;

  app.get('/', (req, res) => {
    res.send('Application is running!');
  });

  // New telegram message
  app.post('/new-message', async (req, res) => {
    const { message } = req.body;

    if (message) {
      if (message.text) {
        await sendMessage(
          message,
          "Hi! Give me a image file so I can convert to PNG"
        );
        return res.end();
      };

      try {
        if (message.hasOwnProperty('photo')) {
          await sendMessage(message, 'You must send a image file without compression');

          return res.end();
        }

        if (message.hasOwnProperty('document')) {

          if (!message.document.mime_type.includes('image/')) {
            await sendMessage(message, 'You must send a image');

            return res.end();
          }

          const { file_name, file_id } = message.document;

          let [fileTitle, fileExt] = file_name.split('.');

          const response1 = await axios.get(
            TELEGRAM_URL + `/getFile?file_id=${file_id}`
          );

          const { file_path } = response1.data.result;

          const fileUrl = `https://api.telegram.org/file/bot${TOKEN}/${file_path}`;

          const response2 = await axios({
            method: 'GET',
            url: fileUrl,
            responseType: 'stream',
          });

          const path = resolve(__dirname, '..', '..', '..', 'tmp', fileTitle);

          response2.data.pipe(fs.createWriteStream(path + '.' + fileExt));

          await new Promise((resolve, reject) => {
            response2.data.on('end', () => {
              resolve();
            });

            response2.data.on('error', () => {
              reject();
            });
          });
          sendMessage(message, 'File received, converting...');
          await asyncJimp
            .read(path + '.' + fileExt)
            .then(resolve => {
              (fileExt !== 'png') ? fileExt = 'png' : fileExt = 'jpg';
              resolve
              .deflateStrategy(0)
              .write(path + '.' + fileExt);
            }).catch(reject => reject());

          const form = new FormData();

          form.append('chat_id', message.chat.id);
          form.append('document', fs.createReadStream(path + '.' + fileExt));

          let headers = {
            headers: form.getHeaders()
          }

          await axios.post(TELEGRAM_URL + '/sendDocument', form, headers);
          fs.unlinkSync(path + '.' + fileExt);
          await sendMessage(message, 'Done!');
          return res.end();
        }
      } catch (error) {

        await sendMessage(message, 'Internal error, try again later')
        throw new Error(error);
      }


      return res.end();
    }

    return res.end();
  });

  app.listen(process.env.PORT || 3000);

  async function sendMessage(message, text) {
    await axios.post(TELEGRAM_URL + '/sendMessage', {
      chat_id: message.chat.id,
      text: text,
    });
  }
}

main();
