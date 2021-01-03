const { get, post } = require('axios');
const { resolve } = require('path');
const fs = require('fs');
const Jimp = require('jimp');
const FormData = require('form-data');
const TelegramBot = require('./telegramBot');

class ConvImgBot extends TelegramBot {
  constructor(message) {
    super(message);
    this.message = message;
    this.path = '';
    this.file = {};
  }

  async getFile() {
    const url = this.FILE_TELEGRAM_URL + this.file.path;
    const response = await get(url, {
      responseType: 'stream',
    });
    if (process.env.NODE_ENV === 'dev') {
      this.path = resolve(__dirname, '..', 'tmp', this.file.title);
    }

    this.path = resolve(__dirname, '..', '..', '..', 'tmp', fileTitle);

    response.data.pipe(fs.createWriteStream(`${this.path}.${this.file.ext}`));

    await new Promise((resolve, reject) => {
      response.data.on('end', () => {
        resolve();
      });
      response.data.on('error', () => {
        this.sendMessage('Error on receiving file');
        reject();
      });
    });
    await this.sendMessage('File received!');

    return this;
  }

  async sendFile() {
    const form = new FormData();

    form.append('chat_id', this.message.chat.id);
    form.append('document', fs.createReadStream(`${this.path}.${this.file.ext}`));

    const headers = {
      headers: form.getHeaders(),
    };
    const method = 'sendDocument';
    await post(this.DEFAULT_TELEGRAM_URL + method, form, headers);
    this.sendMessage('Done!');
    fs.unlinkSync(`${this.path}.${this.file.ext}`);

    return this;
  }

  async convertImage() {
    await Jimp.read(`${this.path}.${this.file.ext}`)
      .then((resolve) => {
        this.file.ext !== 'png' ? (this.file.ext = 'png') : (this.file.ext = 'jpg');
        resolve.deflateStrategy(1).write(`${this.path}.${this.file.ext}`);
      })
      .catch((reject) => reject());

    return this;
  }

  async getFileAttributes() {
    const { file_name, file_id } = this.message.document;
    const [title, ext] = file_name.split('.');
    const method = 'getFile';
    const url = `${this.DEFAULT_TELEGRAM_URL}${method}?file_id=${file_id}`;
    const response = await get(url);
    const { file_path } = response.data.result;

    this.file = {
      id: file_id,
      title,
      ext,
      path: file_path,
    };

    return this;
  }
}

module.exports = ConvImgBot;

// const path = resolve(__dirname, '..', '..', '..', 'tmp', fileTitle);
