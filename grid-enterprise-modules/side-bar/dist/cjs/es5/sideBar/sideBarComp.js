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
exports.SideBarComp = void 0;
var core_1 = require("@ag-grid-community/core");
var sideBarButtonsComp_1 = require("./sideBarButtonsComp");
var sideBarDefParser_1 = require("./sideBarDefParser");
var toolPanelWrapper_1 = require("./toolPanelWrapper");
var SideBarComp = /** @class */ (function (_super) {
    __extends(SideBarComp, _super);
    function SideBarComp() {
        var _this = _super.call(this, SideBarComp.TEMPLATE) || this;
        _this.toolPanelWrappers = [];
        return _this;
    }
    SideBarComp.prototype.postConstruct = function () {
        var _this = this;
        this.sideBarButtonsComp.addEventListener(sideBarButtonsComp_1.SideBarButtonsComp.EVENT_SIDE_BAR_BUTTON_CLICKED, this.onToolPanelButtonClicked.bind(this));
        this.setSideBarDef();
        this.addManagedPropertyListener('sideBar', function () {
            _this.clearDownUi();
            _this.setSideBarDef();
        });
        this.gridApi.registerSideBarComp(this);
        this.createManagedBean(new core_1.ManagedFocusFeature(this.getFocusableElement(), {
            onTabKeyDown: this.onTabKeyDown.bind(this),
            handleKeyDown: this.handleKeyDown.bind(this)
        }));
    };
    SideBarComp.prototype.onTabKeyDown = function (e) {
        if (e.defaultPrevented) {
            return;
        }
        var _a = this, focusService = _a.focusService, sideBarButtonsComp = _a.sideBarButtonsComp;
        var eGui = this.getGui();
        var sideBarGui = sideBarButtonsComp.getGui();
        var eDocument = this.gridOptionsService.getDocument();
        var activeElement = eDocument.activeElement;
        var openPanel = eGui.querySelector('.ag-tool-panel-wrapper:not(.ag-hidden)');
        var target = e.target;
        if (!openPanel) {
            return;
        }
        if (sideBarGui.contains(activeElement)) {
            if (focusService.focusInto(openPanel, e.shiftKey)) {
                e.preventDefault();
            }
            return;
        }
        // only handle backwards focus to target the sideBar buttons
        if (!e.shiftKey) {
            return;
        }
        var nextEl = null;
        if (openPanel.contains(activeElement)) {
            nextEl = this.focusService.findNextFocusableElement(openPanel, undefined, true);
        }
        else if (focusService.isTargetUnderManagedComponent(openPanel, target) && e.shiftKey) {
            nextEl = this.focusService.findFocusableElementBeforeTabGuard(openPanel, target);
        }
        if (!nextEl) {
            nextEl = sideBarGui.querySelector('.ag-selected button');
        }
        if (nextEl) {
            e.preventDefault();
            nextEl.focus();
        }
    };
    SideBarComp.prototype.handleKeyDown = function (e) {
        var eDocument = this.gridOptionsService.getDocument();
        if (!this.sideBarButtonsComp.getGui().contains(eDocument.activeElement)) {
            return;
        }
        var sideBarGui = this.sideBarButtonsComp.getGui();
        var buttons = Array.prototype.slice.call(sideBarGui.querySelectorAll('.ag-side-button'));
        var currentButton = eDocument.activeElement;
        var currentPos = buttons.findIndex(function (button) { return button.contains(currentButton); });
        var nextPos = null;
        switch (e.key) {
            case core_1.KeyCode.LEFT:
            case core_1.KeyCode.UP:
                nextPos = Math.max(0, currentPos - 1);
                break;
            case core_1.KeyCode.RIGHT:
            case core_1.KeyCode.DOWN:
                nextPos = Math.min(currentPos + 1, buttons.length - 1);
                break;
        }
        if (nextPos === null) {
            return;
        }
        var innerButton = buttons[nextPos].querySelector('button');
        if (innerButton) {
            innerButton.focus();
            e.preventDefault();
        }
    };
    SideBarComp.prototype.onToolPanelButtonClicked = function (event) {
        var id = event.toolPanelId;
        var openedItem = this.openedItem();
        // if item was already open, we close it
        if (openedItem === id) {
            this.openToolPanel(undefined, 'sideBarButtonClicked'); // passing undefined closes
        }
        else {
            this.openToolPanel(id, 'sideBarButtonClicked');
        }
    };
    SideBarComp.prototype.clearDownUi = function () {
        this.sideBarButtonsComp.clearButtons();
        this.destroyToolPanelWrappers();
    };
    SideBarComp.prototype.setSideBarDef = function () {
        // initially hide side bar
        this.setDisplayed(false);
        var sideBarRaw = this.gridOptionsService.get('sideBar');
        this.sideBar = sideBarDefParser_1.SideBarDefParser.parse(sideBarRaw);
        if (!!this.sideBar && !!this.sideBar.toolPanels) {
            var shouldDisplaySideBar = !this.sideBar.hiddenByDefault;
            this.setDisplayed(shouldDisplaySideBar);
            var toolPanelDefs = this.sideBar.toolPanels;
            this.sideBarButtonsComp.setToolPanelDefs(toolPanelDefs);
            this.setupToolPanels(toolPanelDefs);
            this.setSideBarPosition(this.sideBar.position);
            if (!this.sideBar.hiddenByDefault) {
                this.openToolPanel(this.sideBar.defaultToolPanel, 'sideBarInitializing');
            }
        }
    };
    SideBarComp.prototype.getDef = function () {
        return this.sideBar;
    };
    SideBarComp.prototype.setSideBarPosition = function (position) {
        if (!position) {
            position = 'right';
        }
        var isLeft = position === 'left';
        var resizerSide = isLeft ? 'right' : 'left';
        this.addOrRemoveCssClass('ag-side-bar-left', isLeft);
        this.addOrRemoveCssClass('ag-side-bar-right', !isLeft);
        this.toolPanelWrappers.forEach(function (wrapper) {
            wrapper.setResizerSizerSide(resizerSide);
        });
        return this;
    };
    SideBarComp.prototype.setupToolPanels = function (defs) {
        var _this = this;
        defs.forEach(function (def) {
            if (def.id == null) {
                console.warn("AG Grid: please review all your toolPanel components, it seems like at least one of them doesn't have an id");
                return;
            }
            // helpers, in case user doesn't have the right module loaded
            if (def.toolPanel === 'agColumnsToolPanel') {
                var moduleMissing = !core_1.ModuleRegistry.assertRegistered(core_1.ModuleNames.ColumnsToolPanelModule, 'Column Tool Panel');
                if (moduleMissing) {
                    return;
                }
            }
            if (def.toolPanel === 'agFiltersToolPanel') {
                var moduleMissing = !core_1.ModuleRegistry.assertRegistered(core_1.ModuleNames.FiltersToolPanelModule, 'Filters Tool Panel');
                if (moduleMissing) {
                    return;
                }
            }
            var wrapper = new toolPanelWrapper_1.ToolPanelWrapper();
            _this.getContext().createBean(wrapper);
            wrapper.setToolPanelDef(def);
            wrapper.setDisplayed(false);
            _this.getGui().appendChild(wrapper.getGui());
            _this.toolPanelWrappers.push(wrapper);
        });
    };
    SideBarComp.prototype.refresh = function () {
        this.toolPanelWrappers.forEach(function (wrapper) { return wrapper.refresh(); });
    };
    SideBarComp.prototype.openToolPanel = function (key, source) {
        if (source === void 0) { source = 'api'; }
        var currentlyOpenedKey = this.openedItem();
        if (currentlyOpenedKey === key) {
            return;
        }
        this.toolPanelWrappers.forEach(function (wrapper) {
            var show = key === wrapper.getToolPanelId();
            wrapper.setDisplayed(show);
        });
        var newlyOpenedKey = this.openedItem();
        var openToolPanelChanged = currentlyOpenedKey !== newlyOpenedKey;
        if (openToolPanelChanged) {
            this.sideBarButtonsComp.setActiveButton(key);
            this.raiseToolPanelVisibleEvent(key, currentlyOpenedKey !== null && currentlyOpenedKey !== void 0 ? currentlyOpenedKey : undefined, source);
        }
    };
    SideBarComp.prototype.getToolPanelInstance = function (key) {
        var toolPanelWrapper = this.toolPanelWrappers.filter(function (toolPanel) { return toolPanel.getToolPanelId() === key; })[0];
        if (!toolPanelWrapper) {
            console.warn("AG Grid: unable to lookup Tool Panel as invalid key supplied: " + key);
            return;
        }
        return toolPanelWrapper.getToolPanelInstance();
    };
    SideBarComp.prototype.raiseToolPanelVisibleEvent = function (key, previousKey, source) {
        // To be removed in v30
        var oldEvent = {
            type: core_1.Events.EVENT_TOOL_PANEL_VISIBLE_CHANGED,
            source: key,
        };
        this.eventService.dispatchEvent(oldEvent);
        if (previousKey) {
            var event_1 = {
                type: core_1.Events.EVENT_INTERNAL_TOOL_PANEL_VISIBLE_CHANGED,
                source: source,
                key: previousKey,
                visible: false,
            };
            this.eventService.dispatchEvent(event_1);
        }
        if (key) {
            var event_2 = {
                type: core_1.Events.EVENT_INTERNAL_TOOL_PANEL_VISIBLE_CHANGED,
                source: source,
                key: key,
                visible: true,
            };
            this.eventService.dispatchEvent(event_2);
        }
    };
    SideBarComp.prototype.close = function (source) {
        if (source === void 0) { source = 'api'; }
        this.openToolPanel(undefined, source);
    };
    SideBarComp.prototype.isToolPanelShowing = function () {
        return !!this.openedItem();
    };
    SideBarComp.prototype.openedItem = function () {
        var activeToolPanel = null;
        this.toolPanelWrappers.forEach(function (wrapper) {
            if (wrapper.isDisplayed()) {
                activeToolPanel = wrapper.getToolPanelId();
            }
        });
        return activeToolPanel;
    };
    SideBarComp.prototype.destroyToolPanelWrappers = function () {
        var _this = this;
        this.toolPanelWrappers.forEach(function (wrapper) {
            core_1._.removeFromParent(wrapper.getGui());
            _this.destroyBean(wrapper);
        });
        this.toolPanelWrappers.length = 0;
    };
    SideBarComp.prototype.destroy = function () {
        this.destroyToolPanelWrappers();
        _super.prototype.destroy.call(this);
    };
    SideBarComp.TEMPLATE = "<div class=\"ag-side-bar ag-unselectable\">\n            <ag-side-bar-buttons ref=\"sideBarButtons\"></ag-side-bar-buttons>\n        </div>";
    __decorate([
        core_1.Autowired('gridApi')
    ], SideBarComp.prototype, "gridApi", void 0);
    __decorate([
        core_1.Autowired('focusService')
    ], SideBarComp.prototype, "focusService", void 0);
    __decorate([
        core_1.RefSelector('sideBarButtons')
    ], SideBarComp.prototype, "sideBarButtonsComp", void 0);
    __decorate([
        core_1.PostConstruct
    ], SideBarComp.prototype, "postConstruct", null);
    return SideBarComp;
}(core_1.Component));
exports.SideBarComp = SideBarComp;
