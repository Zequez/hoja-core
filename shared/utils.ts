import { v4 as uuidv4, validate } from 'uuid';
import { encode, decode } from 'js-base64';
export { default as cx } from 'classnames';

export function groupBy<T extends { [key: string]: any }>(arr: T[], key: string) {
  return arr.reduce(
    (acc, obj) => {
      const val = obj[key];
      acc[val] = (acc[val] || []).concat(obj);
      return acc;
    },
    {} as { [key: string]: T[] },
  );
}

export function keyBy<T extends { [key: string]: any }>(arr: T[], key: string) {
  return arr.reduce(
    (acc, obj) => {
      const val = obj[key];
      if (acc[val]) console.warn('Duplicate key: ' + val);
      acc[val] = obj;
      return acc;
    },
    {} as { [key: string]: T },
  );
}

export function validateEmail(email: string) {
  const re =
    /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(String(email).toLowerCase());
}

type TokenMember = {
  id: number;
  email: string;
  fullName: string;
};

export function tokenData(token: string): TokenMember & { exp: number; iat: number } {
  return JSON.parse(decodeB64(token.split('.')[1]));
}

export function randomAlphaNumericString() {
  return Math.random().toString(36).slice(2);
}

export const randANS = randomAlphaNumericString;

export const uuid = uuidv4;

export const validateUuid = validate;

export const encodeB64 = encode;
export const decodeB64 = decode;

export function toArr(x: string | string[]) {
  return Array.isArray(x) ? x : [x];
}

export function wait(time: number) {
  return new Promise((resolve) => setTimeout(resolve, time));
}

export function slugify(title: string) {
  return title
    .toLocaleLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Convert accents and stuff
    .replace(/[^a-z0-9 -]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

export function capitalizeFirstLetter(str: string) {
  return str.charAt(0).toLocaleUpperCase() + str.slice(1);
}

export function debounce<T>(fn: (...args: T[]) => void) {
  let timeoutId: NodeJS.Timeout;
  return (delay: number, ...args: T[]) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      fn(...args);
    }, delay);
  };
}
