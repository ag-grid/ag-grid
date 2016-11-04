/**
 * @license Angular v3.0.2
 * (c) 2010-2016 Google, Inc. https://angular.io/
 * License: MIT
 */
(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('@angular/common'), require('@angular/core'), require('rxjs/Subject'), require('rxjs/observable/from'), require('rxjs/observable/of'), require('rxjs/operator/every'), require('rxjs/operator/map'), require('rxjs/operator/mergeAll'), require('rxjs/operator/mergeMap'), require('rxjs/operator/reduce'), require('rxjs/Observable'), require('rxjs/operator/catch'), require('rxjs/operator/concatAll'), require('rxjs/operator/first'), require('rxjs/util/EmptyError'), require('rxjs/observable/fromPromise'), require('rxjs/operator/last'), require('rxjs/BehaviorSubject')) :
    typeof define === 'function' && define.amd ? define(['exports', '@angular/common', '@angular/core', 'rxjs/Subject', 'rxjs/observable/from', 'rxjs/observable/of', 'rxjs/operator/every', 'rxjs/operator/map', 'rxjs/operator/mergeAll', 'rxjs/operator/mergeMap', 'rxjs/operator/reduce', 'rxjs/Observable', 'rxjs/operator/catch', 'rxjs/operator/concatAll', 'rxjs/operator/first', 'rxjs/util/EmptyError', 'rxjs/observable/fromPromise', 'rxjs/operator/last', 'rxjs/BehaviorSubject'], factory) :
    (factory((global.ng = global.ng || {}, global.ng.router = global.ng.router || {}),global.ng.common,global.ng.core,global.Rx,global.Rx.Observable,global.Rx.Observable,global.Rx.Observable.prototype,global.Rx.Observable.prototype,global.Rx.Observable.prototype,global.Rx.Observable.prototype,global.Rx.Observable.prototype,global.Rx,global.Rx.Observable.prototype,global.Rx.Observable.prototype,global.Rx.Observable.prototype,global.Rx,global.Rx.Observable,global.Rx.Observable.prototype,global.Rx));
}(this, function (exports,_angular_common,_angular_core,rxjs_Subject,rxjs_observable_from,rxjs_observable_of,rxjs_operator_every,rxjs_operator_map,rxjs_operator_mergeAll,rxjs_operator_mergeMap,rxjs_operator_reduce,rxjs_Observable,rxjs_operator_catch,rxjs_operator_concatAll,rxjs_operator_first,rxjs_util_EmptyError,rxjs_observable_fromPromise,l,rxjs_BehaviorSubject) { 'use strict';

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
     * @whatItDoes Name of the primary outlet.
     *
     * @stable
     */
    var PRIMARY_OUTLET = 'primary';
    var NavigationCancelingError = (function (_super) {
        __extends(NavigationCancelingError, _super);
        function NavigationCancelingError(message) {
            _super.call(this, message);
            this.message = message;
            this.stack = (new Error(message)).stack;
        }
        NavigationCancelingError.prototype.toString = function () { return this.message; };
        return NavigationCancelingError;
    }(Error));

    function shallowEqualArrays(a, b) {
        if (a.length !== b.length)
            return false;
        for (var i = 0; i < a.length; ++i) {
            if (!shallowEqual(a[i], b[i]))
                return false;
        }
        return true;
    }
    function shallowEqual(a, b) {
        var k1 = Object.keys(a);
        var k2 = Object.keys(b);
        if (k1.length != k2.length) {
            return false;
        }
        var key;
        for (var i = 0; i < k1.length; i++) {
            key = k1[i];
            if (a[key] !== b[key]) {
                return false;
            }
        }
        return true;
    }
    function flatten(a) {
        var target = [];
        for (var i = 0; i < a.length; ++i) {
            for (var j = 0; j < a[i].length; ++j) {
                target.push(a[i][j]);
            }
        }
        return target;
    }
    function last(a) {
        return a.length > 0 ? a[a.length - 1] : null;
    }
    function merge(m1, m2) {
        var m = {};
        for (var attr in m1) {
            if (m1.hasOwnProperty(attr)) {
                m[attr] = m1[attr];
            }
        }
        for (var attr in m2) {
            if (m2.hasOwnProperty(attr)) {
                m[attr] = m2[attr];
            }
        }
        return m;
    }
    function forEach(map, callback) {
        for (var prop in map) {
            if (map.hasOwnProperty(prop)) {
                callback(map[prop], prop);
            }
        }
    }
    function waitForMap(obj, fn) {
        var waitFor = [];
        var res = {};
        forEach(obj, function (a, k) {
            if (k === PRIMARY_OUTLET) {
                waitFor.push(rxjs_operator_map.map.call(fn(k, a), function (_) {
                    res[k] = _;
                    return _;
                }));
            }
        });
        forEach(obj, function (a, k) {
            if (k !== PRIMARY_OUTLET) {
                waitFor.push(rxjs_operator_map.map.call(fn(k, a), function (_) {
                    res[k] = _;
                    return _;
                }));
            }
        });
        if (waitFor.length > 0) {
            var concatted$ = rxjs_operator_concatAll.concatAll.call(rxjs_observable_of.of.apply(void 0, waitFor));
            var last$ = l.last.call(concatted$);
            return rxjs_operator_map.map.call(last$, function () { return res; });
        }
        else {
            return rxjs_observable_of.of(res);
        }
    }
    function andObservables(observables) {
        var merged$ = rxjs_operator_mergeAll.mergeAll.call(observables);
        return rxjs_operator_every.every.call(merged$, function (result) { return result === true; });
    }
    function wrapIntoObservable(value) {
        if (value instanceof rxjs_Observable.Observable) {
            return value;
        }
        else if (value instanceof Promise) {
            return rxjs_observable_fromPromise.fromPromise(value);
        }
        else {
            return rxjs_observable_of.of(value);
        }
    }

    /**
     * @experimental
     */
    var ROUTES = new _angular_core.OpaqueToken('ROUTES');
    var LoadedRouterConfig = (function () {
        function LoadedRouterConfig(routes, injector, factoryResolver) {
            this.routes = routes;
            this.injector = injector;
            this.factoryResolver = factoryResolver;
        }
        return LoadedRouterConfig;
    }());
    var RouterConfigLoader = (function () {
        function RouterConfigLoader(loader, compiler) {
            this.loader = loader;
            this.compiler = compiler;
        }
        RouterConfigLoader.prototype.load = function (parentInjector, loadChildren) {
            return rxjs_operator_map.map.call(this.loadModuleFactory(loadChildren), function (r) {
                var ref = r.create(parentInjector);
                return new LoadedRouterConfig(flatten(ref.injector.get(ROUTES)), ref.injector, ref.componentFactoryResolver);
            });
        };
        RouterConfigLoader.prototype.loadModuleFactory = function (loadChildren) {
            var _this = this;
            if (typeof loadChildren === 'string') {
                return rxjs_observable_fromPromise.fromPromise(this.loader.load(loadChildren));
            }
            else {
                var offlineMode_1 = this.compiler instanceof _angular_core.Compiler;
                return rxjs_operator_mergeMap.mergeMap.call(wrapIntoObservable(loadChildren()), function (t) { return offlineMode_1 ? rxjs_observable_of.of(t) : rxjs_observable_fromPromise.fromPromise(_this.compiler.compileModuleAsync(t)); });
            }
        };
        return RouterConfigLoader;
    }());

    function createEmptyUrlTree() {
        return new UrlTree(new UrlSegmentGroup([], {}), {}, null);
    }
    function containsTree(container, containee, exact) {
        if (exact) {
            return equalSegmentGroups(container.root, containee.root);
        }
        else {
            return containsSegmentGroup(container.root, containee.root);
        }
    }
    function equalSegmentGroups(container, containee) {
        if (!equalPath(container.segments, containee.segments))
            return false;
        if (container.numberOfChildren !== containee.numberOfChildren)
            return false;
        for (var c in containee.children) {
            if (!container.children[c])
                return false;
            if (!equalSegmentGroups(container.children[c], containee.children[c]))
                return false;
        }
        return true;
    }
    function containsSegmentGroup(container, containee) {
        return containsSegmentGroupHelper(container, containee, containee.segments);
    }
    function containsSegmentGroupHelper(container, containee, containeePaths) {
        if (container.segments.length > containeePaths.length) {
            var current = container.segments.slice(0, containeePaths.length);
            if (!equalPath(current, containeePaths))
                return false;
            if (containee.hasChildren())
                return false;
            return true;
        }
        else if (container.segments.length === containeePaths.length) {
            if (!equalPath(container.segments, containeePaths))
                return false;
            for (var c in containee.children) {
                if (!container.children[c])
                    return false;
                if (!containsSegmentGroup(container.children[c], containee.children[c]))
                    return false;
            }
            return true;
        }
        else {
            var current = containeePaths.slice(0, container.segments.length);
            var next = containeePaths.slice(container.segments.length);
            if (!equalPath(container.segments, current))
                return false;
            if (!container.children[PRIMARY_OUTLET])
                return false;
            return containsSegmentGroupHelper(container.children[PRIMARY_OUTLET], containee, next);
        }
    }
    /**
     * @whatItDoes Represents the parsed URL.
     *
     * @howToUse
     *
     * ```
     * @Component({templateUrl:'template.html'})
     * class MyComponent {
     *   constructor(router: Router) {
     *     const tree: UrlTree =
     * router.parseUrl('/team/33/(user/victor//support:help)?debug=true#fragment');
     *     const f = tree.fragment; // return 'fragment'
     *     const q = tree.queryParams; // returns {debug: 'true'}
     *     const g: UrlSegmentGroup = tree.root.children[PRIMARY_OUTLET];
     *     const s: UrlSegment[] = g.segments; // returns 2 segments 'team' and '33'
     *     g.children[PRIMARY_OUTLET].segments; // returns 2 segments 'user' and 'victor'
     *     g.children['support'].segments; // return 1 segment 'help'
     *   }
     * }
     * ```
     *
     * @description
     *
     * Since a router state is a tree, and the URL is nothing but a serialized state, the URL is a
     * serialized tree.
     * UrlTree is a data structure that provides a lot of affordances in dealing with URLs
     *
     * @stable
     */
    var UrlTree = (function () {
        /**
         * @internal
         */
        function UrlTree(
            /**
            * The root segment group of the URL tree.
             */
            root,
            /**
             * The query params of the URL.
             */
            queryParams,
            /**
             * The fragment of the URL.
             */
            fragment) {
            this.root = root;
            this.queryParams = queryParams;
            this.fragment = fragment;
        }
        /**
         * @docsNotRequired
         */
        UrlTree.prototype.toString = function () { return new DefaultUrlSerializer().serialize(this); };
        return UrlTree;
    }());
    /**
     * @whatItDoes Represents the parsed URL segment.
     *
     * See {@link UrlTree} for more information.
     *
     * @stable
     */
    var UrlSegmentGroup = (function () {
        function UrlSegmentGroup(
            /**
             * The URL segments of this group. See {@link UrlSegment} for more information.
             */
            segments,
            /**
             * The list of children of this group.
             */
            children) {
            var _this = this;
            this.segments = segments;
            this.children = children;
            /**
             * The parent node in the url tree.
             */
            this.parent = null;
            forEach(children, function (v, k) { return v.parent = _this; });
        }
        /**
         * Return true if the segment has child segments
         */
        UrlSegmentGroup.prototype.hasChildren = function () { return this.numberOfChildren > 0; };
        Object.defineProperty(UrlSegmentGroup.prototype, "numberOfChildren", {
            /**
             * Returns the number of child sements.
             */
            get: function () { return Object.keys(this.children).length; },
            enumerable: true,
            configurable: true
        });
        /**
         * @docsNotRequired
         */
        UrlSegmentGroup.prototype.toString = function () { return serializePaths(this); };
        return UrlSegmentGroup;
    }());
    /**
     * @whatItDoes Represents a single URL segment.
     *
     * @howToUse
     *
     * ```
     * @Component({templateUrl:'template.html'})
     * class MyComponent {
     *   constructor(router: Router) {
     *     const tree: UrlTree = router.parseUrl('/team;id=33');
     *     const g: UrlSegmentGroup = tree.root.children[PRIMARY_OUTLET];
     *     const s: UrlSegment[] = g.segments;
     *     s[0].path; // returns 'team'
     *     s[0].parameters; // returns {id: 33}
     *   }
     * }
     * ```
     *
     * @description
     *
     * A UrlSegment is a part of a URL between the two slashes. It contains a path and
     * the matrix parameters associated with the segment.
     *
     * @stable
     */
    var UrlSegment = (function () {
        function UrlSegment(
            /**
             * The part part of a URL segment.
             */
            path,
            /**
             * The matrix parameters associated with a segment.
             */
            parameters) {
            this.path = path;
            this.parameters = parameters;
        }
        /**
         * @docsNotRequired
         */
        UrlSegment.prototype.toString = function () { return serializePath(this); };
        return UrlSegment;
    }());
    function equalPath(a, b) {
        if (a.length !== b.length)
            return false;
        for (var i = 0; i < a.length; ++i) {
            if (a[i].path !== b[i].path)
                return false;
        }
        return true;
    }
    function mapChildrenIntoArray(segment, fn) {
        var res = [];
        forEach(segment.children, function (child, childOutlet) {
            if (childOutlet === PRIMARY_OUTLET) {
                res = res.concat(fn(child, childOutlet));
            }
        });
        forEach(segment.children, function (child, childOutlet) {
            if (childOutlet !== PRIMARY_OUTLET) {
                res = res.concat(fn(child, childOutlet));
            }
        });
        return res;
    }
    /**
     * @whatItDoes Serializes and deserializes a URL string into a URL tree.
     *
     * @description The url serialization strategy is customizable. You can
     * make all URLs case insensitive by providing a custom UrlSerializer.
     *
     * See {@link DefaultUrlSerializer} for an example of a URL serializer.
     *
     * @stable
     */
    var UrlSerializer = (function () {
        function UrlSerializer() {
        }
        return UrlSerializer;
    }());
    /**
     * @whatItDoes A default implementation of the {@link UrlSerializer}.
     *
     * @description
     *
     * Example URLs:
     *
     * ```
     * /inbox/33(popup:compose)
     * /inbox/33;open=true/messages/44
     * ```
     *
     * DefaultUrlSerializer uses parentheses to serialize secondary segments (e.g., popup:compose), the
     * colon syntax to specify the outlet, and the ';parameter=value' syntax (e.g., open=true) to
     * specify route specific parameters.
     *
     * @stable
     */
    var DefaultUrlSerializer = (function () {
        function DefaultUrlSerializer() {
        }
        /**
         * Parse a url into a {@link UrlTree}.
         */
        DefaultUrlSerializer.prototype.parse = function (url) {
            var p = new UrlParser(url);
            return new UrlTree(p.parseRootSegment(), p.parseQueryParams(), p.parseFragment());
        };
        /**
         * Converts a {@link UrlTree} into a url.
         */
        DefaultUrlSerializer.prototype.serialize = function (tree) {
            var segment = "/" + serializeSegment(tree.root, true);
            var query = serializeQueryParams(tree.queryParams);
            var fragment = tree.fragment !== null && tree.fragment !== undefined ? "#" + encodeURI(tree.fragment) : '';
            return "" + segment + query + fragment;
        };
        return DefaultUrlSerializer;
    }());
    function serializePaths(segment) {
        return segment.segments.map(function (p) { return serializePath(p); }).join('/');
    }
    function serializeSegment(segment, root) {
        if (segment.hasChildren() && root) {
            var primary = segment.children[PRIMARY_OUTLET] ?
                serializeSegment(segment.children[PRIMARY_OUTLET], false) :
                '';
            var children_1 = [];
            forEach(segment.children, function (v, k) {
                if (k !== PRIMARY_OUTLET) {
                    children_1.push(k + ":" + serializeSegment(v, false));
                }
            });
            if (children_1.length > 0) {
                return primary + "(" + children_1.join('//') + ")";
            }
            else {
                return "" + primary;
            }
        }
        else if (segment.hasChildren() && !root) {
            var children = mapChildrenIntoArray(segment, function (v, k) {
                if (k === PRIMARY_OUTLET) {
                    return [serializeSegment(segment.children[PRIMARY_OUTLET], false)];
                }
                else {
                    return [(k + ":" + serializeSegment(v, false))];
                }
            });
            return serializePaths(segment) + "/(" + children.join('//') + ")";
        }
        else {
            return serializePaths(segment);
        }
    }
    function encode(s) {
        return encodeURIComponent(s);
    }
    function decode(s) {
        return decodeURIComponent(s);
    }
    function serializePath(path) {
        return "" + encode(path.path) + serializeParams(path.parameters);
    }
    function serializeParams(params) {
        return pairs(params).map(function (p) { return (";" + encode(p.first) + "=" + encode(p.second)); }).join('');
    }
    function serializeQueryParams(params) {
        var strs = pairs(params).map(function (p) { return (encode(p.first) + "=" + encode(p.second)); });
        return strs.length > 0 ? "?" + strs.join("&") : '';
    }
    var Pair = (function () {
        function Pair(first, second) {
            this.first = first;
            this.second = second;
        }
        return Pair;
    }());
    function pairs(obj) {
        var res = [];
        for (var prop in obj) {
            if (obj.hasOwnProperty(prop)) {
                res.push(new Pair(prop, obj[prop]));
            }
        }
        return res;
    }
    var SEGMENT_RE = /^[^\/\(\)\?;=&#]+/;
    function matchSegments(str) {
        SEGMENT_RE.lastIndex = 0;
        var match = str.match(SEGMENT_RE);
        return match ? match[0] : '';
    }
    var QUERY_PARAM_RE = /^[^=\?&#]+/;
    function matchQueryParams(str) {
        QUERY_PARAM_RE.lastIndex = 0;
        var match = str.match(SEGMENT_RE);
        return match ? match[0] : '';
    }
    var QUERY_PARAM_VALUE_RE = /^[^\?&#]+/;
    function matchUrlQueryParamValue(str) {
        QUERY_PARAM_VALUE_RE.lastIndex = 0;
        var match = str.match(QUERY_PARAM_VALUE_RE);
        return match ? match[0] : '';
    }
    var UrlParser = (function () {
        function UrlParser(url) {
            this.url = url;
            this.remaining = url;
        }
        UrlParser.prototype.peekStartsWith = function (str) { return this.remaining.startsWith(str); };
        UrlParser.prototype.capture = function (str) {
            if (!this.remaining.startsWith(str)) {
                throw new Error("Expected \"" + str + "\".");
            }
            this.remaining = this.remaining.substring(str.length);
        };
        UrlParser.prototype.parseRootSegment = function () {
            if (this.remaining.startsWith('/')) {
                this.capture('/');
            }
            if (this.remaining === '' || this.remaining.startsWith('?') || this.remaining.startsWith('#')) {
                return new UrlSegmentGroup([], {});
            }
            else {
                return new UrlSegmentGroup([], this.parseChildren());
            }
        };
        UrlParser.prototype.parseChildren = function () {
            if (this.remaining.length == 0) {
                return {};
            }
            if (this.peekStartsWith('/')) {
                this.capture('/');
            }
            var paths = [];
            if (!this.peekStartsWith('(')) {
                paths.push(this.parseSegments());
            }
            while (this.peekStartsWith('/') && !this.peekStartsWith('//') && !this.peekStartsWith('/(')) {
                this.capture('/');
                paths.push(this.parseSegments());
            }
            var children = {};
            if (this.peekStartsWith('/(')) {
                this.capture('/');
                children = this.parseParens(true);
            }
            var res = {};
            if (this.peekStartsWith('(')) {
                res = this.parseParens(false);
            }
            if (paths.length > 0 || Object.keys(children).length > 0) {
                res[PRIMARY_OUTLET] = new UrlSegmentGroup(paths, children);
            }
            return res;
        };
        UrlParser.prototype.parseSegments = function () {
            var path = matchSegments(this.remaining);
            if (path === '' && this.peekStartsWith(';')) {
                throw new Error("Empty path url segment cannot have parameters: '" + this.remaining + "'.");
            }
            this.capture(path);
            var matrixParams = {};
            if (this.peekStartsWith(';')) {
                matrixParams = this.parseMatrixParams();
            }
            return new UrlSegment(decode(path), matrixParams);
        };
        UrlParser.prototype.parseQueryParams = function () {
            var params = {};
            if (this.peekStartsWith('?')) {
                this.capture('?');
                this.parseQueryParam(params);
                while (this.remaining.length > 0 && this.peekStartsWith('&')) {
                    this.capture('&');
                    this.parseQueryParam(params);
                }
            }
            return params;
        };
        UrlParser.prototype.parseFragment = function () {
            if (this.peekStartsWith('#')) {
                return decodeURI(this.remaining.substring(1));
            }
            else {
                return null;
            }
        };
        UrlParser.prototype.parseMatrixParams = function () {
            var params = {};
            while (this.remaining.length > 0 && this.peekStartsWith(';')) {
                this.capture(';');
                this.parseParam(params);
            }
            return params;
        };
        UrlParser.prototype.parseParam = function (params) {
            var key = matchSegments(this.remaining);
            if (!key) {
                return;
            }
            this.capture(key);
            var value = '';
            if (this.peekStartsWith('=')) {
                this.capture('=');
                var valueMatch = matchSegments(this.remaining);
                if (valueMatch) {
                    value = valueMatch;
                    this.capture(value);
                }
            }
            params[decode(key)] = decode(value);
        };
        UrlParser.prototype.parseQueryParam = function (params) {
            var key = matchQueryParams(this.remaining);
            if (!key) {
                return;
            }
            this.capture(key);
            var value = '';
            if (this.peekStartsWith('=')) {
                this.capture('=');
                var valueMatch = matchUrlQueryParamValue(this.remaining);
                if (valueMatch) {
                    value = valueMatch;
                    this.capture(value);
                }
            }
            params[decode(key)] = decode(value);
        };
        UrlParser.prototype.parseParens = function (allowPrimary) {
            var segments = {};
            this.capture('(');
            while (!this.peekStartsWith(')') && this.remaining.length > 0) {
                var path = matchSegments(this.remaining);
                var next = this.remaining[path.length];
                // if is is not one of these characters, then the segment was unescaped
                // or the group was not closed
                if (next !== '/' && next !== ')' && next !== ';') {
                    throw new Error("Cannot parse url '" + this.url + "'");
                }
                var outletName = void 0;
                if (path.indexOf(':') > -1) {
                    outletName = path.substr(0, path.indexOf(':'));
                    this.capture(outletName);
                    this.capture(':');
                }
                else if (allowPrimary) {
                    outletName = PRIMARY_OUTLET;
                }
                var children = this.parseChildren();
                segments[outletName] = Object.keys(children).length === 1 ? children[PRIMARY_OUTLET] :
                    new UrlSegmentGroup([], children);
                if (this.peekStartsWith('//')) {
                    this.capture('//');
                }
            }
            this.capture(')');
            return segments;
        };
        return UrlParser;
    }());

    var NoMatch = (function () {
        function NoMatch(segmentGroup) {
            if (segmentGroup === void 0) { segmentGroup = null; }
            this.segmentGroup = segmentGroup;
        }
        return NoMatch;
    }());
    var AbsoluteRedirect = (function () {
        function AbsoluteRedirect(segments) {
            this.segments = segments;
        }
        return AbsoluteRedirect;
    }());
    function noMatch(segmentGroup) {
        return new rxjs_Observable.Observable(function (obs) { return obs.error(new NoMatch(segmentGroup)); });
    }
    function absoluteRedirect(segments) {
        return new rxjs_Observable.Observable(function (obs) { return obs.error(new AbsoluteRedirect(segments)); });
    }
    function canLoadFails(route) {
        return new rxjs_Observable.Observable(function (obs) { return obs.error(new NavigationCancelingError("Cannot load children because the guard of the route \"path: '" + route.path + "'\" returned false")); });
    }
    function applyRedirects(injector, configLoader, urlTree, config) {
        return new ApplyRedirects(injector, configLoader, urlTree, config).apply();
    }
    var ApplyRedirects = (function () {
        function ApplyRedirects(injector, configLoader, urlTree, config) {
            this.injector = injector;
            this.configLoader = configLoader;
            this.urlTree = urlTree;
            this.config = config;
            this.allowRedirects = true;
        }
        ApplyRedirects.prototype.apply = function () {
            var _this = this;
            var expanded$ = this.expandSegmentGroup(this.injector, this.config, this.urlTree.root, PRIMARY_OUTLET);
            var urlTrees$ = rxjs_operator_map.map.call(expanded$, function (rootSegmentGroup) { return _this.createUrlTree(rootSegmentGroup); });
            return rxjs_operator_catch._catch.call(urlTrees$, function (e) {
                if (e instanceof AbsoluteRedirect) {
                    // after an absolute redirect we do not apply any more redirects!
                    _this.allowRedirects = false;
                    var group = new UrlSegmentGroup([], (_a = {}, _a[PRIMARY_OUTLET] = new UrlSegmentGroup(e.segments, {}), _a));
                    // we need to run matching, so we can fetch all lazy-loaded modules
                    return _this.match(group);
                }
                else if (e instanceof NoMatch) {
                    throw _this.noMatchError(e);
                }
                else {
                    throw e;
                }
                var _a;
            });
        };
        ApplyRedirects.prototype.match = function (segmentGroup) {
            var _this = this;
            var expanded$ = this.expandSegmentGroup(this.injector, this.config, segmentGroup, PRIMARY_OUTLET);
            var mapped$ = rxjs_operator_map.map.call(expanded$, function (rootSegmentGroup) { return _this.createUrlTree(rootSegmentGroup); });
            return rxjs_operator_catch._catch.call(mapped$, function (e) {
                if (e instanceof NoMatch) {
                    throw _this.noMatchError(e);
                }
                else {
                    throw e;
                }
            });
        };
        ApplyRedirects.prototype.noMatchError = function (e) {
            return new Error("Cannot match any routes: '" + e.segmentGroup + "'");
        };
        ApplyRedirects.prototype.createUrlTree = function (rootCandidate) {
            var root = rootCandidate.segments.length > 0 ?
                new UrlSegmentGroup([], (_a = {}, _a[PRIMARY_OUTLET] = rootCandidate, _a)) :
                rootCandidate;
            return new UrlTree(root, this.urlTree.queryParams, this.urlTree.fragment);
            var _a;
        };
        ApplyRedirects.prototype.expandSegmentGroup = function (injector, routes, segmentGroup, outlet) {
            if (segmentGroup.segments.length === 0 && segmentGroup.hasChildren()) {
                return rxjs_operator_map.map.call(this.expandChildren(injector, routes, segmentGroup), function (children) { return new UrlSegmentGroup([], children); });
            }
            else {
                return this.expandSegment(injector, segmentGroup, routes, segmentGroup.segments, outlet, true);
            }
        };
        ApplyRedirects.prototype.expandChildren = function (injector, routes, segmentGroup) {
            var _this = this;
            return waitForMap(segmentGroup.children, function (childOutlet, child) { return _this.expandSegmentGroup(injector, routes, child, childOutlet); });
        };
        ApplyRedirects.prototype.expandSegment = function (injector, segmentGroup, routes, segments, outlet, allowRedirects) {
            var _this = this;
            var routes$ = rxjs_observable_of.of.apply(void 0, routes);
            var processedRoutes$ = rxjs_operator_map.map.call(routes$, function (r) {
                var expanded$ = _this.expandSegmentAgainstRoute(injector, segmentGroup, routes, r, segments, outlet, allowRedirects);
                return rxjs_operator_catch._catch.call(expanded$, function (e) {
                    if (e instanceof NoMatch)
                        return rxjs_observable_of.of(null);
                    else
                        throw e;
                });
            });
            var concattedProcessedRoutes$ = rxjs_operator_concatAll.concatAll.call(processedRoutes$);
            var first$ = rxjs_operator_first.first.call(concattedProcessedRoutes$, function (s) { return !!s; });
            return rxjs_operator_catch._catch.call(first$, function (e, _) {
                if (e instanceof rxjs_util_EmptyError.EmptyError) {
                    throw new NoMatch(segmentGroup);
                }
                else {
                    throw e;
                }
            });
        };
        ApplyRedirects.prototype.expandSegmentAgainstRoute = function (injector, segmentGroup, routes, route, paths, outlet, allowRedirects) {
            if (getOutlet$1(route) !== outlet)
                return noMatch(segmentGroup);
            if (route.redirectTo !== undefined && !(allowRedirects && this.allowRedirects))
                return noMatch(segmentGroup);
            if (route.redirectTo === undefined) {
                return this.matchSegmentAgainstRoute(injector, segmentGroup, route, paths);
            }
            else {
                return this.expandSegmentAgainstRouteUsingRedirect(injector, segmentGroup, routes, route, paths, outlet);
            }
        };
        ApplyRedirects.prototype.expandSegmentAgainstRouteUsingRedirect = function (injector, segmentGroup, routes, route, segments, outlet) {
            if (route.path === '**') {
                return this.expandWildCardWithParamsAgainstRouteUsingRedirect(route);
            }
            else {
                return this.expandRegularSegmentAgainstRouteUsingRedirect(injector, segmentGroup, routes, route, segments, outlet);
            }
        };
        ApplyRedirects.prototype.expandWildCardWithParamsAgainstRouteUsingRedirect = function (route) {
            var newSegments = applyRedirectCommands([], route.redirectTo, {});
            if (route.redirectTo.startsWith('/')) {
                return absoluteRedirect(newSegments);
            }
            else {
                return rxjs_observable_of.of(new UrlSegmentGroup(newSegments, {}));
            }
        };
        ApplyRedirects.prototype.expandRegularSegmentAgainstRouteUsingRedirect = function (injector, segmentGroup, routes, route, segments, outlet) {
            var _a = match(segmentGroup, route, segments), matched = _a.matched, consumedSegments = _a.consumedSegments, lastChild = _a.lastChild, positionalParamSegments = _a.positionalParamSegments;
            if (!matched)
                return noMatch(segmentGroup);
            var newSegments = applyRedirectCommands(consumedSegments, route.redirectTo, positionalParamSegments);
            if (route.redirectTo.startsWith('/')) {
                return absoluteRedirect(newSegments);
            }
            else {
                return this.expandSegment(injector, segmentGroup, routes, newSegments.concat(segments.slice(lastChild)), outlet, false);
            }
        };
        ApplyRedirects.prototype.matchSegmentAgainstRoute = function (injector, rawSegmentGroup, route, segments) {
            var _this = this;
            if (route.path === '**') {
                return rxjs_observable_of.of(new UrlSegmentGroup(segments, {}));
            }
            else {
                var _a = match(rawSegmentGroup, route, segments), matched = _a.matched, consumedSegments_1 = _a.consumedSegments, lastChild = _a.lastChild;
                if (!matched)
                    return noMatch(rawSegmentGroup);
                var rawSlicedSegments_1 = segments.slice(lastChild);
                var childConfig$ = this.getChildConfig(injector, route);
                return rxjs_operator_mergeMap.mergeMap.call(childConfig$, function (routerConfig) {
                    var childInjector = routerConfig.injector;
                    var childConfig = routerConfig.routes;
                    var _a = split(rawSegmentGroup, consumedSegments_1, rawSlicedSegments_1, childConfig), segmentGroup = _a.segmentGroup, slicedSegments = _a.slicedSegments;
                    if (slicedSegments.length === 0 && segmentGroup.hasChildren()) {
                        var expanded$ = _this.expandChildren(childInjector, childConfig, segmentGroup);
                        return rxjs_operator_map.map.call(expanded$, function (children) { return new UrlSegmentGroup(consumedSegments_1, children); });
                    }
                    else if (childConfig.length === 0 && slicedSegments.length === 0) {
                        return rxjs_observable_of.of(new UrlSegmentGroup(consumedSegments_1, {}));
                    }
                    else {
                        var expanded$ = _this.expandSegment(childInjector, segmentGroup, childConfig, slicedSegments, PRIMARY_OUTLET, true);
                        return rxjs_operator_map.map.call(expanded$, function (cs) { return new UrlSegmentGroup(consumedSegments_1.concat(cs.segments), cs.children); });
                    }
                });
            }
        };
        ApplyRedirects.prototype.getChildConfig = function (injector, route) {
            var _this = this;
            if (route.children) {
                return rxjs_observable_of.of(new LoadedRouterConfig(route.children, injector, null));
            }
            else if (route.loadChildren) {
                return rxjs_operator_mergeMap.mergeMap.call(runGuards(injector, route), function (shouldLoad) {
                    if (shouldLoad) {
                        if (route._loadedConfig) {
                            return rxjs_observable_of.of(route._loadedConfig);
                        }
                        else {
                            return rxjs_operator_map.map.call(_this.configLoader.load(injector, route.loadChildren), function (r) {
                                route._loadedConfig = r;
                                return r;
                            });
                        }
                    }
                    else {
                        return canLoadFails(route);
                    }
                });
            }
            else {
                return rxjs_observable_of.of(new LoadedRouterConfig([], injector, null));
            }
        };
        return ApplyRedirects;
    }());
    function runGuards(injector, route) {
        var canLoad = route.canLoad;
        if (!canLoad || canLoad.length === 0)
            return rxjs_observable_of.of(true);
        var obs = rxjs_operator_map.map.call(rxjs_observable_from.from(canLoad), function (c) {
            var guard = injector.get(c);
            if (guard.canLoad) {
                return wrapIntoObservable(guard.canLoad(route));
            }
            else {
                return wrapIntoObservable(guard(route));
            }
        });
        return andObservables(obs);
    }
    function match(segmentGroup, route, segments) {
        var noMatch = { matched: false, consumedSegments: [], lastChild: 0, positionalParamSegments: {} };
        if (route.path === '') {
            if ((route.pathMatch === 'full') && (segmentGroup.hasChildren() || segments.length > 0)) {
                return { matched: false, consumedSegments: [], lastChild: 0, positionalParamSegments: {} };
            }
            else {
                return { matched: true, consumedSegments: [], lastChild: 0, positionalParamSegments: {} };
            }
        }
        var path = route.path;
        var parts = path.split('/');
        var positionalParamSegments = {};
        var consumedSegments = [];
        var currentIndex = 0;
        for (var i = 0; i < parts.length; ++i) {
            if (currentIndex >= segments.length)
                return noMatch;
            var current = segments[currentIndex];
            var p = parts[i];
            var isPosParam = p.startsWith(':');
            if (!isPosParam && p !== current.path)
                return noMatch;
            if (isPosParam) {
                positionalParamSegments[p.substring(1)] = current;
            }
            consumedSegments.push(current);
            currentIndex++;
        }
        if (route.pathMatch === 'full' &&
            (segmentGroup.hasChildren() || currentIndex < segments.length)) {
            return { matched: false, consumedSegments: [], lastChild: 0, positionalParamSegments: {} };
        }
        return { matched: true, consumedSegments: consumedSegments, lastChild: currentIndex, positionalParamSegments: positionalParamSegments };
    }
    function applyRedirectCommands(segments, redirectTo, posParams) {
        var r = redirectTo.startsWith('/') ? redirectTo.substring(1) : redirectTo;
        if (r === '') {
            return [];
        }
        else {
            return createSegments(redirectTo, r.split('/'), segments, posParams);
        }
    }
    function createSegments(redirectTo, parts, segments, posParams) {
        return parts.map(function (p) { return p.startsWith(':') ? findPosParam(p, posParams, redirectTo) :
            findOrCreateSegment(p, segments); });
    }
    function findPosParam(part, posParams, redirectTo) {
        var paramName = part.substring(1);
        var pos = posParams[paramName];
        if (!pos)
            throw new Error("Cannot redirect to '" + redirectTo + "'. Cannot find '" + part + "'.");
        return pos;
    }
    function findOrCreateSegment(part, segments) {
        var idx = 0;
        for (var _i = 0, segments_1 = segments; _i < segments_1.length; _i++) {
            var s = segments_1[_i];
            if (s.path === part) {
                segments.splice(idx);
                return s;
            }
            idx++;
        }
        return new UrlSegment(part, {});
    }
    function split(segmentGroup, consumedSegments, slicedSegments, config) {
        if (slicedSegments.length > 0 &&
            containsEmptyPathRedirectsWithNamedOutlets(segmentGroup, slicedSegments, config)) {
            var s = new UrlSegmentGroup(consumedSegments, createChildrenForEmptySegments(config, new UrlSegmentGroup(slicedSegments, segmentGroup.children)));
            return { segmentGroup: mergeTrivialChildren(s), slicedSegments: [] };
        }
        else if (slicedSegments.length === 0 &&
            containsEmptyPathRedirects(segmentGroup, slicedSegments, config)) {
            var s = new UrlSegmentGroup(segmentGroup.segments, addEmptySegmentsToChildrenIfNeeded(segmentGroup, slicedSegments, config, segmentGroup.children));
            return { segmentGroup: mergeTrivialChildren(s), slicedSegments: slicedSegments };
        }
        else {
            return { segmentGroup: segmentGroup, slicedSegments: slicedSegments };
        }
    }
    function mergeTrivialChildren(s) {
        if (s.numberOfChildren === 1 && s.children[PRIMARY_OUTLET]) {
            var c = s.children[PRIMARY_OUTLET];
            return new UrlSegmentGroup(s.segments.concat(c.segments), c.children);
        }
        else {
            return s;
        }
    }
    function addEmptySegmentsToChildrenIfNeeded(segmentGroup, slicedSegments, routes, children) {
        var res = {};
        for (var _i = 0, routes_1 = routes; _i < routes_1.length; _i++) {
            var r = routes_1[_i];
            if (emptyPathRedirect(segmentGroup, slicedSegments, r) && !children[getOutlet$1(r)]) {
                res[getOutlet$1(r)] = new UrlSegmentGroup([], {});
            }
        }
        return merge(children, res);
    }
    function createChildrenForEmptySegments(routes, primarySegmentGroup) {
        var res = {};
        res[PRIMARY_OUTLET] = primarySegmentGroup;
        for (var _i = 0, routes_2 = routes; _i < routes_2.length; _i++) {
            var r = routes_2[_i];
            if (r.path === '' && getOutlet$1(r) !== PRIMARY_OUTLET) {
                res[getOutlet$1(r)] = new UrlSegmentGroup([], {});
            }
        }
        return res;
    }
    function containsEmptyPathRedirectsWithNamedOutlets(segmentGroup, slicedSegments, routes) {
        return routes
            .filter(function (r) { return emptyPathRedirect(segmentGroup, slicedSegments, r) &&
            getOutlet$1(r) !== PRIMARY_OUTLET; })
            .length > 0;
    }
    function containsEmptyPathRedirects(segmentGroup, slicedSegments, routes) {
        return routes.filter(function (r) { return emptyPathRedirect(segmentGroup, slicedSegments, r); }).length > 0;
    }
    function emptyPathRedirect(segmentGroup, slicedSegments, r) {
        if ((segmentGroup.hasChildren() || slicedSegments.length > 0) && r.pathMatch === 'full')
            return false;
        return r.path === '' && r.redirectTo !== undefined;
    }
    function getOutlet$1(route) {
        return route.outlet ? route.outlet : PRIMARY_OUTLET;
    }

    /**
     * @license
     * Copyright Google Inc. All Rights Reserved.
     *
     * Use of this source code is governed by an MIT-style license that can be
     * found in the LICENSE file at https://angular.io/license
     */
    function validateConfig(config) {
        config.forEach(validateNode);
    }
    function validateNode(route) {
        if (Array.isArray(route)) {
            throw new Error("Invalid route configuration: Array cannot be specified");
        }
        if (!!route.redirectTo && !!route.children) {
            throw new Error("Invalid configuration of route '" + route.path + "': redirectTo and children cannot be used together");
        }
        if (!!route.redirectTo && !!route.loadChildren) {
            throw new Error("Invalid configuration of route '" + route.path + "': redirectTo and loadChildren cannot be used together");
        }
        if (!!route.children && !!route.loadChildren) {
            throw new Error("Invalid configuration of route '" + route.path + "': children and loadChildren cannot be used together");
        }
        if (!!route.redirectTo && !!route.component) {
            throw new Error("Invalid configuration of route '" + route.path + "': redirectTo and component cannot be used together");
        }
        if (route.redirectTo === undefined && !route.component && !route.children &&
            !route.loadChildren) {
            throw new Error("Invalid configuration of route '" + route.path + "': one of the following must be provided (component or redirectTo or children or loadChildren)");
        }
        if (route.path === undefined) {
            throw new Error("Invalid route configuration: routes must have path specified");
        }
        if (route.path.startsWith('/')) {
            throw new Error("Invalid route configuration of route '" + route.path + "': path cannot start with a slash");
        }
        if (route.path === '' && route.redirectTo !== undefined && route.pathMatch === undefined) {
            var exp = "The default value of 'pathMatch' is 'prefix', but often the intent is to use 'full'.";
            throw new Error("Invalid route configuration of route '{path: \"" + route.path + "\", redirectTo: \"" + route.redirectTo + "\"}': please provide 'pathMatch'. " + exp);
        }
        if (route.pathMatch !== undefined && route.pathMatch !== 'full' && route.pathMatch !== 'prefix') {
            throw new Error("Invalid configuration of route '" + route.path + "': pathMatch can only be set to 'prefix' or 'full'");
        }
    }

    /**
     * @license
     * Copyright Google Inc. All Rights Reserved.
     *
     * Use of this source code is governed by an MIT-style license that can be
     * found in the LICENSE file at https://angular.io/license
     */
    var Tree = (function () {
        function Tree(root) {
            this._root = root;
        }
        Object.defineProperty(Tree.prototype, "root", {
            get: function () { return this._root.value; },
            enumerable: true,
            configurable: true
        });
        /**
         * @internal
         */
        Tree.prototype.parent = function (t) {
            var p = this.pathFromRoot(t);
            return p.length > 1 ? p[p.length - 2] : null;
        };
        /**
         * @internal
         */
        Tree.prototype.children = function (t) {
            var n = findNode(t, this._root);
            return n ? n.children.map(function (t) { return t.value; }) : [];
        };
        /**
         * @internal
         */
        Tree.prototype.firstChild = function (t) {
            var n = findNode(t, this._root);
            return n && n.children.length > 0 ? n.children[0].value : null;
        };
        /**
         * @internal
         */
        Tree.prototype.siblings = function (t) {
            var p = findPath(t, this._root, []);
            if (p.length < 2)
                return [];
            var c = p[p.length - 2].children.map(function (c) { return c.value; });
            return c.filter(function (cc) { return cc !== t; });
        };
        /**
         * @internal
         */
        Tree.prototype.pathFromRoot = function (t) { return findPath(t, this._root, []).map(function (s) { return s.value; }); };
        return Tree;
    }());
    function findNode(expected, c) {
        if (expected === c.value)
            return c;
        for (var _i = 0, _a = c.children; _i < _a.length; _i++) {
            var cc = _a[_i];
            var r = findNode(expected, cc);
            if (r)
                return r;
        }
        return null;
    }
    function findPath(expected, c, collected) {
        collected.push(c);
        if (expected === c.value)
            return collected;
        for (var _i = 0, _a = c.children; _i < _a.length; _i++) {
            var cc = _a[_i];
            var cloned = collected.slice(0);
            var r = findPath(expected, cc, cloned);
            if (r.length > 0)
                return r;
        }
        return [];
    }
    var TreeNode = (function () {
        function TreeNode(value, children) {
            this.value = value;
            this.children = children;
        }
        TreeNode.prototype.toString = function () { return "TreeNode(" + this.value + ")"; };
        return TreeNode;
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
     * @whatItDoes Represents the state of the router.
     *
     * @howToUse
     *
     * ```
     * @Component({templateUrl:'template.html'})
     * class MyComponent {
     *   constructor(router: Router) {
     *     const state: RouterState = router.routerState;
     *     const root: ActivatedRoute = state.root;
     *     const child = root.firstChild;
     *     const id: Observable<string> = child.params.map(p => p.id);
     *     //...
     *   }
     * }
     * ```
     *
     * @description
     * RouterState is a tree of activated routes. Every node in this tree knows about the "consumed" URL
     * segments,
     * the extracted parameters, and the resolved data.
     *
     * See {@link ActivatedRoute} for more information.
     *
     * @stable
     */
    var RouterState = (function (_super) {
        __extends$1(RouterState, _super);
        /**
         * @internal
         */
        function RouterState(root,
            /**
             * The current snapshot of the router state.
             */
            snapshot) {
            _super.call(this, root);
            this.snapshot = snapshot;
            setRouterStateSnapshot(this, root);
        }
        RouterState.prototype.toString = function () { return this.snapshot.toString(); };
        return RouterState;
    }(Tree));
    function createEmptyState(urlTree, rootComponent) {
        var snapshot = createEmptyStateSnapshot(urlTree, rootComponent);
        var emptyUrl = new rxjs_BehaviorSubject.BehaviorSubject([new UrlSegment('', {})]);
        var emptyParams = new rxjs_BehaviorSubject.BehaviorSubject({});
        var emptyData = new rxjs_BehaviorSubject.BehaviorSubject({});
        var emptyQueryParams = new rxjs_BehaviorSubject.BehaviorSubject({});
        var fragment = new rxjs_BehaviorSubject.BehaviorSubject('');
        var activated = new ActivatedRoute(emptyUrl, emptyParams, emptyQueryParams, fragment, emptyData, PRIMARY_OUTLET, rootComponent, snapshot.root);
        activated.snapshot = snapshot.root;
        return new RouterState(new TreeNode(activated, []), snapshot);
    }
    function createEmptyStateSnapshot(urlTree, rootComponent) {
        var emptyParams = {};
        var emptyData = {};
        var emptyQueryParams = {};
        var fragment = '';
        var activated = new ActivatedRouteSnapshot([], emptyParams, emptyQueryParams, fragment, emptyData, PRIMARY_OUTLET, rootComponent, null, urlTree.root, -1, InheritedResolve.empty);
        return new RouterStateSnapshot('', new TreeNode(activated, []));
    }
    /**
     * @whatItDoes Contains the information about a route associated with a component loaded in an
     * outlet.
     * ActivatedRoute can also be used to traverse the router state tree.
     *
     * @howToUse
     *
     * ```
     * @Component({templateUrl:'./my-component.html'})
     * class MyComponent {
     *   constructor(route: ActivatedRoute) {
     *     const id: Observable<string> = route.params.map(p => p.id);
     *     const url: Observable<string> = route.url.map(s => s.join(''));
     *     const user = route.data.map(d => d.user); //includes `data` and `resolve`
     *   }
     * }
     * ```
     *
     * @stable
     */
    var ActivatedRoute = (function () {
        /**
         * @internal
         */
        function ActivatedRoute(
            /**
             *  The URL segments matched by this route. The observable will emit a new value when
             *  the array of segments changes.
             */
            url,
            /**
             * The matrix parameters scoped to this route. The observable will emit a new value when
             * the set of the parameters changes.
             */
            params,
            /**
             * The query parameters shared by all the routes. The observable will emit a new value when
             * the set of the parameters changes.
             */
            queryParams,
            /**
             * The URL fragment shared by all the routes. The observable will emit a new value when
             * the URL fragment changes.
             */
            fragment,
            /**
             * The static and resolved data of this route. The observable will emit a new value when
             * any of the resolvers returns a new object.
             */
            data,
            /**
             * The outlet name of the route. It's a constant.
             */
            outlet,
            /**
             * The component of the route. It's a constant.
             */
            component, // TODO: vsavkin: remove |string
            futureSnapshot) {
            this.url = url;
            this.params = params;
            this.queryParams = queryParams;
            this.fragment = fragment;
            this.data = data;
            this.outlet = outlet;
            this.component = component;
            this._futureSnapshot = futureSnapshot;
        }
        Object.defineProperty(ActivatedRoute.prototype, "routeConfig", {
            /**
             * The configuration used to match this route.
             */
            get: function () { return this._futureSnapshot.routeConfig; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ActivatedRoute.prototype, "root", {
            /**
             * The root of the router state.
             */
            get: function () { return this._routerState.root; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ActivatedRoute.prototype, "parent", {
            /**
             * The parent of this route in the router state tree.
             */
            get: function () { return this._routerState.parent(this); },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ActivatedRoute.prototype, "firstChild", {
            /**
             * The first child of this route in the router state tree.
             */
            get: function () { return this._routerState.firstChild(this); },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ActivatedRoute.prototype, "children", {
            /**
             * The children of this route in the router state tree.
             */
            get: function () { return this._routerState.children(this); },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ActivatedRoute.prototype, "pathFromRoot", {
            /**
             * The path from the root of the router state tree to this route.
             */
            get: function () { return this._routerState.pathFromRoot(this); },
            enumerable: true,
            configurable: true
        });
        /**
         * @docsNotRequired
         */
        ActivatedRoute.prototype.toString = function () {
            return this.snapshot ? this.snapshot.toString() : "Future(" + this._futureSnapshot + ")";
        };
        return ActivatedRoute;
    }());
    /**
     * @internal
     */
    var InheritedResolve = (function () {
        function InheritedResolve(parent, current) {
            this.parent = parent;
            this.current = current;
            /**
             * @internal
             */
            this.resolvedData = {};
        }
        Object.defineProperty(InheritedResolve.prototype, "flattenedResolvedData", {
            /**
             * @internal
             */
            get: function () {
                return this.parent ? merge(this.parent.flattenedResolvedData, this.resolvedData) :
                    this.resolvedData;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(InheritedResolve, "empty", {
            get: function () { return new InheritedResolve(null, {}); },
            enumerable: true,
            configurable: true
        });
        return InheritedResolve;
    }());
    /**
     * @whatItDoes Contains the information about a route associated with a component loaded in an
     * outlet
     * at a particular moment in time. ActivatedRouteSnapshot can also be used to traverse the router
     * state tree.
     *
     * @howToUse
     *
     * ```
     * @Component({templateUrl:'./my-component.html'})
     * class MyComponent {
     *   constructor(route: ActivatedRoute) {
     *     const id: string = route.snapshot.params.id;
     *     const url: string = route.snapshot.url.join('');
     *     const user = route.snapshot.data.user;
     *   }
     * }
     * ```
     *
     * @stable
     */
    var ActivatedRouteSnapshot = (function () {
        /**
         * @internal
         */
        function ActivatedRouteSnapshot(
            /**
             *  The URL segments matched by this route.
             */
            url,
            /**
             * The matrix parameters scoped to this route.
             */
            params,
            /**
             * The query parameters shared by all the routes.
             */
            queryParams,
            /**
             * The URL fragment shared by all the routes.
             */
            fragment,
            /**
             * The static and resolved data of this route.
             */
            data,
            /**
             * The outlet name of the route.
             */
            outlet,
            /**
             * The component of the route.
             */
            component, routeConfig, urlSegment, lastPathIndex, resolve) {
            this.url = url;
            this.params = params;
            this.queryParams = queryParams;
            this.fragment = fragment;
            this.data = data;
            this.outlet = outlet;
            this.component = component;
            this._routeConfig = routeConfig;
            this._urlSegment = urlSegment;
            this._lastPathIndex = lastPathIndex;
            this._resolve = resolve;
        }
        Object.defineProperty(ActivatedRouteSnapshot.prototype, "routeConfig", {
            /**
             * The configuration used to match this route.
             */
            get: function () { return this._routeConfig; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ActivatedRouteSnapshot.prototype, "root", {
            /**
             * The root of the router state.
             */
            get: function () { return this._routerState.root; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ActivatedRouteSnapshot.prototype, "parent", {
            /**
             * The parent of this route in the router state tree.
             */
            get: function () { return this._routerState.parent(this); },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ActivatedRouteSnapshot.prototype, "firstChild", {
            /**
             * The first child of this route in the router state tree.
             */
            get: function () { return this._routerState.firstChild(this); },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ActivatedRouteSnapshot.prototype, "children", {
            /**
             * The children of this route in the router state tree.
             */
            get: function () { return this._routerState.children(this); },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ActivatedRouteSnapshot.prototype, "pathFromRoot", {
            /**
             * The path from the root of the router state tree to this route.
             */
            get: function () { return this._routerState.pathFromRoot(this); },
            enumerable: true,
            configurable: true
        });
        /**
         * @docsNotRequired
         */
        ActivatedRouteSnapshot.prototype.toString = function () {
            var url = this.url.map(function (s) { return s.toString(); }).join('/');
            var matched = this._routeConfig ? this._routeConfig.path : '';
            return "Route(url:'" + url + "', path:'" + matched + "')";
        };
        return ActivatedRouteSnapshot;
    }());
    /**
     * @whatItDoes Represents the state of the router at a moment in time.
     *
     * @howToUse
     *
     * ```
     * @Component({templateUrl:'template.html'})
     * class MyComponent {
     *   constructor(router: Router) {
     *     const state: RouterState = router.routerState;
     *     const snapshot: RouterStateSnapshot = state.snapshot;
     *     const root: ActivatedRouteSnapshot = snapshot.root;
     *     const child = root.firstChild;
     *     const id: Observable<string> = child.params.map(p => p.id);
     *     //...
     *   }
     * }
     * ```
     *
     * @description
     * RouterStateSnapshot is a tree of activated route snapshots. Every node in this tree knows about
     * the "consumed" URL segments, the extracted parameters, and the resolved data.
     *
     * @stable
     */
    var RouterStateSnapshot = (function (_super) {
        __extends$1(RouterStateSnapshot, _super);
        /**
         * @internal
         */
        function RouterStateSnapshot(
            /** The url from which this snapshot was created */
            url, root) {
            _super.call(this, root);
            this.url = url;
            setRouterStateSnapshot(this, root);
        }
        RouterStateSnapshot.prototype.toString = function () { return serializeNode(this._root); };
        return RouterStateSnapshot;
    }(Tree));
    function setRouterStateSnapshot(state, node) {
        node.value._routerState = state;
        node.children.forEach(function (c) { return setRouterStateSnapshot(state, c); });
    }
    function serializeNode(node) {
        var c = node.children.length > 0 ? " { " + node.children.map(serializeNode).join(", ") + " } " : '';
        return "" + node.value + c;
    }
    /**
     * The expectation is that the activate route is created with the right set of parameters.
     * So we push new values into the observables only when they are not the initial values.
     * And we detect that by checking if the snapshot field is set.
     */
    function advanceActivatedRoute(route) {
        if (route.snapshot) {
            if (!shallowEqual(route.snapshot.queryParams, route._futureSnapshot.queryParams)) {
                route.queryParams.next(route._futureSnapshot.queryParams);
            }
            if (route.snapshot.fragment !== route._futureSnapshot.fragment) {
                route.fragment.next(route._futureSnapshot.fragment);
            }
            if (!shallowEqual(route.snapshot.params, route._futureSnapshot.params)) {
                route.params.next(route._futureSnapshot.params);
                route.data.next(route._futureSnapshot.data);
            }
            if (!shallowEqualArrays(route.snapshot.url, route._futureSnapshot.url)) {
                route.url.next(route._futureSnapshot.url);
            }
            route.snapshot = route._futureSnapshot;
        }
        else {
            route.snapshot = route._futureSnapshot;
            // this is for resolved data
            route.data.next(route._futureSnapshot.data);
        }
    }

    function createRouterState(curr, prevState) {
        var root = createNode(curr._root, prevState ? prevState._root : undefined);
        return new RouterState(root, curr);
    }
    function createNode(curr, prevState) {
        if (prevState && equalRouteSnapshots(prevState.value.snapshot, curr.value)) {
            var value = prevState.value;
            value._futureSnapshot = curr.value;
            var children = createOrReuseChildren(curr, prevState);
            return new TreeNode(value, children);
        }
        else {
            var value = createActivatedRoute(curr.value);
            var children = curr.children.map(function (c) { return createNode(c); });
            return new TreeNode(value, children);
        }
    }
    function createOrReuseChildren(curr, prevState) {
        return curr.children.map(function (child) {
            for (var _i = 0, _a = prevState.children; _i < _a.length; _i++) {
                var p = _a[_i];
                if (equalRouteSnapshots(p.value.snapshot, child.value)) {
                    return createNode(child, p);
                }
            }
            return createNode(child);
        });
    }
    function createActivatedRoute(c) {
        return new ActivatedRoute(new rxjs_BehaviorSubject.BehaviorSubject(c.url), new rxjs_BehaviorSubject.BehaviorSubject(c.params), new rxjs_BehaviorSubject.BehaviorSubject(c.queryParams), new rxjs_BehaviorSubject.BehaviorSubject(c.fragment), new rxjs_BehaviorSubject.BehaviorSubject(c.data), c.outlet, c.component, c);
    }
    function equalRouteSnapshots(a, b) {
        return a._routeConfig === b._routeConfig;
    }

    function createUrlTree(route, urlTree, commands, queryParams, fragment) {
        if (commands.length === 0) {
            return tree(urlTree.root, urlTree.root, urlTree, queryParams, fragment);
        }
        var normalizedCommands = normalizeCommands(commands);
        validateCommands(normalizedCommands);
        if (navigateToRoot(normalizedCommands)) {
            return tree(urlTree.root, new UrlSegmentGroup([], {}), urlTree, queryParams, fragment);
        }
        var startingPosition = findStartingPosition(normalizedCommands, urlTree, route);
        var segmentGroup = startingPosition.processChildren ?
            updateSegmentGroupChildren(startingPosition.segmentGroup, startingPosition.index, normalizedCommands.commands) :
            updateSegmentGroup(startingPosition.segmentGroup, startingPosition.index, normalizedCommands.commands);
        return tree(startingPosition.segmentGroup, segmentGroup, urlTree, queryParams, fragment);
    }
    function validateCommands(n) {
        if (n.isAbsolute && n.commands.length > 0 && isMatrixParams(n.commands[0])) {
            throw new Error('Root segment cannot have matrix parameters');
        }
        var c = n.commands.filter(function (c) { return typeof c === 'object' && c.outlets !== undefined; });
        if (c.length > 0 && c[0] !== n.commands[n.commands.length - 1]) {
            throw new Error('{outlets:{}} has to be the last command');
        }
    }
    function isMatrixParams(command) {
        return typeof command === 'object' && command.outlets === undefined &&
            command.segmentPath === undefined;
    }
    function tree(oldSegmentGroup, newSegmentGroup, urlTree, queryParams, fragment) {
        if (urlTree.root === oldSegmentGroup) {
            return new UrlTree(newSegmentGroup, stringify(queryParams), fragment);
        }
        else {
            return new UrlTree(replaceSegment(urlTree.root, oldSegmentGroup, newSegmentGroup), stringify(queryParams), fragment);
        }
    }
    function replaceSegment(current, oldSegment, newSegment) {
        var children = {};
        forEach(current.children, function (c, outletName) {
            if (c === oldSegment) {
                children[outletName] = newSegment;
            }
            else {
                children[outletName] = replaceSegment(c, oldSegment, newSegment);
            }
        });
        return new UrlSegmentGroup(current.segments, children);
    }
    function navigateToRoot(normalizedChange) {
        return normalizedChange.isAbsolute && normalizedChange.commands.length === 1 &&
            normalizedChange.commands[0] == '/';
    }
    var NormalizedNavigationCommands = (function () {
        function NormalizedNavigationCommands(isAbsolute, numberOfDoubleDots, commands) {
            this.isAbsolute = isAbsolute;
            this.numberOfDoubleDots = numberOfDoubleDots;
            this.commands = commands;
        }
        return NormalizedNavigationCommands;
    }());
    function normalizeCommands(commands) {
        if ((typeof commands[0] === 'string') && commands.length === 1 && commands[0] == '/') {
            return new NormalizedNavigationCommands(true, 0, commands);
        }
        var numberOfDoubleDots = 0;
        var isAbsolute = false;
        var res = [];
        var _loop_1 = function(i) {
            var c = commands[i];
            if (typeof c === 'object' && c.outlets !== undefined) {
                var r_1 = {};
                forEach(c.outlets, function (commands, name) {
                    if (typeof commands === 'string') {
                        r_1[name] = commands.split('/');
                    }
                    else {
                        r_1[name] = commands;
                    }
                });
                res.push({ outlets: r_1 });
                return "continue";
            }
            if (typeof c === 'object' && c.segmentPath !== undefined) {
                res.push(c.segmentPath);
                return "continue";
            }
            if (!(typeof c === 'string')) {
                res.push(c);
                return "continue";
            }
            if (i === 0) {
                var parts = c.split('/');
                for (var j = 0; j < parts.length; ++j) {
                    var cc = parts[j];
                    if (j == 0 && cc == '.') {
                    }
                    else if (j == 0 && cc == '') {
                        isAbsolute = true;
                    }
                    else if (cc == '..') {
                        numberOfDoubleDots++;
                    }
                    else if (cc != '') {
                        res.push(cc);
                    }
                }
            }
            else {
                res.push(c);
            }
        };
        for (var i = 0; i < commands.length; ++i) {
            _loop_1(i);
        }
        return new NormalizedNavigationCommands(isAbsolute, numberOfDoubleDots, res);
    }
    var Position = (function () {
        function Position(segmentGroup, processChildren, index) {
            this.segmentGroup = segmentGroup;
            this.processChildren = processChildren;
            this.index = index;
        }
        return Position;
    }());
    function findStartingPosition(normalizedChange, urlTree, route) {
        if (normalizedChange.isAbsolute) {
            return new Position(urlTree.root, true, 0);
        }
        else if (route.snapshot._lastPathIndex === -1) {
            return new Position(route.snapshot._urlSegment, true, 0);
        }
        else {
            var modifier = isMatrixParams(normalizedChange.commands[0]) ? 0 : 1;
            var index = route.snapshot._lastPathIndex + modifier;
            return createPositionApplyingDoubleDots(route.snapshot._urlSegment, index, normalizedChange.numberOfDoubleDots);
        }
    }
    function createPositionApplyingDoubleDots(group, index, numberOfDoubleDots) {
        var g = group;
        var ci = index;
        var dd = numberOfDoubleDots;
        while (dd > ci) {
            dd -= ci;
            g = g.parent;
            if (!g) {
                throw new Error('Invalid number of \'../\'');
            }
            ci = g.segments.length;
        }
        return new Position(g, false, ci - dd);
    }
    function getPath(command) {
        return "" + command;
    }
    function getOutlets(commands) {
        if (!(typeof commands[0] === 'object'))
            return (_a = {}, _a[PRIMARY_OUTLET] = commands, _a);
        if (commands[0].outlets === undefined)
            return (_b = {}, _b[PRIMARY_OUTLET] = commands, _b);
        return commands[0].outlets;
        var _a, _b;
    }
    function updateSegmentGroup(segmentGroup, startIndex, commands) {
        if (!segmentGroup) {
            segmentGroup = new UrlSegmentGroup([], {});
        }
        if (segmentGroup.segments.length === 0 && segmentGroup.hasChildren()) {
            return updateSegmentGroupChildren(segmentGroup, startIndex, commands);
        }
        var m = prefixedWith(segmentGroup, startIndex, commands);
        var slicedCommands = commands.slice(m.lastIndex);
        if (m.match && slicedCommands.length === 0) {
            return new UrlSegmentGroup(segmentGroup.segments, {});
        }
        else if (m.match && !segmentGroup.hasChildren()) {
            return createNewSegmentGroup(segmentGroup, startIndex, commands);
        }
        else if (m.match) {
            return updateSegmentGroupChildren(segmentGroup, 0, slicedCommands);
        }
        else {
            return createNewSegmentGroup(segmentGroup, startIndex, commands);
        }
    }
    function updateSegmentGroupChildren(segmentGroup, startIndex, commands) {
        if (commands.length === 0) {
            return new UrlSegmentGroup(segmentGroup.segments, {});
        }
        else {
            var outlets_1 = getOutlets(commands);
            var children_1 = {};
            forEach(outlets_1, function (commands, outlet) {
                if (commands !== null) {
                    children_1[outlet] = updateSegmentGroup(segmentGroup.children[outlet], startIndex, commands);
                }
            });
            forEach(segmentGroup.children, function (child, childOutlet) {
                if (outlets_1[childOutlet] === undefined) {
                    children_1[childOutlet] = child;
                }
            });
            return new UrlSegmentGroup(segmentGroup.segments, children_1);
        }
    }
    function prefixedWith(segmentGroup, startIndex, commands) {
        var currentCommandIndex = 0;
        var currentPathIndex = startIndex;
        var noMatch = { match: false, lastIndex: 0 };
        while (currentPathIndex < segmentGroup.segments.length) {
            if (currentCommandIndex >= commands.length)
                return noMatch;
            var path = segmentGroup.segments[currentPathIndex];
            var curr = getPath(commands[currentCommandIndex]);
            var next = currentCommandIndex < commands.length - 1 ? commands[currentCommandIndex + 1] : null;
            if (curr && next && (typeof next === 'object') && next.outlets === undefined) {
                if (!compare(curr, next, path))
                    return noMatch;
                currentCommandIndex += 2;
            }
            else {
                if (!compare(curr, {}, path))
                    return noMatch;
                currentCommandIndex++;
            }
            currentPathIndex++;
        }
        return { match: true, lastIndex: currentCommandIndex };
    }
    function createNewSegmentGroup(segmentGroup, startIndex, commands) {
        var paths = segmentGroup.segments.slice(0, startIndex);
        var i = 0;
        while (i < commands.length) {
            if (typeof commands[i] === 'object' && commands[i].outlets !== undefined) {
                var children = createNewSegmentChldren(commands[i].outlets);
                return new UrlSegmentGroup(paths, children);
            }
            // if we start with an object literal, we need to reuse the path part from the segment
            if (i === 0 && isMatrixParams(commands[0])) {
                var p = segmentGroup.segments[startIndex];
                paths.push(new UrlSegment(p.path, commands[0]));
                i++;
                continue;
            }
            var curr = getPath(commands[i]);
            var next = (i < commands.length - 1) ? commands[i + 1] : null;
            if (curr && next && isMatrixParams(next)) {
                paths.push(new UrlSegment(curr, stringify(next)));
                i += 2;
            }
            else {
                paths.push(new UrlSegment(curr, {}));
                i++;
            }
        }
        return new UrlSegmentGroup(paths, {});
    }
    function createNewSegmentChldren(outlets) {
        var children = {};
        forEach(outlets, function (commands, outlet) {
            if (commands !== null) {
                children[outlet] = createNewSegmentGroup(new UrlSegmentGroup([], {}), 0, commands);
            }
        });
        return children;
    }
    function stringify(params) {
        var res = {};
        forEach(params, function (v, k) { return res[k] = "" + v; });
        return res;
    }
    function compare(path, params, segment) {
        return path == segment.path && shallowEqual(params, segment.parameters);
    }

    var NoMatch$1 = (function () {
        function NoMatch() {
        }
        return NoMatch;
    }());
    var InheritedFromParent = (function () {
        function InheritedFromParent(parent, snapshot, params, data, resolve) {
            this.parent = parent;
            this.snapshot = snapshot;
            this.params = params;
            this.data = data;
            this.resolve = resolve;
        }
        Object.defineProperty(InheritedFromParent.prototype, "allParams", {
            get: function () {
                return this.parent ? merge(this.parent.allParams, this.params) : this.params;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(InheritedFromParent.prototype, "allData", {
            get: function () { return this.parent ? merge(this.parent.allData, this.data) : this.data; },
            enumerable: true,
            configurable: true
        });
        InheritedFromParent.empty = function (snapshot) {
            return new InheritedFromParent(null, snapshot, {}, {}, new InheritedResolve(null, {}));
        };
        return InheritedFromParent;
    }());
    function recognize(rootComponentType, config, urlTree, url) {
        return new Recognizer(rootComponentType, config, urlTree, url).recognize();
    }
    var Recognizer = (function () {
        function Recognizer(rootComponentType, config, urlTree, url) {
            this.rootComponentType = rootComponentType;
            this.config = config;
            this.urlTree = urlTree;
            this.url = url;
        }
        Recognizer.prototype.recognize = function () {
            try {
                var rootSegmentGroup = split$1(this.urlTree.root, [], [], this.config).segmentGroup;
                var children = this.processSegmentGroup(this.config, rootSegmentGroup, InheritedFromParent.empty(null), PRIMARY_OUTLET);
                var root = new ActivatedRouteSnapshot([], Object.freeze({}), Object.freeze(this.urlTree.queryParams), this.urlTree.fragment, {}, PRIMARY_OUTLET, this.rootComponentType, null, this.urlTree.root, -1, InheritedResolve.empty);
                var rootNode = new TreeNode(root, children);
                return rxjs_observable_of.of(new RouterStateSnapshot(this.url, rootNode));
            }
            catch (e) {
                return new rxjs_Observable.Observable(function (obs) { return obs.error(e); });
            }
        };
        Recognizer.prototype.processSegmentGroup = function (config, segmentGroup, inherited, outlet) {
            if (segmentGroup.segments.length === 0 && segmentGroup.hasChildren()) {
                return this.processChildren(config, segmentGroup, inherited);
            }
            else {
                return this.processSegment(config, segmentGroup, 0, segmentGroup.segments, inherited, outlet);
            }
        };
        Recognizer.prototype.processChildren = function (config, segmentGroup, inherited) {
            var _this = this;
            var children = mapChildrenIntoArray(segmentGroup, function (child, childOutlet) { return _this.processSegmentGroup(config, child, inherited, childOutlet); });
            checkOutletNameUniqueness(children);
            sortActivatedRouteSnapshots(children);
            return children;
        };
        Recognizer.prototype.processSegment = function (config, segmentGroup, pathIndex, segments, inherited, outlet) {
            for (var _i = 0, config_1 = config; _i < config_1.length; _i++) {
                var r = config_1[_i];
                try {
                    return this.processSegmentAgainstRoute(r, segmentGroup, pathIndex, segments, inherited, outlet);
                }
                catch (e) {
                    if (!(e instanceof NoMatch$1))
                        throw e;
                }
            }
            throw new NoMatch$1();
        };
        Recognizer.prototype.processSegmentAgainstRoute = function (route, rawSegment, pathIndex, segments, inherited, outlet) {
            if (route.redirectTo)
                throw new NoMatch$1();
            if ((route.outlet ? route.outlet : PRIMARY_OUTLET) !== outlet)
                throw new NoMatch$1();
            var newInheritedResolve = new InheritedResolve(inherited.resolve, getResolve(route));
            if (route.path === '**') {
                var params = segments.length > 0 ? last(segments).parameters : {};
                var snapshot_1 = new ActivatedRouteSnapshot(segments, Object.freeze(merge(inherited.allParams, params)), Object.freeze(this.urlTree.queryParams), this.urlTree.fragment, merge(inherited.allData, getData(route)), outlet, route.component, route, getSourceSegmentGroup(rawSegment), getPathIndexShift(rawSegment) + segments.length, newInheritedResolve);
                return [new TreeNode(snapshot_1, [])];
            }
            var _a = match$1(rawSegment, route, segments, inherited.snapshot), consumedSegments = _a.consumedSegments, parameters = _a.parameters, lastChild = _a.lastChild;
            var rawSlicedSegments = segments.slice(lastChild);
            var childConfig = getChildConfig(route);
            var _b = split$1(rawSegment, consumedSegments, rawSlicedSegments, childConfig), segmentGroup = _b.segmentGroup, slicedSegments = _b.slicedSegments;
            var snapshot = new ActivatedRouteSnapshot(consumedSegments, Object.freeze(merge(inherited.allParams, parameters)), Object.freeze(this.urlTree.queryParams), this.urlTree.fragment, merge(inherited.allData, getData(route)), outlet, route.component, route, getSourceSegmentGroup(rawSegment), getPathIndexShift(rawSegment) + consumedSegments.length, newInheritedResolve);
            var newInherited = route.component ?
                InheritedFromParent.empty(snapshot) :
                new InheritedFromParent(inherited, snapshot, parameters, getData(route), newInheritedResolve);
            if (slicedSegments.length === 0 && segmentGroup.hasChildren()) {
                var children = this.processChildren(childConfig, segmentGroup, newInherited);
                return [new TreeNode(snapshot, children)];
            }
            else if (childConfig.length === 0 && slicedSegments.length === 0) {
                return [new TreeNode(snapshot, [])];
            }
            else {
                var children = this.processSegment(childConfig, segmentGroup, pathIndex + lastChild, slicedSegments, newInherited, PRIMARY_OUTLET);
                return [new TreeNode(snapshot, children)];
            }
        };
        return Recognizer;
    }());
    function sortActivatedRouteSnapshots(nodes) {
        nodes.sort(function (a, b) {
            if (a.value.outlet === PRIMARY_OUTLET)
                return -1;
            if (b.value.outlet === PRIMARY_OUTLET)
                return 1;
            return a.value.outlet.localeCompare(b.value.outlet);
        });
    }
    function getChildConfig(route) {
        if (route.children) {
            return route.children;
        }
        else if (route.loadChildren) {
            return route._loadedConfig.routes;
        }
        else {
            return [];
        }
    }
    function match$1(segmentGroup, route, segments, parent) {
        if (route.path === '') {
            if (route.pathMatch === 'full' && (segmentGroup.hasChildren() || segments.length > 0)) {
                throw new NoMatch$1();
            }
            else {
                var params = parent ? parent.params : {};
                return { consumedSegments: [], lastChild: 0, parameters: params };
            }
        }
        var path = route.path;
        var parts = path.split('/');
        var posParameters = {};
        var consumedSegments = [];
        var currentIndex = 0;
        for (var i = 0; i < parts.length; ++i) {
            if (currentIndex >= segments.length)
                throw new NoMatch$1();
            var current = segments[currentIndex];
            var p = parts[i];
            var isPosParam = p.startsWith(':');
            if (!isPosParam && p !== current.path)
                throw new NoMatch$1();
            if (isPosParam) {
                posParameters[p.substring(1)] = current.path;
            }
            consumedSegments.push(current);
            currentIndex++;
        }
        if (route.pathMatch === 'full' &&
            (segmentGroup.hasChildren() || currentIndex < segments.length)) {
            throw new NoMatch$1();
        }
        var parameters = merge(posParameters, consumedSegments[consumedSegments.length - 1].parameters);
        return { consumedSegments: consumedSegments, lastChild: currentIndex, parameters: parameters };
    }
    function checkOutletNameUniqueness(nodes) {
        var names = {};
        nodes.forEach(function (n) {
            var routeWithSameOutletName = names[n.value.outlet];
            if (routeWithSameOutletName) {
                var p = routeWithSameOutletName.url.map(function (s) { return s.toString(); }).join('/');
                var c = n.value.url.map(function (s) { return s.toString(); }).join('/');
                throw new Error("Two segments cannot have the same outlet name: '" + p + "' and '" + c + "'.");
            }
            names[n.value.outlet] = n.value;
        });
    }
    function getSourceSegmentGroup(segmentGroup) {
        var s = segmentGroup;
        while (s._sourceSegment) {
            s = s._sourceSegment;
        }
        return s;
    }
    function getPathIndexShift(segmentGroup) {
        var s = segmentGroup;
        var res = (s._segmentIndexShift ? s._segmentIndexShift : 0);
        while (s._sourceSegment) {
            s = s._sourceSegment;
            res += (s._segmentIndexShift ? s._segmentIndexShift : 0);
        }
        return res - 1;
    }
    function split$1(segmentGroup, consumedSegments, slicedSegments, config) {
        if (slicedSegments.length > 0 &&
            containsEmptyPathMatchesWithNamedOutlets(segmentGroup, slicedSegments, config)) {
            var s = new UrlSegmentGroup(consumedSegments, createChildrenForEmptyPaths(segmentGroup, consumedSegments, config, new UrlSegmentGroup(slicedSegments, segmentGroup.children)));
            s._sourceSegment = segmentGroup;
            s._segmentIndexShift = consumedSegments.length;
            return { segmentGroup: s, slicedSegments: [] };
        }
        else if (slicedSegments.length === 0 &&
            containsEmptyPathMatches(segmentGroup, slicedSegments, config)) {
            var s = new UrlSegmentGroup(segmentGroup.segments, addEmptyPathsToChildrenIfNeeded(segmentGroup, slicedSegments, config, segmentGroup.children));
            s._sourceSegment = segmentGroup;
            s._segmentIndexShift = consumedSegments.length;
            return { segmentGroup: s, slicedSegments: slicedSegments };
        }
        else {
            var s = new UrlSegmentGroup(segmentGroup.segments, segmentGroup.children);
            s._sourceSegment = segmentGroup;
            s._segmentIndexShift = consumedSegments.length;
            return { segmentGroup: s, slicedSegments: slicedSegments };
        }
    }
    function addEmptyPathsToChildrenIfNeeded(segmentGroup, slicedSegments, routes, children) {
        var res = {};
        for (var _i = 0, routes_1 = routes; _i < routes_1.length; _i++) {
            var r = routes_1[_i];
            if (emptyPathMatch(segmentGroup, slicedSegments, r) && !children[getOutlet$2(r)]) {
                var s = new UrlSegmentGroup([], {});
                s._sourceSegment = segmentGroup;
                s._segmentIndexShift = segmentGroup.segments.length;
                res[getOutlet$2(r)] = s;
            }
        }
        return merge(children, res);
    }
    function createChildrenForEmptyPaths(segmentGroup, consumedSegments, routes, primarySegment) {
        var res = {};
        res[PRIMARY_OUTLET] = primarySegment;
        primarySegment._sourceSegment = segmentGroup;
        primarySegment._segmentIndexShift = consumedSegments.length;
        for (var _i = 0, routes_2 = routes; _i < routes_2.length; _i++) {
            var r = routes_2[_i];
            if (r.path === '' && getOutlet$2(r) !== PRIMARY_OUTLET) {
                var s = new UrlSegmentGroup([], {});
                s._sourceSegment = segmentGroup;
                s._segmentIndexShift = consumedSegments.length;
                res[getOutlet$2(r)] = s;
            }
        }
        return res;
    }
    function containsEmptyPathMatchesWithNamedOutlets(segmentGroup, slicedSegments, routes) {
        return routes
            .filter(function (r) { return emptyPathMatch(segmentGroup, slicedSegments, r) &&
            getOutlet$2(r) !== PRIMARY_OUTLET; })
            .length > 0;
    }
    function containsEmptyPathMatches(segmentGroup, slicedSegments, routes) {
        return routes.filter(function (r) { return emptyPathMatch(segmentGroup, slicedSegments, r); }).length > 0;
    }
    function emptyPathMatch(segmentGroup, slicedSegments, r) {
        if ((segmentGroup.hasChildren() || slicedSegments.length > 0) && r.pathMatch === 'full')
            return false;
        return r.path === '' && r.redirectTo === undefined;
    }
    function getOutlet$2(route) {
        return route.outlet ? route.outlet : PRIMARY_OUTLET;
    }
    function getData(route) {
        return route.data ? route.data : {};
    }
    function getResolve(route) {
        return route.resolve ? route.resolve : {};
    }

    /**
     * @license
     * Copyright Google Inc. All Rights Reserved.
     *
     * Use of this source code is governed by an MIT-style license that can be
     * found in the LICENSE file at https://angular.io/license
     */
    /**
     * @whatItDoes Contains all the router outlets created in a component.
     *
     * @stable
     */
    var RouterOutletMap = (function () {
        function RouterOutletMap() {
            /** @internal */
            this._outlets = {};
        }
        /**
         * Adds an outlet to this map.
         */
        RouterOutletMap.prototype.registerOutlet = function (name, outlet) { this._outlets[name] = outlet; };
        /**
         * Removes an outlet from this map.
         */
        RouterOutletMap.prototype.removeOutlet = function (name) { this._outlets[name] = undefined; };
        return RouterOutletMap;
    }());

    /**
     * @whatItDoes Represents an event triggered when a navigation starts.
     *
     * @stable
     */
    var NavigationStart = (function () {
        // TODO: vsavkin: make internal
        function NavigationStart(
            /** @docsNotRequired */
            id,
            /** @docsNotRequired */
            url) {
            this.id = id;
            this.url = url;
        }
        /** @docsNotRequired */
        NavigationStart.prototype.toString = function () { return "NavigationStart(id: " + this.id + ", url: '" + this.url + "')"; };
        return NavigationStart;
    }());
    /**
     * @whatItDoes Represents an event triggered when a navigation ends successfully.
     *
     * @stable
     */
    var NavigationEnd = (function () {
        // TODO: vsavkin: make internal
        function NavigationEnd(
            /** @docsNotRequired */
            id,
            /** @docsNotRequired */
            url,
            /** @docsNotRequired */
            urlAfterRedirects) {
            this.id = id;
            this.url = url;
            this.urlAfterRedirects = urlAfterRedirects;
        }
        /** @docsNotRequired */
        NavigationEnd.prototype.toString = function () {
            return "NavigationEnd(id: " + this.id + ", url: '" + this.url + "', urlAfterRedirects: '" + this.urlAfterRedirects + "')";
        };
        return NavigationEnd;
    }());
    /**
     * @whatItDoes Represents an event triggered when a navigation is canceled.
     *
     * @stable
     */
    var NavigationCancel = (function () {
        // TODO: vsavkin: make internal
        function NavigationCancel(
            /** @docsNotRequired */
            id,
            /** @docsNotRequired */
            url,
            /** @docsNotRequired */
            reason) {
            this.id = id;
            this.url = url;
            this.reason = reason;
        }
        /** @docsNotRequired */
        NavigationCancel.prototype.toString = function () { return "NavigationCancel(id: " + this.id + ", url: '" + this.url + "')"; };
        return NavigationCancel;
    }());
    /**
     * @whatItDoes Represents an event triggered when a navigation fails due to an unexpected error.
     *
     * @stable
     */
    var NavigationError = (function () {
        // TODO: vsavkin: make internal
        function NavigationError(
            /** @docsNotRequired */
            id,
            /** @docsNotRequired */
            url,
            /** @docsNotRequired */
            error) {
            this.id = id;
            this.url = url;
            this.error = error;
        }
        /** @docsNotRequired */
        NavigationError.prototype.toString = function () {
            return "NavigationError(id: " + this.id + ", url: '" + this.url + "', error: " + this.error + ")";
        };
        return NavigationError;
    }());
    /**
     * @whatItDoes Represents an event triggered when routes are recognized.
     *
     * @stable
     */
    var RoutesRecognized = (function () {
        // TODO: vsavkin: make internal
        function RoutesRecognized(
            /** @docsNotRequired */
            id,
            /** @docsNotRequired */
            url,
            /** @docsNotRequired */
            urlAfterRedirects,
            /** @docsNotRequired */
            state) {
            this.id = id;
            this.url = url;
            this.urlAfterRedirects = urlAfterRedirects;
            this.state = state;
        }
        /** @docsNotRequired */
        RoutesRecognized.prototype.toString = function () {
            return "RoutesRecognized(id: " + this.id + ", url: '" + this.url + "', urlAfterRedirects: '" + this.urlAfterRedirects + "', state: " + this.state + ")";
        };
        return RoutesRecognized;
    }());
    function defaultErrorHandler(error) {
        throw error;
    }
    /**
     * @whatItDoes Provides the navigation and url manipulation capabilities.
     *
     * See {@link Routes} for more details and examples.
     *
     * @ngModule RouterModule
     *
     * @stable
     */
    var Router = (function () {
        /**
         * Creates the router service.
         */
        // TODO: vsavkin make internal after the final is out.
        function Router(rootComponentType, urlSerializer, outletMap, location, injector, loader, compiler, config) {
            this.rootComponentType = rootComponentType;
            this.urlSerializer = urlSerializer;
            this.outletMap = outletMap;
            this.location = location;
            this.injector = injector;
            this.config = config;
            this.navigationId = 0;
            /**
             * Error handler that is invoked when a navigation errors.
             *
             * See {@link ErrorHandler} for more information.
             */
            this.errorHandler = defaultErrorHandler;
            /**
             * Indicates if at least one navigation happened.
             */
            this.navigated = false;
            this.resetConfig(config);
            this.routerEvents = new rxjs_Subject.Subject();
            this.currentUrlTree = createEmptyUrlTree();
            this.configLoader = new RouterConfigLoader(loader, compiler);
            this.currentRouterState = createEmptyState(this.currentUrlTree, this.rootComponentType);
        }
        /**
         * @internal
         * TODO: this should be removed once the constructor of the router made internal
         */
        Router.prototype.resetRootComponentType = function (rootComponentType) {
            this.rootComponentType = rootComponentType;
            // TODO: vsavkin router 4.0 should make the root component set to null
            // this will simplify the lifecycle of the router.
            this.currentRouterState.root.component = this.rootComponentType;
        };
        /**
         * Sets up the location change listener and performs the initial navigation.
         */
        Router.prototype.initialNavigation = function () {
            this.setUpLocationChangeListener();
            this.navigateByUrl(this.location.path(true), { replaceUrl: true });
        };
        /**
         * Sets up the location change listener.
         */
        Router.prototype.setUpLocationChangeListener = function () {
            var _this = this;
            // Zone.current.wrap is needed because of the issue with RxJS scheduler,
            // which does not work properly with zone.js in IE and Safari
            this.locationSubscription = this.location.subscribe(Zone.current.wrap(function (change) {
                var tree = _this.urlSerializer.parse(change['url']);
                // we fire multiple events for a single URL change
                // we should navigate only once
                return _this.currentUrlTree.toString() !== tree.toString() ?
                    _this.scheduleNavigation(tree, { skipLocationChange: change['pop'], replaceUrl: true }) :
                    null;
            }));
        };
        Object.defineProperty(Router.prototype, "routerState", {
            /**
             * Returns the current route state.
             */
            get: function () { return this.currentRouterState; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Router.prototype, "url", {
            /**
             * Returns the current url.
             */
            get: function () { return this.serializeUrl(this.currentUrlTree); },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Router.prototype, "events", {
            /**
             * Returns an observable of route events
             */
            get: function () { return this.routerEvents; },
            enumerable: true,
            configurable: true
        });
        /**
         * Resets the configuration used for navigation and generating links.
         *
         * ### Usage
         *
         * ```
         * router.resetConfig([
         *  { path: 'team/:id', component: TeamCmp, children: [
         *    { path: 'simple', component: SimpleCmp },
         *    { path: 'user/:name', component: UserCmp }
         *  ] }
         * ]);
         * ```
         */
        Router.prototype.resetConfig = function (config) {
            validateConfig(config);
            this.config = config;
        };
        /**
         * @docsNotRequired
         */
        Router.prototype.ngOnDestroy = function () { this.dispose(); };
        /**
         * Disposes of the router.
         */
        Router.prototype.dispose = function () { this.locationSubscription.unsubscribe(); };
        /**
         * Applies an array of commands to the current url tree and creates a new url tree.
         *
         * When given an activate route, applies the given commands starting from the route.
         * When not given a route, applies the given command starting from the root.
         *
         * ### Usage
         *
         * ```
         * // create /team/33/user/11
         * router.createUrlTree(['/team', 33, 'user', 11]);
         *
         * // create /team/33;expand=true/user/11
         * router.createUrlTree(['/team', 33, {expand: true}, 'user', 11]);
         *
         * // you can collapse static segments like this (this works only with the first passed-in value):
         * router.createUrlTree(['/team/33/user', userId]);
         *
         * // If the first segment can contain slashes, and you do not want the router to split it, you
         * // can do the following:
         *
         * router.createUrlTree([{segmentPath: '/one/two'}]);
         *
         * // create /team/33/(user/11//right:chat)
         * router.createUrlTree(['/team', 33, {outlets: {primary: 'user/11', right: 'chat'}}]);
         *
         * // remove the right secondary node
         * router.createUrlTree(['/team', 33, {outlets: {primary: 'user/11', right: null}}]);
         *
         * // assuming the current url is `/team/33/user/11` and the route points to `user/11`
         *
         * // navigate to /team/33/user/11/details
         * router.createUrlTree(['details'], {relativeTo: route});
         *
         * // navigate to /team/33/user/22
         * router.createUrlTree(['../22'], {relativeTo: route});
         *
         * // navigate to /team/44/user/22
         * router.createUrlTree(['../../team/44/user/22'], {relativeTo: route});
         * ```
         */
        Router.prototype.createUrlTree = function (commands, _a) {
            var _b = _a === void 0 ? {} : _a, relativeTo = _b.relativeTo, queryParams = _b.queryParams, fragment = _b.fragment, preserveQueryParams = _b.preserveQueryParams, preserveFragment = _b.preserveFragment;
            var a = relativeTo ? relativeTo : this.routerState.root;
            var q = preserveQueryParams ? this.currentUrlTree.queryParams : queryParams;
            var f = preserveFragment ? this.currentUrlTree.fragment : fragment;
            return createUrlTree(a, this.currentUrlTree, commands, q, f);
        };
        /**
         * Navigate based on the provided url. This navigation is always absolute.
         *
         * Returns a promise that:
         * - is resolved with 'true' when navigation succeeds
         * - is resolved with 'false' when navigation fails
         * - is rejected when an error happens
         *
         * ### Usage
         *
         * ```
         * router.navigateByUrl("/team/33/user/11");
         *
         * // Navigate without updating the URL
         * router.navigateByUrl("/team/33/user/11", { skipLocationChange: true });
         * ```
         *
         * In opposite to `navigate`, `navigateByUrl` takes a whole URL
         * and does not apply any delta to the current one.
         */
        Router.prototype.navigateByUrl = function (url, extras) {
            if (extras === void 0) { extras = { skipLocationChange: false }; }
            if (url instanceof UrlTree) {
                return this.scheduleNavigation(url, extras);
            }
            else {
                var urlTree = this.urlSerializer.parse(url);
                return this.scheduleNavigation(urlTree, extras);
            }
        };
        /**
         * Navigate based on the provided array of commands and a starting point.
         * If no starting route is provided, the navigation is absolute.
         *
         * Returns a promise that:
         * - is resolved with 'true' when navigation succeeds
         * - is resolved with 'false' when navigation fails
         * - is rejected when an error happens
         *
         * ### Usage
         *
         * ```
         * router.navigate(['team', 33, 'user', 11], {relativeTo: route});
         *
         * // Navigate without updating the URL
         * router.navigate(['team', 33, 'user', 11], {relativeTo: route, skipLocationChange: true });
         * ```
         *
         * In opposite to `navigateByUrl`, `navigate` always takes a delta
         * that is applied to the current URL.
         */
        Router.prototype.navigate = function (commands, extras) {
            if (extras === void 0) { extras = { skipLocationChange: false }; }
            return this.scheduleNavigation(this.createUrlTree(commands, extras), extras);
        };
        /**
         * Serializes a {@link UrlTree} into a string.
         */
        Router.prototype.serializeUrl = function (url) { return this.urlSerializer.serialize(url); };
        /**
         * Parses a string into a {@link UrlTree}.
         */
        Router.prototype.parseUrl = function (url) { return this.urlSerializer.parse(url); };
        /**
         * Returns if the url is activated or not.
         */
        Router.prototype.isActive = function (url, exact) {
            if (url instanceof UrlTree) {
                return containsTree(this.currentUrlTree, url, exact);
            }
            else {
                var urlTree = this.urlSerializer.parse(url);
                return containsTree(this.currentUrlTree, urlTree, exact);
            }
        };
        Router.prototype.scheduleNavigation = function (url, extras) {
            var _this = this;
            var id = ++this.navigationId;
            this.routerEvents.next(new NavigationStart(id, this.serializeUrl(url)));
            return Promise.resolve().then(function (_) { return _this.runNavigate(url, extras.skipLocationChange, extras.replaceUrl, id); });
        };
        Router.prototype.runNavigate = function (url, shouldPreventPushState, shouldReplaceUrl, id) {
            var _this = this;
            if (id !== this.navigationId) {
                this.location.go(this.urlSerializer.serialize(this.currentUrlTree));
                this.routerEvents.next(new NavigationCancel(id, this.serializeUrl(url), "Navigation ID " + id + " is not equal to the current navigation id " + this.navigationId));
                return Promise.resolve(false);
            }
            return new Promise(function (resolvePromise, rejectPromise) {
                var state;
                var navigationIsSuccessful;
                var preActivation;
                var appliedUrl;
                var storedState = _this.currentRouterState;
                var storedUrl = _this.currentUrlTree;
                var redirectsApplied$ = applyRedirects(_this.injector, _this.configLoader, url, _this.config);
                var snapshot$ = rxjs_operator_mergeMap.mergeMap.call(redirectsApplied$, function (u) {
                    appliedUrl = u;
                    return recognize(_this.rootComponentType, _this.config, appliedUrl, _this.serializeUrl(appliedUrl));
                });
                var emitRecognzied$ = rxjs_operator_map.map.call(snapshot$, function (newRouterStateSnapshot) {
                    _this.routerEvents.next(new RoutesRecognized(id, _this.serializeUrl(url), _this.serializeUrl(appliedUrl), newRouterStateSnapshot));
                    return newRouterStateSnapshot;
                });
                var routerState$ = rxjs_operator_map.map.call(emitRecognzied$, function (routerStateSnapshot) {
                    return createRouterState(routerStateSnapshot, _this.currentRouterState);
                });
                var preactivation$ = rxjs_operator_map.map.call(routerState$, function (newState) {
                    state = newState;
                    preActivation =
                        new PreActivation(state.snapshot, _this.currentRouterState.snapshot, _this.injector);
                    preActivation.traverse(_this.outletMap);
                });
                var preactivation2$ = rxjs_operator_mergeMap.mergeMap.call(preactivation$, function () { return preActivation.checkGuards(); });
                var resolveData$ = rxjs_operator_mergeMap.mergeMap.call(preactivation2$, function (shouldActivate) {
                    if (shouldActivate) {
                        return rxjs_operator_map.map.call(preActivation.resolveData(), function () { return shouldActivate; });
                    }
                    else {
                        return rxjs_observable_of.of(shouldActivate);
                    }
                });
                resolveData$
                    .forEach(function (shouldActivate) {
                    if (!shouldActivate || id !== _this.navigationId) {
                        navigationIsSuccessful = false;
                        return;
                    }
                    _this.currentUrlTree = appliedUrl;
                    _this.currentRouterState = state;
                    if (!shouldPreventPushState) {
                        var path = _this.urlSerializer.serialize(appliedUrl);
                        if (_this.location.isCurrentPathEqualTo(path) || shouldReplaceUrl) {
                            _this.location.replaceState(path);
                        }
                        else {
                            _this.location.go(path);
                        }
                    }
                    new ActivateRoutes(state, storedState).activate(_this.outletMap);
                    navigationIsSuccessful = true;
                })
                    .then(function () {
                    _this.navigated = true;
                    if (navigationIsSuccessful) {
                        _this.routerEvents.next(new NavigationEnd(id, _this.serializeUrl(url), _this.serializeUrl(appliedUrl)));
                        resolvePromise(true);
                    }
                    else {
                        _this.routerEvents.next(new NavigationCancel(id, _this.serializeUrl(url), ''));
                        resolvePromise(false);
                    }
                }, function (e) {
                    if (e instanceof NavigationCancelingError) {
                        _this.navigated = true;
                        _this.routerEvents.next(new NavigationCancel(id, _this.serializeUrl(url), e.message));
                        resolvePromise(false);
                    }
                    else {
                        _this.routerEvents.next(new NavigationError(id, _this.serializeUrl(url), e));
                        try {
                            resolvePromise(_this.errorHandler(e));
                        }
                        catch (ee) {
                            rejectPromise(ee);
                        }
                    }
                    if (id === _this.navigationId) {
                        _this.currentRouterState = storedState;
                        _this.currentUrlTree = storedUrl;
                        _this.location.replaceState(_this.serializeUrl(storedUrl));
                    }
                });
            });
        };
        return Router;
    }());
    var CanActivate = (function () {
        function CanActivate(path) {
            this.path = path;
        }
        Object.defineProperty(CanActivate.prototype, "route", {
            get: function () { return this.path[this.path.length - 1]; },
            enumerable: true,
            configurable: true
        });
        return CanActivate;
    }());
    var CanDeactivate = (function () {
        function CanDeactivate(component, route) {
            this.component = component;
            this.route = route;
        }
        return CanDeactivate;
    }());
    var PreActivation = (function () {
        function PreActivation(future, curr, injector) {
            this.future = future;
            this.curr = curr;
            this.injector = injector;
            this.checks = [];
        }
        PreActivation.prototype.traverse = function (parentOutletMap) {
            var futureRoot = this.future._root;
            var currRoot = this.curr ? this.curr._root : null;
            this.traverseChildRoutes(futureRoot, currRoot, parentOutletMap, [futureRoot.value]);
        };
        PreActivation.prototype.checkGuards = function () {
            var _this = this;
            if (this.checks.length === 0)
                return rxjs_observable_of.of(true);
            var checks$ = rxjs_observable_from.from(this.checks);
            var runningChecks$ = rxjs_operator_map.map.call(checks$, function (s) {
                if (s instanceof CanActivate) {
                    return andObservables(rxjs_observable_from.from([_this.runCanActivateChild(s.path), _this.runCanActivate(s.route)]));
                }
                else if (s instanceof CanDeactivate) {
                    // workaround https://github.com/Microsoft/TypeScript/issues/7271
                    var s2 = s;
                    return _this.runCanDeactivate(s2.component, s2.route);
                }
                else {
                    throw new Error('Cannot be reached');
                }
            });
            var mergedChecks$ = rxjs_operator_mergeAll.mergeAll.call(runningChecks$);
            return rxjs_operator_every.every.call(mergedChecks$, function (result) { return result === true; });
        };
        PreActivation.prototype.resolveData = function () {
            var _this = this;
            if (this.checks.length === 0)
                return rxjs_observable_of.of(null);
            var checks$ = rxjs_observable_from.from(this.checks);
            var runningChecks$ = rxjs_operator_mergeMap.mergeMap.call(checks$, function (s) {
                if (s instanceof CanActivate) {
                    return _this.runResolve(s.route);
                }
                else {
                    return rxjs_observable_of.of(null);
                }
            });
            return rxjs_operator_reduce.reduce.call(runningChecks$, function (_, __) { return _; });
        };
        PreActivation.prototype.traverseChildRoutes = function (futureNode, currNode, outletMap, futurePath) {
            var _this = this;
            var prevChildren = nodeChildrenAsMap(currNode);
            futureNode.children.forEach(function (c) {
                _this.traverseRoutes(c, prevChildren[c.value.outlet], outletMap, futurePath.concat([c.value]));
                delete prevChildren[c.value.outlet];
            });
            forEach(prevChildren, function (v, k) { return _this.deactivateOutletAndItChildren(v, outletMap._outlets[k]); });
        };
        PreActivation.prototype.traverseRoutes = function (futureNode, currNode, parentOutletMap, futurePath) {
            var future = futureNode.value;
            var curr = currNode ? currNode.value : null;
            var outlet = parentOutletMap ? parentOutletMap._outlets[futureNode.value.outlet] : null;
            // reusing the node
            if (curr && future._routeConfig === curr._routeConfig) {
                if (!shallowEqual(future.params, curr.params)) {
                    this.checks.push(new CanDeactivate(outlet.component, curr), new CanActivate(futurePath));
                }
                else {
                    // we need to set the data
                    future.data = curr.data;
                }
                // If we have a component, we need to go through an outlet.
                if (future.component) {
                    this.traverseChildRoutes(futureNode, currNode, outlet ? outlet.outletMap : null, futurePath);
                }
                else {
                    this.traverseChildRoutes(futureNode, currNode, parentOutletMap, futurePath);
                }
            }
            else {
                if (curr) {
                    // if we had a normal route, we need to deactivate only that outlet.
                    if (curr.component) {
                        this.deactivateOutletAndItChildren(curr, outlet);
                    }
                    else {
                        this.deactivateOutletMap(parentOutletMap);
                    }
                }
                this.checks.push(new CanActivate(futurePath));
                // If we have a component, we need to go through an outlet.
                if (future.component) {
                    this.traverseChildRoutes(futureNode, null, outlet ? outlet.outletMap : null, futurePath);
                }
                else {
                    this.traverseChildRoutes(futureNode, null, parentOutletMap, futurePath);
                }
            }
        };
        PreActivation.prototype.deactivateOutletAndItChildren = function (route, outlet) {
            if (outlet && outlet.isActivated) {
                this.deactivateOutletMap(outlet.outletMap);
                this.checks.push(new CanDeactivate(outlet.component, route));
            }
        };
        PreActivation.prototype.deactivateOutletMap = function (outletMap) {
            var _this = this;
            forEach(outletMap._outlets, function (v) {
                if (v.isActivated) {
                    _this.deactivateOutletAndItChildren(v.activatedRoute.snapshot, v);
                }
            });
        };
        PreActivation.prototype.runCanActivate = function (future) {
            var _this = this;
            var canActivate = future._routeConfig ? future._routeConfig.canActivate : null;
            if (!canActivate || canActivate.length === 0)
                return rxjs_observable_of.of(true);
            var obs = rxjs_operator_map.map.call(rxjs_observable_from.from(canActivate), function (c) {
                var guard = _this.getToken(c, future);
                if (guard.canActivate) {
                    return wrapIntoObservable(guard.canActivate(future, _this.future));
                }
                else {
                    return wrapIntoObservable(guard(future, _this.future));
                }
            });
            return andObservables(obs);
        };
        PreActivation.prototype.runCanActivateChild = function (path) {
            var _this = this;
            var future = path[path.length - 1];
            var canActivateChildGuards = path.slice(0, path.length - 1)
                .reverse()
                .map(function (p) { return _this.extractCanActivateChild(p); })
                .filter(function (_) { return _ !== null; });
            return andObservables(rxjs_operator_map.map.call(rxjs_observable_from.from(canActivateChildGuards), function (d) {
                var obs = rxjs_operator_map.map.call(rxjs_observable_from.from(d.guards), function (c) {
                    var guard = _this.getToken(c, c.node);
                    if (guard.canActivateChild) {
                        return wrapIntoObservable(guard.canActivateChild(future, _this.future));
                    }
                    else {
                        return wrapIntoObservable(guard(future, _this.future));
                    }
                });
                return andObservables(obs);
            }));
        };
        PreActivation.prototype.extractCanActivateChild = function (p) {
            var canActivateChild = p._routeConfig ? p._routeConfig.canActivateChild : null;
            if (!canActivateChild || canActivateChild.length === 0)
                return null;
            return { node: p, guards: canActivateChild };
        };
        PreActivation.prototype.runCanDeactivate = function (component, curr) {
            var _this = this;
            var canDeactivate = curr && curr._routeConfig ? curr._routeConfig.canDeactivate : null;
            if (!canDeactivate || canDeactivate.length === 0)
                return rxjs_observable_of.of(true);
            var canDeactivate$ = rxjs_operator_map.map.call(rxjs_observable_from.from(canDeactivate), function (c) {
                var guard = _this.getToken(c, curr);
                if (guard.canDeactivate) {
                    return wrapIntoObservable(guard.canDeactivate(component, curr, _this.curr));
                }
                else {
                    return wrapIntoObservable(guard(component, curr, _this.curr));
                }
            });
            var merged$ = rxjs_operator_mergeAll.mergeAll.call(canDeactivate$);
            return rxjs_operator_every.every.call(merged$, function (result) { return result === true; });
        };
        PreActivation.prototype.runResolve = function (future) {
            var resolve = future._resolve;
            return rxjs_operator_map.map.call(this.resolveNode(resolve.current, future), function (resolvedData) {
                resolve.resolvedData = resolvedData;
                future.data = merge(future.data, resolve.flattenedResolvedData);
                return null;
            });
        };
        PreActivation.prototype.resolveNode = function (resolve, future) {
            var _this = this;
            return waitForMap(resolve, function (k, v) {
                var resolver = _this.getToken(v, future);
                return resolver.resolve ? wrapIntoObservable(resolver.resolve(future, _this.future)) :
                    wrapIntoObservable(resolver(future, _this.future));
            });
        };
        PreActivation.prototype.getToken = function (token, snapshot) {
            var config = closestLoadedConfig(snapshot);
            var injector = config ? config.injector : this.injector;
            return injector.get(token);
        };
        return PreActivation;
    }());
    var ActivateRoutes = (function () {
        function ActivateRoutes(futureState, currState) {
            this.futureState = futureState;
            this.currState = currState;
        }
        ActivateRoutes.prototype.activate = function (parentOutletMap) {
            var futureRoot = this.futureState._root;
            var currRoot = this.currState ? this.currState._root : null;
            advanceActivatedRoute(this.futureState.root);
            this.activateChildRoutes(futureRoot, currRoot, parentOutletMap);
        };
        ActivateRoutes.prototype.activateChildRoutes = function (futureNode, currNode, outletMap) {
            var _this = this;
            var prevChildren = nodeChildrenAsMap(currNode);
            futureNode.children.forEach(function (c) {
                _this.activateRoutes(c, prevChildren[c.value.outlet], outletMap);
                delete prevChildren[c.value.outlet];
            });
            forEach(prevChildren, function (v, k) { return _this.deactivateOutletAndItChildren(outletMap._outlets[k]); });
        };
        ActivateRoutes.prototype.activateRoutes = function (futureNode, currNode, parentOutletMap) {
            var future = futureNode.value;
            var curr = currNode ? currNode.value : null;
            // reusing the node
            if (future === curr) {
                // advance the route to push the parameters
                advanceActivatedRoute(future);
                // If we have a normal route, we need to go through an outlet.
                if (future.component) {
                    var outlet = getOutlet(parentOutletMap, futureNode.value);
                    this.activateChildRoutes(futureNode, currNode, outlet.outletMap);
                }
                else {
                    this.activateChildRoutes(futureNode, currNode, parentOutletMap);
                }
            }
            else {
                if (curr) {
                    // if we had a normal route, we need to deactivate only that outlet.
                    if (curr.component) {
                        var outlet = getOutlet(parentOutletMap, futureNode.value);
                        this.deactivateOutletAndItChildren(outlet);
                    }
                    else {
                        this.deactivateOutletMap(parentOutletMap);
                    }
                }
                // if we have a normal route, we need to advance the route
                // and place the component into the outlet. After that recurse.
                if (future.component) {
                    advanceActivatedRoute(future);
                    var outlet = getOutlet(parentOutletMap, futureNode.value);
                    var outletMap = new RouterOutletMap();
                    this.placeComponentIntoOutlet(outletMap, future, outlet);
                    this.activateChildRoutes(futureNode, null, outletMap);
                }
                else {
                    advanceActivatedRoute(future);
                    this.activateChildRoutes(futureNode, null, parentOutletMap);
                }
            }
        };
        ActivateRoutes.prototype.placeComponentIntoOutlet = function (outletMap, future, outlet) {
            var resolved = [{ provide: ActivatedRoute, useValue: future }, {
                    provide: RouterOutletMap,
                    useValue: outletMap
                }];
            var config = parentLoadedConfig(future.snapshot);
            var loadedFactoryResolver = null;
            var loadedInjector = null;
            if (config) {
                loadedFactoryResolver = config.factoryResolver;
                loadedInjector = config.injector;
                resolved.push({ provide: _angular_core.ComponentFactoryResolver, useValue: loadedFactoryResolver });
            }
            outlet.activate(future, loadedFactoryResolver, loadedInjector, _angular_core.ReflectiveInjector.resolve(resolved), outletMap);
        };
        ActivateRoutes.prototype.deactivateOutletAndItChildren = function (outlet) {
            if (outlet && outlet.isActivated) {
                this.deactivateOutletMap(outlet.outletMap);
                outlet.deactivate();
            }
        };
        ActivateRoutes.prototype.deactivateOutletMap = function (outletMap) {
            var _this = this;
            forEach(outletMap._outlets, function (v) { return _this.deactivateOutletAndItChildren(v); });
        };
        return ActivateRoutes;
    }());
    function parentLoadedConfig(snapshot) {
        var s = snapshot.parent;
        while (s) {
            var c = s._routeConfig;
            if (c && c._loadedConfig)
                return c._loadedConfig;
            if (c && c.component)
                return null;
            s = s.parent;
        }
        return null;
    }
    function closestLoadedConfig(snapshot) {
        if (!snapshot)
            return null;
        var s = snapshot.parent;
        while (s) {
            var c = s._routeConfig;
            if (c && c._loadedConfig)
                return c._loadedConfig;
            s = s.parent;
        }
        return null;
    }
    function nodeChildrenAsMap(node) {
        return node ? node.children.reduce(function (m, c) {
            m[c.value.outlet] = c;
            return m;
        }, {}) : {};
    }
    function getOutlet(outletMap, route) {
        var outlet = outletMap._outlets[route.outlet];
        if (!outlet) {
            var componentName = route.component.name;
            if (route.outlet === PRIMARY_OUTLET) {
                throw new Error("Cannot find primary outlet to load '" + componentName + "'");
            }
            else {
                throw new Error("Cannot find the outlet " + route.outlet + " to load '" + componentName + "'");
            }
        }
        return outlet;
    }

    /**
     * @whatItDoes Lets you link to specific parts of your app.
     *
     * @howToUse
     *
     * Consider the following route configuration:

     * ```
     * [{ path: 'user/:name', component: UserCmp }]
     * ```
     *
     * When linking to this `user/:name` route, you can write:
     *
     * ```
     * <a routerLink='/user/bob'>link to user component</a>
     * ```
     *
     * @description
     *
     * The RouterLink directives let you link to specific parts of your app.
     *
     * Whe the link is static, you can use the directive as follows:
     *
     * ```
     * <a routerLink="/user/bob">link to user component</a>
     * ```
     *
     * If you use dynamic values to generate the link, you can pass an array of path
     * segments, followed by the params for each segment.
     *
     * For instance `['/team', teamId, 'user', userName, {details: true}]`
     * means that we want to generate a link to `/team/11/user/bob;details=true`.
     *
     * Multiple static segments can be merged into one (e.g., `['/team/11/user', userName, {details:
     true}]`).
     *
     * The first segment name can be prepended with `/`, `./`, or `../`:
     * * If the first segment begins with `/`, the router will look up the route from the root of the
     app.
     * * If the first segment begins with `./`, or doesn't begin with a slash, the router will
     * instead look in the children of the current activated route.
     * * And if the first segment begins with `../`, the router will go up one level.
     *
     * You can set query params and fragment as follows:
     *
     * ```
     * <a [routerLink]="['/user/bob']" [queryParams]="{debug: true}" fragment="education">link to user
     component</a>
     * ```
     * RouterLink will use these to generate this link: `/user/bob#education?debug=true`.
     *
     * You can also tell the directive to preserve the current query params and fragment:
     *
     * ```
     * <a [routerLink]="['/user/bob']" preserveQueryParams preserveFragment>link to user
     component</a>
     * ```
     *
     * The router link directive always treats the provided input as a delta to the current url.
     *
     * For instance, if the current url is `/user/(box//aux:team)`.
     *
     * Then the following link `<a [routerLink]="['/user/jim']">Jim</a>` will generate the link
     * `/user/(jim//aux:team)`.
     *
     * @selector ':not(a)[routerLink]'
     * @ngModule RouterModule
     *
     * See {@link Router.createUrlTree} for more information.
     *
     * @stable
     */
    var RouterLink = (function () {
        function RouterLink(router, route, locationStrategy) {
            this.router = router;
            this.route = route;
            this.locationStrategy = locationStrategy;
            this.commands = [];
        }
        Object.defineProperty(RouterLink.prototype, "routerLink", {
            set: function (data) {
                if (Array.isArray(data)) {
                    this.commands = data;
                }
                else {
                    this.commands = [data];
                }
            },
            enumerable: true,
            configurable: true
        });
        RouterLink.prototype.onClick = function (button, ctrlKey, metaKey) {
            if (button !== 0 || ctrlKey || metaKey) {
                return true;
            }
            this.router.navigateByUrl(this.urlTree);
            return false;
        };
        Object.defineProperty(RouterLink.prototype, "urlTree", {
            get: function () {
                return this.router.createUrlTree(this.commands, {
                    relativeTo: this.route,
                    queryParams: this.queryParams,
                    fragment: this.fragment,
                    preserveQueryParams: toBool(this.preserveQueryParams),
                    preserveFragment: toBool(this.preserveFragment)
                });
            },
            enumerable: true,
            configurable: true
        });
        RouterLink.decorators = [
            { type: _angular_core.Directive, args: [{ selector: ':not(a)[routerLink]' },] },
        ];
        /** @nocollapse */
        RouterLink.ctorParameters = [
            { type: Router, },
            { type: ActivatedRoute, },
            { type: _angular_common.LocationStrategy, },
        ];
        RouterLink.propDecorators = {
            'queryParams': [{ type: _angular_core.Input },],
            'fragment': [{ type: _angular_core.Input },],
            'preserveQueryParams': [{ type: _angular_core.Input },],
            'preserveFragment': [{ type: _angular_core.Input },],
            'routerLink': [{ type: _angular_core.Input },],
            'onClick': [{ type: _angular_core.HostListener, args: ['click', ['$event.button', '$event.ctrlKey', '$event.metaKey'],] },],
        };
        return RouterLink;
    }());
    /**
     * @whatItDoes Lets you link to specific parts of your app.
     *
     * See {@link RouterLink} for more information.
     *
     * @selector 'a[routerLink]'
     * @ngModule RouterModule
     *
     * @stable
     */
    var RouterLinkWithHref = (function () {
        function RouterLinkWithHref(router, route, locationStrategy) {
            var _this = this;
            this.router = router;
            this.route = route;
            this.locationStrategy = locationStrategy;
            this.commands = [];
            this.subscription = router.events.subscribe(function (s) {
                if (s instanceof NavigationEnd) {
                    _this.updateTargetUrlAndHref();
                }
            });
        }
        Object.defineProperty(RouterLinkWithHref.prototype, "routerLink", {
            set: function (data) {
                if (Array.isArray(data)) {
                    this.commands = data;
                }
                else {
                    this.commands = [data];
                }
            },
            enumerable: true,
            configurable: true
        });
        RouterLinkWithHref.prototype.ngOnChanges = function (changes) { this.updateTargetUrlAndHref(); };
        RouterLinkWithHref.prototype.ngOnDestroy = function () { this.subscription.unsubscribe(); };
        RouterLinkWithHref.prototype.onClick = function (button, ctrlKey, metaKey) {
            if (button !== 0 || ctrlKey || metaKey) {
                return true;
            }
            if (typeof this.target === 'string' && this.target != '_self') {
                return true;
            }
            this.router.navigateByUrl(this.urlTree);
            return false;
        };
        RouterLinkWithHref.prototype.updateTargetUrlAndHref = function () {
            this.href = this.locationStrategy.prepareExternalUrl(this.router.serializeUrl(this.urlTree));
        };
        Object.defineProperty(RouterLinkWithHref.prototype, "urlTree", {
            get: function () {
                return this.router.createUrlTree(this.commands, {
                    relativeTo: this.route,
                    queryParams: this.queryParams,
                    fragment: this.fragment,
                    preserveQueryParams: toBool(this.preserveQueryParams),
                    preserveFragment: toBool(this.preserveFragment)
                });
            },
            enumerable: true,
            configurable: true
        });
        RouterLinkWithHref.decorators = [
            { type: _angular_core.Directive, args: [{ selector: 'a[routerLink]' },] },
        ];
        /** @nocollapse */
        RouterLinkWithHref.ctorParameters = [
            { type: Router, },
            { type: ActivatedRoute, },
            { type: _angular_common.LocationStrategy, },
        ];
        RouterLinkWithHref.propDecorators = {
            'target': [{ type: _angular_core.Input },],
            'queryParams': [{ type: _angular_core.Input },],
            'fragment': [{ type: _angular_core.Input },],
            'routerLinkOptions': [{ type: _angular_core.Input },],
            'preserveQueryParams': [{ type: _angular_core.Input },],
            'preserveFragment': [{ type: _angular_core.Input },],
            'href': [{ type: _angular_core.HostBinding },],
            'routerLink': [{ type: _angular_core.Input },],
            'onClick': [{ type: _angular_core.HostListener, args: ['click', ['$event.button', '$event.ctrlKey', '$event.metaKey'],] },],
        };
        return RouterLinkWithHref;
    }());
    function toBool(s) {
        if (s === '')
            return true;
        return !!s;
    }

    /**
     * @whatItDoes Lets you add a CSS class to an element when the link's route becomes active.
     *
     * @howToUse
     *
     * ```
     * <a [routerLink]='/user/bob' routerLinkActive='active-link'>Bob</a>
     * ```
     *
     * @description
     *
     * The RouterLinkActive directive lets you add a CSS class to an element when the link's route
     * becomes active.
     *
     * Consider the following example:
     *
     * ```
     * <a [routerLink]="/user/bob" routerLinkActive="active-link">Bob</a>
     * ```
     *
     * When the url is either '/user' or '/user/bob', the active-link class will
     * be added to the `a` tag. If the url changes, the class will be removed.
     *
     * You can set more than one class, as follows:
     *
     * ```
     * <a [routerLink]="/user/bob" routerLinkActive="class1 class2">Bob</a>
     * <a [routerLink]="/user/bob" [routerLinkActive]="['class1', 'class2']">Bob</a>
     * ```
     *
     * You can configure RouterLinkActive by passing `exact: true`. This will add the classes
     * only when the url matches the link exactly.
     *
     * ```
     * <a [routerLink]="/user/bob" routerLinkActive="active-link" [routerLinkActiveOptions]="{exact:
     * true}">Bob</a>
     * ```
     *
     * Finally, you can apply the RouterLinkActive directive to an ancestor of a RouterLink.
     *
     * ```
     * <div routerLinkActive="active-link" [routerLinkActiveOptions]="{exact: true}">
     *   <a [routerLink]="/user/jim">Jim</a>
     *   <a [routerLink]="/user/bob">Bob</a>
     * </div>
     * ```
     *
     * This will set the active-link class on the div tag if the url is either '/user/jim' or
     * '/user/bob'.
     *
     * @selector ':not(a)[routerLink]'
     * @ngModule RouterModule
     *
     * @stable
     */
    var RouterLinkActive = (function () {
        function RouterLinkActive(router, element, renderer) {
            var _this = this;
            this.router = router;
            this.element = element;
            this.renderer = renderer;
            this.classes = [];
            this.routerLinkActiveOptions = { exact: false };
            this.subscription = router.events.subscribe(function (s) {
                if (s instanceof NavigationEnd) {
                    _this.update();
                }
            });
        }
        RouterLinkActive.prototype.ngAfterContentInit = function () {
            var _this = this;
            this.links.changes.subscribe(function (s) { return _this.update(); });
            this.linksWithHrefs.changes.subscribe(function (s) { return _this.update(); });
            this.update();
        };
        Object.defineProperty(RouterLinkActive.prototype, "routerLinkActive", {
            set: function (data) {
                if (Array.isArray(data)) {
                    this.classes = data;
                }
                else {
                    this.classes = data.split(' ');
                }
            },
            enumerable: true,
            configurable: true
        });
        RouterLinkActive.prototype.ngOnChanges = function (changes) { this.update(); };
        RouterLinkActive.prototype.ngOnDestroy = function () { this.subscription.unsubscribe(); };
        RouterLinkActive.prototype.update = function () {
            var _this = this;
            if (!this.links || !this.linksWithHrefs || !this.router.navigated)
                return;
            var isActive = this.hasActiveLink();
            this.classes.forEach(function (c) { return _this.renderer.setElementClass(_this.element.nativeElement, c, isActive); });
        };
        RouterLinkActive.prototype.isLinkActive = function (router) {
            var _this = this;
            return function (link) {
                return router.isActive(link.urlTree, _this.routerLinkActiveOptions.exact);
            };
        };
        RouterLinkActive.prototype.hasActiveLink = function () {
            return this.links.some(this.isLinkActive(this.router)) ||
                this.linksWithHrefs.some(this.isLinkActive(this.router));
        };
        RouterLinkActive.decorators = [
            { type: _angular_core.Directive, args: [{ selector: '[routerLinkActive]' },] },
        ];
        /** @nocollapse */
        RouterLinkActive.ctorParameters = [
            { type: Router, },
            { type: _angular_core.ElementRef, },
            { type: _angular_core.Renderer, },
        ];
        RouterLinkActive.propDecorators = {
            'links': [{ type: _angular_core.ContentChildren, args: [RouterLink, { descendants: true },] },],
            'linksWithHrefs': [{ type: _angular_core.ContentChildren, args: [RouterLinkWithHref, { descendants: true },] },],
            'routerLinkActiveOptions': [{ type: _angular_core.Input },],
            'routerLinkActive': [{ type: _angular_core.Input },],
        };
        return RouterLinkActive;
    }());

    /**
     * @whatItDoes Acts as a placeholder that Angular dynamically fills based on the current router
     * state.
     *
     * @howToUse
     *
     * ```
     * <router-outlet></router-outlet>
     * <router-outlet name='left'></router-outlet>
     * <router-outlet name='right'></router-outlet>
     * ```
     *
     * A router outlet will emit an activate event any time a new component is being instantiated,
     * and a deactivate event when it is being destroyed.
     *
     * ```
     * <router-outlet
     *   (activate)='onActivate($event)'
     *   (deactivate)='onDeactivate($event)'></router-outlet>
     * ```
     * @selector 'a[routerLink]'
     * @ngModule RouterModule
     *
     * @stable
     */
    var RouterOutlet = (function () {
        function RouterOutlet(parentOutletMap, location, resolver, name) {
            this.parentOutletMap = parentOutletMap;
            this.location = location;
            this.resolver = resolver;
            this.name = name;
            this.activateEvents = new _angular_core.EventEmitter();
            this.deactivateEvents = new _angular_core.EventEmitter();
            parentOutletMap.registerOutlet(name ? name : PRIMARY_OUTLET, this);
        }
        RouterOutlet.prototype.ngOnDestroy = function () { this.parentOutletMap.removeOutlet(this.name ? this.name : PRIMARY_OUTLET); };
        Object.defineProperty(RouterOutlet.prototype, "isActivated", {
            get: function () { return !!this.activated; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(RouterOutlet.prototype, "component", {
            get: function () {
                if (!this.activated)
                    throw new Error('Outlet is not activated');
                return this.activated.instance;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(RouterOutlet.prototype, "activatedRoute", {
            get: function () {
                if (!this.activated)
                    throw new Error('Outlet is not activated');
                return this._activatedRoute;
            },
            enumerable: true,
            configurable: true
        });
        RouterOutlet.prototype.deactivate = function () {
            if (this.activated) {
                var c = this.component;
                this.activated.destroy();
                this.activated = null;
                this.deactivateEvents.emit(c);
            }
        };
        RouterOutlet.prototype.activate = function (activatedRoute, loadedResolver, loadedInjector, providers, outletMap) {
            this.outletMap = outletMap;
            this._activatedRoute = activatedRoute;
            var snapshot = activatedRoute._futureSnapshot;
            var component = snapshot._routeConfig.component;
            var factory;
            if (loadedResolver) {
                factory = loadedResolver.resolveComponentFactory(component);
            }
            else {
                factory = this.resolver.resolveComponentFactory(component);
            }
            var injector = loadedInjector ? loadedInjector : this.location.parentInjector;
            var inj = _angular_core.ReflectiveInjector.fromResolvedProviders(providers, injector);
            this.activated = this.location.createComponent(factory, this.location.length, inj, []);
            this.activated.changeDetectorRef.detectChanges();
            this.activateEvents.emit(this.activated.instance);
        };
        RouterOutlet.decorators = [
            { type: _angular_core.Directive, args: [{ selector: 'router-outlet' },] },
        ];
        /** @nocollapse */
        RouterOutlet.ctorParameters = [
            { type: RouterOutletMap, },
            { type: _angular_core.ViewContainerRef, },
            { type: _angular_core.ComponentFactoryResolver, },
            { type: undefined, decorators: [{ type: _angular_core.Attribute, args: ['name',] },] },
        ];
        RouterOutlet.propDecorators = {
            'activateEvents': [{ type: _angular_core.Output, args: ['activate',] },],
            'deactivateEvents': [{ type: _angular_core.Output, args: ['deactivate',] },],
        };
        return RouterOutlet;
    }());

    /**
     * @whatItDoes Contains a list of directives
     * @stable
     */
    var ROUTER_DIRECTIVES = [RouterOutlet, RouterLink, RouterLinkWithHref, RouterLinkActive];
    /**
     * @whatItDoes Is used in DI to configure the router.
     * @stable
     */
    var ROUTER_CONFIGURATION = new _angular_core.OpaqueToken('ROUTER_CONFIGURATION');
    /**
     * @docsNotRequired
     */
    var ROUTER_FORROOT_GUARD = new _angular_core.OpaqueToken('ROUTER_FORROOT_GUARD');
    var ROUTER_PROVIDERS = [
        _angular_common.Location, { provide: UrlSerializer, useClass: DefaultUrlSerializer }, {
            provide: Router,
            useFactory: setupRouter,
            deps: [
                _angular_core.ApplicationRef, UrlSerializer, RouterOutletMap, _angular_common.Location, _angular_core.Injector, _angular_core.NgModuleFactoryLoader,
                _angular_core.Compiler, ROUTES, ROUTER_CONFIGURATION
            ]
        },
        RouterOutletMap, { provide: ActivatedRoute, useFactory: rootRoute, deps: [Router] },
        { provide: _angular_core.NgModuleFactoryLoader, useClass: _angular_core.SystemJsNgModuleLoader },
        { provide: ROUTER_CONFIGURATION, useValue: { enableTracing: false } }
    ];
    /**
     * @whatItDoes Adds router directives and providers.
     *
     * @howToUse
     *
     * RouterModule can be imported multiple times: once per lazily-loaded bundle.
     * Since the router deals with a global shared resource--location, we cannot have
     * more than one router service active.
     *
     * That is why there are two ways to create the module: `RouterModule.forRoot` and
     * `RouterModule.forChild`.
     *
     * * `forRoot` creates a module that contains all the directives, the given routes, and the router
     * service itself.
     * * `forChild` creates a module that contains all the directives and the given routes, but does not
     * include
     * the router service.
     *
     * When registered at the root, the module should be used as follows
     *
     * ```
     * @NgModule({
     *   imports: [RouterModule.forRoot(ROUTES)]
     * })
     * class MyNgModule {}
     * ```
     *
     * For submodules and lazy loaded submodules the module should be used as follows:
     *
     * ```
     * @NgModule({
     *   imports: [RouterModule.forChild(ROUTES)]
     * })
     * class MyNgModule {}
     * ```
     *
     * @description
     *
     * Managing state transitions is one of the hardest parts of building applications. This is
     * especially true on the web, where you also need to ensure that the state is reflected in the URL.
     * In addition, we often want to split applications into multiple bundles and load them on demand.
     * Doing this transparently is not trivial.
     *
     * The Angular 2 router solves these problems. Using the router, you can declaratively specify
     * application states, manage state transitions while taking care of the URL, and load bundles on
     * demand.
     *
     * [Read this developer guide](https://angular.io/docs/ts/latest/guide/router.html) to get an
     * overview of how the router should be used.
     *
     * @stable
     */
    var RouterModule = (function () {
        function RouterModule(guard) {
        }
        /**
         * Creates a module with all the router providers and directives. It also optionally sets up an
         * application listener to perform an initial navigation.
         *
         * Options:
         * * `enableTracing` makes the router log all its internal events to the console.
         * * `useHash` enables the location strategy that uses the URL fragment instead of the history
         * API.
         * * `initialNavigation` disables the initial navigation.
         * * `errorHandler` provides a custom error handler.
         */
        RouterModule.forRoot = function (routes, config) {
            return {
                ngModule: RouterModule,
                providers: [
                    ROUTER_PROVIDERS, provideRoutes(routes), {
                        provide: ROUTER_FORROOT_GUARD,
                        useFactory: provideForRootGuard,
                        deps: [[Router, new _angular_core.Optional(), new _angular_core.SkipSelf()]]
                    },
                    { provide: ROUTER_CONFIGURATION, useValue: config ? config : {} }, {
                        provide: _angular_common.LocationStrategy,
                        useFactory: provideLocationStrategy,
                        deps: [
                            _angular_common.PlatformLocation, [new _angular_core.Inject(_angular_common.APP_BASE_HREF), new _angular_core.Optional()], ROUTER_CONFIGURATION
                        ]
                    },
                    provideRouterInitializer()
                ]
            };
        };
        /**
         * Creates a module with all the router directives and a provider registering routes.
         */
        RouterModule.forChild = function (routes) {
            return { ngModule: RouterModule, providers: [provideRoutes(routes)] };
        };
        RouterModule.decorators = [
            { type: _angular_core.NgModule, args: [{ declarations: ROUTER_DIRECTIVES, exports: ROUTER_DIRECTIVES },] },
        ];
        /** @nocollapse */
        RouterModule.ctorParameters = [
            { type: undefined, decorators: [{ type: _angular_core.Optional }, { type: _angular_core.Inject, args: [ROUTER_FORROOT_GUARD,] },] },
        ];
        return RouterModule;
    }());
    function provideLocationStrategy(platformLocationStrategy, baseHref, options) {
        if (options === void 0) { options = {}; }
        return options.useHash ? new _angular_common.HashLocationStrategy(platformLocationStrategy, baseHref) :
            new _angular_common.PathLocationStrategy(platformLocationStrategy, baseHref);
    }
    function provideForRootGuard(router) {
        if (router) {
            throw new Error("RouterModule.forRoot() called twice. Lazy loaded modules should use RouterModule.forChild() instead.");
        }
        return 'guarded';
    }
    /**
     * @whatItDoes Registers routes.
     *
     * @howToUse
     *
     * ```
     * @NgModule({
     *   imports: [RouterModule.forChild(ROUTES)],
     *   providers: [provideRoutes(EXTRA_ROUTES)]
     * })
     * class MyNgModule {}
     * ```
     *
     * @stable
     */
    function provideRoutes(routes) {
        return [
            { provide: _angular_core.ANALYZE_FOR_ENTRY_COMPONENTS, multi: true, useValue: routes },
            { provide: ROUTES, multi: true, useValue: routes }
        ];
    }
    function setupRouter(ref, urlSerializer, outletMap, location, injector, loader, compiler, config, opts) {
        if (opts === void 0) { opts = {}; }
        if (ref.componentTypes.length == 0) {
            throw new Error('Bootstrap at least one component before injecting Router.');
        }
        var componentType = ref.componentTypes[0];
        var r = new Router(componentType, urlSerializer, outletMap, location, injector, loader, compiler, flatten(config));
        if (opts.errorHandler) {
            r.errorHandler = opts.errorHandler;
        }
        if (opts.enableTracing) {
            r.events.subscribe(function (e) {
                console.group("Router Event: " + e.constructor.name);
                console.log(e.toString());
                console.log(e);
                console.groupEnd();
            });
        }
        return r;
    }
    function rootRoute(router) {
        return router.routerState.root;
    }
    function initialRouterNavigation(router, opts) {
        return function () {
            if (opts.initialNavigation === false) {
                router.setUpLocationChangeListener();
            }
            else {
                router.initialNavigation();
            }
        };
    }
    function provideRouterInitializer() {
        return {
            provide: _angular_core.APP_BOOTSTRAP_LISTENER,
            multi: true,
            useFactory: initialRouterNavigation,
            deps: [Router, ROUTER_CONFIGURATION]
        };
    }

    var __router_private__ = {
        ROUTER_PROVIDERS: ROUTER_PROVIDERS,
        ROUTES: ROUTES,
        flatten: flatten
    };

    exports.RouterLink = RouterLink;
    exports.RouterLinkWithHref = RouterLinkWithHref;
    exports.RouterLinkActive = RouterLinkActive;
    exports.RouterOutlet = RouterOutlet;
    exports.NavigationCancel = NavigationCancel;
    exports.NavigationEnd = NavigationEnd;
    exports.NavigationError = NavigationError;
    exports.NavigationStart = NavigationStart;
    exports.Router = Router;
    exports.RoutesRecognized = RoutesRecognized;
    exports.RouterModule = RouterModule;
    exports.provideRoutes = provideRoutes;
    exports.RouterOutletMap = RouterOutletMap;
    exports.ActivatedRoute = ActivatedRoute;
    exports.ActivatedRouteSnapshot = ActivatedRouteSnapshot;
    exports.RouterState = RouterState;
    exports.RouterStateSnapshot = RouterStateSnapshot;
    exports.PRIMARY_OUTLET = PRIMARY_OUTLET;
    exports.DefaultUrlSerializer = DefaultUrlSerializer;
    exports.UrlSegment = UrlSegment;
    exports.UrlSerializer = UrlSerializer;
    exports.UrlTree = UrlTree;
    exports.__router_private__ = __router_private__;

}));
