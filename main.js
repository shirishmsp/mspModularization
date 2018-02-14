export * from './modules/utils/basic.js';
export { default as Browser } from './modules/utils/browser.js';
export { LocalStore, SessionStore } from './modules/utils/browser.js';
export { default as Cookie } from './modules/utils/cookie.js';
export * from './modules/utils/date.js';
export * from './modules/utils/extension.js';
export * from './modules/utils/helpers.js';
export * from './modules/utils/images.js';
export * from './modules/utils/logger.js';
export * from './modules/utils/performance.js';
export * from './modules/utils/social.js';
export * from './modules/utils/subscription.js';
export { default as Url } from './modules/utils/url.js';
export { default as Validator } from './modules/utils/validator.js';

import Url from './modules/utils/url.js';
console.log(Url.hashParams);