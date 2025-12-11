declare module 'quill' {
  interface QuillOptions {
    theme?: string;
    modules?: {
      toolbar?: any;
      imageUploader?: any;
      imageDrop?: any;
      [key: string]: any;
    };
    placeholder?: string;
    [key: string]: any;
  }

  class Quill {
    constructor(container: HTMLElement, options: QuillOptions);
    root: HTMLElement;
    on(event: string, callback: (...args: any[]) => void): void;
    [key: string]: any;
  }

  namespace Quill {
    function register(path: string, module: any): void;
  }

  export default Quill;
}

declare module 'quill-image-uploader' {
  const ImageUploader: any;
  export default ImageUploader;
}

declare module 'quill-image-drop-module' {
  const ImageDrop: any;
  export = ImageDrop;
}
