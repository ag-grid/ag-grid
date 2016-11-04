/**
 * @license Angular v2.1.2
 * (c) 2010-2016 Google, Inc. https://angular.io/
 * License: MIT
 */
(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('@angular/core'), require('rxjs/Observable'), require('@angular/platform-browser')) :
    typeof define === 'function' && define.amd ? define(['exports', '@angular/core', 'rxjs/Observable', '@angular/platform-browser'], factory) :
    (factory((global.ng = global.ng || {}, global.ng.http = global.ng.http || {}),global.ng.core,global.Rx,global.ng.platformBrowser));
}(this, function (exports,_angular_core,rxjs_Observable,_angular_platformBrowser) { 'use strict';

    /**
     * A backend for http that uses the `XMLHttpRequest` browser API.
     *
     * Take care not to evaluate this in non-browser contexts.
     *
     * @experimental
     */
    var BrowserXhr = (function () {
        function BrowserXhr() {
        }
        BrowserXhr.prototype.build = function () { return (new XMLHttpRequest()); };
        BrowserXhr.decorators = [
            { type: _angular_core.Injectable },
        ];
        /** @nocollapse */
        BrowserXhr.ctorParameters = [];
        return BrowserXhr;
    }());

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
    var global$1 = globalScope;
    // TODO: remove calls to assert in production environment
    // Note: Can't just export this and import in in other files
    // as `assert` is a reserved keyword in Dart
    global$1.assert = function assert(condition) {
        // TODO: to be fixed properly via #2830, noop for now
    };
    function isPresent(obj) {
        return obj != null;
    }
    function isJsObject(o) {
        return o !== null && (typeof o === 'function' || typeof o === 'object');
    }

    /**
     * @license
     * Copyright Google Inc. All Rights Reserved.
     *
     * Use of this source code is governed by an MIT-style license that can be
     * found in the LICENSE file at https://angular.io/license
     */
    /**
     * Supported http methods.
     * @experimental
     */
    exports.RequestMethod;
    (function (RequestMethod) {
        RequestMethod[RequestMethod["Get"] = 0] = "Get";
        RequestMethod[RequestMethod["Post"] = 1] = "Post";
        RequestMethod[RequestMethod["Put"] = 2] = "Put";
        RequestMethod[RequestMethod["Delete"] = 3] = "Delete";
        RequestMethod[RequestMethod["Options"] = 4] = "Options";
        RequestMethod[RequestMethod["Head"] = 5] = "Head";
        RequestMethod[RequestMethod["Patch"] = 6] = "Patch";
    })(exports.RequestMethod || (exports.RequestMethod = {}));
    /**
     * All possible states in which a connection can be, based on
     * [States](http://www.w3.org/TR/XMLHttpRequest/#states) from the `XMLHttpRequest` spec, but with an
     * additional "CANCELLED" state.
     * @experimental
     */
    exports.ReadyState;
    (function (ReadyState) {
        ReadyState[ReadyState["Unsent"] = 0] = "Unsent";
        ReadyState[ReadyState["Open"] = 1] = "Open";
        ReadyState[ReadyState["HeadersReceived"] = 2] = "HeadersReceived";
        ReadyState[ReadyState["Loading"] = 3] = "Loading";
        ReadyState[ReadyState["Done"] = 4] = "Done";
        ReadyState[ReadyState["Cancelled"] = 5] = "Cancelled";
    })(exports.ReadyState || (exports.ReadyState = {}));
    /**
     * Acceptable response types to be associated with a {@link Response}, based on
     * [ResponseType](https://fetch.spec.whatwg.org/#responsetype) from the Fetch spec.
     * @experimental
     */
    exports.ResponseType;
    (function (ResponseType) {
        ResponseType[ResponseType["Basic"] = 0] = "Basic";
        ResponseType[ResponseType["Cors"] = 1] = "Cors";
        ResponseType[ResponseType["Default"] = 2] = "Default";
        ResponseType[ResponseType["Error"] = 3] = "Error";
        ResponseType[ResponseType["Opaque"] = 4] = "Opaque";
    })(exports.ResponseType || (exports.ResponseType = {}));
    /**
     * Supported content type to be automatically associated with a {@link Request}.
     * @experimental
     */
    var ContentType;
    (function (ContentType) {
        ContentType[ContentType["NONE"] = 0] = "NONE";
        ContentType[ContentType["JSON"] = 1] = "JSON";
        ContentType[ContentType["FORM"] = 2] = "FORM";
        ContentType[ContentType["FORM_DATA"] = 3] = "FORM_DATA";
        ContentType[ContentType["TEXT"] = 4] = "TEXT";
        ContentType[ContentType["BLOB"] = 5] = "BLOB";
        ContentType[ContentType["ARRAY_BUFFER"] = 6] = "ARRAY_BUFFER";
    })(ContentType || (ContentType = {}));
    /**
     * Define which buffer to use to store the response
     * @experimental
     */
    exports.ResponseContentType;
    (function (ResponseContentType) {
        ResponseContentType[ResponseContentType["Text"] = 0] = "Text";
        ResponseContentType[ResponseContentType["Json"] = 1] = "Json";
        ResponseContentType[ResponseContentType["ArrayBuffer"] = 2] = "ArrayBuffer";
        ResponseContentType[ResponseContentType["Blob"] = 3] = "Blob";
    })(exports.ResponseContentType || (exports.ResponseContentType = {}));

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
    var MapWrapper = (function () {
        function MapWrapper() {
        }
        MapWrapper.createFromStringMap = function (stringMap) {
            var result = new Map();
            for (var prop in stringMap) {
                result.set(prop, stringMap[prop]);
            }
            return result;
        };
        MapWrapper.keys = function (m) { return _arrayFromMap(m, false); };
        MapWrapper.values = function (m) { return _arrayFromMap(m, true); };
        return MapWrapper;
    }());

    /**
     * Polyfill for [Headers](https://developer.mozilla.org/en-US/docs/Web/API/Headers/Headers), as
     * specified in the [Fetch Spec](https://fetch.spec.whatwg.org/#headers-class).
     *
     * The only known difference between this `Headers` implementation and the spec is the
     * lack of an `entries` method.
     *
     * ### Example
     *
     * ```
     * import {Headers} from '@angular/http';
     *
     * var firstHeaders = new Headers();
     * firstHeaders.append('Content-Type', 'image/jpeg');
     * console.log(firstHeaders.get('Content-Type')) //'image/jpeg'
     *
     * // Create headers from Plain Old JavaScript Object
     * var secondHeaders = new Headers({
     *   'X-My-Custom-Header': 'Angular'
     * });
     * console.log(secondHeaders.get('X-My-Custom-Header')); //'Angular'
     *
     * var thirdHeaders = new Headers(secondHeaders);
     * console.log(thirdHeaders.get('X-My-Custom-Header')); //'Angular'
     * ```
     *
     * @experimental
     */
    var Headers = (function () {
        // TODO(vicb): any -> string|string[]
        function Headers(headers) {
            var _this = this;
            /** @internal header names are lower case */
            this._headers = new Map();
            /** @internal map lower case names to actual names */
            this._normalizedNames = new Map();
            if (!headers) {
                return;
            }
            if (headers instanceof Headers) {
                headers._headers.forEach(function (values, name) {
                    values.forEach(function (value) { return _this.append(name, value); });
                });
                return;
            }
            Object.keys(headers).forEach(function (name) {
                var values = Array.isArray(headers[name]) ? headers[name] : [headers[name]];
                _this.delete(name);
                values.forEach(function (value) { return _this.append(name, value); });
            });
        }
        /**
         * Returns a new Headers instance from the given DOMString of Response Headers
         */
        Headers.fromResponseHeaderString = function (headersString) {
            var headers = new Headers();
            headersString.split('\n').forEach(function (line) {
                var index = line.indexOf(':');
                if (index > 0) {
                    var name_1 = line.slice(0, index);
                    var value = line.slice(index + 1).trim();
                    headers.set(name_1, value);
                }
            });
            return headers;
        };
        /**
         * Appends a header to existing list of header values for a given header name.
         */
        Headers.prototype.append = function (name, value) {
            var values = this.getAll(name);
            if (values === null) {
                this.set(name, value);
            }
            else {
                values.push(value);
            }
        };
        /**
         * Deletes all header values for the given name.
         */
        Headers.prototype.delete = function (name) {
            var lcName = name.toLowerCase();
            this._normalizedNames.delete(lcName);
            this._headers.delete(lcName);
        };
        Headers.prototype.forEach = function (fn) {
            var _this = this;
            this._headers.forEach(function (values, lcName) { return fn(values, _this._normalizedNames.get(lcName), _this._headers); });
        };
        /**
         * Returns first header that matches given name.
         */
        Headers.prototype.get = function (name) {
            var values = this.getAll(name);
            if (values === null) {
                return null;
            }
            return values.length > 0 ? values[0] : null;
        };
        /**
         * Checks for existence of header by given name.
         */
        Headers.prototype.has = function (name) { return this._headers.has(name.toLowerCase()); };
        /**
         * Returns the names of the headers
         */
        Headers.prototype.keys = function () { return MapWrapper.values(this._normalizedNames); };
        /**
         * Sets or overrides header value for given name.
         */
        Headers.prototype.set = function (name, value) {
            if (Array.isArray(value)) {
                if (value.length) {
                    this._headers.set(name.toLowerCase(), [value.join(',')]);
                }
            }
            else {
                this._headers.set(name.toLowerCase(), [value]);
            }
            this.mayBeSetNormalizedName(name);
        };
        /**
         * Returns values of all headers.
         */
        Headers.prototype.values = function () { return MapWrapper.values(this._headers); };
        /**
         * Returns string of all headers.
         */
        // TODO(vicb): returns {[name: string]: string[]}
        Headers.prototype.toJSON = function () {
            var _this = this;
            var serialized = {};
            this._headers.forEach(function (values, name) {
                var split = [];
                values.forEach(function (v) { return split.push.apply(split, v.split(',')); });
                serialized[_this._normalizedNames.get(name)] = split;
            });
            return serialized;
        };
        /**
         * Returns list of header values for a given name.
         */
        Headers.prototype.getAll = function (name) {
            return this.has(name) ? this._headers.get(name.toLowerCase()) : null;
        };
        /**
         * This method is not implemented.
         */
        Headers.prototype.entries = function () { throw new Error('"entries" method is not implemented on Headers class'); };
        Headers.prototype.mayBeSetNormalizedName = function (name) {
            var lcName = name.toLowerCase();
            if (!this._normalizedNames.has(lcName)) {
                this._normalizedNames.set(lcName, name);
            }
        };
        return Headers;
    }());

    /**
     * @license
     * Copyright Google Inc. All Rights Reserved.
     *
     * Use of this source code is governed by an MIT-style license that can be
     * found in the LICENSE file at https://angular.io/license
     */
    var __extends$1 = (this && this.__extends) || function (d, b) {
        for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
    /**
     * Creates a response options object to be optionally provided when instantiating a
     * {@link Response}.
     *
     * This class is based on the `ResponseInit` description in the [Fetch
     * Spec](https://fetch.spec.whatwg.org/#responseinit).
     *
     * All values are null by default. Typical defaults can be found in the
     * {@link BaseResponseOptions} class, which sub-classes `ResponseOptions`.
     *
     * This class may be used in tests to build {@link Response Responses} for
     * mock responses (see {@link MockBackend}).
     *
     * ### Example ([live demo](http://plnkr.co/edit/P9Jkk8e8cz6NVzbcxEsD?p=preview))
     *
     * ```typescript
     * import {ResponseOptions, Response} from '@angular/http';
     *
     * var options = new ResponseOptions({
     *   body: '{"name":"Jeff"}'
     * });
     * var res = new Response(options);
     *
     * console.log('res.json():', res.json()); // Object {name: "Jeff"}
     * ```
     *
     * @experimental
     */
    var ResponseOptions = (function () {
        function ResponseOptions(_a) {
            var _b = _a === void 0 ? {} : _a, body = _b.body, status = _b.status, headers = _b.headers, statusText = _b.statusText, type = _b.type, url = _b.url;
            this.body = isPresent(body) ? body : null;
            this.status = isPresent(status) ? status : null;
            this.headers = isPresent(headers) ? headers : null;
            this.statusText = isPresent(statusText) ? statusText : null;
            this.type = isPresent(type) ? type : null;
            this.url = isPresent(url) ? url : null;
        }
        /**
         * Creates a copy of the `ResponseOptions` instance, using the optional input as values to
         * override
         * existing values. This method will not change the values of the instance on which it is being
         * called.
         *
         * This may be useful when sharing a base `ResponseOptions` object inside tests,
         * where certain properties may change from test to test.
         *
         * ### Example ([live demo](http://plnkr.co/edit/1lXquqFfgduTFBWjNoRE?p=preview))
         *
         * ```typescript
         * import {ResponseOptions, Response} from '@angular/http';
         *
         * var options = new ResponseOptions({
         *   body: {name: 'Jeff'}
         * });
         * var res = new Response(options.merge({
         *   url: 'https://google.com'
         * }));
         * console.log('options.url:', options.url); // null
         * console.log('res.json():', res.json()); // Object {name: "Jeff"}
         * console.log('res.url:', res.url); // https://google.com
         * ```
         */
        ResponseOptions.prototype.merge = function (options) {
            return new ResponseOptions({
                body: isPresent(options) && isPresent(options.body) ? options.body : this.body,
                status: isPresent(options) && isPresent(options.status) ? options.status : this.status,
                headers: isPresent(options) && isPresent(options.headers) ? options.headers : this.headers,
                statusText: isPresent(options) && isPresent(options.statusText) ? options.statusText :
                    this.statusText,
                type: isPresent(options) && isPresent(options.type) ? options.type : this.type,
                url: isPresent(options) && isPresent(options.url) ? options.url : this.url,
            });
        };
        return ResponseOptions;
    }());
    /**
     * Subclass of {@link ResponseOptions}, with default values.
     *
     * Default values:
     *  * status: 200
     *  * headers: empty {@link Headers} object
     *
     * This class could be extended and bound to the {@link ResponseOptions} class
     * when configuring an {@link Injector}, in order to override the default options
     * used by {@link Http} to create {@link Response Responses}.
     *
     * ### Example ([live demo](http://plnkr.co/edit/qv8DLT?p=preview))
     *
     * ```typescript
     * import {provide} from '@angular/core';
     * import {bootstrap} from '@angular/platform-browser/browser';
     * import {HTTP_PROVIDERS, Headers, Http, BaseResponseOptions, ResponseOptions} from
     * '@angular/http';
     * import {App} from './myapp';
     *
     * class MyOptions extends BaseResponseOptions {
     *   headers:Headers = new Headers({network: 'github'});
     * }
     *
     * bootstrap(App, [HTTP_PROVIDERS, {provide: ResponseOptions, useClass: MyOptions}]);
     * ```
     *
     * The options could also be extended when manually creating a {@link Response}
     * object.
     *
     * ### Example ([live demo](http://plnkr.co/edit/VngosOWiaExEtbstDoix?p=preview))
     *
     * ```
     * import {BaseResponseOptions, Response} from '@angular/http';
     *
     * var options = new BaseResponseOptions();
     * var res = new Response(options.merge({
     *   body: 'Angular',
     *   headers: new Headers({framework: 'angular'})
     * }));
     * console.log('res.headers.get("framework"):', res.headers.get('framework')); // angular
     * console.log('res.text():', res.text()); // Angular;
     * ```
     *
     * @experimental
     */
    var BaseResponseOptions = (function (_super) {
        __extends$1(BaseResponseOptions, _super);
        function BaseResponseOptions() {
            _super.call(this, { status: 200, statusText: 'Ok', type: exports.ResponseType.Default, headers: new Headers() });
        }
        BaseResponseOptions.decorators = [
            { type: _angular_core.Injectable },
        ];
        /** @nocollapse */
        BaseResponseOptions.ctorParameters = [];
        return BaseResponseOptions;
    }(ResponseOptions));

    /**
     * @license
     * Copyright Google Inc. All Rights Reserved.
     *
     * Use of this source code is governed by an MIT-style license that can be
     * found in the LICENSE file at https://angular.io/license
     */
    /**
     * Abstract class from which real backends are derived.
     *
     * The primary purpose of a `ConnectionBackend` is to create new connections to fulfill a given
     * {@link Request}.
     *
     * @experimental
     */
    var ConnectionBackend = (function () {
        function ConnectionBackend() {
        }
        return ConnectionBackend;
    }());
    /**
     * Abstract class from which real connections are derived.
     *
     * @experimental
     */
    var Connection = (function () {
        function Connection() {
        }
        return Connection;
    }());
    /**
     * An XSRFStrategy configures XSRF protection (e.g. via headers) on an HTTP request.
     *
     * @experimental
     */
    var XSRFStrategy = (function () {
        function XSRFStrategy() {
        }
        return XSRFStrategy;
    }());

    function normalizeMethodName(method) {
        if (typeof method !== 'string')
            return method;
        switch (method.toUpperCase()) {
            case 'GET':
                return exports.RequestMethod.Get;
            case 'POST':
                return exports.RequestMethod.Post;
            case 'PUT':
                return exports.RequestMethod.Put;
            case 'DELETE':
                return exports.RequestMethod.Delete;
            case 'OPTIONS':
                return exports.RequestMethod.Options;
            case 'HEAD':
                return exports.RequestMethod.Head;
            case 'PATCH':
                return exports.RequestMethod.Patch;
        }
        throw new Error("Invalid request method. The method \"" + method + "\" is not supported.");
    }
    var isSuccess = function (status) { return (status >= 200 && status < 300); };
    function getResponseURL(xhr) {
        if ('responseURL' in xhr) {
            return xhr.responseURL;
        }
        if (/^X-Request-URL:/m.test(xhr.getAllResponseHeaders())) {
            return xhr.getResponseHeader('X-Request-URL');
        }
        return;
    }
    function stringToArrayBuffer(input) {
        var view = new Uint16Array(input.length);
        for (var i = 0, strLen = input.length; i < strLen; i++) {
            view[i] = input.charCodeAt(i);
        }
        return view.buffer;
    }

    /**
     * @license
     * Copyright Google Inc. All Rights Reserved.
     *
     * Use of this source code is governed by an MIT-style license that can be
     * found in the LICENSE file at https://angular.io/license
     */
    function paramParser(rawParams) {
        if (rawParams === void 0) { rawParams = ''; }
        var map = new Map();
        if (rawParams.length > 0) {
            var params = rawParams.split('&');
            params.forEach(function (param) {
                var eqIdx = param.indexOf('=');
                var _a = eqIdx == -1 ? [param, ''] : [param.slice(0, eqIdx), param.slice(eqIdx + 1)], key = _a[0], val = _a[1];
                var list = map.get(key) || [];
                list.push(val);
                map.set(key, list);
            });
        }
        return map;
    }
    /**
     * @experimental
     **/
    var QueryEncoder = (function () {
        function QueryEncoder() {
        }
        QueryEncoder.prototype.encodeKey = function (k) { return standardEncoding(k); };
        QueryEncoder.prototype.encodeValue = function (v) { return standardEncoding(v); };
        return QueryEncoder;
    }());
    function standardEncoding(v) {
        return encodeURIComponent(v)
            .replace(/%40/gi, '@')
            .replace(/%3A/gi, ':')
            .replace(/%24/gi, '$')
            .replace(/%2C/gi, ',')
            .replace(/%3B/gi, ';')
            .replace(/%2B/gi, '+')
            .replace(/%3D/gi, '=')
            .replace(/%3F/gi, '?')
            .replace(/%2F/gi, '/');
    }
    /**
     * Map-like representation of url search parameters, based on
     * [URLSearchParams](https://url.spec.whatwg.org/#urlsearchparams) in the url living standard,
     * with several extensions for merging URLSearchParams objects:
     *   - setAll()
     *   - appendAll()
     *   - replaceAll()
     *
     * This class accepts an optional second parameter of ${@link QueryEncoder},
     * which is used to serialize parameters before making a request. By default,
     * `QueryEncoder` encodes keys and values of parameters using `encodeURIComponent`,
     * and then un-encodes certain characters that are allowed to be part of the query
     * according to IETF RFC 3986: https://tools.ietf.org/html/rfc3986.
     *
     * These are the characters that are not encoded: `! $ \' ( ) * + , ; A 9 - . _ ~ ? /`
     *
     * If the set of allowed query characters is not acceptable for a particular backend,
     * `QueryEncoder` can be subclassed and provided as the 2nd argument to URLSearchParams.
     *
     * ```
     * import {URLSearchParams, QueryEncoder} from '@angular/http';
     * class MyQueryEncoder extends QueryEncoder {
     *   encodeKey(k: string): string {
     *     return myEncodingFunction(k);
     *   }
     *
     *   encodeValue(v: string): string {
     *     return myEncodingFunction(v);
     *   }
     * }
     *
     * let params = new URLSearchParams('', new MyQueryEncoder());
     * ```
     * @experimental
     */
    var URLSearchParams = (function () {
        function URLSearchParams(rawParams, queryEncoder) {
            if (rawParams === void 0) { rawParams = ''; }
            if (queryEncoder === void 0) { queryEncoder = new QueryEncoder(); }
            this.rawParams = rawParams;
            this.queryEncoder = queryEncoder;
            this.paramsMap = paramParser(rawParams);
        }
        URLSearchParams.prototype.clone = function () {
            var clone = new URLSearchParams('', this.queryEncoder);
            clone.appendAll(this);
            return clone;
        };
        URLSearchParams.prototype.has = function (param) { return this.paramsMap.has(param); };
        URLSearchParams.prototype.get = function (param) {
            var storedParam = this.paramsMap.get(param);
            return Array.isArray(storedParam) ? storedParam[0] : null;
        };
        URLSearchParams.prototype.getAll = function (param) { return this.paramsMap.get(param) || []; };
        URLSearchParams.prototype.set = function (param, val) {
            if (val === void 0 || val === null) {
                this.delete(param);
                return;
            }
            var list = this.paramsMap.get(param) || [];
            list.length = 0;
            list.push(val);
            this.paramsMap.set(param, list);
        };
        // A merge operation
        // For each name-values pair in `searchParams`, perform `set(name, values[0])`
        //
        // E.g: "a=[1,2,3], c=[8]" + "a=[4,5,6], b=[7]" = "a=[4], c=[8], b=[7]"
        //
        // TODO(@caitp): document this better
        URLSearchParams.prototype.setAll = function (searchParams) {
            var _this = this;
            searchParams.paramsMap.forEach(function (value, param) {
                var list = _this.paramsMap.get(param) || [];
                list.length = 0;
                list.push(value[0]);
                _this.paramsMap.set(param, list);
            });
        };
        URLSearchParams.prototype.append = function (param, val) {
            if (val === void 0 || val === null)
                return;
            var list = this.paramsMap.get(param) || [];
            list.push(val);
            this.paramsMap.set(param, list);
        };
        // A merge operation
        // For each name-values pair in `searchParams`, perform `append(name, value)`
        // for each value in `values`.
        //
        // E.g: "a=[1,2], c=[8]" + "a=[3,4], b=[7]" = "a=[1,2,3,4], c=[8], b=[7]"
        //
        // TODO(@caitp): document this better
        URLSearchParams.prototype.appendAll = function (searchParams) {
            var _this = this;
            searchParams.paramsMap.forEach(function (value, param) {
                var list = _this.paramsMap.get(param) || [];
                for (var i = 0; i < value.length; ++i) {
                    list.push(value[i]);
                }
                _this.paramsMap.set(param, list);
            });
        };
        // A merge operation
        // For each name-values pair in `searchParams`, perform `delete(name)`,
        // followed by `set(name, values)`
        //
        // E.g: "a=[1,2,3], c=[8]" + "a=[4,5,6], b=[7]" = "a=[4,5,6], c=[8], b=[7]"
        //
        // TODO(@caitp): document this better
        URLSearchParams.prototype.replaceAll = function (searchParams) {
            var _this = this;
            searchParams.paramsMap.forEach(function (value, param) {
                var list = _this.paramsMap.get(param) || [];
                list.length = 0;
                for (var i = 0; i < value.length; ++i) {
                    list.push(value[i]);
                }
                _this.paramsMap.set(param, list);
            });
        };
        URLSearchParams.prototype.toString = function () {
            var _this = this;
            var paramsList = [];
            this.paramsMap.forEach(function (values, k) {
                values.forEach(function (v) { return paramsList.push(_this.queryEncoder.encodeKey(k) + '=' + _this.queryEncoder.encodeValue(v)); });
            });
            return paramsList.join('&');
        };
        URLSearchParams.prototype.delete = function (param) { this.paramsMap.delete(param); };
        return URLSearchParams;
    }());

    /**
     * HTTP request body used by both {@link Request} and {@link Response}
     * https://fetch.spec.whatwg.org/#body
     */
    var Body = (function () {
        function Body() {
        }
        /**
         * Attempts to return body as parsed `JSON` object, or raises an exception.
         */
        Body.prototype.json = function () {
            if (typeof this._body === 'string') {
                return JSON.parse(this._body);
            }
            if (this._body instanceof ArrayBuffer) {
                return JSON.parse(this.text());
            }
            return this._body;
        };
        /**
         * Returns the body as a string, presuming `toString()` can be called on the response body.
         */
        Body.prototype.text = function () {
            if (this._body instanceof URLSearchParams) {
                return this._body.toString();
            }
            if (this._body instanceof ArrayBuffer) {
                return String.fromCharCode.apply(null, new Uint16Array(this._body));
            }
            if (this._body === null) {
                return '';
            }
            if (isJsObject(this._body)) {
                return JSON.stringify(this._body, null, 2);
            }
            return this._body.toString();
        };
        /**
         * Return the body as an ArrayBuffer
         */
        Body.prototype.arrayBuffer = function () {
            if (this._body instanceof ArrayBuffer) {
                return this._body;
            }
            return stringToArrayBuffer(this.text());
        };
        /**
          * Returns the request's body as a Blob, assuming that body exists.
          */
        Body.prototype.blob = function () {
            if (this._body instanceof Blob) {
                return this._body;
            }
            if (this._body instanceof ArrayBuffer) {
                return new Blob([this._body]);
            }
            throw new Error('The request body isn\'t either a blob or an array buffer');
        };
        return Body;
    }());

    /**
     * @license
     * Copyright Google Inc. All Rights Reserved.
     *
     * Use of this source code is governed by an MIT-style license that can be
     * found in the LICENSE file at https://angular.io/license
     */
    var __extends$2 = (this && this.__extends) || function (d, b) {
        for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
    /**
     * Creates `Response` instances from provided values.
     *
     * Though this object isn't
     * usually instantiated by end-users, it is the primary object interacted with when it comes time to
     * add data to a view.
     *
     * ### Example
     *
     * ```
     * http.request('my-friends.txt').subscribe(response => this.friends = response.text());
     * ```
     *
     * The Response's interface is inspired by the Response constructor defined in the [Fetch
     * Spec](https://fetch.spec.whatwg.org/#response-class), but is considered a static value whose body
     * can be accessed many times. There are other differences in the implementation, but this is the
     * most significant.
     *
     * @experimental
     */
    var Response = (function (_super) {
        __extends$2(Response, _super);
        function Response(responseOptions) {
            _super.call(this);
            this._body = responseOptions.body;
            this.status = responseOptions.status;
            this.ok = (this.status >= 200 && this.status <= 299);
            this.statusText = responseOptions.statusText;
            this.headers = responseOptions.headers;
            this.type = responseOptions.type;
            this.url = responseOptions.url;
        }
        Response.prototype.toString = function () {
            return "Response with status: " + this.status + " " + this.statusText + " for URL: " + this.url;
        };
        return Response;
    }(Body));

    var _nextRequestId = 0;
    var JSONP_HOME = '__ng_jsonp__';
    var _jsonpConnections = null;
    function _getJsonpConnections() {
        if (_jsonpConnections === null) {
            _jsonpConnections = global$1[JSONP_HOME] = {};
        }
        return _jsonpConnections;
    }
    // Make sure not to evaluate this in a non-browser environment!
    var BrowserJsonp = (function () {
        function BrowserJsonp() {
        }
        // Construct a <script> element with the specified URL
        BrowserJsonp.prototype.build = function (url) {
            var node = document.createElement('script');
            node.src = url;
            return node;
        };
        BrowserJsonp.prototype.nextRequestID = function () { return "__req" + _nextRequestId++; };
        BrowserJsonp.prototype.requestCallback = function (id) { return JSONP_HOME + "." + id + ".finished"; };
        BrowserJsonp.prototype.exposeConnection = function (id, connection) {
            var connections = _getJsonpConnections();
            connections[id] = connection;
        };
        BrowserJsonp.prototype.removeConnection = function (id) {
            var connections = _getJsonpConnections();
            connections[id] = null;
        };
        // Attach the <script> element to the DOM
        BrowserJsonp.prototype.send = function (node) { document.body.appendChild((node)); };
        // Remove <script> element from the DOM
        BrowserJsonp.prototype.cleanup = function (node) {
            if (node.parentNode) {
                node.parentNode.removeChild((node));
            }
        };
        BrowserJsonp.decorators = [
            { type: _angular_core.Injectable },
        ];
        /** @nocollapse */
        BrowserJsonp.ctorParameters = [];
        return BrowserJsonp;
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
    var JSONP_ERR_NO_CALLBACK = 'JSONP injected script did not invoke callback.';
    var JSONP_ERR_WRONG_METHOD = 'JSONP requests must use GET request method.';
    /**
     * Abstract base class for an in-flight JSONP request.
     *
     * @experimental
     */
    var JSONPConnection = (function () {
        function JSONPConnection() {
        }
        return JSONPConnection;
    }());
    var JSONPConnection_ = (function (_super) {
        __extends(JSONPConnection_, _super);
        function JSONPConnection_(req, _dom, baseResponseOptions) {
            var _this = this;
            _super.call(this);
            this._dom = _dom;
            this.baseResponseOptions = baseResponseOptions;
            this._finished = false;
            if (req.method !== exports.RequestMethod.Get) {
                throw new TypeError(JSONP_ERR_WRONG_METHOD);
            }
            this.request = req;
            this.response = new rxjs_Observable.Observable(function (responseObserver) {
                _this.readyState = exports.ReadyState.Loading;
                var id = _this._id = _dom.nextRequestID();
                _dom.exposeConnection(id, _this);
                // Workaround Dart
                // url = url.replace(/=JSONP_CALLBACK(&|$)/, `generated method`);
                var callback = _dom.requestCallback(_this._id);
                var url = req.url;
                if (url.indexOf('=JSONP_CALLBACK&') > -1) {
                    url = url.replace('=JSONP_CALLBACK&', "=" + callback + "&");
                }
                else if (url.lastIndexOf('=JSONP_CALLBACK') === url.length - '=JSONP_CALLBACK'.length) {
                    url = url.substring(0, url.length - '=JSONP_CALLBACK'.length) + ("=" + callback);
                }
                var script = _this._script = _dom.build(url);
                var onLoad = function (event) {
                    if (_this.readyState === exports.ReadyState.Cancelled)
                        return;
                    _this.readyState = exports.ReadyState.Done;
                    _dom.cleanup(script);
                    if (!_this._finished) {
                        var responseOptions_1 = new ResponseOptions({ body: JSONP_ERR_NO_CALLBACK, type: exports.ResponseType.Error, url: url });
                        if (isPresent(baseResponseOptions)) {
                            responseOptions_1 = baseResponseOptions.merge(responseOptions_1);
                        }
                        responseObserver.error(new Response(responseOptions_1));
                        return;
                    }
                    var responseOptions = new ResponseOptions({ body: _this._responseData, url: url });
                    if (isPresent(_this.baseResponseOptions)) {
                        responseOptions = _this.baseResponseOptions.merge(responseOptions);
                    }
                    responseObserver.next(new Response(responseOptions));
                    responseObserver.complete();
                };
                var onError = function (error) {
                    if (_this.readyState === exports.ReadyState.Cancelled)
                        return;
                    _this.readyState = exports.ReadyState.Done;
                    _dom.cleanup(script);
                    var responseOptions = new ResponseOptions({ body: error.message, type: exports.ResponseType.Error });
                    if (isPresent(baseResponseOptions)) {
                        responseOptions = baseResponseOptions.merge(responseOptions);
                    }
                    responseObserver.error(new Response(responseOptions));
                };
                script.addEventListener('load', onLoad);
                script.addEventListener('error', onError);
                _dom.send(script);
                return function () {
                    _this.readyState = exports.ReadyState.Cancelled;
                    script.removeEventListener('load', onLoad);
                    script.removeEventListener('error', onError);
                    if (isPresent(script)) {
                        _this._dom.cleanup(script);
                    }
                };
            });
        }
        JSONPConnection_.prototype.finished = function (data) {
            // Don't leak connections
            this._finished = true;
            this._dom.removeConnection(this._id);
            if (this.readyState === exports.ReadyState.Cancelled)
                return;
            this._responseData = data;
        };
        return JSONPConnection_;
    }(JSONPConnection));
    /**
     * A {@link ConnectionBackend} that uses the JSONP strategy of making requests.
     *
     * @experimental
     */
    var JSONPBackend = (function (_super) {
        __extends(JSONPBackend, _super);
        function JSONPBackend() {
            _super.apply(this, arguments);
        }
        return JSONPBackend;
    }(ConnectionBackend));
    var JSONPBackend_ = (function (_super) {
        __extends(JSONPBackend_, _super);
        function JSONPBackend_(_browserJSONP, _baseResponseOptions) {
            _super.call(this);
            this._browserJSONP = _browserJSONP;
            this._baseResponseOptions = _baseResponseOptions;
        }
        JSONPBackend_.prototype.createConnection = function (request) {
            return new JSONPConnection_(request, this._browserJSONP, this._baseResponseOptions);
        };
        JSONPBackend_.decorators = [
            { type: _angular_core.Injectable },
        ];
        /** @nocollapse */
        JSONPBackend_.ctorParameters = [
            { type: BrowserJsonp, },
            { type: ResponseOptions, },
        ];
        return JSONPBackend_;
    }(JSONPBackend));

    var XSSI_PREFIX = /^\)\]\}',?\n/;
    /**
     * Creates connections using `XMLHttpRequest`. Given a fully-qualified
     * request, an `XHRConnection` will immediately create an `XMLHttpRequest` object and send the
     * request.
     *
     * This class would typically not be created or interacted with directly inside applications, though
     * the {@link MockConnection} may be interacted with in tests.
     *
     * @experimental
     */
    var XHRConnection = (function () {
        function XHRConnection(req, browserXHR, baseResponseOptions) {
            var _this = this;
            this.request = req;
            this.response = new rxjs_Observable.Observable(function (responseObserver) {
                var _xhr = browserXHR.build();
                _xhr.open(exports.RequestMethod[req.method].toUpperCase(), req.url);
                if (isPresent(req.withCredentials)) {
                    _xhr.withCredentials = req.withCredentials;
                }
                // load event handler
                var onLoad = function () {
                    // responseText is the old-school way of retrieving response (supported by IE8 & 9)
                    // response/responseType properties were introduced in ResourceLoader Level2 spec (supported
                    // by IE10)
                    var body = _xhr.response === undefined ? _xhr.responseText : _xhr.response;
                    // Implicitly strip a potential XSSI prefix.
                    if (typeof body === 'string')
                        body = body.replace(XSSI_PREFIX, '');
                    var headers = Headers.fromResponseHeaderString(_xhr.getAllResponseHeaders());
                    var url = getResponseURL(_xhr);
                    // normalize IE9 bug (http://bugs.jquery.com/ticket/1450)
                    var status = _xhr.status === 1223 ? 204 : _xhr.status;
                    // fix status code when it is 0 (0 status is undocumented).
                    // Occurs when accessing file resources or on Android 4.1 stock browser
                    // while retrieving files from application cache.
                    if (status === 0) {
                        status = body ? 200 : 0;
                    }
                    var statusText = _xhr.statusText || 'OK';
                    var responseOptions = new ResponseOptions({ body: body, status: status, headers: headers, statusText: statusText, url: url });
                    if (isPresent(baseResponseOptions)) {
                        responseOptions = baseResponseOptions.merge(responseOptions);
                    }
                    var response = new Response(responseOptions);
                    response.ok = isSuccess(status);
                    if (response.ok) {
                        responseObserver.next(response);
                        // TODO(gdi2290): defer complete if array buffer until done
                        responseObserver.complete();
                        return;
                    }
                    responseObserver.error(response);
                };
                // error event handler
                var onError = function (err) {
                    var responseOptions = new ResponseOptions({
                        body: err,
                        type: exports.ResponseType.Error,
                        status: _xhr.status,
                        statusText: _xhr.statusText,
                    });
                    if (isPresent(baseResponseOptions)) {
                        responseOptions = baseResponseOptions.merge(responseOptions);
                    }
                    responseObserver.error(new Response(responseOptions));
                };
                _this.setDetectedContentType(req, _xhr);
                if (isPresent(req.headers)) {
                    req.headers.forEach(function (values, name) { return _xhr.setRequestHeader(name, values.join(',')); });
                }
                // Select the correct buffer type to store the response
                if (isPresent(req.responseType) && isPresent(_xhr.responseType)) {
                    switch (req.responseType) {
                        case exports.ResponseContentType.ArrayBuffer:
                            _xhr.responseType = 'arraybuffer';
                            break;
                        case exports.ResponseContentType.Json:
                            _xhr.responseType = 'json';
                            break;
                        case exports.ResponseContentType.Text:
                            _xhr.responseType = 'text';
                            break;
                        case exports.ResponseContentType.Blob:
                            _xhr.responseType = 'blob';
                            break;
                        default:
                            throw new Error('The selected responseType is not supported');
                    }
                }
                _xhr.addEventListener('load', onLoad);
                _xhr.addEventListener('error', onError);
                _xhr.send(_this.request.getBody());
                return function () {
                    _xhr.removeEventListener('load', onLoad);
                    _xhr.removeEventListener('error', onError);
                    _xhr.abort();
                };
            });
        }
        XHRConnection.prototype.setDetectedContentType = function (req /** TODO #9100 */, _xhr /** TODO #9100 */) {
            // Skip if a custom Content-Type header is provided
            if (isPresent(req.headers) && isPresent(req.headers.get('Content-Type'))) {
                return;
            }
            // Set the detected content type
            switch (req.contentType) {
                case ContentType.NONE:
                    break;
                case ContentType.JSON:
                    _xhr.setRequestHeader('content-type', 'application/json');
                    break;
                case ContentType.FORM:
                    _xhr.setRequestHeader('content-type', 'application/x-www-form-urlencoded;charset=UTF-8');
                    break;
                case ContentType.TEXT:
                    _xhr.setRequestHeader('content-type', 'text/plain');
                    break;
                case ContentType.BLOB:
                    var blob = req.blob();
                    if (blob.type) {
                        _xhr.setRequestHeader('content-type', blob.type);
                    }
                    break;
            }
        };
        return XHRConnection;
    }());
    /**
     * `XSRFConfiguration` sets up Cross Site Request Forgery (XSRF) protection for the application
     * using a cookie. See {@link https://www.owasp.org/index.php/Cross-Site_Request_Forgery_(CSRF)}
     * for more information on XSRF.
     *
     * Applications can configure custom cookie and header names by binding an instance of this class
     * with different `cookieName` and `headerName` values. See the main HTTP documentation for more
     * details.
     *
     * @experimental
     */
    var CookieXSRFStrategy = (function () {
        function CookieXSRFStrategy(_cookieName, _headerName) {
            if (_cookieName === void 0) { _cookieName = 'XSRF-TOKEN'; }
            if (_headerName === void 0) { _headerName = 'X-XSRF-TOKEN'; }
            this._cookieName = _cookieName;
            this._headerName = _headerName;
        }
        CookieXSRFStrategy.prototype.configureRequest = function (req) {
            var xsrfToken = _angular_platformBrowser.__platform_browser_private__.getDOM().getCookie(this._cookieName);
            if (xsrfToken) {
                req.headers.set(this._headerName, xsrfToken);
            }
        };
        return CookieXSRFStrategy;
    }());
    /**
     * Creates {@link XHRConnection} instances.
     *
     * This class would typically not be used by end users, but could be
     * overridden if a different backend implementation should be used,
     * such as in a node backend.
     *
     * ### Example
     *
     * ```
     * import {Http, MyNodeBackend, HTTP_PROVIDERS, BaseRequestOptions} from '@angular/http';
     * @Component({
     *   viewProviders: [
     *     HTTP_PROVIDERS,
     *     {provide: Http, useFactory: (backend, options) => {
     *       return new Http(backend, options);
     *     }, deps: [MyNodeBackend, BaseRequestOptions]}]
     * })
     * class MyComponent {
     *   constructor(http:Http) {
     *     http.request('people.json').subscribe(res => this.people = res.json());
     *   }
     * }
     * ```
     * @experimental
     */
    var XHRBackend = (function () {
        function XHRBackend(_browserXHR, _baseResponseOptions, _xsrfStrategy) {
            this._browserXHR = _browserXHR;
            this._baseResponseOptions = _baseResponseOptions;
            this._xsrfStrategy = _xsrfStrategy;
        }
        XHRBackend.prototype.createConnection = function (request) {
            this._xsrfStrategy.configureRequest(request);
            return new XHRConnection(request, this._browserXHR, this._baseResponseOptions);
        };
        XHRBackend.decorators = [
            { type: _angular_core.Injectable },
        ];
        /** @nocollapse */
        XHRBackend.ctorParameters = [
            { type: BrowserXhr, },
            { type: ResponseOptions, },
            { type: XSRFStrategy, },
        ];
        return XHRBackend;
    }());

    /**
     * @license
     * Copyright Google Inc. All Rights Reserved.
     *
     * Use of this source code is governed by an MIT-style license that can be
     * found in the LICENSE file at https://angular.io/license
     */
    var __extends$3 = (this && this.__extends) || function (d, b) {
        for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
    /**
     * Creates a request options object to be optionally provided when instantiating a
     * {@link Request}.
     *
     * This class is based on the `RequestInit` description in the [Fetch
     * Spec](https://fetch.spec.whatwg.org/#requestinit).
     *
     * All values are null by default. Typical defaults can be found in the {@link BaseRequestOptions}
     * class, which sub-classes `RequestOptions`.
     *
     * ### Example ([live demo](http://plnkr.co/edit/7Wvi3lfLq41aQPKlxB4O?p=preview))
     *
     * ```typescript
     * import {RequestOptions, Request, RequestMethod} from '@angular/http';
     *
     * var options = new RequestOptions({
     *   method: RequestMethod.Post,
     *   url: 'https://google.com'
     * });
     * var req = new Request(options);
     * console.log('req.method:', RequestMethod[req.method]); // Post
     * console.log('options.url:', options.url); // https://google.com
     * ```
     *
     * @experimental
     */
    var RequestOptions = (function () {
        function RequestOptions(_a) {
            var _b = _a === void 0 ? {} : _a, method = _b.method, headers = _b.headers, body = _b.body, url = _b.url, search = _b.search, withCredentials = _b.withCredentials, responseType = _b.responseType;
            this.method = isPresent(method) ? normalizeMethodName(method) : null;
            this.headers = isPresent(headers) ? headers : null;
            this.body = isPresent(body) ? body : null;
            this.url = isPresent(url) ? url : null;
            this.search = isPresent(search) ?
                (typeof search === 'string' ? new URLSearchParams((search)) :
                    (search)) :
                null;
            this.withCredentials = isPresent(withCredentials) ? withCredentials : null;
            this.responseType = isPresent(responseType) ? responseType : null;
        }
        /**
         * Creates a copy of the `RequestOptions` instance, using the optional input as values to override
         * existing values. This method will not change the values of the instance on which it is being
         * called.
         *
         * Note that `headers` and `search` will override existing values completely if present in
         * the `options` object. If these values should be merged, it should be done prior to calling
         * `merge` on the `RequestOptions` instance.
         *
         * ### Example ([live demo](http://plnkr.co/edit/6w8XA8YTkDRcPYpdB9dk?p=preview))
         *
         * ```typescript
         * import {RequestOptions, Request, RequestMethod} from '@angular/http';
         *
         * var options = new RequestOptions({
         *   method: RequestMethod.Post
         * });
         * var req = new Request(options.merge({
         *   url: 'https://google.com'
         * }));
         * console.log('req.method:', RequestMethod[req.method]); // Post
         * console.log('options.url:', options.url); // null
         * console.log('req.url:', req.url); // https://google.com
         * ```
         */
        RequestOptions.prototype.merge = function (options) {
            return new RequestOptions({
                method: options && isPresent(options.method) ? options.method : this.method,
                headers: options && isPresent(options.headers) ? options.headers : this.headers,
                body: options && isPresent(options.body) ? options.body : this.body,
                url: options && isPresent(options.url) ? options.url : this.url,
                search: options && isPresent(options.search) ?
                    (typeof options.search === 'string' ? new URLSearchParams(options.search) :
                        (options.search).clone()) :
                    this.search,
                withCredentials: options && isPresent(options.withCredentials) ? options.withCredentials :
                    this.withCredentials,
                responseType: options && isPresent(options.responseType) ? options.responseType :
                    this.responseType
            });
        };
        return RequestOptions;
    }());
    /**
     * Subclass of {@link RequestOptions}, with default values.
     *
     * Default values:
     *  * method: {@link RequestMethod RequestMethod.Get}
     *  * headers: empty {@link Headers} object
     *
     * This class could be extended and bound to the {@link RequestOptions} class
     * when configuring an {@link Injector}, in order to override the default options
     * used by {@link Http} to create and send {@link Request Requests}.
     *
     * ### Example ([live demo](http://plnkr.co/edit/LEKVSx?p=preview))
     *
     * ```typescript
     * import {provide} from '@angular/core';
     * import {bootstrap} from '@angular/platform-browser/browser';
     * import {HTTP_PROVIDERS, Http, BaseRequestOptions, RequestOptions} from '@angular/http';
     * import {App} from './myapp';
     *
     * class MyOptions extends BaseRequestOptions {
     *   search: string = 'coreTeam=true';
     * }
     *
     * bootstrap(App, [HTTP_PROVIDERS, {provide: RequestOptions, useClass: MyOptions}]);
     * ```
     *
     * The options could also be extended when manually creating a {@link Request}
     * object.
     *
     * ### Example ([live demo](http://plnkr.co/edit/oyBoEvNtDhOSfi9YxaVb?p=preview))
     *
     * ```
     * import {BaseRequestOptions, Request, RequestMethod} from '@angular/http';
     *
     * var options = new BaseRequestOptions();
     * var req = new Request(options.merge({
     *   method: RequestMethod.Post,
     *   url: 'https://google.com'
     * }));
     * console.log('req.method:', RequestMethod[req.method]); // Post
     * console.log('options.url:', options.url); // null
     * console.log('req.url:', req.url); // https://google.com
     * ```
     *
     * @experimental
     */
    var BaseRequestOptions = (function (_super) {
        __extends$3(BaseRequestOptions, _super);
        function BaseRequestOptions() {
            _super.call(this, { method: exports.RequestMethod.Get, headers: new Headers() });
        }
        BaseRequestOptions.decorators = [
            { type: _angular_core.Injectable },
        ];
        /** @nocollapse */
        BaseRequestOptions.ctorParameters = [];
        return BaseRequestOptions;
    }(RequestOptions));

    /**
     * @license
     * Copyright Google Inc. All Rights Reserved.
     *
     * Use of this source code is governed by an MIT-style license that can be
     * found in the LICENSE file at https://angular.io/license
     */
    var __extends$5 = (this && this.__extends) || function (d, b) {
        for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
    // TODO(jeffbcross): properly implement body accessors
    /**
     * Creates `Request` instances from provided values.
     *
     * The Request's interface is inspired by the Request constructor defined in the [Fetch
     * Spec](https://fetch.spec.whatwg.org/#request-class),
     * but is considered a static value whose body can be accessed many times. There are other
     * differences in the implementation, but this is the most significant.
     *
     * `Request` instances are typically created by higher-level classes, like {@link Http} and
     * {@link Jsonp}, but it may occasionally be useful to explicitly create `Request` instances.
     * One such example is when creating services that wrap higher-level services, like {@link Http},
     * where it may be useful to generate a `Request` with arbitrary headers and search params.
     *
     * ```typescript
     * import {Injectable, Injector} from '@angular/core';
     * import {HTTP_PROVIDERS, Http, Request, RequestMethod} from '@angular/http';
     *
     * @Injectable()
     * class AutoAuthenticator {
     *   constructor(public http:Http) {}
     *   request(url:string) {
     *     return this.http.request(new Request({
     *       method: RequestMethod.Get,
     *       url: url,
     *       search: 'password=123'
     *     }));
     *   }
     * }
     *
     * var injector = Injector.resolveAndCreate([HTTP_PROVIDERS, AutoAuthenticator]);
     * var authenticator = injector.get(AutoAuthenticator);
     * authenticator.request('people.json').subscribe(res => {
     *   //URL should have included '?password=123'
     *   console.log('people', res.json());
     * });
     * ```
     *
     * @experimental
     */
    var Request = (function (_super) {
        __extends$5(Request, _super);
        function Request(requestOptions) {
            _super.call(this);
            // TODO: assert that url is present
            var url = requestOptions.url;
            this.url = requestOptions.url;
            if (isPresent(requestOptions.search)) {
                var search = requestOptions.search.toString();
                if (search.length > 0) {
                    var prefix = '?';
                    if (this.url.indexOf('?') != -1) {
                        prefix = (this.url[this.url.length - 1] == '&') ? '' : '&';
                    }
                    // TODO: just delete search-query-looking string in url?
                    this.url = url + prefix + search;
                }
            }
            this._body = requestOptions.body;
            this.method = normalizeMethodName(requestOptions.method);
            // TODO(jeffbcross): implement behavior
            // Defaults to 'omit', consistent with browser
            // TODO(jeffbcross): implement behavior
            this.headers = new Headers(requestOptions.headers);
            this.contentType = this.detectContentType();
            this.withCredentials = requestOptions.withCredentials;
            this.responseType = requestOptions.responseType;
        }
        /**
         * Returns the content type enum based on header options.
         */
        Request.prototype.detectContentType = function () {
            switch (this.headers.get('content-type')) {
                case 'application/json':
                    return ContentType.JSON;
                case 'application/x-www-form-urlencoded':
                    return ContentType.FORM;
                case 'multipart/form-data':
                    return ContentType.FORM_DATA;
                case 'text/plain':
                case 'text/html':
                    return ContentType.TEXT;
                case 'application/octet-stream':
                    return ContentType.BLOB;
                default:
                    return this.detectContentTypeFromBody();
            }
        };
        /**
         * Returns the content type of request's body based on its type.
         */
        Request.prototype.detectContentTypeFromBody = function () {
            if (this._body == null) {
                return ContentType.NONE;
            }
            else if (this._body instanceof URLSearchParams) {
                return ContentType.FORM;
            }
            else if (this._body instanceof FormData) {
                return ContentType.FORM_DATA;
            }
            else if (this._body instanceof Blob$1) {
                return ContentType.BLOB;
            }
            else if (this._body instanceof ArrayBuffer$1) {
                return ContentType.ARRAY_BUFFER;
            }
            else if (this._body && typeof this._body == 'object') {
                return ContentType.JSON;
            }
            else {
                return ContentType.TEXT;
            }
        };
        /**
         * Returns the request's body according to its type. If body is undefined, return
         * null.
         */
        Request.prototype.getBody = function () {
            switch (this.contentType) {
                case ContentType.JSON:
                    return this.text();
                case ContentType.FORM:
                    return this.text();
                case ContentType.FORM_DATA:
                    return this._body;
                case ContentType.TEXT:
                    return this.text();
                case ContentType.BLOB:
                    return this.blob();
                case ContentType.ARRAY_BUFFER:
                    return this.arrayBuffer();
                default:
                    return null;
            }
        };
        return Request;
    }(Body));
    var noop = function () { };
    var w = typeof window == 'object' ? window : noop;
    var FormData = w['FormData'] || noop;
    var Blob$1 = w['Blob'] || noop;
    var ArrayBuffer$1 = w['ArrayBuffer'] || noop;

    /**
     * @license
     * Copyright Google Inc. All Rights Reserved.
     *
     * Use of this source code is governed by an MIT-style license that can be
     * found in the LICENSE file at https://angular.io/license
     */
    var __extends$4 = (this && this.__extends) || function (d, b) {
        for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
    function httpRequest(backend, request) {
        return backend.createConnection(request).response;
    }
    function mergeOptions(defaultOpts, providedOpts, method, url) {
        var newOptions = defaultOpts;
        if (isPresent(providedOpts)) {
            // Hack so Dart can used named parameters
            return newOptions.merge(new RequestOptions({
                method: providedOpts.method || method,
                url: providedOpts.url || url,
                search: providedOpts.search,
                headers: providedOpts.headers,
                body: providedOpts.body,
                withCredentials: providedOpts.withCredentials,
                responseType: providedOpts.responseType
            }));
        }
        if (isPresent(method)) {
            return newOptions.merge(new RequestOptions({ method: method, url: url }));
        }
        else {
            return newOptions.merge(new RequestOptions({ url: url }));
        }
    }
    /**
     * Performs http requests using `XMLHttpRequest` as the default backend.
     *
     * `Http` is available as an injectable class, with methods to perform http requests. Calling
     * `request` returns an `Observable` which will emit a single {@link Response} when a
     * response is received.
     *
     * ### Example
     *
     * ```typescript
     * import {Http, HTTP_PROVIDERS} from '@angular/http';
     * import 'rxjs/add/operator/map'
     * @Component({
     *   selector: 'http-app',
     *   viewProviders: [HTTP_PROVIDERS],
     *   templateUrl: 'people.html'
     * })
     * class PeopleComponent {
     *   constructor(http: Http) {
     *     http.get('people.json')
     *       // Call map on the response observable to get the parsed people object
     *       .map(res => res.json())
     *       // Subscribe to the observable to get the parsed people object and attach it to the
     *       // component
     *       .subscribe(people => this.people = people);
     *   }
     * }
     * ```
     *
     *
     * ### Example
     *
     * ```
     * http.get('people.json').subscribe((res:Response) => this.people = res.json());
     * ```
     *
     * The default construct used to perform requests, `XMLHttpRequest`, is abstracted as a "Backend" (
     * {@link XHRBackend} in this case), which could be mocked with dependency injection by replacing
     * the {@link XHRBackend} provider, as in the following example:
     *
     * ### Example
     *
     * ```typescript
     * import {BaseRequestOptions, Http} from '@angular/http';
     * import {MockBackend} from '@angular/http/testing';
     * var injector = Injector.resolveAndCreate([
     *   BaseRequestOptions,
     *   MockBackend,
     *   {provide: Http, useFactory:
     *       function(backend, defaultOptions) {
     *         return new Http(backend, defaultOptions);
     *       },
     *       deps: [MockBackend, BaseRequestOptions]}
     * ]);
     * var http = injector.get(Http);
     * http.get('request-from-mock-backend.json').subscribe((res:Response) => doSomething(res));
     * ```
     *
     * @experimental
     */
    var Http = (function () {
        function Http(_backend, _defaultOptions) {
            this._backend = _backend;
            this._defaultOptions = _defaultOptions;
        }
        /**
         * Performs any type of http request. First argument is required, and can either be a url or
         * a {@link Request} instance. If the first argument is a url, an optional {@link RequestOptions}
         * object can be provided as the 2nd argument. The options object will be merged with the values
         * of {@link BaseRequestOptions} before performing the request.
         */
        Http.prototype.request = function (url, options) {
            var responseObservable;
            if (typeof url === 'string') {
                responseObservable = httpRequest(this._backend, new Request(mergeOptions(this._defaultOptions, options, exports.RequestMethod.Get, url)));
            }
            else if (url instanceof Request) {
                responseObservable = httpRequest(this._backend, url);
            }
            else {
                throw new Error('First argument must be a url string or Request instance.');
            }
            return responseObservable;
        };
        /**
         * Performs a request with `get` http method.
         */
        Http.prototype.get = function (url, options) {
            return this.request(new Request(mergeOptions(this._defaultOptions, options, exports.RequestMethod.Get, url)));
        };
        /**
         * Performs a request with `post` http method.
         */
        Http.prototype.post = function (url, body, options) {
            return this.request(new Request(mergeOptions(this._defaultOptions.merge(new RequestOptions({ body: body })), options, exports.RequestMethod.Post, url)));
        };
        /**
         * Performs a request with `put` http method.
         */
        Http.prototype.put = function (url, body, options) {
            return this.request(new Request(mergeOptions(this._defaultOptions.merge(new RequestOptions({ body: body })), options, exports.RequestMethod.Put, url)));
        };
        /**
         * Performs a request with `delete` http method.
         */
        Http.prototype.delete = function (url, options) {
            return this.request(new Request(mergeOptions(this._defaultOptions, options, exports.RequestMethod.Delete, url)));
        };
        /**
         * Performs a request with `patch` http method.
         */
        Http.prototype.patch = function (url, body, options) {
            return this.request(new Request(mergeOptions(this._defaultOptions.merge(new RequestOptions({ body: body })), options, exports.RequestMethod.Patch, url)));
        };
        /**
         * Performs a request with `head` http method.
         */
        Http.prototype.head = function (url, options) {
            return this.request(new Request(mergeOptions(this._defaultOptions, options, exports.RequestMethod.Head, url)));
        };
        /**
         * Performs a request with `options` http method.
         */
        Http.prototype.options = function (url, options) {
            return this.request(new Request(mergeOptions(this._defaultOptions, options, exports.RequestMethod.Options, url)));
        };
        Http.decorators = [
            { type: _angular_core.Injectable },
        ];
        /** @nocollapse */
        Http.ctorParameters = [
            { type: ConnectionBackend, },
            { type: RequestOptions, },
        ];
        return Http;
    }());
    /**
     * @experimental
     */
    var Jsonp = (function (_super) {
        __extends$4(Jsonp, _super);
        function Jsonp(backend, defaultOptions) {
            _super.call(this, backend, defaultOptions);
        }
        /**
         * Performs any type of http request. First argument is required, and can either be a url or
         * a {@link Request} instance. If the first argument is a url, an optional {@link RequestOptions}
         * object can be provided as the 2nd argument. The options object will be merged with the values
         * of {@link BaseRequestOptions} before performing the request.
         *
         * @security Regular XHR is the safest alternative to JSONP for most applications, and is
         * supported by all current browsers. Because JSONP creates a `<script>` element with
         * contents retrieved from a remote source, attacker-controlled data introduced by an untrusted
         * source could expose your application to XSS risks. Data exposed by JSONP may also be
         * readable by malicious third-party websites. In addition, JSONP introduces potential risk for
         * future security issues (e.g. content sniffing).  For more detail, see the
         * [Security Guide](http://g.co/ng/security).
         */
        Jsonp.prototype.request = function (url, options) {
            var responseObservable;
            if (typeof url === 'string') {
                url =
                    new Request(mergeOptions(this._defaultOptions, options, exports.RequestMethod.Get, url));
            }
            if (url instanceof Request) {
                if (url.method !== exports.RequestMethod.Get) {
                    throw new Error('JSONP requests must use GET request method.');
                }
                responseObservable = httpRequest(this._backend, url);
            }
            else {
                throw new Error('First argument must be a url string or Request instance.');
            }
            return responseObservable;
        };
        Jsonp.decorators = [
            { type: _angular_core.Injectable },
        ];
        /** @nocollapse */
        Jsonp.ctorParameters = [
            { type: ConnectionBackend, },
            { type: RequestOptions, },
        ];
        return Jsonp;
    }(Http));

    function _createDefaultCookieXSRFStrategy() {
        return new CookieXSRFStrategy();
    }
    function httpFactory(xhrBackend, requestOptions) {
        return new Http(xhrBackend, requestOptions);
    }
    function jsonpFactory(jsonpBackend, requestOptions) {
        return new Jsonp(jsonpBackend, requestOptions);
    }
    /**
     * The module that includes http's providers
     *
     * @experimental
     */
    var HttpModule = (function () {
        function HttpModule() {
        }
        HttpModule.decorators = [
            { type: _angular_core.NgModule, args: [{
                        providers: [
                            // TODO(pascal): use factory type annotations once supported in DI
                            // issue: https://github.com/angular/angular/issues/3183
                            { provide: Http, useFactory: httpFactory, deps: [XHRBackend, RequestOptions] },
                            BrowserXhr,
                            { provide: RequestOptions, useClass: BaseRequestOptions },
                            { provide: ResponseOptions, useClass: BaseResponseOptions },
                            XHRBackend,
                            { provide: XSRFStrategy, useFactory: _createDefaultCookieXSRFStrategy },
                        ],
                    },] },
        ];
        /** @nocollapse */
        HttpModule.ctorParameters = [];
        return HttpModule;
    }());
    /**
     * The module that includes jsonp's providers
     *
     * @experimental
     */
    var JsonpModule = (function () {
        function JsonpModule() {
        }
        JsonpModule.decorators = [
            { type: _angular_core.NgModule, args: [{
                        providers: [
                            // TODO(pascal): use factory type annotations once supported in DI
                            // issue: https://github.com/angular/angular/issues/3183
                            { provide: Jsonp, useFactory: jsonpFactory, deps: [JSONPBackend, RequestOptions] },
                            BrowserJsonp,
                            { provide: RequestOptions, useClass: BaseRequestOptions },
                            { provide: ResponseOptions, useClass: BaseResponseOptions },
                            { provide: JSONPBackend, useClass: JSONPBackend_ },
                        ],
                    },] },
        ];
        /** @nocollapse */
        JsonpModule.ctorParameters = [];
        return JsonpModule;
    }());

    exports.BrowserXhr = BrowserXhr;
    exports.JSONPBackend = JSONPBackend;
    exports.JSONPConnection = JSONPConnection;
    exports.CookieXSRFStrategy = CookieXSRFStrategy;
    exports.XHRBackend = XHRBackend;
    exports.XHRConnection = XHRConnection;
    exports.BaseRequestOptions = BaseRequestOptions;
    exports.RequestOptions = RequestOptions;
    exports.BaseResponseOptions = BaseResponseOptions;
    exports.ResponseOptions = ResponseOptions;
    exports.Headers = Headers;
    exports.Http = Http;
    exports.Jsonp = Jsonp;
    exports.HttpModule = HttpModule;
    exports.JsonpModule = JsonpModule;
    exports.Connection = Connection;
    exports.ConnectionBackend = ConnectionBackend;
    exports.XSRFStrategy = XSRFStrategy;
    exports.Request = Request;
    exports.Response = Response;
    exports.QueryEncoder = QueryEncoder;
    exports.URLSearchParams = URLSearchParams;

}));
