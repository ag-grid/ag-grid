/**
 * @license Angular v2.1.2
 * (c) 2010-2016 Google, Inc. https://angular.io/
 * License: MIT
 */
(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('@angular/core'), require('@angular/platform-browser')) :
    typeof define === 'function' && define.amd ? define(['exports', '@angular/core', '@angular/platform-browser'], factory) :
    (factory((global.ng = global.ng || {}, global.ng.platformBrowser = global.ng.platformBrowser || {}, global.ng.platformBrowser.testing = global.ng.platformBrowser.testing || {}),global.ng.core,global.ng.platformBrowser));
}(this, function (exports,_angular_core,_angular_platformBrowser) { 'use strict';

    /**
     * @license
     * Copyright Google Inc. All Rights Reserved.
     *
     * Use of this source code is governed by an MIT-style license that can be
     * found in the LICENSE file at https://angular.io/license
     */
    var globalScope;
    if (typeof window === 'undefined') {
        if (typeof WorkerGlobalScope !== 'undefined' && self instanceof WorkerGlobalScope) {
            // TODO: Replace any with WorkerGlobalScope from lib.webworker.d.ts #3492
            globalScope = self;
        }
        else {
            globalScope = global;
        }
    }
    else {
        globalScope = window;
    }
    // Need to declare a new variable for global here since TypeScript
    // exports the original value of the symbol.
    var _global = globalScope;
    // TODO: remove calls to assert in production environment
    // Note: Can't just export this and import in in other files
    // as `assert` is a reserved keyword in Dart
    _global.assert = function assert(condition) {
        // TODO: to be fixed properly via #2830, noop for now
    };
    function isPresent(obj) {
        return obj != null;
    }

    // Safari doesn't implement MapIterator.next(), which is used is Traceur's polyfill of Array.from
    // TODO(mlaval): remove the work around once we have a working polyfill of Array.from
    var _arrayFromMap = (function () {
        try {
            if ((new Map()).values().next) {
                return function createArrayFromMap(m, getValues) {
                    return getValues ? Array.from(m.values()) : Array.from(m.keys());
                };
            }
        }
        catch (e) {
        }
        return function createArrayFromMapWithForeach(m, getValues) {
            var res = new Array(m.size), i = 0;
            m.forEach(function (v, k) {
                res[i] = getValues ? v : k;
                i++;
            });
            return res;
        };
    })();

    var getDOM = _angular_platformBrowser.__platform_browser_private__.getDOM;
    var BrowserDomAdapter = _angular_platformBrowser.__platform_browser_private__.BrowserDomAdapter;
    var ELEMENT_PROBE_PROVIDERS = _angular_platformBrowser.__platform_browser_private__.ELEMENT_PROBE_PROVIDERS;

    var BrowserDetection = (function () {
        function BrowserDetection(ua) {
            this._overrideUa = ua;
        }
        Object.defineProperty(BrowserDetection.prototype, "_ua", {
            get: function () {
                if (isPresent(this._overrideUa)) {
                    return this._overrideUa;
                }
                else {
                    return getDOM() ? getDOM().getUserAgent() : '';
                }
            },
            enumerable: true,
            configurable: true
        });
        BrowserDetection.setup = function () { browserDetection = new BrowserDetection(null); };
        Object.defineProperty(BrowserDetection.prototype, "isFirefox", {
            get: function () { return this._ua.indexOf('Firefox') > -1; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(BrowserDetection.prototype, "isAndroid", {
            get: function () {
                return this._ua.indexOf('Mozilla/5.0') > -1 && this._ua.indexOf('Android') > -1 &&
                    this._ua.indexOf('AppleWebKit') > -1 && this._ua.indexOf('Chrome') == -1 &&
                    this._ua.indexOf('IEMobile') == -1;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(BrowserDetection.prototype, "isEdge", {
            get: function () { return this._ua.indexOf('Edge') > -1; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(BrowserDetection.prototype, "isIE", {
            get: function () { return this._ua.indexOf('Trident') > -1; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(BrowserDetection.prototype, "isWebkit", {
            get: function () {
                return this._ua.indexOf('AppleWebKit') > -1 && this._ua.indexOf('Edge') == -1 &&
                    this._ua.indexOf('IEMobile') == -1;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(BrowserDetection.prototype, "isIOS7", {
            get: function () {
                return (this._ua.indexOf('iPhone OS 7') > -1 || this._ua.indexOf('iPad OS 7') > -1) &&
                    this._ua.indexOf('IEMobile') == -1;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(BrowserDetection.prototype, "isSlow", {
            get: function () { return this.isAndroid || this.isIE || this.isIOS7; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(BrowserDetection.prototype, "supportsNativeIntlApi", {
            // The Intl API is only natively supported in Chrome, Firefox, IE11 and Edge.
            // This detector is needed in tests to make the difference between:
            // 1) IE11/Edge: they have a native Intl API, but with some discrepancies
            // 2) IE9/IE10: they use the polyfill, and so no discrepancies
            get: function () {
                return !!_global.Intl && _global.Intl !== _global.IntlPolyfill;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(BrowserDetection.prototype, "isChromeDesktop", {
            get: function () {
                return this._ua.indexOf('Chrome') > -1 && this._ua.indexOf('Mobile Safari') == -1 &&
                    this._ua.indexOf('Edge') == -1;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(BrowserDetection.prototype, "isOldChrome", {
            // "Old Chrome" means Chrome 3X, where there are some discrepancies in the Intl API.
            // Android 4.4 and 5.X have such browsers by default (respectively 30 and 39).
            get: function () {
                return this._ua.indexOf('Chrome') > -1 && this._ua.indexOf('Chrome/3') > -1 &&
                    this._ua.indexOf('Edge') == -1;
            },
            enumerable: true,
            configurable: true
        });
        return BrowserDetection;
    }());
    BrowserDetection.setup();
    var browserDetection = new BrowserDetection(null);
    function createNgZone() {
        return new _angular_core.NgZone({ enableLongStackTrace: true });
    }

    function initBrowserTests() {
        BrowserDomAdapter.makeCurrent();
        BrowserDetection.setup();
    }
    var _TEST_BROWSER_PLATFORM_PROVIDERS = [{ provide: _angular_core.PLATFORM_INITIALIZER, useValue: initBrowserTests, multi: true }];
    /**
     * Platform for testing
     *
     * @stable
     */
    var platformBrowserTesting = _angular_core.createPlatformFactory(_angular_core.platformCore, 'browserTesting', _TEST_BROWSER_PLATFORM_PROVIDERS);
    /**
     * NgModule for testing.
     *
     * @stable
     */
    var BrowserTestingModule = (function () {
        function BrowserTestingModule() {
        }
        BrowserTestingModule.decorators = [
            { type: _angular_core.NgModule, args: [{
                        exports: [_angular_platformBrowser.BrowserModule],
                        providers: [
                            { provide: _angular_core.APP_ID, useValue: 'a' }, ELEMENT_PROBE_PROVIDERS,
                            { provide: _angular_core.NgZone, useFactory: createNgZone },
                            { provide: _angular_platformBrowser.AnimationDriver, useValue: _angular_platformBrowser.AnimationDriver.NOOP }
                        ]
                    },] },
        ];
        /** @nocollapse */
        BrowserTestingModule.ctorParameters = [];
        return BrowserTestingModule;
    }());

    exports.platformBrowserTesting = platformBrowserTesting;
    exports.BrowserTestingModule = BrowserTestingModule;

}));
