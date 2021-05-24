/**
 * @ag-grid-community/core - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components
 * @version v25.3.0
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
var componentAnnotations_1 = require("../widgets/componentAnnotations");
var managedFocusComponent_1 = require("../widgets/managedFocusComponent");
var dom_1 = require("../utils/dom");
var aria_1 = require("../utils/aria");
var generic_1 = require("../utils/generic");
var function_1 = require("../utils/function");
var keyCode_1 = require("../constants/keyCode");
var TabbedLayout = /** @class */ (function (_super) {
    __extends(TabbedLayout, _super);
    function TabbedLayout(params) {
        var _this = _super.call(this, TabbedLayout.getTemplate(params.cssClass)) || this;
        _this.items = [];
        _this.params = params;
        if (params.items) {
            params.items.forEach(function (item) { return _this.addItem(item); });
        }
        return _this;
    }
    TabbedLayout.getTemplate = function (cssClass) {
        return /* html */ "<div class=\"ag-tabs " + cssClass + "\">\n            <div ref=\"eHeader\" role=\"menu\" class=\"ag-tabs-header " + (cssClass ? cssClass + "-header" : '') + "\"></div>\n            <div ref=\"eBody\" role=\"presentation\" class=\"ag-tabs-body " + (cssClass ? cssClass + "-body" : '') + "\"></div>\n        </div>";
    };
    TabbedLayout.prototype.handleKeyDown = function (e) {
        switch (e.keyCode) {
            case keyCode_1.KeyCode.RIGHT:
            case keyCode_1.KeyCode.LEFT:
                if (!this.eHeader.contains(document.activeElement)) {
                    return;
                }
                var currentPosition = this.items.indexOf(this.activeItem);
                var nextPosition = e.keyCode === keyCode_1.KeyCode.RIGHT ? Math.min(currentPosition + 1, this.items.length - 1) : Math.max(currentPosition - 1, 0);
                if (currentPosition === nextPosition) {
                    return;
                }
                e.preventDefault();
                var nextItem = this.items[nextPosition];
                this.showItemWrapper(nextItem);
                nextItem.eHeaderButton.focus();
                break;
            case keyCode_1.KeyCode.UP:
            case keyCode_1.KeyCode.DOWN:
                e.stopPropagation();
                break;
        }
    };
    TabbedLayout.prototype.onTabKeyDown = function (e) {
        if (e.defaultPrevented) {
            return;
        }
        var _a = this, focusController = _a.focusController, eHeader = _a.eHeader, eBody = _a.eBody, activeItem = _a.activeItem;
        var activeElement = document.activeElement;
        e.preventDefault();
        if (eHeader.contains(activeElement)) {
            // focus is in header, move into body of popup
            focusController.focusInto(eBody, e.shiftKey);
        }
        else {
            // focus is in body, establish if it should return to header
            if (focusController.isFocusUnderManagedComponent(eBody)) {
                // focus was in a managed focus component and has now left, so we can return to the header
                activeItem.eHeaderButton.focus();
            }
            else {
                var nextEl = focusController.findNextFocusableElement(eBody, false, e.shiftKey);
                if (nextEl) {
                    // if another element exists in the body that can be focussed, go to that
                    nextEl.focus();
                }
                else {
                    // otherwise return to the header
                    activeItem.eHeaderButton.focus();
                }
            }
        }
    };
    TabbedLayout.prototype.setAfterAttachedParams = function (params) {
        this.afterAttachedParams = params;
    };
    TabbedLayout.prototype.getMinDimensions = function () {
        var eDummyContainer = this.getGui().cloneNode(true);
        var eDummyBody = eDummyContainer.querySelector('[ref="eBody"]');
        // position fixed, so it isn't restricted to the boundaries of the parent
        eDummyContainer.style.position = 'fixed';
        // we put the dummy into the body container, so it will inherit all the
        // css styles that the real cells are inheriting
        this.getGui().appendChild(eDummyContainer);
        var minWidth = 0;
        var minHeight = 0;
        this.items.forEach(function (itemWrapper) {
            dom_1.clearElement(eDummyBody);
            var eClone = itemWrapper.tabbedItem.bodyPromise.resolveNow(null, function (body) { return body.cloneNode(true); });
            if (eClone == null) {
                return;
            }
            eDummyBody.appendChild(eClone);
            if (minWidth < eDummyContainer.offsetWidth) {
                minWidth = eDummyContainer.offsetWidth;
            }
            if (minHeight < eDummyContainer.offsetHeight) {
                minHeight = eDummyContainer.offsetHeight;
            }
        });
        this.getGui().removeChild(eDummyContainer);
        return { height: minHeight, width: minWidth };
    };
    TabbedLayout.prototype.showFirstItem = function () {
        if (this.items.length > 0) {
            this.showItemWrapper(this.items[0]);
        }
    };
    TabbedLayout.prototype.addItem = function (item) {
        var eHeaderButton = document.createElement('span');
        eHeaderButton.setAttribute('tabIndex', '-1');
        eHeaderButton.setAttribute('role', 'menuitem');
        eHeaderButton.appendChild(item.title);
        dom_1.addCssClass(eHeaderButton, 'ag-tab');
        this.eHeader.appendChild(eHeaderButton);
        aria_1.setAriaLabel(eHeaderButton, item.titleLabel);
        var wrapper = {
            tabbedItem: item,
            eHeaderButton: eHeaderButton
        };
        this.items.push(wrapper);
        eHeaderButton.addEventListener('click', this.showItemWrapper.bind(this, wrapper));
    };
    TabbedLayout.prototype.showItem = function (tabbedItem) {
        var itemWrapper = generic_1.find(this.items, function (wrapper) { return wrapper.tabbedItem === tabbedItem; });
        if (itemWrapper) {
            this.showItemWrapper(itemWrapper);
        }
    };
    TabbedLayout.prototype.showItemWrapper = function (wrapper) {
        var _this = this;
        if (this.params.onItemClicked) {
            this.params.onItemClicked({ item: wrapper.tabbedItem });
        }
        if (this.activeItem === wrapper) {
            function_1.callIfPresent(this.params.onActiveItemClicked);
            return;
        }
        dom_1.clearElement(this.eBody);
        wrapper.tabbedItem.bodyPromise.then(function (body) {
            _this.eBody.appendChild(body);
            var onlyUnmanaged = !_this.focusController.isKeyboardMode();
            _this.focusController.focusInto(_this.eBody, false, onlyUnmanaged);
            if (wrapper.tabbedItem.afterAttachedCallback) {
                wrapper.tabbedItem.afterAttachedCallback(_this.afterAttachedParams);
            }
        });
        if (this.activeItem) {
            dom_1.removeCssClass(this.activeItem.eHeaderButton, 'ag-tab-selected');
        }
        dom_1.addCssClass(wrapper.eHeaderButton, 'ag-tab-selected');
        this.activeItem = wrapper;
    };
    __decorate([
        componentAnnotations_1.RefSelector('eHeader')
    ], TabbedLayout.prototype, "eHeader", void 0);
    __decorate([
        componentAnnotations_1.RefSelector('eBody')
    ], TabbedLayout.prototype, "eBody", void 0);
    return TabbedLayout;
}(managedFocusComponent_1.ManagedFocusComponent));
exports.TabbedLayout = TabbedLayout;

//# sourceMappingURL=tabbedLayout.js.map
