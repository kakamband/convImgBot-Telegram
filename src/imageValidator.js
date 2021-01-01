const TelegramBot = require('./telegramBot');

class ImageValidator extends TelegramBot {
  constructor(message) {
    super(message);
    this.message = message;
    this.suportedTypes = ['bmp', 'gif', 'jpeg', 'png', 'tiff'];
  }

  checkIfFileIsValid() {
    const isPhoto = this.message.hasOwnProperty('photo');
    const isDocument = this.message.hasOwnProperty('document');

    if (!isPhoto && !isDocument) {
      return false;
    }

    if (isPhoto) {
      this.sendMessage('You must send a image file without compression');
      return false;
    }

    if (isDocument) {
      const { mime_type } = this.message.document;
      const isImage = mime_type.includes('image/');

      if (!isImage) {
        this.sendMessage('File must be a image');
        return false;
      }
      const { file_name } = this.message.document;

      const [, fileExt] = file_name.split('.');

      const isFileSuported = this.suportedTypes.indexOf(fileExt) >= 0;

      if (!isFileSuported) {
        this.sendMessage(`Sorry, I don't work with ${fileExt} files.`);
        return false;
      }
      this.sendMessage('Processing image...');
      return true;
    }
  }
}

module.exports = ImageValidator;
