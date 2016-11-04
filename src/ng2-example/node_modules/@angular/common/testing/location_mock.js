/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { EventEmitter, Injectable } from '@angular/core';
/**
 * A spy for {@link Location} that allows tests to fire simulated location events.
 *
 * @experimental
 */
export var SpyLocation = (function () {
    function SpyLocation() {
        this.urlChanges = [];
        this._history = [new LocationState('', '')];
        this._historyIndex = 0;
        /** @internal */
        this._subject = new EventEmitter();
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
        { type: Injectable },
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
//# sourceMappingURL=location_mock.js.map