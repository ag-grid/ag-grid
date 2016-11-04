/**
 * @license Angular v2.1.2
 * (c) 2010-2016 Google, Inc. https://angular.io/
 * License: MIT
 */
(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('@angular/common'), require('@angular/compiler'), require('@angular/core'), require('@angular/platform-browser')) :
    typeof define === 'function' && define.amd ? define(['exports', '@angular/common', '@angular/compiler', '@angular/core', '@angular/platform-browser'], factory) :
    (factory((global.ng = global.ng || {}, global.ng.platformServer = global.ng.platformServer || {}),global.ng.common,global.ng.compiler,global.ng.core,global.ng.platformBrowser));
}(this, function (exports,_angular_common,_angular_compiler,_angular_core,_angular_platformBrowser) { 'use strict';

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
    function isBlank(obj) {
        return obj == null;
    }
    function setValueOnPath(global, path, value) {
        var parts = path.split('.');
        var obj = global;
        while (parts.length > 1) {
            var name = parts.shift();
            if (obj.hasOwnProperty(name) && isPresent(obj[name])) {
                obj = obj[name];
            }
            else {
                obj = obj[name] = {};
            }
        }
        if (obj === undefined || obj === null) {
            obj = {};
        }
        obj[parts.shift()] = value;
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
    var ListWrapper = (function () {
        function ListWrapper() {
        }
        ListWrapper.removeAll = function (list, items) {
            for (var i = 0; i < items.length; ++i) {
                var index = list.indexOf(items[i]);
                list.splice(index, 1);
            }
        };
        ListWrapper.remove = function (list, el) {
            var index = list.indexOf(el);
            if (index > -1) {
                list.splice(index, 1);
                return true;
            }
            return false;
        };
        ListWrapper.equals = function (a, b) {
            if (a.length != b.length)
                return false;
            for (var i = 0; i < a.length; ++i) {
                if (a[i] !== b[i])
                    return false;
            }
            return true;
        };
        ListWrapper.maximum = function (list, predicate) {
            if (list.length == 0) {
                return null;
            }
            var solution = null;
            var maxValue = -Infinity;
            for (var index = 0; index < list.length; index++) {
                var candidate = list[index];
                if (candidate == null) {
                    continue;
                }
                var candidateValue = predicate(candidate);
                if (candidateValue > maxValue) {
                    solution = candidate;
                    maxValue = candidateValue;
                }
            }
            return solution;
        };
        ListWrapper.flatten = function (list) {
            var target = [];
            _flattenArray(list, target);
            return target;
        };
        return ListWrapper;
    }());
    function _flattenArray(source, target) {
        if (isPresent(source)) {
            for (var i = 0; i < source.length; i++) {
                var item = source[i];
                if (Array.isArray(item)) {
                    _flattenArray(item, target);
                }
                else {
                    target.push(item);
                }
            }
        }
        return target;
    }

    var DomAdapter = _angular_platformBrowser.__platform_browser_private__.DomAdapter;
    var setRootDomAdapter = _angular_platformBrowser.__platform_browser_private__.setRootDomAdapter;

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
    var parse5 = require('parse5');
    var treeAdapter;
    var _attrToPropMap = {
        'class': 'className',
        'innerHtml': 'innerHTML',
        'readonly': 'readOnly',
        'tabindex': 'tabIndex',
    };
    var defDoc = null;
    var mapProps = ['attribs', 'x-attribsNamespace', 'x-attribsPrefix'];
    function _notImplemented(methodName) {
        return new Error('This method is not implemented in Parse5DomAdapter: ' + methodName);
    }
    /* tslint:disable:requireParameterType */
    /**
     * A `DomAdapter` powered by the `parse5` NodeJS module.
     *
     * @security Tread carefully! Interacting with the DOM directly is dangerous and
     * can introduce XSS risks.
     */
    var Parse5DomAdapter = (function (_super) {
        __extends$1(Parse5DomAdapter, _super);
        function Parse5DomAdapter() {
            _super.apply(this, arguments);
        }
        Parse5DomAdapter.makeCurrent = function () {
            treeAdapter = parse5.treeAdapters.htmlparser2;
            setRootDomAdapter(new Parse5DomAdapter());
        };
        Parse5DomAdapter.prototype.hasProperty = function (element, name) {
            return _HTMLElementPropertyList.indexOf(name) > -1;
        };
        // TODO(tbosch): don't even call this method when we run the tests on server side
        // by not using the DomRenderer in tests. Keeping this for now to make tests happy...
        Parse5DomAdapter.prototype.setProperty = function (el, name, value) {
            if (name === 'innerHTML') {
                this.setInnerHTML(el, value);
            }
            else if (name === 'className') {
                el.attribs['class'] = el.className = value;
            }
            else {
                el[name] = value;
            }
        };
        // TODO(tbosch): don't even call this method when we run the tests on server side
        // by not using the DomRenderer in tests. Keeping this for now to make tests happy...
        Parse5DomAdapter.prototype.getProperty = function (el, name) { return el[name]; };
        Parse5DomAdapter.prototype.logError = function (error) { console.error(error); };
        Parse5DomAdapter.prototype.log = function (error) { console.log(error); };
        Parse5DomAdapter.prototype.logGroup = function (error) { console.error(error); };
        Parse5DomAdapter.prototype.logGroupEnd = function () { };
        Object.defineProperty(Parse5DomAdapter.prototype, "attrToPropMap", {
            get: function () { return _attrToPropMap; },
            enumerable: true,
            configurable: true
        });
        Parse5DomAdapter.prototype.query = function (selector) { throw _notImplemented('query'); };
        Parse5DomAdapter.prototype.querySelector = function (el, selector) { return this.querySelectorAll(el, selector)[0]; };
        Parse5DomAdapter.prototype.querySelectorAll = function (el, selector) {
            var _this = this;
            var res = [];
            var _recursive = function (result, node, selector, matcher) {
                var cNodes = node.childNodes;
                if (cNodes && cNodes.length > 0) {
                    for (var i = 0; i < cNodes.length; i++) {
                        var childNode = cNodes[i];
                        if (_this.elementMatches(childNode, selector, matcher)) {
                            result.push(childNode);
                        }
                        _recursive(result, childNode, selector, matcher);
                    }
                }
            };
            var matcher = new _angular_compiler.SelectorMatcher();
            matcher.addSelectables(_angular_compiler.CssSelector.parse(selector));
            _recursive(res, el, selector, matcher);
            return res;
        };
        Parse5DomAdapter.prototype.elementMatches = function (node, selector, matcher) {
            if (matcher === void 0) { matcher = null; }
            if (this.isElementNode(node) && selector === '*') {
                return true;
            }
            var result = false;
            if (selector && selector.charAt(0) == '#') {
                result = this.getAttribute(node, 'id') == selector.substring(1);
            }
            else if (selector) {
                if (!matcher) {
                    matcher = new _angular_compiler.SelectorMatcher();
                    matcher.addSelectables(_angular_compiler.CssSelector.parse(selector));
                }
                var cssSelector = new _angular_compiler.CssSelector();
                cssSelector.setElement(this.tagName(node));
                if (node.attribs) {
                    for (var attrName in node.attribs) {
                        cssSelector.addAttribute(attrName, node.attribs[attrName]);
                    }
                }
                var classList = this.classList(node);
                for (var i = 0; i < classList.length; i++) {
                    cssSelector.addClassName(classList[i]);
                }
                matcher.match(cssSelector, function (selector, cb) { result = true; });
            }
            return result;
        };
        Parse5DomAdapter.prototype.on = function (el, evt, listener) {
            var listenersMap = el._eventListenersMap;
            if (!listenersMap) {
                listenersMap = {};
                el._eventListenersMap = listenersMap;
            }
            var listeners = listenersMap[evt] || [];
            listenersMap[evt] = listeners.concat([listener]);
        };
        Parse5DomAdapter.prototype.onAndCancel = function (el, evt, listener) {
            this.on(el, evt, listener);
            return function () { ListWrapper.remove((el._eventListenersMap[evt]), listener); };
        };
        Parse5DomAdapter.prototype.dispatchEvent = function (el, evt) {
            if (!evt.target) {
                evt.target = el;
            }
            if (el._eventListenersMap) {
                var listeners = el._eventListenersMap[evt.type];
                if (listeners) {
                    for (var i = 0; i < listeners.length; i++) {
                        listeners[i](evt);
                    }
                }
            }
            if (el.parent) {
                this.dispatchEvent(el.parent, evt);
            }
            if (el._window) {
                this.dispatchEvent(el._window, evt);
            }
        };
        Parse5DomAdapter.prototype.createMouseEvent = function (eventType) { return this.createEvent(eventType); };
        Parse5DomAdapter.prototype.createEvent = function (eventType) {
            var event = {
                type: eventType,
                defaultPrevented: false,
                preventDefault: function () { event.defaultPrevented = true; }
            };
            return event;
        };
        Parse5DomAdapter.prototype.preventDefault = function (event) { event.returnValue = false; };
        Parse5DomAdapter.prototype.isPrevented = function (event) { return isPresent(event.returnValue) && !event.returnValue; };
        Parse5DomAdapter.prototype.getInnerHTML = function (el) {
            return parse5.serialize(this.templateAwareRoot(el), { treeAdapter: treeAdapter });
        };
        Parse5DomAdapter.prototype.getTemplateContent = function (el) { return null; };
        Parse5DomAdapter.prototype.getOuterHTML = function (el) {
            var fragment = treeAdapter.createDocumentFragment();
            this.appendChild(fragment, el);
            return parse5.serialize(fragment, { treeAdapter: treeAdapter });
        };
        Parse5DomAdapter.prototype.nodeName = function (node) { return node.tagName; };
        Parse5DomAdapter.prototype.nodeValue = function (node) { return node.nodeValue; };
        Parse5DomAdapter.prototype.type = function (node) { throw _notImplemented('type'); };
        Parse5DomAdapter.prototype.content = function (node) { return node.childNodes[0]; };
        Parse5DomAdapter.prototype.firstChild = function (el) { return el.firstChild; };
        Parse5DomAdapter.prototype.nextSibling = function (el) { return el.nextSibling; };
        Parse5DomAdapter.prototype.parentElement = function (el) { return el.parent; };
        Parse5DomAdapter.prototype.childNodes = function (el) { return el.childNodes; };
        Parse5DomAdapter.prototype.childNodesAsList = function (el) {
            var childNodes = el.childNodes;
            var res = new Array(childNodes.length);
            for (var i = 0; i < childNodes.length; i++) {
                res[i] = childNodes[i];
            }
            return res;
        };
        Parse5DomAdapter.prototype.clearNodes = function (el) {
            while (el.childNodes.length > 0) {
                this.remove(el.childNodes[0]);
            }
        };
        Parse5DomAdapter.prototype.appendChild = function (el, node) {
            this.remove(node);
            treeAdapter.appendChild(this.templateAwareRoot(el), node);
        };
        Parse5DomAdapter.prototype.removeChild = function (el, node) {
            if (el.childNodes.indexOf(node) > -1) {
                this.remove(node);
            }
        };
        Parse5DomAdapter.prototype.remove = function (el) {
            var parent = el.parent;
            if (parent) {
                var index = parent.childNodes.indexOf(el);
                parent.childNodes.splice(index, 1);
            }
            var prev = el.previousSibling;
            var next = el.nextSibling;
            if (prev) {
                prev.next = next;
            }
            if (next) {
                next.prev = prev;
            }
            el.prev = null;
            el.next = null;
            el.parent = null;
            return el;
        };
        Parse5DomAdapter.prototype.insertBefore = function (el, node) {
            this.remove(node);
            treeAdapter.insertBefore(el.parent, node, el);
        };
        Parse5DomAdapter.prototype.insertAllBefore = function (el, nodes) {
            var _this = this;
            nodes.forEach(function (n) { return _this.insertBefore(el, n); });
        };
        Parse5DomAdapter.prototype.insertAfter = function (el, node) {
            if (el.nextSibling) {
                this.insertBefore(el.nextSibling, node);
            }
            else {
                this.appendChild(el.parent, node);
            }
        };
        Parse5DomAdapter.prototype.setInnerHTML = function (el, value) {
            this.clearNodes(el);
            var content = parse5.parseFragment(value, { treeAdapter: treeAdapter });
            for (var i = 0; i < content.childNodes.length; i++) {
                treeAdapter.appendChild(el, content.childNodes[i]);
            }
        };
        Parse5DomAdapter.prototype.getText = function (el, isRecursive) {
            if (this.isTextNode(el)) {
                return el.data;
            }
            if (this.isCommentNode(el)) {
                // In the DOM, comments within an element return an empty string for textContent
                // However, comment node instances return the comment content for textContent getter
                return isRecursive ? '' : el.data;
            }
            if (!el.childNodes || el.childNodes.length == 0) {
                return '';
            }
            var textContent = '';
            for (var i = 0; i < el.childNodes.length; i++) {
                textContent += this.getText(el.childNodes[i], true);
            }
            return textContent;
        };
        Parse5DomAdapter.prototype.setText = function (el, value) {
            if (this.isTextNode(el) || this.isCommentNode(el)) {
                el.data = value;
            }
            else {
                this.clearNodes(el);
                if (value !== '')
                    treeAdapter.insertText(el, value);
            }
        };
        Parse5DomAdapter.prototype.getValue = function (el) { return el.value; };
        Parse5DomAdapter.prototype.setValue = function (el, value) { el.value = value; };
        Parse5DomAdapter.prototype.getChecked = function (el) { return el.checked; };
        Parse5DomAdapter.prototype.setChecked = function (el, value) { el.checked = value; };
        Parse5DomAdapter.prototype.createComment = function (text) { return treeAdapter.createCommentNode(text); };
        Parse5DomAdapter.prototype.createTemplate = function (html) {
            var template = treeAdapter.createElement('template', 'http://www.w3.org/1999/xhtml', []);
            var content = parse5.parseFragment(html, { treeAdapter: treeAdapter });
            treeAdapter.setTemplateContent(template, content);
            return template;
        };
        Parse5DomAdapter.prototype.createElement = function (tagName) {
            return treeAdapter.createElement(tagName, 'http://www.w3.org/1999/xhtml', []);
        };
        Parse5DomAdapter.prototype.createElementNS = function (ns, tagName) {
            return treeAdapter.createElement(tagName, ns, []);
        };
        Parse5DomAdapter.prototype.createTextNode = function (text) {
            var t = this.createComment(text);
            t.type = 'text';
            return t;
        };
        Parse5DomAdapter.prototype.createScriptTag = function (attrName, attrValue) {
            return treeAdapter.createElement('script', 'http://www.w3.org/1999/xhtml', [{ name: attrName, value: attrValue }]);
        };
        Parse5DomAdapter.prototype.createStyleElement = function (css) {
            var style = this.createElement('style');
            this.setText(style, css);
            return style;
        };
        Parse5DomAdapter.prototype.createShadowRoot = function (el) {
            el.shadowRoot = treeAdapter.createDocumentFragment();
            el.shadowRoot.parent = el;
            return el.shadowRoot;
        };
        Parse5DomAdapter.prototype.getShadowRoot = function (el) { return el.shadowRoot; };
        Parse5DomAdapter.prototype.getHost = function (el) { return el.host; };
        Parse5DomAdapter.prototype.getDistributedNodes = function (el) { throw _notImplemented('getDistributedNodes'); };
        Parse5DomAdapter.prototype.clone = function (node) {
            var _recursive = function (node) {
                var nodeClone = Object.create(Object.getPrototypeOf(node));
                for (var prop in node) {
                    var desc = Object.getOwnPropertyDescriptor(node, prop);
                    if (desc && 'value' in desc && typeof desc.value !== 'object') {
                        nodeClone[prop] = node[prop];
                    }
                }
                nodeClone.parent = null;
                nodeClone.prev = null;
                nodeClone.next = null;
                nodeClone.children = null;
                mapProps.forEach(function (mapName) {
                    if (isPresent(node[mapName])) {
                        nodeClone[mapName] = {};
                        for (var prop in node[mapName]) {
                            nodeClone[mapName][prop] = node[mapName][prop];
                        }
                    }
                });
                var cNodes = node.children;
                if (cNodes) {
                    var cNodesClone = new Array(cNodes.length);
                    for (var i = 0; i < cNodes.length; i++) {
                        var childNode = cNodes[i];
                        var childNodeClone = _recursive(childNode);
                        cNodesClone[i] = childNodeClone;
                        if (i > 0) {
                            childNodeClone.prev = cNodesClone[i - 1];
                            cNodesClone[i - 1].next = childNodeClone;
                        }
                        childNodeClone.parent = nodeClone;
                    }
                    nodeClone.children = cNodesClone;
                }
                return nodeClone;
            };
            return _recursive(node);
        };
        Parse5DomAdapter.prototype.getElementsByClassName = function (element, name) {
            return this.querySelectorAll(element, '.' + name);
        };
        Parse5DomAdapter.prototype.getElementsByTagName = function (element, name) {
            throw _notImplemented('getElementsByTagName');
        };
        Parse5DomAdapter.prototype.classList = function (element) {
            var classAttrValue = null;
            var attributes = element.attribs;
            if (attributes && attributes.hasOwnProperty('class')) {
                classAttrValue = attributes['class'];
            }
            return classAttrValue ? classAttrValue.trim().split(/\s+/g) : [];
        };
        Parse5DomAdapter.prototype.addClass = function (element, className) {
            var classList = this.classList(element);
            var index = classList.indexOf(className);
            if (index == -1) {
                classList.push(className);
                element.attribs['class'] = element.className = classList.join(' ');
            }
        };
        Parse5DomAdapter.prototype.removeClass = function (element, className) {
            var classList = this.classList(element);
            var index = classList.indexOf(className);
            if (index > -1) {
                classList.splice(index, 1);
                element.attribs['class'] = element.className = classList.join(' ');
            }
        };
        Parse5DomAdapter.prototype.hasClass = function (element, className) {
            return this.classList(element).indexOf(className) > -1;
        };
        Parse5DomAdapter.prototype.hasStyle = function (element, styleName, styleValue) {
            if (styleValue === void 0) { styleValue = null; }
            var value = this.getStyle(element, styleName) || '';
            return styleValue ? value == styleValue : value.length > 0;
        };
        /** @internal */
        Parse5DomAdapter.prototype._readStyleAttribute = function (element) {
            var styleMap = {};
            var attributes = element.attribs;
            if (attributes && attributes.hasOwnProperty('style')) {
                var styleAttrValue = attributes['style'];
                var styleList = styleAttrValue.split(/;+/g);
                for (var i = 0; i < styleList.length; i++) {
                    if (styleList[i].length > 0) {
                        var elems = styleList[i].split(/:+/g);
                        styleMap[elems[0].trim()] = elems[1].trim();
                    }
                }
            }
            return styleMap;
        };
        /** @internal */
        Parse5DomAdapter.prototype._writeStyleAttribute = function (element, styleMap) {
            var styleAttrValue = '';
            for (var key in styleMap) {
                var newValue = styleMap[key];
                if (newValue) {
                    styleAttrValue += key + ':' + styleMap[key] + ';';
                }
            }
            element.attribs['style'] = styleAttrValue;
        };
        Parse5DomAdapter.prototype.setStyle = function (element, styleName, styleValue) {
            var styleMap = this._readStyleAttribute(element);
            styleMap[styleName] = styleValue;
            this._writeStyleAttribute(element, styleMap);
        };
        Parse5DomAdapter.prototype.removeStyle = function (element, styleName) { this.setStyle(element, styleName, null); };
        Parse5DomAdapter.prototype.getStyle = function (element, styleName) {
            var styleMap = this._readStyleAttribute(element);
            return styleMap.hasOwnProperty(styleName) ? styleMap[styleName] : '';
        };
        Parse5DomAdapter.prototype.tagName = function (element) { return element.tagName == 'style' ? 'STYLE' : element.tagName; };
        Parse5DomAdapter.prototype.attributeMap = function (element) {
            var res = new Map();
            var elAttrs = treeAdapter.getAttrList(element);
            for (var i = 0; i < elAttrs.length; i++) {
                var attrib = elAttrs[i];
                res.set(attrib.name, attrib.value);
            }
            return res;
        };
        Parse5DomAdapter.prototype.hasAttribute = function (element, attribute) {
            return element.attribs && element.attribs.hasOwnProperty(attribute);
        };
        Parse5DomAdapter.prototype.hasAttributeNS = function (element, ns, attribute) { throw 'not implemented'; };
        Parse5DomAdapter.prototype.getAttribute = function (element, attribute) {
            return element.attribs && element.attribs.hasOwnProperty(attribute) ?
                element.attribs[attribute] :
                null;
        };
        Parse5DomAdapter.prototype.getAttributeNS = function (element, ns, attribute) { throw 'not implemented'; };
        Parse5DomAdapter.prototype.setAttribute = function (element, attribute, value) {
            if (attribute) {
                element.attribs[attribute] = value;
                if (attribute === 'class') {
                    element.className = value;
                }
            }
        };
        Parse5DomAdapter.prototype.setAttributeNS = function (element, ns, attribute, value) {
            throw 'not implemented';
        };
        Parse5DomAdapter.prototype.removeAttribute = function (element, attribute) {
            if (attribute) {
                delete element.attribs[attribute];
            }
        };
        Parse5DomAdapter.prototype.removeAttributeNS = function (element, ns, name) { throw 'not implemented'; };
        Parse5DomAdapter.prototype.templateAwareRoot = function (el) {
            return this.isTemplateElement(el) ? treeAdapter.getTemplateContent(el) : el;
        };
        Parse5DomAdapter.prototype.createHtmlDocument = function () {
            var newDoc = treeAdapter.createDocument();
            newDoc.title = 'fake title';
            var head = treeAdapter.createElement('head', null, []);
            var body = treeAdapter.createElement('body', 'http://www.w3.org/1999/xhtml', []);
            this.appendChild(newDoc, head);
            this.appendChild(newDoc, body);
            newDoc['head'] = head;
            newDoc['body'] = body;
            newDoc['_window'] = {};
            return newDoc;
        };
        Parse5DomAdapter.prototype.defaultDoc = function () { return defDoc = defDoc || this.createHtmlDocument(); };
        Parse5DomAdapter.prototype.getBoundingClientRect = function (el) { return { left: 0, top: 0, width: 0, height: 0 }; };
        Parse5DomAdapter.prototype.getTitle = function () { return this.defaultDoc().title || ''; };
        Parse5DomAdapter.prototype.setTitle = function (newTitle) { this.defaultDoc().title = newTitle; };
        Parse5DomAdapter.prototype.isTemplateElement = function (el) {
            return this.isElementNode(el) && this.tagName(el) === 'template';
        };
        Parse5DomAdapter.prototype.isTextNode = function (node) { return treeAdapter.isTextNode(node); };
        Parse5DomAdapter.prototype.isCommentNode = function (node) { return treeAdapter.isCommentNode(node); };
        Parse5DomAdapter.prototype.isElementNode = function (node) { return node ? treeAdapter.isElementNode(node) : false; };
        Parse5DomAdapter.prototype.hasShadowRoot = function (node) { return isPresent(node.shadowRoot); };
        Parse5DomAdapter.prototype.isShadowRoot = function (node) { return this.getShadowRoot(node) == node; };
        Parse5DomAdapter.prototype.importIntoDoc = function (node) { return this.clone(node); };
        Parse5DomAdapter.prototype.adoptNode = function (node) { return node; };
        Parse5DomAdapter.prototype.getHref = function (el) { return el.href; };
        Parse5DomAdapter.prototype.resolveAndSetHref = function (el, baseUrl, href) {
            if (href == null) {
                el.href = baseUrl;
            }
            else {
                el.href = baseUrl + '/../' + href;
            }
        };
        /** @internal */
        Parse5DomAdapter.prototype._buildRules = function (parsedRules, css) {
            var rules = [];
            for (var i = 0; i < parsedRules.length; i++) {
                var parsedRule = parsedRules[i];
                var rule = {};
                rule['cssText'] = css;
                rule['style'] = { content: '', cssText: '' };
                if (parsedRule.type == 'rule') {
                    rule['type'] = 1;
                    rule['selectorText'] =
                        parsedRule.selectors.join(', '.replace(/\s{2,}/g, ' ')
                            .replace(/\s*~\s*/g, ' ~ ')
                            .replace(/\s*\+\s*/g, ' + ')
                            .replace(/\s*>\s*/g, ' > ')
                            .replace(/\[(\w+)=(\w+)\]/g, '[$1="$2"]'));
                    if (isBlank(parsedRule.declarations)) {
                        continue;
                    }
                    for (var j = 0; j < parsedRule.declarations.length; j++) {
                        var declaration = parsedRule.declarations[j];
                        rule['style'] = declaration.property[declaration.value];
                        rule['style'].cssText += declaration.property + ': ' + declaration.value + ';';
                    }
                }
                else if (parsedRule.type == 'media') {
                    rule['type'] = 4;
                    rule['media'] = { mediaText: parsedRule.media };
                    if (parsedRule.rules) {
                        rule['cssRules'] = this._buildRules(parsedRule.rules);
                    }
                }
                rules.push(rule);
            }
            return rules;
        };
        Parse5DomAdapter.prototype.supportsDOMEvents = function () { return false; };
        Parse5DomAdapter.prototype.supportsNativeShadowDOM = function () { return false; };
        Parse5DomAdapter.prototype.getGlobalEventTarget = function (target) {
            if (target == 'window') {
                return this.defaultDoc()._window;
            }
            else if (target == 'document') {
                return this.defaultDoc();
            }
            else if (target == 'body') {
                return this.defaultDoc().body;
            }
        };
        Parse5DomAdapter.prototype.getBaseHref = function () { throw 'not implemented'; };
        Parse5DomAdapter.prototype.resetBaseElement = function () { throw 'not implemented'; };
        Parse5DomAdapter.prototype.getHistory = function () { throw 'not implemented'; };
        Parse5DomAdapter.prototype.getLocation = function () { throw 'not implemented'; };
        Parse5DomAdapter.prototype.getUserAgent = function () { return 'Fake user agent'; };
        Parse5DomAdapter.prototype.getData = function (el, name) { return this.getAttribute(el, 'data-' + name); };
        Parse5DomAdapter.prototype.getComputedStyle = function (el) { throw 'not implemented'; };
        Parse5DomAdapter.prototype.setData = function (el, name, value) { this.setAttribute(el, 'data-' + name, value); };
        // TODO(tbosch): move this into a separate environment class once we have it
        Parse5DomAdapter.prototype.setGlobalVar = function (path, value) { setValueOnPath(_global, path, value); };
        Parse5DomAdapter.prototype.supportsWebAnimation = function () { return false; };
        Parse5DomAdapter.prototype.performanceNow = function () { return Date.now(); };
        Parse5DomAdapter.prototype.getAnimationPrefix = function () { return ''; };
        Parse5DomAdapter.prototype.getTransitionEnd = function () { return 'transitionend'; };
        Parse5DomAdapter.prototype.supportsAnimation = function () { return true; };
        Parse5DomAdapter.prototype.replaceChild = function (el, newNode, oldNode) { throw new Error('not implemented'); };
        Parse5DomAdapter.prototype.parse = function (templateHtml) { throw new Error('not implemented'); };
        Parse5DomAdapter.prototype.invoke = function (el, methodName, args) { throw new Error('not implemented'); };
        Parse5DomAdapter.prototype.getEventKey = function (event) { throw new Error('not implemented'); };
        Parse5DomAdapter.prototype.supportsCookies = function () { return false; };
        Parse5DomAdapter.prototype.getCookie = function (name) { throw new Error('not implemented'); };
        Parse5DomAdapter.prototype.setCookie = function (name, value) { throw new Error('not implemented'); };
        Parse5DomAdapter.prototype.animate = function (element, keyframes, options) { throw new Error('not implemented'); };
        return Parse5DomAdapter;
    }(DomAdapter));
    // TODO: build a proper list, this one is all the keys of a HTMLInputElement
    var _HTMLElementPropertyList = [
        'webkitEntries',
        'incremental',
        'webkitdirectory',
        'selectionDirection',
        'selectionEnd',
        'selectionStart',
        'labels',
        'validationMessage',
        'validity',
        'willValidate',
        'width',
        'valueAsNumber',
        'valueAsDate',
        'value',
        'useMap',
        'defaultValue',
        'type',
        'step',
        'src',
        'size',
        'required',
        'readOnly',
        'placeholder',
        'pattern',
        'name',
        'multiple',
        'min',
        'minLength',
        'maxLength',
        'max',
        'list',
        'indeterminate',
        'height',
        'formTarget',
        'formNoValidate',
        'formMethod',
        'formEnctype',
        'formAction',
        'files',
        'form',
        'disabled',
        'dirName',
        'checked',
        'defaultChecked',
        'autofocus',
        'autocomplete',
        'alt',
        'align',
        'accept',
        'onautocompleteerror',
        'onautocomplete',
        'onwaiting',
        'onvolumechange',
        'ontoggle',
        'ontimeupdate',
        'onsuspend',
        'onsubmit',
        'onstalled',
        'onshow',
        'onselect',
        'onseeking',
        'onseeked',
        'onscroll',
        'onresize',
        'onreset',
        'onratechange',
        'onprogress',
        'onplaying',
        'onplay',
        'onpause',
        'onmousewheel',
        'onmouseup',
        'onmouseover',
        'onmouseout',
        'onmousemove',
        'onmouseleave',
        'onmouseenter',
        'onmousedown',
        'onloadstart',
        'onloadedmetadata',
        'onloadeddata',
        'onload',
        'onkeyup',
        'onkeypress',
        'onkeydown',
        'oninvalid',
        'oninput',
        'onfocus',
        'onerror',
        'onended',
        'onemptied',
        'ondurationchange',
        'ondrop',
        'ondragstart',
        'ondragover',
        'ondragleave',
        'ondragenter',
        'ondragend',
        'ondrag',
        'ondblclick',
        'oncuechange',
        'oncontextmenu',
        'onclose',
        'onclick',
        'onchange',
        'oncanplaythrough',
        'oncanplay',
        'oncancel',
        'onblur',
        'onabort',
        'spellcheck',
        'isContentEditable',
        'contentEditable',
        'outerText',
        'innerText',
        'accessKey',
        'hidden',
        'webkitdropzone',
        'draggable',
        'tabIndex',
        'dir',
        'translate',
        'lang',
        'title',
        'childElementCount',
        'lastElementChild',
        'firstElementChild',
        'children',
        'onwebkitfullscreenerror',
        'onwebkitfullscreenchange',
        'nextElementSibling',
        'previousElementSibling',
        'onwheel',
        'onselectstart',
        'onsearch',
        'onpaste',
        'oncut',
        'oncopy',
        'onbeforepaste',
        'onbeforecut',
        'onbeforecopy',
        'shadowRoot',
        'dataset',
        'classList',
        'className',
        'outerHTML',
        'innerHTML',
        'scrollHeight',
        'scrollWidth',
        'scrollTop',
        'scrollLeft',
        'clientHeight',
        'clientWidth',
        'clientTop',
        'clientLeft',
        'offsetParent',
        'offsetHeight',
        'offsetWidth',
        'offsetTop',
        'offsetLeft',
        'localName',
        'prefix',
        'namespaceURI',
        'id',
        'style',
        'attributes',
        'tagName',
        'parentElement',
        'textContent',
        'baseURI',
        'ownerDocument',
        'nextSibling',
        'previousSibling',
        'lastChild',
        'firstChild',
        'childNodes',
        'parentNode',
        'nodeType',
        'nodeValue',
        'nodeName',
        'closure_lm_714617',
        '__jsaction',
    ];

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
    function notSupported(feature) {
        throw new Error("platform-server does not support '" + feature + "'.");
    }
    var ServerPlatformLocation = (function (_super) {
        __extends(ServerPlatformLocation, _super);
        function ServerPlatformLocation() {
            _super.apply(this, arguments);
        }
        ServerPlatformLocation.prototype.getBaseHrefFromDOM = function () { throw notSupported('getBaseHrefFromDOM'); };
        ;
        ServerPlatformLocation.prototype.onPopState = function (fn) { notSupported('onPopState'); };
        ;
        ServerPlatformLocation.prototype.onHashChange = function (fn) { notSupported('onHashChange'); };
        ;
        Object.defineProperty(ServerPlatformLocation.prototype, "pathname", {
            get: function () { throw notSupported('pathname'); },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ServerPlatformLocation.prototype, "search", {
            get: function () { throw notSupported('search'); },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ServerPlatformLocation.prototype, "hash", {
            get: function () { throw notSupported('hash'); },
            enumerable: true,
            configurable: true
        });
        ServerPlatformLocation.prototype.replaceState = function (state, title, url) { notSupported('replaceState'); };
        ;
        ServerPlatformLocation.prototype.pushState = function (state, title, url) { notSupported('pushState'); };
        ;
        ServerPlatformLocation.prototype.forward = function () { notSupported('forward'); };
        ;
        ServerPlatformLocation.prototype.back = function () { notSupported('back'); };
        ;
        return ServerPlatformLocation;
    }(_angular_common.PlatformLocation));
    var INTERNAL_SERVER_PLATFORM_PROVIDERS = [
        { provide: _angular_core.PLATFORM_INITIALIZER, useValue: initParse5Adapter, multi: true },
        { provide: _angular_common.PlatformLocation, useClass: ServerPlatformLocation },
    ];
    function initParse5Adapter() {
        Parse5DomAdapter.makeCurrent();
    }
    /**
     * The ng module for the server.
     *
     * @experimental
     */
    var ServerModule = (function () {
        function ServerModule() {
        }
        ServerModule.decorators = [
            { type: _angular_core.NgModule, args: [{ imports: [_angular_platformBrowser.BrowserModule] },] },
        ];
        /** @nocollapse */
        ServerModule.ctorParameters = [];
        return ServerModule;
    }());
    /**
     * @experimental
     */
    var platformServer = _angular_core.createPlatformFactory(_angular_core.platformCore, 'server', INTERNAL_SERVER_PLATFORM_PROVIDERS);
    /**
     * The server platform that supports the runtime compiler.
     *
     * @experimental
     */
    var platformDynamicServer = _angular_core.createPlatformFactory(_angular_compiler.platformCoreDynamic, 'serverDynamic', INTERNAL_SERVER_PLATFORM_PROVIDERS);

    var __platform_server_private__ = {
        INTERNAL_SERVER_PLATFORM_PROVIDERS: INTERNAL_SERVER_PLATFORM_PROVIDERS
    };

    exports.ServerModule = ServerModule;
    exports.platformDynamicServer = platformDynamicServer;
    exports.platformServer = platformServer;
    exports.__platform_server_private__ = __platform_server_private__;

}));
