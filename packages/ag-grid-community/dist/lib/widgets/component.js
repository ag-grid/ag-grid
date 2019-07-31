/**
 * ag-grid-community - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components
 * @version v21.1.1
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
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
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
        _this.childComponents = [];
        _this.annotatedEventListeners = [];
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
    Component.prototype.createChildComponentsFromTags = function (parentNode) {
        var _this = this;
        // we MUST take a copy of the list first, as the 'swapComponentForNode' adds comments into the DOM
        // which messes up the traversal order of the children.
        var childNodeList = utils_1._.copyNodeList(parentNode.childNodes);
        childNodeList.forEach(function (childNode) {
            var childComp = _this.getContext().createComponentFromElement(childNode, function (childComp) {
                // copy over all attributes, including css classes, so any attributes user put on the tag
                // wll be carried across
                _this.copyAttributesFromNode(childNode, childComp.getGui());
            });
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
        utils_1._.iterateNamedNodeMap(source.attributes, function (name, value) {
            dest.setAttribute(name, value);
        });
    };
    Component.prototype.swapComponentForNode = function (newComponent, parentNode, childNode) {
        var eComponent = newComponent.getGui();
        parentNode.replaceChild(eComponent, childNode);
        parentNode.insertBefore(document.createComment(childNode.nodeName), eComponent);
        this.childComponents.push(newComponent);
        this.swapInComponentForQuerySelectors(newComponent, childNode);
    };
    Component.prototype.swapInComponentForQuerySelectors = function (newComponent, childNode) {
        var thisProto = Object.getPrototypeOf(this);
        var thisNoType = this;
        while (thisProto != null) {
            var metaData = thisProto.__agComponentMetaData;
            var currentProtoName = (thisProto.constructor).name;
            if (metaData && metaData[currentProtoName] && metaData[currentProtoName].querySelectors) {
                metaData[currentProtoName].querySelectors.forEach(function (querySelector) {
                    if (thisNoType[querySelector.attributeName] === childNode) {
                        thisNoType[querySelector.attributeName] = newComponent;
                    }
                });
            }
            thisProto = Object.getPrototypeOf(thisProto);
        }
    };
    Component.prototype.setTemplate = function (template) {
        var eGui = utils_1._.loadTemplate(template);
        this.setTemplateFromElement(eGui);
    };
    Component.prototype.setTemplateFromElement = function (element) {
        this.eGui = element;
        this.eGui.__agComponent = this;
        this.addAnnotatedEventListeners();
        this.wireQuerySelectors();
        // context will not be available when user sets template in constructor
        var contextIsAvailable = !!this.getContext();
        if (contextIsAvailable) {
            this.createChildComponentsFromTags(this.getGui());
        }
    };
    Component.prototype.createChildComponentsPreConstruct = function () {
        // ui exists if user sets template in constructor. when this happens, we have to wait for the context
        // to be autoWired first before we can create child components.
        var uiExists = !!this.getGui();
        if (uiExists) {
            this.createChildComponentsFromTags(this.getGui());
        }
    };
    Component.prototype.wireQuerySelectors = function () {
        var _this = this;
        if (!this.eGui) {
            return;
        }
        var thisProto = Object.getPrototypeOf(this);
        var _loop_1 = function () {
            var metaData = thisProto.__agComponentMetaData;
            var currentProtoName = (thisProto.constructor).name;
            if (metaData && metaData[currentProtoName] && metaData[currentProtoName].querySelectors) {
                var thisNoType_1 = this_1;
                metaData[currentProtoName].querySelectors.forEach(function (querySelector) {
                    var resultOfQuery = _this.eGui.querySelector(querySelector.querySelector);
                    if (resultOfQuery) {
                        var backingComponent = resultOfQuery.__agComponent;
                        if (backingComponent) {
                            thisNoType_1[querySelector.attributeName] = backingComponent;
                        }
                        else {
                            thisNoType_1[querySelector.attributeName] = resultOfQuery;
                        }
                    }
                    else {
                        // put debug msg in here if query selector fails???
                    }
                });
            }
            thisProto = Object.getPrototypeOf(thisProto);
        };
        var this_1 = this;
        while (thisProto != null) {
            _loop_1();
        }
    };
    Component.prototype.addAnnotatedEventListeners = function () {
        var _this = this;
        this.removeAnnotatedEventListeners();
        if (!this.eGui) {
            return;
        }
        var listenerMethods = this.getAgComponentMetaData('listenerMethods');
        if (utils_1._.missingOrEmpty(listenerMethods)) {
            return;
        }
        if (!this.annotatedEventListeners) {
            this.annotatedEventListeners = [];
        }
        listenerMethods.forEach(function (eventListener) {
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
        this.annotatedEventListeners.forEach(function (eventListener) {
            _this.eGui.removeEventListener(eventListener.eventName, eventListener.listener);
        });
        this.annotatedEventListeners = [];
    };
    Component.prototype.getGui = function () {
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
    Component.prototype.appendChild = function (newChild) {
        if (utils_1._.isNodeOrElement(newChild)) {
            this.eGui.appendChild(newChild);
        }
        else {
            var childComponent = newChild;
            this.eGui.appendChild(childComponent.getGui());
            this.childComponents.push(childComponent);
        }
    };
    Component.prototype.addFeature = function (context, feature) {
        context.wireBean(feature);
        if (feature.destroy) {
            this.addDestroyFunc(feature.destroy.bind(feature));
        }
    };
    Component.prototype.isVisible = function () {
        return this.visible;
    };
    Component.prototype.setVisible = function (visible, visibilityMode) {
        var isDisplay = visibilityMode !== 'visibility';
        if (visible !== this.visible) {
            this.visible = visible;
            utils_1._.addOrRemoveCssClass(this.eGui, isDisplay ? 'ag-hidden' : 'ag-invisible', !visible);
            var event_1 = {
                type: Component.EVENT_VISIBLE_CHANGED,
                visible: this.visible
            };
            this.dispatchEvent(event_1);
        }
    };
    Component.prototype.addOrRemoveCssClass = function (className, addOrRemove) {
        utils_1._.addOrRemoveCssClass(this.eGui, className, addOrRemove);
    };
    Component.prototype.destroy = function () {
        _super.prototype.destroy.call(this);
        this.childComponents.forEach(function (childComponent) {
            if (childComponent && childComponent.destroy) {
                childComponent.destroy();
            }
        });
        this.childComponents.length = 0;
        this.removeAnnotatedEventListeners();
    };
    Component.prototype.addGuiEventListener = function (event, listener) {
        var _this = this;
        this.getGui().addEventListener(event, listener);
        this.addDestroyFunc(function () { return _this.getGui().removeEventListener(event, listener); });
    };
    Component.prototype.addCssClass = function (className) {
        utils_1._.addCssClass(this.getGui(), className);
    };
    Component.prototype.removeCssClass = function (className) {
        utils_1._.removeCssClass(this.getGui(), className);
    };
    Component.prototype.getAttribute = function (key) {
        var eGui = this.getGui();
        return eGui ? eGui.getAttribute(key) : null;
    };
    Component.prototype.getRefElement = function (refName) {
        return this.queryForHtmlElement('[ref="' + refName + '"]');
    };
    Component.EVENT_VISIBLE_CHANGED = 'visibleChanged';
    __decorate([
        context_1.PreConstruct,
        __metadata("design:type", Function),
        __metadata("design:paramtypes", []),
        __metadata("design:returntype", void 0)
    ], Component.prototype, "createChildComponentsPreConstruct", null);
    return Component;
}(beanStub_1.BeanStub));
exports.Component = Component;
