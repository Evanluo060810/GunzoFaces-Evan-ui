// 统一插件前缀，便于批量修改
const PREFIX = 'cropit';
const EVENT_NAMESPACE = `.${PREFIX}`;

export const PLUGIN_KEY = PREFIX;

export const CLASS_NAMES = {
  // 基于统一前缀生成类名，减少重复书写
  PREVIEW: `${PREFIX}-preview`,
  PREVIEW_IMAGE_CONTAINER: `${PREFIX}-preview-image-container`,
  PREVIEW_IMAGE: `${PREFIX}-preview-image`,
  PREVIEW_BACKGROUND_CONTAINER: `${PREFIX}-preview-background-container`,
  PREVIEW_BACKGROUND: `${PREFIX}-preview-background`,
  FILE_INPUT: `${PREFIX}-image-input`,
  ZOOM_SLIDER: `${PREFIX}-image-zoom-input`,

  DRAG_HOVERED: `${PREFIX}-drag-hovered`,
  IMAGE_LOADING: `${PREFIX}-image-loading`,
  IMAGE_LOADED: `${PREFIX}-image-loaded`,
  DISABLED: `${PREFIX}-disabled`,
};

export const ERRORS = {
  IMAGE_FAILED_TO_LOAD: { code: 0, message: 'Image failed to load.' },
  SMALL_IMAGE: { code: 1, message: 'Image is too small.' },
};

// 简化事件名生成函数，利用模板字符串和箭头函数
const eventName = (events) => events.map(e => `${e}${EVENT_NAMESPACE}`).join(' ');

export const EVENTS = {
  PREVIEW: eventName([
    'mousedown', 'mouseup', 'mouseleave',
    'touchstart', 'touchend', 'touchcancel', 'touchleave',
  ]),
  PREVIEW_MOVE: eventName(['mousemove', 'touchmove']),
  ZOOM_INPUT: eventName(['mousemove', 'touchmove', 'change']),
};