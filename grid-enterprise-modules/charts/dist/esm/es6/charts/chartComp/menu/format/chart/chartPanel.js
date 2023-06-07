var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { _, Autowired, Component, PostConstruct, RefSelector } from "@ag-grid-community/core";
import { PaddingPanel } from "./paddingPanel";
import { BackgroundPanel } from "./backgroundPanel";
import TitlePanel from "./titlePanel";
export class ChartPanel extends Component {
    constructor({ chartController, chartOptionsService, isExpandedOnInit = false }) {
        super();
        this.activePanels = [];
        this.chartController = chartController;
        this.chartOptionsService = chartOptionsService;
        this.isExpandedOnInit = isExpandedOnInit;
    }
    init() {
        const groupParams = {
            cssIdentifier: 'charts-format-top-level',
            direction: 'vertical'
        };
        this.setTemplate(ChartPanel.TEMPLATE, { chartGroup: groupParams });
        this.initGroup();
        this.initTitles();
        this.initPaddingPanel();
        this.initBackgroundPanel();
    }
    initGroup() {
        this.chartGroup
            .setTitle(this.chartTranslationService.translate('chart'))
            .toggleGroupExpand(this.isExpandedOnInit)
            .hideEnabledCheckbox(true);
    }
    initTitles() {
        const titlePanelComp = this.createBean(new TitlePanel(this.chartOptionsService));
        this.chartGroup.addItem(titlePanelComp);
        this.activePanels.push(titlePanelComp);
    }
    initPaddingPanel() {
        const paddingPanelComp = this.createBean(new PaddingPanel(this.chartOptionsService, this.chartController));
        this.chartGroup.addItem(paddingPanelComp);
        this.activePanels.push(paddingPanelComp);
    }
    initBackgroundPanel() {
        const backgroundPanelComp = this.createBean(new BackgroundPanel(this.chartOptionsService));
        this.chartGroup.addItem(backgroundPanelComp);
        this.activePanels.push(backgroundPanelComp);
    }
    destroyActivePanels() {
        this.activePanels.forEach(panel => {
            _.removeFromParent(panel.getGui());
            this.destroyBean(panel);
        });
    }
    destroy() {
        this.destroyActivePanels();
        super.destroy();
    }
}
ChartPanel.TEMPLATE = `<div>
            <ag-group-component ref="chartGroup"></ag-group-component>
        </div>`;
__decorate([
    RefSelector('chartGroup')
], ChartPanel.prototype, "chartGroup", void 0);
__decorate([
    Autowired('chartTranslationService')
], ChartPanel.prototype, "chartTranslationService", void 0);
__decorate([
    PostConstruct
], ChartPanel.prototype, "init", null);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2hhcnRQYW5lbC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uL3NyYy9jaGFydHMvY2hhcnRDb21wL21lbnUvZm9ybWF0L2NoYXJ0L2NoYXJ0UGFuZWwudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7O0FBQUEsT0FBTyxFQUNILENBQUMsRUFHRCxTQUFTLEVBQ1QsU0FBUyxFQUNULGFBQWEsRUFDYixXQUFXLEVBQ2QsTUFBTSx5QkFBeUIsQ0FBQztBQUNqQyxPQUFPLEVBQUUsWUFBWSxFQUFFLE1BQU0sZ0JBQWdCLENBQUM7QUFFOUMsT0FBTyxFQUFFLGVBQWUsRUFBRSxNQUFNLG1CQUFtQixDQUFDO0FBQ3BELE9BQU8sVUFBVSxNQUFNLGNBQWMsQ0FBQztBQUt0QyxNQUFNLE9BQU8sVUFBVyxTQUFRLFNBQVM7SUFpQnJDLFlBQVksRUFDUixlQUFlLEVBQ2YsbUJBQW1CLEVBQ25CLGdCQUFnQixHQUFHLEtBQUssRUFDUDtRQUNqQixLQUFLLEVBQUUsQ0FBQztRQVBKLGlCQUFZLEdBQWdCLEVBQUUsQ0FBQztRQVNuQyxJQUFJLENBQUMsZUFBZSxHQUFHLGVBQWUsQ0FBQztRQUN2QyxJQUFJLENBQUMsbUJBQW1CLEdBQUcsbUJBQW1CLENBQUM7UUFDL0MsSUFBSSxDQUFDLGdCQUFnQixHQUFHLGdCQUFnQixDQUFDO0lBQzdDLENBQUM7SUFHTyxJQUFJO1FBQ1IsTUFBTSxXQUFXLEdBQTJCO1lBQ3hDLGFBQWEsRUFBRSx5QkFBeUI7WUFDeEMsU0FBUyxFQUFFLFVBQVU7U0FDeEIsQ0FBQztRQUNGLElBQUksQ0FBQyxXQUFXLENBQUMsVUFBVSxDQUFDLFFBQVEsRUFBRSxFQUFFLFVBQVUsRUFBRSxXQUFXLEVBQUUsQ0FBQyxDQUFDO1FBRW5FLElBQUksQ0FBQyxTQUFTLEVBQUUsQ0FBQztRQUNqQixJQUFJLENBQUMsVUFBVSxFQUFFLENBQUM7UUFDbEIsSUFBSSxDQUFDLGdCQUFnQixFQUFFLENBQUM7UUFDeEIsSUFBSSxDQUFDLG1CQUFtQixFQUFFLENBQUM7SUFDL0IsQ0FBQztJQUVPLFNBQVM7UUFDYixJQUFJLENBQUMsVUFBVTthQUNWLFFBQVEsQ0FBQyxJQUFJLENBQUMsdUJBQXVCLENBQUMsU0FBUyxDQUFDLE9BQU8sQ0FBQyxDQUFDO2FBQ3pELGlCQUFpQixDQUFDLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQzthQUN4QyxtQkFBbUIsQ0FBQyxJQUFJLENBQUMsQ0FBQztJQUNuQyxDQUFDO0lBRU8sVUFBVTtRQUNkLE1BQU0sY0FBYyxHQUFHLElBQUksQ0FBQyxVQUFVLENBQUMsSUFBSSxVQUFVLENBQUMsSUFBSSxDQUFDLG1CQUFtQixDQUFDLENBQUMsQ0FBQztRQUVqRixJQUFJLENBQUMsVUFBVSxDQUFDLE9BQU8sQ0FBQyxjQUFjLENBQUMsQ0FBQztRQUN4QyxJQUFJLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQyxjQUFjLENBQUMsQ0FBQztJQUMzQyxDQUFDO0lBRU8sZ0JBQWdCO1FBQ3BCLE1BQU0sZ0JBQWdCLEdBQUcsSUFBSSxDQUFDLFVBQVUsQ0FBQyxJQUFJLFlBQVksQ0FBQyxJQUFJLENBQUMsbUJBQW1CLEVBQUUsSUFBSSxDQUFDLGVBQWUsQ0FBQyxDQUFDLENBQUM7UUFDM0csSUFBSSxDQUFDLFVBQVUsQ0FBQyxPQUFPLENBQUMsZ0JBQWdCLENBQUMsQ0FBQztRQUMxQyxJQUFJLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDO0lBQzdDLENBQUM7SUFFTyxtQkFBbUI7UUFDdkIsTUFBTSxtQkFBbUIsR0FBRyxJQUFJLENBQUMsVUFBVSxDQUFDLElBQUksZUFBZSxDQUFDLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxDQUFDLENBQUM7UUFDM0YsSUFBSSxDQUFDLFVBQVUsQ0FBQyxPQUFPLENBQUMsbUJBQW1CLENBQUMsQ0FBQztRQUM3QyxJQUFJLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxDQUFDO0lBQ2hELENBQUM7SUFFTyxtQkFBbUI7UUFDdkIsSUFBSSxDQUFDLFlBQVksQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLEVBQUU7WUFDOUIsQ0FBQyxDQUFDLGdCQUFnQixDQUFDLEtBQUssQ0FBQyxNQUFNLEVBQUUsQ0FBQyxDQUFDO1lBQ25DLElBQUksQ0FBQyxXQUFXLENBQUMsS0FBSyxDQUFDLENBQUM7UUFDNUIsQ0FBQyxDQUFDLENBQUM7SUFDUCxDQUFDO0lBRVMsT0FBTztRQUNiLElBQUksQ0FBQyxtQkFBbUIsRUFBRSxDQUFDO1FBQzNCLEtBQUssQ0FBQyxPQUFPLEVBQUUsQ0FBQztJQUNwQixDQUFDOztBQTdFYSxtQkFBUSxHQUNsQjs7ZUFFTyxDQUFDO0FBRWU7SUFBMUIsV0FBVyxDQUFDLFlBQVksQ0FBQzs4Q0FBc0M7QUFFMUI7SUFBckMsU0FBUyxDQUFDLHlCQUF5QixDQUFDOzJEQUEwRDtBQXFCL0Y7SUFEQyxhQUFhO3NDQVliIn0=