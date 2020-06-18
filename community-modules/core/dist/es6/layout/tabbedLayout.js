/**
 * @ag-grid-community/core - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components
 * @version v23.2.1
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
import { _ } from '../utils';
import { RefSelector } from '../widgets/componentAnnotations';
import { Constants } from '../constants';
import { ManagedFocusComponent } from '../widgets/managedFocusComponent';
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
        return /* html */ "<div class=\"ag-tabs " + cssClass + "\">\n            <div ref=\"eHeader\" class=\"ag-tabs-header " + (cssClass ? cssClass + "-header" : '') + "\"></div>\n            <div ref=\"eBody\" class=\"ag-tabs-body " + (cssClass ? cssClass + "-body" : '') + "\"></div>\n        </div>";
    };
    TabbedLayout.prototype.handleKeyDown = function (e) {
        switch (e.keyCode) {
            case Constants.KEY_RIGHT:
            case Constants.KEY_LEFT:
                if (!this.eHeader.contains(document.activeElement)) {
                    return;
                }
                var currentPosition = this.items.indexOf(this.activeItem);
                var nextPosition = e.keyCode === Constants.KEY_RIGHT ? Math.min(currentPosition + 1, this.items.length - 1) : Math.max(currentPosition - 1, 0);
                if (currentPosition === nextPosition) {
                    return;
                }
                e.preventDefault();
                var nextItem = this.items[nextPosition];
                this.showItemWrapper(nextItem);
                nextItem.eHeaderButton.focus();
                break;
            case Constants.KEY_UP:
            case Constants.KEY_DOWN:
                e.stopPropagation();
                break;
        }
    };
    TabbedLayout.prototype.onTabKeyDown = function (e) {
        var _a = this, focusController = _a.focusController, eHeader = _a.eHeader, eBody = _a.eBody, activeItem = _a.activeItem;
        var activeElement = document.activeElement;
        var focusInHeader = eHeader.contains(activeElement);
        e.preventDefault();
        if (focusInHeader) {
            if (e.shiftKey) {
                focusController.focusLastFocusableElement(eBody);
            }
            else {
                focusController.focusFirstFocusableElement(eBody);
            }
        }
        else {
            var isFocusManaged = focusController.isFocusUnderManagedComponent(eBody);
            if (isFocusManaged) {
                activeItem.eHeaderButton.focus();
            }
            else {
                var nextEl = focusController.findNextFocusableElement(eBody, false, e.shiftKey);
                if (nextEl) {
                    nextEl.focus();
                }
                else {
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
            _.clearElement(eDummyBody);
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
        eHeaderButton.tabIndex = -1;
        eHeaderButton.appendChild(item.title);
        _.addCssClass(eHeaderButton, 'ag-tab');
        this.eHeader.appendChild(eHeaderButton);
        eHeaderButton.setAttribute('aria-label', item.titleLabel);
        var wrapper = {
            tabbedItem: item,
            eHeaderButton: eHeaderButton
        };
        this.items.push(wrapper);
        eHeaderButton.addEventListener('click', this.showItemWrapper.bind(this, wrapper));
    };
    TabbedLayout.prototype.showItem = function (tabbedItem) {
        var itemWrapper = _.find(this.items, function (wrapper) {
            return wrapper.tabbedItem === tabbedItem;
        });
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
            _.callIfPresent(this.params.onActiveItemClicked);
            return;
        }
        _.clearElement(this.eBody);
        wrapper.tabbedItem.bodyPromise.then(function (body) {
            _this.eBody.appendChild(body);
            var onlyUnmanaged = !_this.focusController.isKeyboardFocus();
            _this.focusController.focusFirstFocusableElement(_this.eBody, onlyUnmanaged);
        });
        if (this.activeItem) {
            _.removeCssClass(this.activeItem.eHeaderButton, 'ag-tab-selected');
        }
        _.addCssClass(wrapper.eHeaderButton, 'ag-tab-selected');
        this.activeItem = wrapper;
        if (wrapper.tabbedItem.afterAttachedCallback) {
            wrapper.tabbedItem.afterAttachedCallback(this.afterAttachedParams);
        }
    };
    __decorate([
        RefSelector('eHeader')
    ], TabbedLayout.prototype, "eHeader", void 0);
    __decorate([
        RefSelector('eBody')
    ], TabbedLayout.prototype, "eBody", void 0);
    return TabbedLayout;
}(ManagedFocusComponent));
export { TabbedLayout };
