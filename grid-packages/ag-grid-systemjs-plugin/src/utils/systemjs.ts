import type { SystemJsConfig, SystemJsGlobal, SystemJsPlugin } from '../types/systemjs';

export function registerSystemJsPlugin(plugin: SystemJsPlugin): void {
  const { System, systemjs: config = {} } = (typeof self !== 'undefined' ? self : global) as typeof globalThis & {
    System?: SystemJsGlobal;
    systemjs?: SystemJsConfig;
  };
  const hooks = System!.constructor.prototype;
  plugin(hooks, config);
}

export function getSystemJsUrlExtension(url: string): string | null {
  // Strip any query string or hash fragment from the URL before extracting the extension
  const [, extension] = /(\.[\w\-]+)($|[#?].*)/.exec(url) || [, undefined];
  if (!extension) return null;
  return extension;
}

export function generateSystemJsScriptResponse(url: string, source: string): Response {
  // Tag the source code with a sourceURL directive so that the transformed code
  // is displayed in browser dev tools as a distinct resource
  const sourceWithUrl = `${source}\n${getSystemJsSourceURlDirective(url)}`;
  return new Response(new Blob([sourceWithUrl], { type: 'application/javascript' }));
}

export function getSystemJsSourceURlDirective(url: string): string {
  return '//# sourceURL=' + url + '!systemjs';
}
