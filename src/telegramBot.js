const { post } = require('axios');

class TelegramBot {
  constructor(messsage) {
    this.messsage = messsage;
    this.DEFAULT_TELEGRAM_URL = `https://api.telegram.org/bot${this.getToken()}/`;
    this.FILE_TELEGRAM_URL = `https://api.telegram.org/file/bot${this.getToken()}/`;
  }

  getToken() {
    return process.env.TELEGRAM_BOT_TOKEN;
  }

  sendMessage(content) {
    const method = 'sendMessage';

    const url = this.DEFAULT_TELEGRAM_URL + method;
    return post(url, {
      chat_id: this.message.chat.id,
      text: content,
    });
  }
}

module.exports = TelegramBot;
