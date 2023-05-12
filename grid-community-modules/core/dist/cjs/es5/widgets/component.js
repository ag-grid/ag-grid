/**
 * @ag-grid-community/core - Advanced Data Grid / Data Table supporting Javascript / Typescript / React / Angular / Vue
 * @version v29.3.5
 * @link https://www.ag-grid.com/
 * @license MIT
 */
"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
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
exports.Component = void 0;
var context_1 = require("../context/context");
var beanStub_1 = require("../context/beanStub");
var utils_1 = require("../utils");
var dom_1 = require("../utils/dom");
var function_1 = require("../utils/function");
var customTooltipFeature_1 = require("./customTooltipFeature");
var cssClassManager_1 = require("../rendering/cssClassManager");
var compIdSequence = new utils_1.NumberSequence();
var Component = /** @class */ (function (_super) {
    __extends(Component, _super);
    function Component(template) {
        var _this = _super.call(this) || this;
        // if false, then CSS class "ag-hidden" is applied, which sets "display: none"
        _this.displayed = true;
        // if false, then CSS class "ag-invisible" is applied, which sets "visibility: hidden"
        _this.visible = true;
        // unique id for this row component. this is used for getting a reference to the HTML dom.
        // we cannot use the RowNode id as this is not unique (due to animation, old rows can be lying
        // around as we create a new rowComp instance for the same row node).
        _this.compId = compIdSequence.next();
        _this.cssClassManager = new cssClassManager_1.CssClassManager(function () { return _this.eGui; });
        if (template) {
            _this.setTemplate(template);
        }
        return _this;
    }
    Component.prototype.preConstructOnComponent = function () {
        this.usingBrowserTooltips = this.gridOptionsService.is('enableBrowserTooltips');
    };
    Component.prototype.getCompId = function () {
        return this.compId;
    };
    Component.prototype.getTooltipParams = function () {
        return {
            value: this.tooltipText,
            location: 'UNKNOWN'
        };
    };
    Component.prototype.setTooltip = function (newTooltipText) {
        var _this = this;
        var removeTooltip = function () {
            if (_this.usingBrowserTooltips) {
                _this.getGui().removeAttribute('title');
            }
            else {
                _this.tooltipFeature = _this.destroyBean(_this.tooltipFeature);
            }
        };
        var addTooltip = function () {
            if (_this.usingBrowserTooltips) {
                _this.getGui().setAttribute('title', _this.tooltipText);
            }
            else {
                _this.tooltipFeature = _this.createBean(new customTooltipFeature_1.CustomTooltipFeature(_this));
            }
        };
        if (this.tooltipText != newTooltipText) {
            if (this.tooltipText) {
                removeTooltip();
            }
            if (newTooltipText != null) {
                this.tooltipText = newTooltipText;
                if (this.tooltipText) {
                    addTooltip();
                }
            }
        }
    };
    // for registered components only, eg creates AgCheckbox instance from ag-checkbox HTML tag
    Component.prototype.createChildComponentsFromTags = function (parentNode, paramsMap) {
        var _this = this;
        // we MUST take a copy of the list first, as the 'swapComponentForNode' adds comments into the DOM
        // which messes up the traversal order of the children.
        var childNodeList = dom_1.copyNodeList(parentNode.childNodes);
        childNodeList.forEach(function (childNode) {
            if (!(childNode instanceof HTMLElement)) {
                return;
            }
            var childComp = _this.createComponentFromElement(childNode, function (childComp) {
                // copy over all attributes, including css classes, so any attributes user put on the tag
                // wll be carried across
                var childGui = childComp.getGui();
                if (childGui) {
                    _this.copyAttributesFromNode(childNode, childComp.getGui());
                }
            }, paramsMap);
            if (childComp) {
                if (childComp.addItems && childNode.children.length) {
                    _this.createChildComponentsFromTags(childNode, paramsMap);
                    // converting from HTMLCollection to Array
                    var items = Array.prototype.slice.call(childNode.children);
                    childComp.addItems(items);
                }
                // replace the tag (eg ag-checkbox) with the proper HTMLElement (eg 'div') in the dom
                _this.swapComponentForNode(childComp, parentNode, childNode);
            }
            else if (childNode.childNodes) {
                _this.createChildComponentsFromTags(childNode, paramsMap);
            }
        });
    };
    Component.prototype.createComponentFromElement = function (element, afterPreCreateCallback, paramsMap) {
        var key = element.nodeName;
        var componentParams = paramsMap ? paramsMap[element.getAttribute('ref')] : undefined;
        var ComponentClass = this.agStackComponentsRegistry.getComponentClass(key);
        if (ComponentClass) {
            Component.elementGettingCreated = element;
            var newComponent = new ComponentClass(componentParams);
            newComponent.setParentComponent(this);
            this.createBean(newComponent, null, afterPreCreateCallback);
            return newComponent;
        }
        return null;
    };
    Component.prototype.copyAttributesFromNode = function (source, dest) {
        dom_1.iterateNamedNodeMap(source.attributes, function (name, value) { return dest.setAttribute(name, value); });
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
            var currentProtoName = function_1.getFunctionName(thisPrototype.constructor);
            if (metaData && metaData[currentProtoName] && metaData[currentProtoName].querySelectors) {
                metaData[currentProtoName].querySelectors.forEach(function (querySelector) { return action(querySelector); });
            }
            thisPrototype = Object.getPrototypeOf(thisPrototype);
        }
    };
    Component.prototype.setTemplate = function (template, paramsMap) {
        var eGui = dom_1.loadTemplate(template);
        this.setTemplateFromElement(eGui, paramsMap);
    };
    Component.prototype.setTemplateFromElement = function (element, paramsMap) {
        this.eGui = element;
        this.eGui.__agComponent = this;
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
            var setResult = function (result) { return thisNoType[querySelector.attributeName] = result; };
            // if it's a ref selector, and match is on top level component, we return
            // the element. otherwise no way of components putting ref=xxx on the top
            // level element as querySelector only looks at children.
            var topLevelRefMatch = querySelector.refSelector
                && _this.eGui.getAttribute('ref') === querySelector.refSelector;
            if (topLevelRefMatch) {
                setResult(_this.eGui);
            }
            else {
                // otherwise use querySelector, which looks at children
                var resultOfQuery = _this.eGui.querySelector(querySelector.querySelector);
                if (resultOfQuery) {
                    setResult(resultOfQuery.__agComponent || resultOfQuery);
                }
            }
        });
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
        if (newChild == null) {
            return;
        }
        if (!container) {
            container = this.eGui;
        }
        if (dom_1.isNodeOrElement(newChild)) {
            container.appendChild(newChild);
        }
        else {
            var childComponent = newChild;
            container.appendChild(childComponent.getGui());
        }
    };
    Component.prototype.isDisplayed = function () {
        return this.displayed;
    };
    Component.prototype.setVisible = function (visible, options) {
        if (options === void 0) { options = {}; }
        if (visible !== this.visible) {
            this.visible = visible;
            var skipAriaHidden = options.skipAriaHidden;
            dom_1.setVisible(this.eGui, visible, { skipAriaHidden: skipAriaHidden });
        }
    };
    Component.prototype.setDisplayed = function (displayed, options) {
        if (options === void 0) { options = {}; }
        if (displayed !== this.displayed) {
            this.displayed = displayed;
            var skipAriaHidden = options.skipAriaHidden;
            dom_1.setDisplayed(this.eGui, displayed, { skipAriaHidden: skipAriaHidden });
            var event_1 = {
                type: Component.EVENT_DISPLAYED_CHANGED,
                visible: this.displayed
            };
            this.dispatchEvent(event_1);
        }
    };
    Component.prototype.destroy = function () {
        if (this.tooltipFeature) {
            this.tooltipFeature = this.destroyBean(this.tooltipFeature);
        }
        if (this.parentComponent) {
            this.parentComponent = undefined;
        }
        var eGui = this.eGui;
        if (eGui && eGui.__agComponent) {
            eGui.__agComponent = undefined;
        }
        _super.prototype.destroy.call(this);
    };
    Component.prototype.addGuiEventListener = function (event, listener, options) {
        var _this = this;
        this.eGui.addEventListener(event, listener, options);
        this.addDestroyFunc(function () { return _this.eGui.removeEventListener(event, listener); });
    };
    Component.prototype.addCssClass = function (className) {
        this.cssClassManager.addCssClass(className);
    };
    Component.prototype.removeCssClass = function (className) {
        this.cssClassManager.removeCssClass(className);
    };
    Component.prototype.containsCssClass = function (className) {
        return this.cssClassManager.containsCssClass(className);
    };
    Component.prototype.addOrRemoveCssClass = function (className, addOrRemove) {
        this.cssClassManager.addOrRemoveCssClass(className, addOrRemove);
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
    ], Component.prototype, "preConstructOnComponent", null);
    __decorate([
        context_1.PreConstruct
    ], Component.prototype, "createChildComponentsPreConstruct", null);
    return Component;
}(beanStub_1.BeanStub));
exports.Component = Component;
