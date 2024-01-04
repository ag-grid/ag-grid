import * as babel from '@babel/core';
import { getBabelPlugins } from '../babel/plugins';
import type { SystemJs, SystemJsConfig } from '../types/systemjs';

const DEFAULT_IGNORED_CONTENT_TYPES = new Set([
  'application/javascript',
  'text/css',
  'application/json',
  'application/wasm',
]);
const DEFAULT_IGNORED_FILE_EXTENSIONS = new Set(['.js', '.css', '.json', '.wasm']);

export default function plugin(hooks: SystemJs, config: SystemJsConfig): void {
  // Force all scripts to be loaded via fetch / eval rather than <script> tags in order to be transformed before execution
  hooks.shouldFetch = (url: string): boolean => true;

  // Override the SystemJS fetch method to transform the source code for matching content types
  hooks.fetch = ((fetch) =>
    function (url: string, options?: RequestInit): Promise<Response> {
      const pluginConfig = config?.babel;
      return fetch(url, options).then(function (res) {
        // If the script load failed, return the result as-is
        if (!res.ok) return res;
        // Determine whether the script should be transformed, returning the result as-is if not
        const contentType = res.headers.get('content-type');
        const extension = getSystemJsUrlExtension(url);
        const shouldTransform = pluginConfig?.shouldTransform || defaultTransformPredicate;
        if (!shouldTransform(url, extension, contentType)) return res;
        // If the script should be transformed, run it through Babel before returning the response
        return res
          .text()
          .then((source) => transform(url, extension, source))
          .then((source) => generateSystemJsScriptResponse(url, source));
      });
    })(hooks.fetch);
}

function defaultTransformPredicate(url: string, extension: string | null, contentType: string | null): boolean {
  // Default behavior is to transform all resources except JS/CSS/JSON/WASM files
  const contentTypes = contentType ? contentType.split(';') : [];
  if (contentTypes.some((type) => DEFAULT_IGNORED_CONTENT_TYPES.has(type))) return false;
  if (extension && DEFAULT_IGNORED_FILE_EXTENSIONS.has(extension)) return false;
  return true;
}

function getSystemJsUrlExtension(url: string): string | null {
  // Strip any query string or hash fragment from the URL before extracting the extension
  const [, extension] = /(\.[\w\-]+)($|[#?].*)/.exec(url) || [, undefined];
  if (!extension) return null;
  return extension;
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

function transform(url: string, extension: string | null, source: string): Promise<string> {
  // Get the Babel plugins for the given file extension
  const { syntax: syntaxPlugins, transform: transformPlugins } = getBabelPlugins(extension);
  // Transform the source code using Babel
  const options: babel.TransformOptions = {
    filename: url,
    sourceMaps: 'inline',
    code: true,
    ast: false,
    compact: false,
    sourceType: 'module',
    parserOpts: {
      plugins: syntaxPlugins,
      errorRecovery: true,
    },
    plugins: transformPlugins,
  };
  return new Promise((resolve, reject) => {
    babel.transform(source, options, function (err, result) {
      if (err) return reject(err);
      if (!result) return reject(new Error('Failed to transform source file'));
      resolve(result.code!);
    });
  });
}

function generateSystemJsScriptResponse(url: string, source: string): Response {
  // Tag the source code with a sourceURL directive so that the transformed code
  // is displayed in browser dev tools as a distinct resource
  const sourceWithUrl = `${source}\n${getSystemJsSourceURlDirective(url)}`;
  return new Response(new Blob([sourceWithUrl], { type: 'application/javascript' }));
}

function getSystemJsSourceURlDirective(url: string): string {
  return '//# sourceURL=' + url + '!system';
}
