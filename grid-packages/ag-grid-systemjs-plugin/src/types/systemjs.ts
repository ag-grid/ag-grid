export interface SystemJsGlobal {
  constructor: SystemJsConstructor;
}

export interface SystemJsConstructor {
  prototype: SystemJs;
}

export interface SystemJs {
  shouldFetch(url: string): boolean;
  fetch(url: string, options?: RequestInit): Promise<Response>;
}

export interface SystemJsConfig {
  babel?: SystemJsBabelOptions;
}

export interface SystemJsBabelOptions {
  shouldTransform?: (url: string, extension: string | null, contentType: string | null) => boolean;
}

export interface SystemJsPlugin {
  (hooks: SystemJs, config: SystemJsConfig): void;
}
