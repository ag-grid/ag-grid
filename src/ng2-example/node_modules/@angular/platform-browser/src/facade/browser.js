/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
/**
 * JS version of browser APIs. This library can only run in the browser.
 */
var win = typeof window !== 'undefined' && window || {};
export { win as window };
export var document = win.document;
export var location = win.location;
export var gc = win['gc'] ? function () { return win['gc'](); } : function () { return null; };
export var performance = win['performance'] ? win['performance'] : null;
export var Event = win['Event'];
export var MouseEvent = win['MouseEvent'];
export var KeyboardEvent = win['KeyboardEvent'];
export var EventTarget = win['EventTarget'];
export var History = win['History'];
export var Location = win['Location'];
export var EventListener = win['EventListener'];
//# sourceMappingURL=browser.js.map