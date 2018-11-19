// ag-grid-enterprise v19.1.3
"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    }
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
var ag_grid_community_1 = require("ag-grid-community");
var SideBarButtonsComp = /** @class */ (function (_super) {
    __extends(SideBarButtonsComp, _super);
    function SideBarButtonsComp() {
        var _this = _super.call(this, SideBarButtonsComp.TEMPLATE) || this;
        _this.panels = {};
        _this.defaultPanelKey = null;
        return _this;
    }
    SideBarButtonsComp.prototype.registerPanelComp = function (key, panelComponent) {
        this.panels[key] = panelComponent;
    };
    SideBarButtonsComp.prototype.registerGridComp = function (gridPanel) {
        this.gridPanel = gridPanel;
    };
    SideBarButtonsComp.prototype.postConstruct = function () {
        var buttons = {};
        var toolPanels = ag_grid_community_1._.get(this.gridOptionsWrapper.getSideBar(), 'toolPanels', []);
        toolPanels.forEach(function (toolPanel) {
            buttons[toolPanel.id] = toolPanel;
        });
        this.createButtonsHtml(buttons);
    };
    SideBarButtonsComp.prototype.createButtonsHtml = function (componentButtons) {
        var _this = this;
        var translate = this.gridOptionsWrapper.getLocaleTextFunc();
        var html = '';
        var keys = Object.keys(componentButtons);
        keys.forEach(function (key) {
            var def = componentButtons[key];
            html += "<div class=\"ag-side-button\"\"><button type=\"button\" ref=\"toggle-button-" + key + "\"><div><span class=\"ag-icon-" + def.iconKey + "\"></span></div><span>" + translate(def.labelKey, def.labelDefault) + "</span></button></div>";
        });
        this.getGui().innerHTML = html;
        keys.forEach(function (key) {
            _this.addButtonEvents(key);
        });
        this.defaultPanelKey = ag_grid_community_1._.get(this.gridOptionsWrapper.getSideBar(), 'defaultToolPanel', null);
        var defaultButtonElement = this.getRefElement("toggle-button-" + this.defaultPanelKey);
        if (defaultButtonElement && defaultButtonElement.parentElement) {
            ag_grid_community_1._.addOrRemoveCssClass(defaultButtonElement.parentElement, 'ag-selected', true);
        }
    };
    SideBarButtonsComp.prototype.addButtonEvents = function (keyToProcess) {
        var _this = this;
        var btShow = this.getRefElement("toggle-button-" + keyToProcess);
        this.addDestroyableEventListener(btShow, 'click', function () { return _this.onButtonPressed(keyToProcess); });
    };
    SideBarButtonsComp.prototype.onButtonPressed = function (keyPressed) {
        var _this = this;
        Object.keys(this.panels).forEach(function (keyToProcess) {
            _this.processKeyAfterKeyPressed(keyToProcess, keyPressed);
        });
    };
    SideBarButtonsComp.prototype.processKeyAfterKeyPressed = function (keyToProcess, keyPressed) {
        var panelToProcess = this.panels[keyToProcess];
        var clickingThisPanel = keyToProcess === keyPressed;
        var showThisPanel = clickingThisPanel ? !panelToProcess.isVisible() : false;
        this.setPanelVisibility(keyToProcess, showThisPanel);
    };
    SideBarButtonsComp.prototype.setPanelVisibility = function (key, show) {
        var panelToProcess = this.panels[key];
        if (!panelToProcess) {
            console.warn("ag-grid: can't change the visibility for the non existing tool panel item [" + key + "]");
            return;
        }
        panelToProcess.setVisible(show);
        var button = this.getRefElement("toggle-button-" + key);
        if (button.parentElement) {
            ag_grid_community_1._.addOrRemoveCssClass(button.parentElement, 'ag-selected', show);
        }
    };
    SideBarButtonsComp.prototype.clear = function () {
        this.setTemplate(SideBarButtonsComp.TEMPLATE);
        this.panels = {};
    };
    SideBarButtonsComp.TEMPLATE = "<div class=\"ag-side-buttons\"></div>";
    __decorate([
        ag_grid_community_1.Autowired("gridOptionsWrapper"),
        __metadata("design:type", ag_grid_community_1.GridOptionsWrapper)
    ], SideBarButtonsComp.prototype, "gridOptionsWrapper", void 0);
    __decorate([
        ag_grid_community_1.Autowired("eventService"),
        __metadata("design:type", ag_grid_community_1.EventService)
    ], SideBarButtonsComp.prototype, "eventService", void 0);
    __decorate([
        ag_grid_community_1.PostConstruct,
        __metadata("design:type", Function),
        __metadata("design:paramtypes", []),
        __metadata("design:returntype", void 0)
    ], SideBarButtonsComp.prototype, "postConstruct", null);
    return SideBarButtonsComp;
}(ag_grid_community_1.Component));
exports.SideBarButtonsComp = SideBarButtonsComp;
