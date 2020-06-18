/**
 * @ag-grid-community/core - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components
 * @version v23.2.1
 * @link http://www.ag-grid.com/
 * @license MIT
 */
"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
var context_1 = require("../context/context");
var beanStub_1 = require("../context/beanStub");
var utils_1 = require("../utils");
var compIdSequence = new utils_1.NumberSequence();
var Component = /** @class */ (function (_super) {
    __extends(Component, _super);
    function Component(template) {
        var _this = _super.call(this) || this;
        _this.annotatedGuiListeners = [];
        // if false, then CSS class "ag-hidden" is applied, which sets "display: none"
        _this.displayed = true;
        // if false, then CSS class "ag-invisible" is applied, which sets "visibility: hidden"
        _this.visible = true;
        // unique id for this row component. this is used for getting a reference to the HTML dom.
        // we cannot use the RowNode id as this is not unique (due to animation, old rows can be lying
        // around as we create a new rowComp instance for the same row node).
        _this.compId = compIdSequence.next();
        if (template) {
            _this.setTemplate(template);
        }
        return _this;
    }
    Component.prototype.getCompId = function () {
        return this.compId;
    };
    // for registered components only, eg creates AgCheckbox instance from ag-checkbox HTML tag
    Component.prototype.createChildComponentsFromTags = function (parentNode, paramsMap) {
        var _this = this;
        // we MUST take a copy of the list first, as the 'swapComponentForNode' adds comments into the DOM
        // which messes up the traversal order of the children.
        var childNodeList = utils_1._.copyNodeList(parentNode.childNodes);
        utils_1._.forEach(childNodeList, function (childNode) {
            if (!(childNode instanceof HTMLElement)) {
                return;
            }
            var childComp = _this.createComponentFromElement(childNode, function (childComp) {
                // copy over all attributes, including css classes, so any attributes user put on the tag
                // wll be carried across
                _this.copyAttributesFromNode(childNode, childComp.getGui());
            }, paramsMap);
            if (childComp) {
                if (childComp.addItems && childNode.children.length) {
                    _this.createChildComponentsFromTags(childNode);
                    // converting from HTMLCollection to Array
                    var items = Array.prototype.slice.call(childNode.children);
                    childComp.addItems(items);
                }
                // replace the tag (eg ag-checkbox) with the proper HTMLElement (eg 'div') in the dom
                _this.swapComponentForNode(childComp, parentNode, childNode);
            }
            else if (childNode.childNodes) {
                _this.createChildComponentsFromTags(childNode);
            }
        });
    };
    Component.prototype.createComponentFromElement = function (element, afterPreCreateCallback, paramsMap) {
        var key = element.nodeName;
        var componentParams = paramsMap ? paramsMap[element.getAttribute('ref')] : undefined;
        var ComponentClass = this.agStackComponentsRegistry.getComponentClass(key);
        if (ComponentClass) {
            var newComponent = new ComponentClass(componentParams);
            this.createBean(newComponent, null, afterPreCreateCallback);
            return newComponent;
        }
        return null;
    };
    Component.prototype.copyAttributesFromNode = function (source, dest) {
        utils_1._.iterateNamedNodeMap(source.attributes, function (name, value) { return dest.setAttribute(name, value); });
    };
    Component.prototype.swapComponentForNode = function (newComponent, parentNode, childNode) {
        var eComponent = newComponent.getGui();
        parentNode.replaceChild(eComponent, childNode);
        parentNode.insertBefore(document.createComment(childNode.nodeName), eComponent);
        this.addDestroyFunc(this.destroyBean.bind(this, newComponent));
        this.swapInComponentForQuerySelectors(newComponent, childNode);
    };
    Component.prototype.swapInComponentForQuerySelectors = function (newComponent, childNode) {
        var thisNoType = this;
        this.iterateOverQuerySelectors(function (querySelector) {
            if (thisNoType[querySelector.attributeName] === childNode) {
                thisNoType[querySelector.attributeName] = newComponent;
            }
        });
    };
    Component.prototype.iterateOverQuerySelectors = function (action) {
        var thisPrototype = Object.getPrototypeOf(this);
        while (thisPrototype != null) {
            var metaData = thisPrototype.__agComponentMetaData;
            var currentProtoName = (thisPrototype.constructor).name;
            if (metaData && metaData[currentProtoName] && metaData[currentProtoName].querySelectors) {
                utils_1._.forEach(metaData[currentProtoName].querySelectors, function (querySelector) { return action(querySelector); });
            }
            thisPrototype = Object.getPrototypeOf(thisPrototype);
        }
    };
    Component.prototype.setTemplate = function (template, paramsMap) {
        var eGui = utils_1._.loadTemplate(template);
        this.setTemplateFromElement(eGui, paramsMap);
    };
    Component.prototype.setTemplateFromElement = function (element, paramsMap) {
        this.eGui = element;
        this.eGui.__agComponent = this;
        this.addAnnotatedGuiEventListeners();
        this.wireQuerySelectors();
        // context will not be available when user sets template in constructor
        if (!!this.getContext()) {
            this.createChildComponentsFromTags(this.getGui(), paramsMap);
        }
    };
    Component.prototype.createChildComponentsPreConstruct = function () {
        // ui exists if user sets template in constructor. when this happens, we have to wait for the context
        // to be autoWired first before we can create child components.
        if (!!this.getGui()) {
            this.createChildComponentsFromTags(this.getGui());
        }
    };
    Component.prototype.wireQuerySelectors = function () {
        var _this = this;
        if (!this.eGui) {
            return;
        }
        var thisNoType = this;
        this.iterateOverQuerySelectors(function (querySelector) {
            var resultOfQuery = _this.eGui.querySelector(querySelector.querySelector);
            if (resultOfQuery) {
                thisNoType[querySelector.attributeName] = resultOfQuery.__agComponent || resultOfQuery;
            }
            else {
                // put debug msg in here if query selector fails???
            }
        });
    };
    Component.prototype.addAnnotatedGuiEventListeners = function () {
        var _this = this;
        this.removeAnnotatedGuiEventListeners();
        if (!this.eGui) {
            return;
        }
        var listenerMethods = this.getAgComponentMetaData('guiListenerMethods');
        if (!listenerMethods) {
            return;
        }
        if (!this.annotatedGuiListeners) {
            this.annotatedGuiListeners = [];
        }
        listenerMethods.forEach(function (meta) {
            var element = _this.getRefElement(meta.ref);
            if (!element) {
                return;
            }
            var listener = _this[meta.methodName].bind(_this);
            element.addEventListener(meta.eventName, listener);
            _this.annotatedGuiListeners.push({ eventName: meta.eventName, listener: listener, element: element });
        });
    };
    Component.prototype.addAnnotatedGridEventListeners = function () {
        var _this = this;
        var listenerMetas = this.getAgComponentMetaData('gridListenerMethods');
        if (!listenerMetas) {
            return;
        }
        listenerMetas.forEach(function (meta) {
            var listener = _this[meta.methodName].bind(_this);
            _this.addManagedListener(_this.eventService, meta.eventName, listener);
        });
    };
    Component.prototype.getAgComponentMetaData = function (key) {
        var res = [];
        var thisProto = Object.getPrototypeOf(this);
        while (thisProto != null) {
            var metaData = thisProto.__agComponentMetaData;
            var currentProtoName = (thisProto.constructor).name;
            // IE does not support Function.prototype.name, so we need to extract
            // the name using a RegEx
            // from: https://matt.scharley.me/2012/03/monkey-patch-name-ie.html
            if (currentProtoName === undefined) {
                var funcNameRegex = /function\s([^(]{1,})\(/;
                var results = funcNameRegex.exec(thisProto.constructor.toString());
                if (results && results.length > 1) {
                    currentProtoName = results[1].trim();
                }
            }
            if (metaData && metaData[currentProtoName] && metaData[currentProtoName][key]) {
                res = res.concat(metaData[currentProtoName][key]);
            }
            thisProto = Object.getPrototypeOf(thisProto);
        }
        return res;
    };
    Component.prototype.removeAnnotatedGuiEventListeners = function () {
        if (!this.annotatedGuiListeners) {
            return;
        }
        utils_1._.forEach(this.annotatedGuiListeners, function (e) {
            e.element.removeEventListener(e.eventName, e.listener);
        });
        this.annotatedGuiListeners = [];
    };
    Component.prototype.getGui = function () {
        return this.eGui;
    };
    Component.prototype.getFocusableElement = function () {
        return this.eGui;
    };
    Component.prototype.setParentComponent = function (component) {
        this.parentComponent = component;
    };
    Component.prototype.getParentComponent = function () {
        return this.parentComponent;
    };
    // this method is for older code, that wants to provide the gui element,
    // it is not intended for this to be in ag-Stack
    Component.prototype.setGui = function (eGui) {
        this.eGui = eGui;
    };
    Component.prototype.queryForHtmlElement = function (cssSelector) {
        return this.eGui.querySelector(cssSelector);
    };
    Component.prototype.queryForHtmlInputElement = function (cssSelector) {
        return this.eGui.querySelector(cssSelector);
    };
    Component.prototype.appendChild = function (newChild, container) {
        if (!container) {
            container = this.eGui;
        }
        if (utils_1._.isNodeOrElement(newChild)) {
            container.appendChild(newChild);
        }
        else {
            var childComponent = newChild;
            container.appendChild(childComponent.getGui());
            this.addDestroyFunc(this.destroyBean.bind(this, childComponent));
        }
    };
    Component.prototype.isDisplayed = function () {
        return this.displayed;
    };
    Component.prototype.setVisible = function (visible) {
        if (visible !== this.visible) {
            this.visible = visible;
            utils_1._.setVisible(this.eGui, visible);
        }
    };
    Component.prototype.setDisplayed = function (displayed) {
        if (displayed !== this.displayed) {
            this.displayed = displayed;
            utils_1._.setDisplayed(this.eGui, displayed);
            var event_1 = {
                type: Component.EVENT_DISPLAYED_CHANGED,
                visible: this.displayed
            };
            this.dispatchEvent(event_1);
        }
    };
    Component.prototype.destroy = function () {
        this.removeAnnotatedGuiEventListeners();
        _super.prototype.destroy.call(this);
    };
    Component.prototype.addGuiEventListener = function (event, listener) {
        var _this = this;
        this.eGui.addEventListener(event, listener);
        this.addDestroyFunc(function () { return _this.eGui.removeEventListener(event, listener); });
    };
    Component.prototype.addCssClass = function (className) {
        utils_1._.addCssClass(this.eGui, className);
    };
    Component.prototype.removeCssClass = function (className) {
        utils_1._.removeCssClass(this.eGui, className);
    };
    Component.prototype.addOrRemoveCssClass = function (className, addOrRemove) {
        utils_1._.addOrRemoveCssClass(this.eGui, className, addOrRemove);
    };
    Component.prototype.getAttribute = function (key) {
        var eGui = this.eGui;
        return eGui ? eGui.getAttribute(key) : null;
    };
    Component.prototype.getRefElement = function (refName) {
        return this.queryForHtmlElement("[ref=\"" + refName + "\"]");
    };
    Component.EVENT_DISPLAYED_CHANGED = 'displayedChanged';
    __decorate([
        context_1.Autowired('agStackComponentsRegistry')
    ], Component.prototype, "agStackComponentsRegistry", void 0);
    __decorate([
        context_1.PreConstruct
    ], Component.prototype, "createChildComponentsPreConstruct", null);
    __decorate([
        context_1.PostConstruct
    ], Component.prototype, "addAnnotatedGridEventListeners", null);
    return Component;
}(beanStub_1.BeanStub));
exports.Component = Component;

//# sourceMappingURL=component.js.map
