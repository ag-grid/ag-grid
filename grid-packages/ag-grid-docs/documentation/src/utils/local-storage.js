import isServerSideRendering from './is-server-side-rendering';

const prefix = 'documentation:';
const exists = () => !isServerSideRendering() && typeof window.localStorage !== 'undefined';
const set = (key, value) => exists() && window.localStorage.setItem(prefix + key, value);
const get = (key) => exists() ? window.localStorage.getItem(prefix + key) : null;

export const LocalStorage = { exists, get, set };

export default LocalStorage;