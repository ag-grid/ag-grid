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
var agAbstractField_1 = require("./agAbstractField");
var agPickerField_1 = require("./agPickerField");
var agList_1 = require("./agList");
var context_1 = require("../context/context");
var dom_1 = require("../utils/dom");
var AgSelect = /** @class */ (function (_super) {
    __extends(AgSelect, _super);
    function AgSelect(config) {
        return _super.call(this, config, 'ag-select', 'smallDown', 'listbox') || this;
    }
    AgSelect.prototype.init = function () {
        var _this = this;
        this.listComponent = this.createBean(new agList_1.AgList('select'));
        this.listComponent.setParentComponent(this);
        this.eWrapper.tabIndex = 0;
        this.listComponent.addManagedListener(this.listComponent, agList_1.AgList.EVENT_ITEM_SELECTED, function () { if (_this.hideList) {
            _this.hideList();
        } });
        this.listComponent.addManagedListener(this.listComponent, agAbstractField_1.AgAbstractField.EVENT_CHANGED, function () {
            _this.setValue(_this.listComponent.getValue(), false, true);
            if (_this.hideList) {
                _this.hideList();
            }
        });
    };
    AgSelect.prototype.showPicker = function () {
        var _this = this;
        var listGui = this.listComponent.getGui();
        var destroyMouseWheelFunc = this.addManagedListener(document.body, 'wheel', function (e) {
            if (!listGui.contains(e.target) && _this.hideList) {
                _this.hideList();
            }
        });
        var destroyFocusOutFunc = this.addManagedListener(listGui, 'focusout', function (e) {
            if (!listGui.contains(e.relatedTarget) && _this.hideList) {
                _this.hideList();
            }
        });
        var addPopupRes = this.popupService.addPopup({
            modal: true,
            eChild: listGui,
            closeOnEsc: true,
            closedCallback: function () {
                _this.hideList = null;
                _this.isPickerDisplayed = false;
                destroyFocusOutFunc();
                destroyMouseWheelFunc();
                if (_this.isAlive()) {
                    _this.getFocusableElement().focus();
                }
            }
        });
        if (addPopupRes) {
            this.hideList = addPopupRes.hideFunc;
        }
        this.isPickerDisplayed = true;
        dom_1.setElementWidth(listGui, dom_1.getAbsoluteWidth(this.eWrapper));
        listGui.style.maxHeight = dom_1.getInnerHeight(this.popupService.getPopupParent()) + 'px';
        listGui.style.position = 'absolute';
        this.popupService.positionPopupUnderComponent({
            type: 'ag-list',
            eventSource: this.eWrapper,
            ePopup: listGui,
            keepWithinBounds: true
        });
        this.listComponent.refreshHighlighted();
        return this.listComponent;
    };
    AgSelect.prototype.addOptions = function (options) {
        var _this = this;
        options.forEach(function (option) { return _this.addOption(option); });
        return this;
    };
    AgSelect.prototype.addOption = function (option) {
        this.listComponent.addOption(option);
        return this;
    };
    AgSelect.prototype.setValue = function (value, silent, fromPicker) {
        if (this.value === value) {
            return this;
        }
        if (!fromPicker) {
            this.listComponent.setValue(value, true);
        }
        var newValue = this.listComponent.getValue();
        if (newValue === this.getValue()) {
            return this;
        }
        this.eDisplayField.innerHTML = this.listComponent.getDisplayValue();
        return _super.prototype.setValue.call(this, value, silent);
    };
    AgSelect.prototype.destroy = function () {
        if (this.hideList) {
            this.hideList();
        }
        this.destroyBean(this.listComponent);
        _super.prototype.destroy.call(this);
    };
    __decorate([
        context_1.Autowired('popupService')
    ], AgSelect.prototype, "popupService", void 0);
    __decorate([
        context_1.PostConstruct
    ], AgSelect.prototype, "init", null);
    return AgSelect;
}(agPickerField_1.AgPickerField));
exports.AgSelect = AgSelect;

//# sourceMappingURL=agSelect.js.map
