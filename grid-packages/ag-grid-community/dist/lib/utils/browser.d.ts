export declare function isBrowserSafari(): boolean;
export declare function getSafariVersion(): number;
/**
 * Returns true for Chrome and also for Edge (Chromium)
 */
export declare function isBrowserChrome(): boolean;
export declare function isBrowserFirefox(): boolean;
export declare function isMacOsUserAgent(): boolean;
export declare function isIOSUserAgent(): boolean;
export declare function browserSupportsPreventScroll(): boolean;
export declare function getTabIndex(el: HTMLElement | null): string | null;
export declare function getMaxDivHeight(): number;
export declare function getBodyWidth(): number;
export declare function getBodyHeight(): number;
export declare function getScrollbarWidth(): number | null;
export declare function isInvisibleScrollbar(): boolean;
