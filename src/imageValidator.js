class ImageValidator {
  constructor(message) {
    this.message = message;
    this.suportedTypes = ['bmp', 'gif', 'jpeg', 'png', 'tiff'];
    this.error = '';
  }

  checkIfFileIsValid() {
    const isPhoto = this.message.hasOwnProperty('photo');
    const isDocument = this.message.hasOwnProperty('document');

    if (!isPhoto && !isDocument) {
      this.error = 'Invalid file.';
      return false;
    }

    if (isPhoto) {
      this.error = 'Please send a image file without compression.';
      return false;
    }

    if (isDocument) {
      const { mime_type } = this.message.document;
      const isImage = mime_type.includes('image/');

      if (!isImage) {
        this.error = 'File must be a image.';
        return false;
      }
      const { file_name } = this.message.document;

      const [, fileExt] = file_name.split('.');

      const isFileSuported = this.suportedTypes.indexOf(fileExt) >= 0;

      if (!isFileSuported) {
        this.error = `The extension ${fileExt} is not suported.`;
        return false;
      }

      return true;
    }
  }
}

module.exports = ImageValidator;
