/**
 * @ag-grid-community/core - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components
 * @version v23.1.1
 * @link http://www.ag-grid.com/
 * @license MIT
 */
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
import { BeanStub } from "../context/beanStub";
import { PreConstruct } from "../context/context";
import { _, NumberSequence } from "../utils";
var compIdSequence = new NumberSequence();
var Component = /** @class */ (function (_super) {
    __extends(Component, _super);
    function Component(template) {
        var _this = _super.call(this) || this;
        _this.childComponents = [];
        _this.annotatedEventListeners = [];
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
        var childNodeList = _.copyNodeList(parentNode.childNodes);
        _.forEach(childNodeList, function (childNode) {
            if (!(childNode instanceof HTMLElement)) {
                return;
            }
            var childComp = _this.getContext().createComponentFromElement(childNode, function (childComp) {
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
    Component.prototype.copyAttributesFromNode = function (source, dest) {
        _.iterateNamedNodeMap(source.attributes, function (name, value) { return dest.setAttribute(name, value); });
    };
    Component.prototype.swapComponentForNode = function (newComponent, parentNode, childNode) {
        var eComponent = newComponent.getGui();
        parentNode.replaceChild(eComponent, childNode);
        parentNode.insertBefore(document.createComment(childNode.nodeName), eComponent);
        this.childComponents.push(newComponent);
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
                _.forEach(metaData[currentProtoName].querySelectors, function (querySelector) { return action(querySelector); });
            }
            thisPrototype = Object.getPrototypeOf(thisPrototype);
        }
    };
    Component.prototype.setTemplate = function (template, paramsMap) {
        var eGui = _.loadTemplate(template);
        this.setTemplateFromElement(eGui, paramsMap);
    };
    Component.prototype.setTemplateFromElement = function (element, paramsMap) {
        this.eGui = element;
        this.eGui.__agComponent = this;
        this.addAnnotatedEventListeners();
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
    Component.prototype.addAnnotatedEventListeners = function () {
        var _this = this;
        this.removeAnnotatedEventListeners();
        if (!this.eGui) {
            return;
        }
        var listenerMethods = this.getAgComponentMetaData('listenerMethods');
        if (_.missingOrEmpty(listenerMethods)) {
            return;
        }
        if (!this.annotatedEventListeners) {
            this.annotatedEventListeners = [];
        }
        _.forEach(listenerMethods, function (eventListener) {
            var listener = _this[eventListener.methodName].bind(_this);
            _this.eGui.addEventListener(eventListener.eventName, listener);
            _this.annotatedEventListeners.push({ eventName: eventListener.eventName, listener: listener });
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
    Component.prototype.removeAnnotatedEventListeners = function () {
        var _this = this;
        if (!this.annotatedEventListeners || !this.eGui) {
            return;
        }
        _.forEach(this.annotatedEventListeners, function (e) { return _this.eGui.removeEventListener(e.eventName, e.listener); });
        this.annotatedEventListeners = [];
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
        if (_.isNodeOrElement(newChild)) {
            container.appendChild(newChild);
        }
        else {
            var childComponent = newChild;
            container.appendChild(childComponent.getGui());
            this.childComponents.push(childComponent);
        }
    };
    Component.prototype.addFeature = function (feature, context) {
        this.wireDependentBean(feature, context);
    };
    Component.prototype.isDisplayed = function () {
        return this.displayed;
    };
    Component.prototype.setVisible = function (visible) {
        if (visible !== this.visible) {
            this.visible = visible;
            _.setVisible(this.eGui, visible);
        }
    };
    Component.prototype.setDisplayed = function (displayed) {
        if (displayed !== this.displayed) {
            this.displayed = displayed;
            _.setDisplayed(this.eGui, displayed);
            var event_1 = {
                type: Component.EVENT_DISPLAYED_CHANGED,
                visible: this.displayed
            };
            this.dispatchEvent(event_1);
        }
    };
    Component.prototype.destroy = function () {
        _.forEach(this.childComponents, function (childComponent) {
            if (childComponent && childComponent.destroy) {
                childComponent.destroy();
            }
        });
        this.childComponents.length = 0;
        this.removeAnnotatedEventListeners();
        _super.prototype.destroy.call(this);
    };
    Component.prototype.addGuiEventListener = function (event, listener) {
        var _this = this;
        this.eGui.addEventListener(event, listener);
        this.addDestroyFunc(function () { return _this.eGui.removeEventListener(event, listener); });
    };
    Component.prototype.addCssClass = function (className) {
        _.addCssClass(this.eGui, className);
    };
    Component.prototype.removeCssClass = function (className) {
        _.removeCssClass(this.eGui, className);
    };
    Component.prototype.addOrRemoveCssClass = function (className, addOrRemove) {
        _.addOrRemoveCssClass(this.eGui, className, addOrRemove);
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
        PreConstruct
    ], Component.prototype, "createChildComponentsPreConstruct", null);
    return Component;
}(BeanStub));
export { Component };
