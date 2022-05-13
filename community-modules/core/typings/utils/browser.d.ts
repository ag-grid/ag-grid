export declare function isBrowserEdge(): boolean;
export declare function isBrowserSafari(): boolean;
export declare function isBrowserChrome(): boolean;
export declare function isBrowserFirefox(): boolean;
export declare function isIOSUserAgent(): boolean;
export declare function getTabIndex(el: HTMLElement | null): string | null;
export declare function getMaxDivHeight(): number;
export declare function getScrollbarWidth(): number | null;
export declare function isInvisibleScrollbar(): boolean;
/** @deprecated */
export declare function hasOverflowScrolling(): boolean;
/**
 * Gets the document body width
 * from: http://stackoverflow.com/questions/1038727/how-to-get-browser-width-using-javascript-code
 * @returns {number}
 */
export declare function getBodyWidth(): number;
/**
 * Gets the body height
 * from: http://stackoverflow.com/questions/1038727/how-to-get-browser-width-using-javascript-code
 * @returns {number}
 */
export declare function getBodyHeight(): number;
