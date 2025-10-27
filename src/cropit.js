class Cropit {
  constructor(jQuery, element, options) {
    this.$el = $(element);
    const defaults = this.loadDefaults(this.$el);
    this.options = $.extend({}, defaults, options);
    this.init();
  }

  init() {
    // 初始化图片对象（统一设置跨域属性）
    [this.image, this.preImage] = ['image', 'preImage'].map(() => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      return img;
    });

    // 绑定图片事件（统一处理）
    this.image.onload = this.onImageLoaded.bind(this);
    this.preImage.onload = this.onPreImageLoaded.bind(this);
    [this.image, this.preImage].forEach(img => {
      img.onerror = () => this.onImageError(ERRORS.IMAGE_FAILED_TO_LOAD);
    });

    // 初始化DOM元素
    this.$preview = this.options.$preview.css('position', 'relative');
    this.$fileInput = this.options.$fileInput.attr({ accept: 'image/*' });
    this.$zoomSlider = this.options.$zoomSlider.attr({ min: 0, max: 1, step: 0.01 });

    this.previewSize = {
      width: this.options.width ?? this.$preview.innerWidth(),
      height: this.options.height ?? this.$preview.innerHeight(),
    };

    // 创建图片容器（提取样式配置）
    const imageStyle = {
      transformOrigin: 'top left',
      webkitTransformOrigin: 'top left',
      willChange: 'transform',
    };
    this.$image = $('<img />')
      .addClass(CLASS_NAMES.PREVIEW_IMAGE)
      .attr('alt', '')
      .css(imageStyle);
    this.$imageContainer = $('<div />')
      .addClass(CLASS_NAMES.PREVIEW_IMAGE_CONTAINER)
      .css(this.getContainerStyle())
      .append(this.$image);
    this.$preview.append(this.$imageContainer);

    // 处理背景图片（简化数组处理）
    if (this.options.imageBackground) {
      this.bgBorderWidthArray = Array.isArray(this.options.imageBackgroundBorderWidth)
        ? this.options.imageBackgroundBorderWidth
        : Array(4).fill(this.options.imageBackgroundBorderWidth);

      this.$bg = $('<img />')
        .addClass(CLASS_NAMES.PREVIEW_BACKGROUND)
        .attr('alt', '')
        .css({ ...imageStyle, 
          left: this.bgBorderWidthArray[3], 
          top: this.bgBorderWidthArray[0] 
        });
      this.$bgContainer = $('<div />')
        .addClass(CLASS_NAMES.PREVIEW_BACKGROUND_CONTAINER)
        .css(this.getBgContainerStyle())
        .append(this.$bg);
      if (this.bgBorderWidthArray[0] > 0) {
        this.$bgContainer.css('overflow', 'hidden');
      }
      this.$preview.prepend(this.$bgContainer);
    }

    this.initialZoom = this.options.initialZoom;
    this.imageLoaded = false;
    this.moveContinue = false;
    this.zoomer = new Zoomer();

    this.bindListeners();

    if (this.options.imageState?.src) {
      this.loadImage(this.options.imageState.src);
    }
  }

  // 提取容器样式配置
  getContainerStyle() {
    return {
      position: 'absolute',
      overflow: 'hidden',
      left: 0,
      top: 0,
      width: '100%',
      height: '100%',
    };
  }

  // 提取背景容器样式
  getBgContainerStyle() {
    return {
      position: 'absolute',
      zIndex: 0,
      top: -this.bgBorderWidthArray[0],
      right: -this.bgBorderWidthArray[1],
      bottom: -this.bgBorderWidthArray[2],
      left: -this.bgBorderWidthArray[3],
    };
  }

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
      this.$imageContainer
        .on('dragover.cropit dragleave.cropit', this.onDragOver.bind(this))
        .on('drop.cropit', this.onDrop.bind(this));
    }
  }

  unbindListeners() {
    this.$fileInput.off('change.cropit');
    this.$imageContainer
      .off(EVENTS.PREVIEW)
      .off('dragover.cropit dragleave.cropit drop.cropit');
    this.$zoomSlider.off(EVENTS.ZOOM_INPUT);
  }

  onFileChange(e) {
    this.options.onFileChange(e);
    const file = this.$fileInput.get(0).files?.[0];
    if (file) this.loadFile(file);
  }

  loadFile(file) {
    if (!file?.type.match('image')) {
      this.onFileReaderError();
      return;
    }

    const fileReader = new FileReader();
    fileReader.readAsDataURL(file);
    fileReader.onload = e => this.loadImage(e.target.result);
    fileReader.onerror = () => this.onFileReaderError();
  }

  onFileReaderError() {
    this.options.onFileReaderError();
  }

  onDragOver(e) {
    e.preventDefault();
    e.originalEvent.dataTransfer.dropEffect = 'copy';
    this.$preview.toggleClass(CLASS_NAMES.DRAG_HOVERED, e.type === 'dragover');
  }

  onDrop(e) {
    e.preventDefault();
    e.stopPropagation();

    const files = Array.from(e.originalEvent.dataTransfer.files);
    const imageFile = files.find(file => file.type.match('image'));
    if (imageFile) this.loadFile(imageFile);

    this.$preview.removeClass(CLASS_NAMES.DRAG_HOVERED);
  }

  // 使用fetch替代XHR，简化远程图片加载
  loadImage(imageSrc) {
    if (!imageSrc) return;

    this.options.onImageLoading();
    this.setPreviewClass('loading');

    if (imageSrc.startsWith('data')) {
      this.preImage.src = imageSrc;
    } else {
      fetch(imageSrc)
        .then(response => {
          if (!response.ok) throw new Error('Load failed');
          return response.blob();
        })
        .then(blob => this.loadFile(blob))
        .catch(() => this.onImageError(ERRORS.IMAGE_FAILED_TO_LOAD));
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
      if (this.image.src) this.setPreviewClass('loaded');
      return;
    }

    this.image.src = this.preImage.src;
  }

  onImageLoaded() {
    this.rotation = 0;
    this.setupZoomer(this.options.imageState?.zoom ?? this.initialZoom);
    this.offset = this.options.imageState?.offset ?? this.calculateCenterOffset();

    this.options.imageState = {};
    this.$image.attr('src', this.image.src);
    this.$bg?.attr('src', this.image.src);

    this.setPreviewClass('loaded');
    this.imageLoaded = true;
    this.options.onImageLoaded();
  }

  // 提取居中计算逻辑
  calculateCenterOffset() {
    return {
      x: (this.previewSize.width - this.image.width * this.zoom) / 2,
      y: (this.previewSize.height - this.image.height * this.zoom) / 2,
    };
  }

  onImageError(error) {
    this.options.onImageError(error);
    this.$preview.removeClass(CLASS_NAMES.IMAGE_LOADING);
  }

  // 合并class操作方法
  setPreviewClass(state) {
    this.$preview
      .removeClass(CLASS_NAMES.IMAGE_LOADING, CLASS_NAMES.IMAGE_LOADED)
      .addClass(state === 'loading' ? CLASS_NAMES.IMAGE_LOADING : CLASS_NAMES.IMAGE_LOADED);
  }

  getEventPosition(e) {
    const touch = e.originalEvent?.touches?.[0];
    if (touch) return { x: touch.clientX, y: touch.clientY };
    if (e.clientX && e.clientY) return { x: e.clientX, y: e.clientY };
    return null;
  }

  onPreviewEvent(e) {
    if (!this.imageLoaded) return;

    this.moveContinue = false;
    this.$imageContainer.off(EVENTS.PREVIEW_MOVE);

    if (['mousedown', 'touchstart'].includes(e.type)) {
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
    if (!position || !this.exists(position.x) || !this.exists(position.y)) return;

    this._offset = this.fixOffset(position);
    this.renderImage();
    this.options.onOffsetChange(position);
  }

  get offset() {
    return this._offset;
  }

  // 简化存在性检查
  exists(value) {
    return value != null;
  }

  fixOffset(offset) {
    if (!this.imageLoaded) return offset;

    const ret = { ...offset };
    if (!this.options.freeMove) {
      const imgWidth = this.image.width * this.zoom;
      const imgHeight = this.image.height * this.zoom;

      // 简化边界计算逻辑
      ret.x = imgWidth >= this.previewSize.width
        ? Math.min(0, Math.max(ret.x, this.previewSize.width - imgWidth))
        : Math.max(0, Math.min(ret.x, this.previewSize.width - imgWidth));

      ret.y = imgHeight >= this.previewSize.height
        ? Math.min(0, Math.max(ret.y, this.previewSize.height - imgHeight))
        : Math.max(0, Math.min(ret.y, this.previewSize.height - imgHeight));
    }

    ret.x = Math.round(ret.x);
    ret.y = Math.round(ret.y);
    return ret;
  }

  centerImage() {
    if (!this.image.width || !this.image.height || !this.zoom) return;
    this.offset = this.calculateCenterOffset();
  }

  onZoomSliderChange() {
    if (!this.imageLoaded) return;

    const newZoom = this.zoomer.getZoom(Number(this.$zoomSlider.val()));
    if (newZoom !== this.zoom) this.zoom = newZoom;
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
    this.$zoomSlider.val(this.zoomer.getSliderPosition());

    this.zoomer.isZoomable() ? this.enableZoomSlider() : this.disableZoomSlider();
  }

  shouldRejectImage({ imageWidth, imageHeight, previewSize, maxZoom, exportZoom, smallImage }) {
    if (smallImage === 'allow') return false;
    const requiredWidth = previewSize.width / (maxZoom * exportZoom);
    const requiredHeight = previewSize.height / (maxZoom * exportZoom);
    return imageWidth < requiredWidth || imageHeight < requiredHeight;
  }

  // 提取transform设置逻辑
  setElementTransform($el, offset, zoom, rotation) {
    const transform = `translate(${offset.x}px, ${offset.y}px) scale(${zoom}) rotate(${rotation}deg)`;
    $el.css({ transform, webkitTransform: transform });
  }

  renderImage() {
    this.setElementTransform(this.$image, this._offset, this.zoom, this.rotation);
    this.$bg && this.setElementTransform(this.$bg, this._offset, this.zoom, this.rotation);
  }

  getCroppedImageData(options = {}) {
    const canvas = document.createElement('canvas');
    const scale = options.exportZoom ?? this.options.exportZoom;
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

    return canvas.toDataURL(options.format ?? 'image/png', options.quality ?? 1);
  }
}

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
    const ratioW = this.previewSize.width / this.imageSize.width;
    const ratioH = this.previewSize.height / this.imageSize.height;
    this.minPossibleZoom = Math.min(ratioW, ratioH);
    this.maxPossibleZoom = Math.max(ratioW, ratioH);
    this.zoomMin = Math.max(this.minZoom, this.minPossibleZoom);
    this.zoomMax = Math.min(this.maxZoom, this.maxPossibleZoom);
  }

  setZoom(zoom) {
    this.currentZoom = Math.min(this.zoomMax, Math.max(this.zoomMin, zoom));
  }

  getZoom(sliderPos) {
    return sliderPos === undefined 
      ? this.currentZoom 
      : this.zoomMin + (this.zoomMax - this.zoomMin) * sliderPos;
  }

  getSliderPosition() {
    return (this.currentZoom - this.zoomMin) / (this.zoomMax - this.zoomMin || 1);
  }

  isZoomable() {
    return Math.abs(this.zoomMax - this.zoomMin) > 0.001;
  }
}

// 常量定义优化（使用数组拼接更易维护）
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
  PREVIEW: [
    'mousedown.cropit', 'mouseup.cropit', 'mouseleave.cropit',
    'touchstart.cropit', 'touchend.cropit', 'touchcancel.cropit', 'touchleave.cropit'
  ].join(' '),
  PREVIEW_MOVE: ['mousemove.cropit', 'touchmove.cropit'].join(' '),
  ZOOM_INPUT: ['mousemove.cropit', 'touchmove.cropit', 'change.cropit'].join(' '),
};

export default Cropit;