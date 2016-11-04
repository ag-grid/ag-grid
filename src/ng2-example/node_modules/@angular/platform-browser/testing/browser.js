import { APP_ID, NgModule, NgZone, PLATFORM_INITIALIZER, createPlatformFactory, platformCore } from '@angular/core';
import { AnimationDriver, BrowserModule } from '@angular/platform-browser';
import { BrowserDetection, createNgZone } from './browser_util';
import { BrowserDomAdapter, ELEMENT_PROBE_PROVIDERS } from './private_import_platform-browser';
function initBrowserTests() {
    BrowserDomAdapter.makeCurrent();
    BrowserDetection.setup();
}
var _TEST_BROWSER_PLATFORM_PROVIDERS = [{ provide: PLATFORM_INITIALIZER, useValue: initBrowserTests, multi: true }];
/**
 * Platform for testing
 *
 * @stable
 */
export var platformBrowserTesting = createPlatformFactory(platformCore, 'browserTesting', _TEST_BROWSER_PLATFORM_PROVIDERS);
/**
 * NgModule for testing.
 *
 * @stable
 */
export var BrowserTestingModule = (function () {
    function BrowserTestingModule() {
    }
    BrowserTestingModule.decorators = [
        { type: NgModule, args: [{
                    exports: [BrowserModule],
                    providers: [
                        { provide: APP_ID, useValue: 'a' }, ELEMENT_PROBE_PROVIDERS,
                        { provide: NgZone, useFactory: createNgZone },
                        { provide: AnimationDriver, useValue: AnimationDriver.NOOP }
                    ]
                },] },
    ];
    /** @nocollapse */
    BrowserTestingModule.ctorParameters = [];
    return BrowserTestingModule;
}());
//# sourceMappingURL=browser.js.map