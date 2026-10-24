import { identity } from '@/brand/identity';

import { tr, type Catalog } from './tr';

type Leaves<T, P extends string = ''> = {
  [K in keyof T & string]: T[K] extends string ? `${P}${K}` : Leaves<T[K], `${P}${K}.`>;
}[keyof T & string];

export type CopyKey = Leaves<Catalog>;
export type CopyParams = Record<string, string | number>;

const globals: CopyParams = { brand: identity.name, promise: identity.taglines.promise };

function lookup(key: string): string {
  let node: unknown = tr;
  for (const part of key.split('.')) node = (node as Record<string, unknown>)?.[part];
  if (typeof node !== 'string') {
    if (__DEV__) console.warn(`[i18n] eksik anahtar: ${key}`);
    return key;
  }
  return node;
}

export function interpolate(template: string, params: CopyParams = {}): string {
  const all = { ...globals, ...params };
  return template.replace(/\{\{(\w+)\}\}/g, (_, name: string) => (name in all ? String(all[name]) : `{{${name}}}`));
}

/** Typed copy lookup. Turkish is the source language. */
export function t(key: CopyKey, params?: CopyParams): string {
  return interpolate(lookup(key), params);
}

export { trUpper, trLower, trCapitalize } from './turkish';
export * from './format';
