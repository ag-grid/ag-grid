/**
 * @license Angular v2.1.2
 * (c) 2010-2016 Google, Inc. https://angular.io/
 * License: MIT
 */
(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('@angular/core'), require('@angular/common')) :
    typeof define === 'function' && define.amd ? define(['exports', '@angular/core', '@angular/common'], factory) :
    (factory((global.ng = global.ng || {}, global.ng.common = global.ng.common || {}, global.ng.common.testing = global.ng.common.testing || {}),global.ng.core,global.ng.common));
}(this, function (exports,_angular_core,_angular_common) { 'use strict';

    /**
     * A spy for {@link Location} that allows tests to fire simulated location events.
     *
     * @experimental
     */
    var SpyLocation = (function () {
        function SpyLocation() {
            this.urlChanges = [];
            this._history = [new LocationState('', '')];
            this._historyIndex = 0;
            /** @internal */
            this._subject = new _angular_core.EventEmitter();
            /** @internal */
            this._baseHref = '';
            /** @internal */
            this._platformStrategy = null;
        }
        SpyLocation.prototype.setInitialPath = function (url) { this._history[this._historyIndex].path = url; };
        SpyLocation.prototype.setBaseHref = function (url) { this._baseHref = url; };
        SpyLocation.prototype.path = function () { return this._history[this._historyIndex].path; };
        SpyLocation.prototype.isCurrentPathEqualTo = function (path, query) {
            if (query === void 0) { query = ''; }
            var givenPath = path.endsWith('/') ? path.substring(0, path.length - 1) : path;
            var currPath = this.path().endsWith('/') ? this.path().substring(0, this.path().length - 1) : this.path();
            return currPath == givenPath + (query.length > 0 ? ('?' + query) : '');
        };
        SpyLocation.prototype.simulateUrlPop = function (pathname) { this._subject.emit({ 'url': pathname, 'pop': true }); };
        SpyLocation.prototype.simulateHashChange = function (pathname) {
            // Because we don't prevent the native event, the browser will independently update the path
            this.setInitialPath(pathname);
            this.urlChanges.push('hash: ' + pathname);
            this._subject.emit({ 'url': pathname, 'pop': true, 'type': 'hashchange' });
        };
        SpyLocation.prototype.prepareExternalUrl = function (url) {
            if (url.length > 0 && !url.startsWith('/')) {
                url = '/' + url;
            }
            return this._baseHref + url;
        };
        SpyLocation.prototype.go = function (path, query) {
            if (query === void 0) { query = ''; }
            path = this.prepareExternalUrl(path);
            if (this._historyIndex > 0) {
                this._history.splice(this._historyIndex + 1);
            }
            this._history.push(new LocationState(path, query));
            this._historyIndex = this._history.length - 1;
            var locationState = this._history[this._historyIndex - 1];
            if (locationState.path == path && locationState.query == query) {
                return;
            }
            var url = path + (query.length > 0 ? ('?' + query) : '');
            this.urlChanges.push(url);
            this._subject.emit({ 'url': url, 'pop': false });
        };
        SpyLocation.prototype.replaceState = function (path, query) {
            if (query === void 0) { query = ''; }
            path = this.prepareExternalUrl(path);
            var history = this._history[this._historyIndex];
            if (history.path == path && history.query == query) {
                return;
            }
            history.path = path;
            history.query = query;
            var url = path + (query.length > 0 ? ('?' + query) : '');
            this.urlChanges.push('replace: ' + url);
        };
        SpyLocation.prototype.forward = function () {
            if (this._historyIndex < (this._history.length - 1)) {
                this._historyIndex++;
                this._subject.emit({ 'url': this.path(), 'pop': true });
            }
        };
        SpyLocation.prototype.back = function () {
            if (this._historyIndex > 0) {
                this._historyIndex--;
                this._subject.emit({ 'url': this.path(), 'pop': true });
            }
        };
        SpyLocation.prototype.subscribe = function (onNext, onThrow, onReturn) {
            if (onThrow === void 0) { onThrow = null; }
            if (onReturn === void 0) { onReturn = null; }
            return this._subject.subscribe({ next: onNext, error: onThrow, complete: onReturn });
        };
        SpyLocation.prototype.normalize = function (url) { return null; };
        SpyLocation.decorators = [
            { type: _angular_core.Injectable },
        ];
        /** @nocollapse */
        SpyLocation.ctorParameters = [];
        return SpyLocation;
    }());
    var LocationState = (function () {
        function LocationState(path, query) {
            this.path = path;
            this.query = query;
        }
        return LocationState;
    }());

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
    /**
     * A mock implementation of {@link LocationStrategy} that allows tests to fire simulated
     * location events.
     *
     * @stable
     */
    var MockLocationStrategy = (function (_super) {
        __extends(MockLocationStrategy, _super);
        function MockLocationStrategy() {
            _super.call(this);
            this.internalBaseHref = '/';
            this.internalPath = '/';
            this.internalTitle = '';
            this.urlChanges = [];
            /** @internal */
            this._subject = new _angular_core.EventEmitter();
        }
        MockLocationStrategy.prototype.simulatePopState = function (url) {
            this.internalPath = url;
            this._subject.emit(new _MockPopStateEvent(this.path()));
        };
        MockLocationStrategy.prototype.path = function (includeHash) {
            if (includeHash === void 0) { includeHash = false; }
            return this.internalPath;
        };
        MockLocationStrategy.prototype.prepareExternalUrl = function (internal) {
            if (internal.startsWith('/') && this.internalBaseHref.endsWith('/')) {
                return this.internalBaseHref + internal.substring(1);
            }
            return this.internalBaseHref + internal;
        };
        MockLocationStrategy.prototype.pushState = function (ctx, title, path, query) {
            this.internalTitle = title;
            var url = path + (query.length > 0 ? ('?' + query) : '');
            this.internalPath = url;
            var externalUrl = this.prepareExternalUrl(url);
            this.urlChanges.push(externalUrl);
        };
        MockLocationStrategy.prototype.replaceState = function (ctx, title, path, query) {
            this.internalTitle = title;
            var url = path + (query.length > 0 ? ('?' + query) : '');
            this.internalPath = url;
            var externalUrl = this.prepareExternalUrl(url);
            this.urlChanges.push('replace: ' + externalUrl);
        };
        MockLocationStrategy.prototype.onPopState = function (fn) { this._subject.subscribe({ next: fn }); };
        MockLocationStrategy.prototype.getBaseHref = function () { return this.internalBaseHref; };
        MockLocationStrategy.prototype.back = function () {
            if (this.urlChanges.length > 0) {
                this.urlChanges.pop();
                var nextUrl = this.urlChanges.length > 0 ? this.urlChanges[this.urlChanges.length - 1] : '';
                this.simulatePopState(nextUrl);
            }
        };
        MockLocationStrategy.prototype.forward = function () { throw 'not implemented'; };
        MockLocationStrategy.decorators = [
            { type: _angular_core.Injectable },
        ];
        /** @nocollapse */
        MockLocationStrategy.ctorParameters = [];
        return MockLocationStrategy;
    }(_angular_common.LocationStrategy));
    var _MockPopStateEvent = (function () {
        function _MockPopStateEvent(newUrl) {
            this.newUrl = newUrl;
            this.pop = true;
            this.type = 'popstate';
        }
        return _MockPopStateEvent;
    }());

    exports.SpyLocation = SpyLocation;
    exports.MockLocationStrategy = MockLocationStrategy;

}));
