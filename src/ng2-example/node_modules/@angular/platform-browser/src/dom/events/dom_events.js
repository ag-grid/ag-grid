/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
import { Injectable } from '@angular/core';
import { getDOM } from '../dom_adapter';
import { EventManagerPlugin } from './event_manager';
export var DomEventsPlugin = (function (_super) {
    __extends(DomEventsPlugin, _super);
    function DomEventsPlugin() {
        _super.apply(this, arguments);
    }
    // This plugin should come last in the list of plugins, because it accepts all
    // events.
    DomEventsPlugin.prototype.supports = function (eventName) { return true; };
    DomEventsPlugin.prototype.addEventListener = function (element, eventName, handler) {
        var zone = this.manager.getZone();
        var outsideHandler = function (event /** TODO #9100 */) { return zone.runGuarded(function () { return handler(event); }); };
        return this.manager.getZone().runOutsideAngular(function () { return getDOM().onAndCancel(element, eventName, outsideHandler); });
    };
    DomEventsPlugin.prototype.addGlobalEventListener = function (target, eventName, handler) {
        var element = getDOM().getGlobalEventTarget(target);
        var zone = this.manager.getZone();
        var outsideHandler = function (event /** TODO #9100 */) { return zone.runGuarded(function () { return handler(event); }); };
        return this.manager.getZone().runOutsideAngular(function () { return getDOM().onAndCancel(element, eventName, outsideHandler); });
    };
    DomEventsPlugin.decorators = [
        { type: Injectable },
    ];
    /** @nocollapse */
    DomEventsPlugin.ctorParameters = [];
    return DomEventsPlugin;
}(EventManagerPlugin));
//# sourceMappingURL=dom_events.js.map