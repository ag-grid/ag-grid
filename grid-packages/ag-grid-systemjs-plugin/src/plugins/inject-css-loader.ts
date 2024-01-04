import type { SystemJs, SystemJsConfig } from '../types/systemjs';
import { generateSystemJsScriptResponse, getSystemJsUrlExtension } from '../utils/systemjs';

export default function plugin(hooks: SystemJs, config: SystemJsConfig): void {
  // Force all files with a .css extension to be loaded via fetch / eval rather than <script> tags
  hooks.shouldFetch = ((shouldFetch) =>
    function (url: string): boolean {
      const extension = getSystemJsUrlExtension(url);
      if (isStyleSheet(extension, null)) return true;
      return false;
    })(hooks.shouldFetch);

  // Override the SystemJS fetch method to transform the source code for matching resources
  hooks.fetch = ((fetch) =>
    function (url: string, options?: RequestInit): Promise<Response> {
      const extension = getSystemJsUrlExtension(url);
      const innerOptions = {
        ...options,
        // Ensure CSS files are not transformed by the SystemJS module-types extra
        passThrough: true,
      };
      return fetch(url, innerOptions).then(function (res) {
        // If the script load failed, return the result as-is
        if (!res.ok) return res;
        // If the resource is not a CSS stylesheet, return the result as-is
        const contentType = res.headers.get('content-type');
        if (!isStyleSheet(extension, contentType)) return res;
        // Otherwise, return a module that injects the stylesheet into the DOM at runtime
        return res
          .text()
          .then((source) => injectStyleSheetModule(url, source))
          .then((source) => generateSystemJsScriptResponse(url, source));
      });
    })(hooks.fetch);
}

function isStyleSheet(extension: string | null, contentType: string | null): boolean {
  const contentTypes = contentType ? contentType.split(';') : [];
  return contentTypes.includes('text/css') || extension === '.css';
}

function injectStyleSheetModule(url: string, source: string): string {
  // Create a new SystemJS module that injects the stylesheet into to the DOM at runtime
  return `System.register([], function(_export, _context) {
  return {
    setters: [],
    execute: function() {
      const style = document.createElement('style');
      style.textContent = ${JSON.stringify(source)};
      document.head.appendChild(style);
    }
  };
})`;
}
