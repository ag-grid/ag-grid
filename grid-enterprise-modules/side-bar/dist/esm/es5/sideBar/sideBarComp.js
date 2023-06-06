var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
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
var __values = (this && this.__values) || function(o) {
    var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
    if (m) return m.call(o);
    if (o && typeof o.length === "number") return {
        next: function () {
            if (o && i >= o.length) o = void 0;
            return { value: o && o[i++], done: !o };
        }
    };
    throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
};
import { _, Component, Events, ModuleNames, ModuleRegistry, PostConstruct, RefSelector, Autowired, ManagedFocusFeature, KeyCode } from "@ag-grid-community/core";
import { SideBarButtonsComp } from "./sideBarButtonsComp";
import { SideBarDefParser } from "./sideBarDefParser";
import { ToolPanelWrapper } from "./toolPanelWrapper";
var SideBarComp = /** @class */ (function (_super) {
    __extends(SideBarComp, _super);
    function SideBarComp() {
        var _this = _super.call(this, SideBarComp.TEMPLATE) || this;
        _this.toolPanelWrappers = [];
        return _this;
    }
    SideBarComp.prototype.postConstruct = function () {
        var _this = this;
        this.sideBarButtonsComp.addEventListener(SideBarButtonsComp.EVENT_SIDE_BAR_BUTTON_CLICKED, this.onToolPanelButtonClicked.bind(this));
        this.setSideBarDef();
        this.addManagedPropertyListener('sideBar', function () {
            _this.clearDownUi();
            _this.setSideBarDef();
        });
        this.gridApi.registerSideBarComp(this);
        this.createManagedBean(new ManagedFocusFeature(this.getFocusableElement(), {
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
            case KeyCode.LEFT:
            case KeyCode.UP:
                nextPos = Math.max(0, currentPos - 1);
                break;
            case KeyCode.RIGHT:
            case KeyCode.DOWN:
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
        this.sideBar = SideBarDefParser.parse(sideBarRaw);
        if (!!this.sideBar && !!this.sideBar.toolPanels) {
            var shouldDisplaySideBar = !this.sideBar.hiddenByDefault;
            this.setDisplayed(shouldDisplaySideBar);
            var toolPanelDefs = this.sideBar.toolPanels;
            this.createToolPanelsAndSideButtons(toolPanelDefs);
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
    SideBarComp.prototype.createToolPanelsAndSideButtons = function (defs) {
        var e_1, _a;
        try {
            for (var defs_1 = __values(defs), defs_1_1 = defs_1.next(); !defs_1_1.done; defs_1_1 = defs_1.next()) {
                var def = defs_1_1.value;
                this.createToolPanelAndSideButton(def);
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (defs_1_1 && !defs_1_1.done && (_a = defs_1.return)) _a.call(defs_1);
            }
            finally { if (e_1) throw e_1.error; }
        }
    };
    SideBarComp.prototype.validateDef = function (def) {
        if (def.id == null) {
            console.warn("AG Grid: please review all your toolPanel components, it seems like at least one of them doesn't have an id");
            return false;
        }
        // helpers, in case user doesn't have the right module loaded
        if (def.toolPanel === 'agColumnsToolPanel') {
            var moduleMissing = !ModuleRegistry.assertRegistered(ModuleNames.ColumnsToolPanelModule, 'Column Tool Panel', this.context.getGridId());
            if (moduleMissing) {
                return false;
            }
        }
        if (def.toolPanel === 'agFiltersToolPanel') {
            var moduleMissing = !ModuleRegistry.assertRegistered(ModuleNames.FiltersToolPanelModule, 'Filters Tool Panel', this.context.getGridId());
            if (moduleMissing) {
                return false;
            }
        }
        return true;
    };
    SideBarComp.prototype.createToolPanelAndSideButton = function (def) {
        if (!this.validateDef(def)) {
            return;
        }
        var button = this.sideBarButtonsComp.addButtonComp(def);
        var wrapper = this.getContext().createBean(new ToolPanelWrapper());
        wrapper.setToolPanelDef(def);
        wrapper.setDisplayed(false);
        var wrapperGui = wrapper.getGui();
        this.appendChild(wrapperGui);
        this.toolPanelWrappers.push(wrapper);
        _.setAriaControls(button.getButtonElement(), wrapperGui);
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
        var switchingToolPanel = !!key && !!previousKey;
        if (previousKey) {
            var event_1 = {
                type: Events.EVENT_TOOL_PANEL_VISIBLE_CHANGED,
                source: source,
                key: previousKey,
                visible: false,
                switchingToolPanel: switchingToolPanel,
            };
            this.eventService.dispatchEvent(event_1);
        }
        if (key) {
            var event_2 = {
                type: Events.EVENT_TOOL_PANEL_VISIBLE_CHANGED,
                source: source,
                key: key,
                visible: true,
                switchingToolPanel: switchingToolPanel,
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
            _.removeFromParent(wrapper.getGui());
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
        Autowired('gridApi')
    ], SideBarComp.prototype, "gridApi", void 0);
    __decorate([
        Autowired('focusService')
    ], SideBarComp.prototype, "focusService", void 0);
    __decorate([
        RefSelector('sideBarButtons')
    ], SideBarComp.prototype, "sideBarButtonsComp", void 0);
    __decorate([
        PostConstruct
    ], SideBarComp.prototype, "postConstruct", null);
    return SideBarComp;
}(Component));
export { SideBarComp };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2lkZUJhckNvbXAuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9zcmMvc2lkZUJhci9zaWRlQmFyQ29tcC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFBLE9BQU8sRUFDSCxDQUFDLEVBQ0QsU0FBUyxFQUNULE1BQU0sRUFHTixXQUFXLEVBQ1gsY0FBYyxFQUNkLGFBQWEsRUFDYixXQUFXLEVBS1gsU0FBUyxFQUNULG1CQUFtQixFQUVuQixPQUFPLEVBRVYsTUFBTSx5QkFBeUIsQ0FBQztBQUNqQyxPQUFPLEVBQTZCLGtCQUFrQixFQUFFLE1BQU0sc0JBQXNCLENBQUM7QUFDckYsT0FBTyxFQUFFLGdCQUFnQixFQUFFLE1BQU0sb0JBQW9CLENBQUM7QUFDdEQsT0FBTyxFQUFFLGdCQUFnQixFQUFFLE1BQU0sb0JBQW9CLENBQUM7QUFFdEQ7SUFBaUMsK0JBQVM7SUFjdEM7UUFBQSxZQUNJLGtCQUFNLFdBQVcsQ0FBQyxRQUFRLENBQUMsU0FDOUI7UUFWTyx1QkFBaUIsR0FBdUIsRUFBRSxDQUFDOztJQVVuRCxDQUFDO0lBR08sbUNBQWEsR0FBckI7UUFEQSxpQkFrQkM7UUFoQkcsSUFBSSxDQUFDLGtCQUFrQixDQUFDLGdCQUFnQixDQUFDLGtCQUFrQixDQUFDLDZCQUE2QixFQUFFLElBQUksQ0FBQyx3QkFBd0IsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztRQUNySSxJQUFJLENBQUMsYUFBYSxFQUFFLENBQUM7UUFFckIsSUFBSSxDQUFDLDBCQUEwQixDQUFDLFNBQVMsRUFBRTtZQUN2QyxLQUFJLENBQUMsV0FBVyxFQUFFLENBQUM7WUFDbkIsS0FBSSxDQUFDLGFBQWEsRUFBRSxDQUFDO1FBQ3pCLENBQUMsQ0FBQyxDQUFDO1FBRUgsSUFBSSxDQUFDLE9BQU8sQ0FBQyxtQkFBbUIsQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUN2QyxJQUFJLENB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