class Cropit {
  constructor(jQuery, element, options) {
    this.$el = $(element);

    const defaults = this.loadDefaults(this.$el); // 修正：原代码可能遗漏了this
    this.options = $.extend({}, defaults, options);

    this.init();
  }

  init() {
    // 为图片对象添加跨域属性，允许跨域加载
    this.image = new Image();
    this.image.crossOrigin = 'anonymous'; // 关键：允许跨域图片加载
    this.preImage = new Image();
    this.preImage.crossOrigin = 'anonymous'; // 预加载图片也添加跨域属性

    this.image.onload = this.onImageLoaded.bind(this);
    this.preImage.onload = this.onPreImageLoaded.bind(this);
    this.image.onerror = this.preImage.onerror = () => {
      this.onImageError.call(this, ERRORS.IMAGE_FAILED_TO_LOAD);
    };

    this.$preview = this.options.$preview.css('position', 'relative');
    this.$fileInput = this.options.$fileInput.attr({ accept: 'image/*' });
    this.$zoomSlider = this.options.$zoomSlider.attr({ min: 0, max: 1, step: 0.01 });

    this.previewSize = {
      width: this.options.width || this.$preview.innerWidth(),
      height: this.options.height || this.$preview.innerHeight(),
    };

    this.$image = $('<img />')
      .addClass(CLASS_NAMES.PREVIEW_IMAGE)
      .attr('alt', '')
      .css({
        transformOrigin: 'top left',
        webkitTransformOrigin: 'top left',
        willChange: 'transform',
      });
    this.$imageContainer = $('<div />')
      .addClass(CLASS_NAMES.PREVIEW_IMAGE_CONTAINER)
      .css({
        position: 'absolute',
        overflow: 'hidden',
        left: 0,
        top: 0,
        width: '100%',
        height: '100%',
      })
      .append(this.$image);
    this.$preview.append(this.$imageContainer);

    if (this.options.imageBackground) {
      if ($.isArray(this.options.imageBackgroundBorderWidth)) {
        this.bgBorderWidthArray = this.options.imageBackgroundBorderWidth;
      } else {
        this.bgBorderWidthArray = [0, 1, 2, 3].map(() => this.options.imageBackgroundBorderWidth);
      }

      this.$bg = $('<img />')
        .addClass(CLASS_NAMES.PREVIEW_BACKGROUND)
        .attr('alt', '')
        .css({
          position: 'relative',
          left: this.bgBorderWidthArray[3],
          top: this.bgBorderWidthArray[0],
          transformOrigin: 'top left',
          webkitTransformOrigin: 'top left',
          willChange: 'transform',
        });
      this.$bgContainer = $('<div />')
        .addClass(CLASS_NAMES.PREVIEW_BACKGROUND_CONTAINER)
        .css({
          position: 'absolute',
          zIndex: 0,
          top: -this.bgBorderWidthArray[0],
          right: -this.bgBorderWidthArray[1],
          bottom: -this.bgBorderWidthArray[2],
          left: -this.bgBorderWidthArray[3],
        })
        .append(this.$bg);
      if (this.bgBorderWidthArray[0] > 0) {
        this.$bgContainer.css('overflow', 'hidden');
      }
      this.$preview.prepend(this.$bgContainer);
    }

    this.initialZoom = this.options.initialZoom;

    this.imageLoaded = false;

    this.moveContinue = false;

    this.zoomer = new Zoomer(); // 假设Zoomer已定义（原代码可能遗漏）

    if (this.options.allowDragNDrop) {
      $.event.props.push('dataTransfer');
    }

    this.bindListeners();

    if (this.options.imageState && this.options.imageState.src) {
      this.loadImage(this.options.imageState.src);
    }
  }

  // 补充原代码中缺失的loadDefaults方法（根据上下文推测）
  loadDefaults($el) {
    return {
      $preview: $el.find(`.${CLASS_NAMES.PREVIEW}`),
      $fileInput: $el.find(`.${CLASS_NAMES.FILE_INPUT}`),
      $zoomSlider: $el.find(`.${CLASS_NAMES.ZOOM_SLIDER}`),
      imageBackground: false,
      imageBackgroundBorderWidth: 0,
      allowDragNDrop: true,
      initialZoom: 1,
      maxZoom: 1,
      exportZoom: 1,
      freeMove: false,
      smallImage: 'reject',
      onFileChange: () => {},
      onImageLoading: () => {},
      onImageLoaded: () => {},
      onImageError: () => {},
      onFileReaderError: () => {},
      onOffsetChange: () => {},
      onZoomEnabled: () => {},
      onZoomDisabled: () => {},
    };
  }

  bindListeners() {
    this.$fileInput.on('change.cropit', this.onFileChange.bind(this));
    this.$imageContainer.on(EVENTS.PREVIEW, this.onPreviewEvent.bind(this));
    this.$zoomSlider.on(EVENTS.ZOOM_INPUT, this.onZoomSliderChange.bind(this));

    if (this.options.allowDragNDrop) {
      this.$imageContainer.on('dragover.cropit dragleave.cropit', this.onDragOver.bind(this));
      this.$imageContainer.on('drop.cropit', this.onDrop.bind(this));
    }
  }

  unbindListeners() {
    this.$fileInput.off('change.cropit');
    this.$imageContainer.off(EVENTS.PREVIEW);
    this.$imageContainer.off('dragover.cropit dragleave.cropit drop.cropit');
    this.$zoomSlider.off(EVENTS.ZOOM_INPUT);
  }

  onFileChange(e) {
    this.options.onFileChange(e);

    if (this.$fileInput.get(0).files) {
      this.loadFile(this.$fileInput.get(0).files[0]);
    }
  }

  loadFile(file) {
    const fileReader = new FileReader();
    if (file && file.type.match('image')) {
      fileReader.readAsDataURL(file);
      fileReader.onload = this.onFileReaderLoaded.bind(this);
      fileReader.onerror = this.onFileReaderError.bind(this);
    } else if (file) {
      this.onFileReaderError();
    }
  }

  onFileReaderLoaded(e) {
    this.loadImage(e.target.result);
  }

  onFileReaderError() {
    this.options.onFileReaderError();
  }

  onDragOver(e) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
    this.$preview.toggleClass(CLASS_NAMES.DRAG_HOVERED, e.type === 'dragover');
  }

  onDrop(e) {
    e.preventDefault();
    e.stopPropagation();

    const files = Array.prototype.slice.call(e.dataTransfer.files, 0);
    files.some((file) => {
      if (!file.type.match('image')) { return false; }

      this.loadFile(file);
      return true;
    });

    this.$preview.removeClass(CLASS_NAMES.DRAG_HOVERED);
  }

  loadImage(imageSrc) {
    if (!imageSrc) { return; }

    this.options.onImageLoading();
    this.setImageLoadingClass();

    if (imageSrc.indexOf('data') === 0) {
      // 本地DataURL无需跨域处理
      this.preImage.src = imageSrc;
    } else {
      // 远程图片通过XHR加载为blob，避免跨域限制
      const xhr = new XMLHttpRequest();
      xhr.onload = (e) => {
        if (e.target.status >= 300) {
          this.onImageError.call(this, ERRORS.IMAGE_FAILED_TO_LOAD);
          return;
        }
        this.loadFile(e.target.response);
      };
      xhr.open('GET', imageSrc);
      xhr.responseType = 'blob';
      xhr.send();
    }
  }

  onPreImageLoaded() {
    if (this.shouldRejectImage({
      imageWidth: this.preImage.width,
      imageHeight: this.preImage.height,
      previewSize: this.previewSize,
      maxZoom: this.options.maxZoom,
      exportZoom: this.options.exportZoom,
      smallImage: this.options.smallImage,
    })) {
      this.onImageError(ERRORS.SMALL_IMAGE);
      if (this.image.src) { this.setImageLoadedClass(); }
      return;
    }

    this.image.src = this.preImage.src;
  }

  onImageLoaded() {
    this.rotation = 0;
    this.setupZoomer(this.options.imageState && this.options.imageState.zoom || this.initialZoom);
    if (this.options.imageState && this.options.imageState.offset) {
      this.offset = this.options.imageState.offset;
    } else {
      this.centerImage();
    }

    this.options.imageState = {};

    this.$image.attr('src', this.image.src);
    if (this.options.imageBackground) {
      this.$bg.attr('src', this.image.src);
    }

    this.setImageLoadedClass();

    this.imageLoaded = true;

    this.options.onImageLoaded();
  }

  onImageError(error) {
    this.options.onImageError(error);
    this.removeImageLoadingClass();
  }

  setImageLoadingClass() {
    this.$preview
      .removeClass(CLASS_NAMES.IMAGE_LOADED)
      .addClass(CLASS_NAMES.IMAGE_LOADING);
  }

  setImageLoadedClass() {
    this.$preview
      .removeClass(CLASS_NAMES.IMAGE_LOADING)
      .addClass(CLASS_NAMES.IMAGE_LOADED);
  }

  removeImageLoadingClass() {
    this.$preview.removeClass(CLASS_NAMES.IMAGE_LOADING);
  }

  getEventPosition(e) {
    if (e.originalEvent && e.originalEvent.touches && e.originalEvent.touches[0]) {
      e = e.originalEvent.touches[0];
    }
    if (e.clientX && e.clientY) {
      return { x: e.clientX, y: e.clientY };
    }
  }

  onPreviewEvent(e) {
    if (!this.imageLoaded) { return; }

    this.moveContinue = false;
    this.$imageContainer.off(EVENTS.PREVIEW_MOVE);

    if (e.type === 'mousedown' || e.type === 'touchstart') {
      this.origin = this.getEventPosition(e);
      this.moveContinue = true;
      this.$imageContainer.on(EVENTS.PREVIEW_MOVE, this.onMove.bind(this));
    } else {
      $(document.body).focus();
    }

    e.stopPropagation();
    return false;
  }

  onMove(e) {
    const eventPosition = this.getEventPosition(e);

    if (this.moveContinue && eventPosition) {
      this.offset = {
        x: this.offset.x + eventPosition.x - this.origin.x,
        y: this.offset.y + eventPosition.y - this.origin.y,
      };
    }

    this.origin = eventPosition;

    e.stopPropagation();
    return false;
  }

  set offset(position) {
    if (!position || !this.exists(position.x) || !this.exists(position.y)) { return; }

    this._offset = this.fixOffset(position);
    this.renderImage();

    this.options.onOffsetChange(position);
  }

  // 补充原代码中缺失的exists方法（从utils引入）
  exists(value) {
    return value !== null && value !== undefined;
  }

  fixOffset(offset) {
    if (!this.imageLoaded) { return offset; }

    const ret = { x: offset.x, y: offset.y };

    if (!this.options.freeMove) {
      if (this.image.width * this.zoom >= this.previewSize.width) {
        ret.x = Math.min(0, Math.max(ret.x, this.previewSize.width - this.image.width * this.zoom));
      } else {
        ret.x = Math.max(0, Math.min(ret.x, this.previewSize.width - this.image.width * this.zoom));
      }

      if (this.image.height * this.zoom >= this.previewSize.height) {
        ret.y = Math.min(0, Math.max(ret.y, this.previewSize.height - this.image.height * this.zoom));
      } else {
        ret.y = Math.max(0, Math.min(ret.y, this.previewSize.height - this.image.height * this.zoom));
      }
    }

    ret.x = Math.round(ret.x);
    ret.y = Math.round(ret.y);

    return ret;
  }

  centerImage() {
    if (!this.image.width || !this.image.height || !this.zoom) { return; }

    this.offset = {
      x: (this.previewSize.width - this.image.width * this.zoom) / 2,
      y: (this.previewSize.height - this.image.height * this.zoom) / 2,
    };
  }

  onZoomSliderChange() {
    if (!this.imageLoaded) { return; }

    this.zoomSliderPos = Number(this.$zoomSlider.val());
    const newZoom = this.zoomer.getZoom(this.zoomSliderPos);
    if (newZoom === this.zoom) { return; }
    this.zoom = newZoom;
  }

  enableZoomSlider() {
    this.$zoomSlider.removeAttr('disabled');
    this.options.onZoomEnabled();
  }

  disableZoomSlider() {
    this.$zoomSlider.attr('disabled', true);
    this.options.onZoomDisabled();
  }

  setupZoomer(zoom) {
    this.zoomer.setup({
      imageSize: { width: this.image.width, height: this.image.height },
      previewSize: this.previewSize,
      minZoom: this.options.minZoom,
      maxZoom: this.options.maxZoom,
      initialZoom: zoom,
    });
    this.zoom = this.zoomer.getZoom();
    this.zoomSliderPos = this.zoomer.getSliderPosition();
    this.$zoomSlider.val(this.zoomSliderPos);

    if (this.zoomer.isZoomable()) {
      this.enableZoomSlider();
    } else {
      this.disableZoomSlider();
    }
  }

  // 补充原代码中缺失的shouldRejectImage方法
  shouldRejectImage({ imageWidth, imageHeight, previewSize, maxZoom, exportZoom, smallImage }) {
    if (smallImage === 'allow') return false;
    const requiredWidth = previewSize.width / (maxZoom * exportZoom);
    const requiredHeight = previewSize.height / (maxZoom * exportZoom);
    return imageWidth < requiredWidth || imageHeight < requiredHeight;
  }

  // 补充渲染方法（原代码可能遗漏）
  renderImage() {
    const transform = `translate(${this._offset.x}px, ${this._offset.y}px) scale(${this.zoom}) rotate(${this.rotation}deg)`;
    this.$image.css({
      transform,
      webkitTransform: transform,
    });
    if (this.$bg) {
      this.$bg.css({
        transform,
        webkitTransform: transform,
      });
    }
  }

  // 暴露获取裁剪后图片数据的方法（用于下载）
  getCroppedImageData(options = {}) {
    const canvas = document.createElement('canvas');
    const scale = options.exportZoom || this.options.exportZoom;
    canvas.width = this.previewSize.width * scale;
    canvas.height = this.previewSize.height * scale;

    const ctx = canvas.getContext('2d');
    ctx.drawImage(
      this.image,
      -this._offset.x * scale,
      -this._offset.y * scale,
      this.image.width * this.zoom * scale,
      this.image.height * this.zoom * scale
    );

    return canvas.toDataURL(options.format || 'image/png', options.quality || 1);
  }
}

// 补充Zoomer类定义（原代码依赖）
class Zoomer {
  setup(options) {
    this.imageSize = options.imageSize;
    this.previewSize = options.previewSize;
    this.minZoom = options.minZoom || 0;
    this.maxZoom = options.maxZoom || Infinity;
    this.initialZoom = options.initialZoom;
    this.calculateZoomRange();
    this.setZoom(this.initialZoom);
  }

  calculateZoomRange() {
    this.minPossibleZoom = Math.min(
      this.previewSize.width / this.imageSize.width,
      this.previewSize.height / this.imageSize.height
    );
    this.maxPossibleZoom = Math.max(
      this.previewSize.width / this.imageSize.width,
      this.previewSize.height / this.imageSize.height
    );
    this.zoomMin = Math.max(this.minZoom, this.minPossibleZoom);
    this.zoomMax = Math.min(this.maxZoom, this.maxPossibleZoom);
  }

  setZoom(zoom) {
    this.currentZoom = Math.min(this.zoomMax, Math.max(this.zoomMin, zoom));
  }

  getZoom(sliderPos) {
    if (sliderPos === undefined) return this.currentZoom;
    return this.zoomMin + (this.zoomMax - this.zoomMin) * sliderPos;
  }

  getSliderPosition() {
    return (this.currentZoom - this.zoomMin) / (this.zoomMax - this.zoomMin || 1);
  }

  isZoomable() {
    return Math.abs(this.zoomMax - this.zoomMin) > 0.001;
  }
}

// 引入必要的常量（需与constants.js对应）
const CLASS_NAMES = {
  PREVIEW: 'cropit-preview',
  PREVIEW_IMAGE_CONTAINER: 'cropit-preview-image-container',
  PREVIEW_IMAGE: 'cropit-preview-image',
  PREVIEW_BACKGROUND_CONTAINER: 'cropit-preview-background-container',
  PREVIEW_BACKGROUND: 'cropit-preview-background',
  FILE_INPUT: 'cropit-image-input',
  ZOOM_SLIDER: 'cropit-image-zoom-input',
  DRAG_HOVERED: 'cropit-drag-hovered',
  IMAGE_LOADING: 'cropit-image-loading',
  IMAGE_LOADED: 'cropit-image-loaded',
  DISABLED: 'cropit-disabled',
};

const ERRORS = {
  IMAGE_FAILED_TO_LOAD: { code: 0, message: 'Image failed to load.' },
  SMALL_IMAGE: { code: 1, message: 'Image is too small.' },
};

const EVENTS = {
  PREVIEW: 'mousedown.cropit mouseup.cropit mouseleave.cropit touchstart.cropit touchend.cropit touchcancel.cropit touchleave.cropit',
  PREVIEW_MOVE: 'mousemove.cropit touchmove.cropit',
  ZOOM_INPUT: 'mousemove.cropit touchmove.cropit change.cropit',
};

export default Cropit;