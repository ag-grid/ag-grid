/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { platformCoreDynamicTesting } from '@angular/compiler/testing';
import { NgModule, createPlatformFactory } from '@angular/core';
import { TestComponentRenderer } from '@angular/core/testing';
import { BrowserTestingModule } from '@angular/platform-browser/testing';
import { DOMTestComponentRenderer } from './dom_test_component_renderer';
import { INTERNAL_BROWSER_DYNAMIC_PLATFORM_PROVIDERS } from './private_import_platform-browser-dynamic';
export * from './private_export_testing';
/**
 * @stable
 */
export var platformBrowserDynamicTesting = createPlatformFactory(platformCoreDynamicTesting, 'browserDynamicTesting', INTERNAL_BROWSER_DYNAMIC_PLATFORM_PROVIDERS);
/**
 * NgModule for testing.
 *
 * @stable
 */
export var BrowserDynamicTestingModule = (function () {
    function BrowserDynamicTestingModule() {
    }
    BrowserDynamicTestingModule.decorators = [
        { type: NgModule, args: [{
                    exports: [BrowserTestingModule],
                    providers: [
                        { provide: TestComponentRenderer, useClass: DOMTestComponentRenderer },
                    ]
                },] },
    ];
    /** @nocollapse */
    BrowserDynamicTestingModule.ctorParameters = [];
    return BrowserDynamicTestingModule;
}());
//# sourceMappingURL=index.js.map