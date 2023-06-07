var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { Autowired, Component, PostConstruct, PreDestroy, _, KeyCode } from "@ag-grid-community/core";
import { SideBarButtonComp } from "./sideBarButtonComp";
export class SideBarButtonsComp extends Component {
    constructor() {
        super(SideBarButtonsComp.TEMPLATE);
        this.buttonComps = [];
    }
    postConstruct() {
        this.addManagedListener(this.getFocusableElement(), 'keydown', this.handleKeyDown.bind(this));
    }
    handleKeyDown(e) {
        if (e.key !== KeyCode.TAB || !e.shiftKey) {
            return;
        }
        const lastColumn = _.last(this.columnModel.getAllDisplayedColumns());
        if (this.focusService.focusGridView(lastColumn, true)) {
            e.preventDefault();
        }
    }
    setActiveButton(id) {
        this.buttonComps.forEach(comp => {
            comp.setSelected(id === comp.getToolPanelId());
        });
    }
    addButtonComp(def) {
        const buttonComp = this.createBean(new SideBarButtonComp(def));
        this.buttonComps.push(buttonComp);
        this.appendChild(buttonComp);
        buttonComp.addEventListener(SideBarButtonComp.EVENT_TOGGLE_BUTTON_CLICKED, () => {
            this.dispatchEvent({
                type: SideBarButtonsComp.EVENT_SIDE_BAR_BUTTON_CLICKED,
                toolPanelId: def.id
            });
        });
        return buttonComp;
    }
    clearButtons() {
        this.buttonComps = this.destroyBeans(this.buttonComps);
        _.clearElement(this.getGui());
    }
}
SideBarButtonsComp.EVENT_SIDE_BAR_BUTTON_CLICKED = 'sideBarButtonClicked';
SideBarButtonsComp.TEMPLATE = `<div class="ag-side-buttons" role="tablist"></div>`;
__decorate([
    Autowired('focusService')
], SideBarButtonsComp.prototype, "focusService", void 0);
__decorate([
    Autowired('columnModel')
], SideBarButtonsComp.prototype, "columnModel", void 0);
__decorate([
    PostConstruct
], SideBarButtonsComp.prototype, "postConstruct", null);
__decorate([
    PreDestroy
], SideBarButtonsComp.prototype, "clearButtons", null);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2lkZUJhckJ1dHRvbnNDb21wLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vc3JjL3NpZGVCYXIvc2lkZUJhckJ1dHRvbnNDb21wLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7OztBQUFBLE9BQU8sRUFDSCxTQUFTLEVBRVQsU0FBUyxFQUNULGFBQWEsRUFFYixVQUFVLEVBRVYsQ0FBQyxFQUNELE9BQU8sRUFFVixNQUFNLHlCQUF5QixDQUFDO0FBRWpDLE9BQU8sRUFBRSxpQkFBaUIsRUFBRSxNQUFNLHFCQUFxQixDQUFDO0FBTXhELE1BQU0sT0FBTyxrQkFBbUIsU0FBUSxTQUFTO0lBUzdDO1FBQ0ksS0FBSyxDQUFDLGtCQUFrQixDQUFDLFFBQVEsQ0FBQyxDQUFDO1FBTi9CLGdCQUFXLEdBQXdCLEVBQUUsQ0FBQztJQU85QyxDQUFDO0lBR08sYUFBYTtRQUNqQixJQUFJLENBQUMsa0JBQWtCLENBQUMsSUFBSSxDQUFDLG1CQUFtQixFQUFFLEVBQUUsU0FBUyxFQUFFLElBQUksQ0FBQyxhQUFhLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7SUFDbEcsQ0FBQztJQUVPLGFBQWEsQ0FBQyxDQUFnQjtRQUNsQyxJQUFJLENBQUMsQ0FBQyxHQUFHLEtBQUssT0FBTyxDQUFDLEdBQUcsSUFBSSxDQUFDLENBQUMsQ0FBQyxRQUFRLEVBQUU7WUFBRSxPQUFPO1NBQUU7UUFFckQsTUFBTSxVQUFVLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLHNCQUFzQixFQUFFLENBQUMsQ0FBQztRQUVyRSxJQUFJLElBQUksQ0FBQyxZQUFZLENBQUMsYUFBYSxDQUFDLFVBQVUsRUFBRSxJQUFJLENBQUMsRUFBRTtZQUNuRCxDQUFDLENBQUMsY0FBYyxFQUFFLENBQUM7U0FDdEI7SUFDTCxDQUFDO0lBRU0sZUFBZSxDQUFDLEVBQXNCO1FBQ3pDLElBQUksQ0FBQyxXQUFXLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxFQUFFO1lBQzVCLElBQUksQ0FBQyxXQUFXLENBQUMsRUFBRSxLQUFLLElBQUksQ0FBQyxjQUFjLEVBQUUsQ0FBQyxDQUFDO1FBQ25ELENBQUMsQ0FBQyxDQUFDO0lBQ1AsQ0FBQztJQUVNLGFBQWEsQ0FBQyxHQUFpQjtRQUNsQyxNQUFNLFVBQVUsR0FBRyxJQUFJLENBQUMsVUFBVSxDQUFDLElBQUksaUJBQWlCLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztRQUMvRCxJQUFJLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsQ0FBQztRQUNsQyxJQUFJLENBQUMsV0FBVyxDQUFDLFVBQVUsQ0FBQyxDQUFDO1FBRTdCLFVBQVUsQ0FBQyxnQkFBZ0IsQ0FBQyxpQkFBaUIsQ0FBQywyQkFBMkIsRUFBRSxHQUFHLEVBQUU7WUFDNUUsSUFBSSxDQUFDLGFBQWEsQ0FBQztnQkFDZixJQUFJLEVBQUUsa0JBQWtCLENBQUMsNkJBQTZCO2dCQUN0RCxXQUFXLEVBQUUsR0FBRyxDQUFDLEVBQUU7YUFDdEIsQ0FBQyxDQUFDO1FBQ1AsQ0FBQyxDQUFDLENBQUM7UUFFSCxPQUFPLFVBQVUsQ0FBQztJQUN0QixDQUFDO0lBR00sWUFBWTtRQUNmLElBQUksQ0FBQyxXQUFXLEdBQUcsSUFBSSxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLENBQUM7UUFDdkQsQ0FBQyxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsTUFBTSxFQUFFLENBQUMsQ0FBQztJQUNsQyxDQUFDOztBQW5EYSxnREFBNkIsR0FBRyxzQkFBc0IsQ0FBQztBQUM3QywyQkFBUSxHQUFzQixvREFBb0QsQ0FBQztBQUdoRjtJQUExQixTQUFTLENBQUMsY0FBYyxDQUFDO3dEQUFvQztBQUNwQztJQUF6QixTQUFTLENBQUMsYUFBYSxDQUFDO3VEQUFrQztBQU8zRDtJQURDLGFBQWE7dURBR2I7QUFrQ0Q7SUFEQyxVQUFVO3NEQUlWIn0=