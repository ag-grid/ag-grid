"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SideBarButtonsComp = void 0;
const core_1 = require("@ag-grid-community/core");
const sideBarButtonComp_1 = require("./sideBarButtonComp");
class SideBarButtonsComp extends core_1.Component {
    constructor() {
        super(SideBarButtonsComp.TEMPLATE);
        this.buttonComps = [];
    }
    postConstruct() {
        this.addManagedListener(this.getFocusableElement(), 'keydown', this.handleKeyDown.bind(this));
    }
    handleKeyDown(e) {
        if (e.key !== core_1.KeyCode.TAB || !e.shiftKey) {
            return;
        }
        const lastColumn = core_1._.last(this.columnModel.getAllDisplayedColumns());
        if (this.focusService.focusGridView(lastColumn, true)) {
            e.preventDefault();
        }
    }
    setToolPanelDefs(toolPanelDefs) {
        toolPanelDefs.forEach(this.addButtonComp.bind(this));
    }
    setActiveButton(id) {
        this.buttonComps.forEach(comp => {
            comp.setSelected(id === comp.getToolPanelId());
        });
    }
    addButtonComp(def) {
        const buttonComp = this.createBean(new sideBarButtonComp_1.SideBarButtonComp(def));
        this.buttonComps.push(buttonComp);
        this.appendChild(buttonComp);
        buttonComp.addEventListener(sideBarButtonComp_1.SideBarButtonComp.EVENT_TOGGLE_BUTTON_CLICKED, () => {
            this.dispatchEvent({
                type: SideBarButtonsComp.EVENT_SIDE_BAR_BUTTON_CLICKED,
                toolPanelId: def.id
            });
        });
    }
    clearButtons() {
        this.buttonComps = this.destroyBeans(this.buttonComps);
        core_1._.clearElement(this.getGui());
    }
}
SideBarButtonsComp.EVENT_SIDE_BAR_BUTTON_CLICKED = 'sideBarButtonClicked';
SideBarButtonsComp.TEMPLATE = `<div class="ag-side-buttons" role="tablist"></div>`;
__decorate([
    core_1.Autowired('focusService')
], SideBarButtonsComp.prototype, "focusService", void 0);
__decorate([
    core_1.Autowired('columnModel')
], SideBarButtonsComp.prototype, "columnModel", void 0);
__decorate([
    core_1.PostConstruct
], SideBarButtonsComp.prototype, "postConstruct", null);
__decorate([
    core_1.PreDestroy
], SideBarButtonsComp.prototype, "clearButtons", null);
exports.SideBarButtonsComp = SideBarButtonsComp;
