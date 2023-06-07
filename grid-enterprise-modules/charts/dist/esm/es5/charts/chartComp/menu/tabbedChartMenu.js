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
import { AgPromise, Autowired, Component, PostConstruct, TabbedLayout } from "@ag-grid-community/core";
import { ChartDataPanel } from "./data/chartDataPanel";
import { FormatPanel } from "./format/formatPanel";
import { ChartSettingsPanel } from "./settings/chartSettingsPanel";
var TabbedChartMenu = /** @class */ (function (_super) {
    __extends(TabbedChartMenu, _super);
    function TabbedChartMenu(params) {
        var _this = _super.call(this) || this;
        _this.tabs = [];
        var controller = params.controller, panels = params.panels, chartOptionsService = params.chartOptionsService;
        _this.chartController = controller;
        _this.chartOptionsService = chartOptionsService;
        _this.panels = panels;
        return _this;
    }
    TabbedChartMenu.prototype.init = function () {
        var _this = this;
        this.panels.forEach(function (panel) {
            var panelType = panel.replace('chart', '').toLowerCase();
            var _a = _this.createTab(panel, panelType, _this.getPanelClass(panelType)), comp = _a.comp, tab = _a.tab;
            _this.tabs.push(tab);
            _this.addDestroyFunc(function () { return _this.destroyBean(comp); });
        });
        this.tabbedLayout = new TabbedLayout({
            items: this.tabs,
            cssClass: 'ag-chart-tabbed-menu',
            keepScrollPosition: true
        });
        this.getContext().createBean(this.tabbedLayout);
    };
    TabbedChartMenu.prototype.createTab = function (name, title, TabPanelClass) {
        var eWrapperDiv = document.createElement('div');
        eWrapperDiv.classList.add('ag-chart-tab', "ag-chart-" + title);
        var comp = new TabPanelClass(this.chartController, this.chartOptionsService);
        this.getContext().createBean(comp);
        eWrapperDiv.appendChild(comp.getGui());
        var titleEl = document.createElement('div');
        var translatedTitle = this.chartTranslationService.translate(title);
        titleEl.innerText = translatedTitle;
        return {
            comp: comp,
            tab: {
                title: titleEl,
                titleLabel: translatedTitle,
                bodyPromise: AgPromise.resolve(eWrapperDiv),
                getScrollableContainer: function () {
                    var scrollableContainer = eWrapperDiv.querySelector('.ag-scrollable-container');
                    return (scrollableContainer || eWrapperDiv);
                },
                name: name
            }
        };
    };
    TabbedChartMenu.prototype.showTab = function (tab) {
        var tabItem = this.tabs[tab];
        this.tabbedLayout.showItem(tabItem);
    };
    TabbedChartMenu.prototype.getGui = function () {
        return this.tabbedLayout && this.tabbedLayout.getGui();
    };
    TabbedChartMenu.prototype.destroy = function () {
        if (this.parentComponent && this.parentComponent.isAlive()) {
            this.destroyBean(this.parentComponent);
        }
        _super.prototype.destroy.call(this);
    };
    TabbedChartMenu.prototype.getPanelClass = function (panelType) {
        switch (panelType) {
            case TabbedChartMenu.TAB_DATA:
                return ChartDataPanel;
            case TabbedChartMenu.TAB_FORMAT:
                return FormatPanel;
            default:
                return ChartSettingsPanel;
        }
    };
    TabbedChartMenu.TAB_DATA = 'data';
    TabbedChartMenu.TAB_FORMAT = 'format';
    __decorate([
        Autowired('chartTranslationService')
    ], TabbedChartMenu.prototype, "chartTranslationService", void 0);
    __decorate([
        PostConstruct
    ], TabbedChartMenu.prototype, "init", null);
    return TabbedChartMenu;
}(Component));
export { TabbedChartMenu };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGFiYmVkQ2hhcnRNZW51LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vc3JjL2NoYXJ0cy9jaGFydENvbXAvbWVudS90YWJiZWRDaGFydE1lbnUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQUEsT0FBTyxFQUNILFNBQVMsRUFDVCxTQUFTLEVBR1QsU0FBUyxFQUNULGFBQWEsRUFFYixZQUFZLEVBQ2YsTUFBTSx5QkFBeUIsQ0FBQztBQUVqQyxPQUFPLEVBQUUsY0FBYyxFQUFFLE1BQU0sdUJBQXVCLENBQUM7QUFDdkQsT0FBTyxFQUFFLFdBQVcsRUFBRSxNQUFNLHNCQUFzQixDQUFDO0FBQ25ELE9BQU8sRUFBRSxrQkFBa0IsRUFBRSxNQUFNLCtCQUErQixDQUFDO0FBSW5FO0lBQXFDLG1DQUFTO0lBYTFDLHlCQUFZLE1BS1g7UUFMRCxZQU1JLGlCQUFPLFNBT1Y7UUFuQk8sVUFBSSxHQUFpQixFQUFFLENBQUM7UUFjcEIsSUFBQSxVQUFVLEdBQWtDLE1BQU0sV0FBeEMsRUFBRSxNQUFNLEdBQTBCLE1BQU0sT0FBaEMsRUFBRSxtQkFBbUIsR0FBSyxNQUFNLG9CQUFYLENBQVk7UUFFM0QsS0FBSSxDQUFDLGVBQWUsR0FBRyxVQUFVLENBQUM7UUFDbEMsS0FBSSxDQUFDLG1CQUFtQixHQUFHLG1CQUFtQixDQUFDO1FBQy9DLEtBQUksQ0FBQyxNQUFNLEdBQUcsTUFBTSxDQUFDOztJQUN6QixDQUFDO0lBR00sOEJBQUksR0FBWDtRQURBLGlCQWdCQztRQWRHLElBQUksQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLFVBQUEsS0FBSztZQUNyQixJQUFNLFNBQVMsR0FBRyxLQUFLLENBQUMsT0FBTyxDQUFDLE9BQU8sRUFBRSxFQUFFLENBQUMsQ0FBQyxXQUFXLEVBQUUsQ0FBQztZQUNyRCxJQUFBLEtBQWdCLEtBQUksQ0FBQyxTQUFTLENBQUMsS0FBSyxFQUFFLFNBQVMsRUFBRSxLQUFJLENBQUMsYUFBYSxDQUFDLFNBQVMsQ0FBQyxDQUFDLEVBQTdFLElBQUksVUFBQSxFQUFFLEdBQUcsU0FBb0UsQ0FBQztZQUV0RixLQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQztZQUNwQixLQUFJLENBQUMsY0FBYyxDQUFDLGNBQU0sT0FBQSxLQUFJLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxFQUF0QixDQUFzQixDQUFDLENBQUM7UUFDdEQsQ0FBQyxDQUFDLENBQUM7UUFFSCxJQUFJLENBQUMsWUFBWSxHQUFHLElBQUksWUFBWSxDQUFDO1lBQ2pDLEtBQUssRUFBRSxJQUFJLENBQUMsSUFBSTtZQUNoQixRQUFRLEVBQUUsc0JBQXNCO1lBQ2hDLGtCQUFrQixFQUFFLElBQUk7U0FDM0IsQ0FBQyxDQUFDO1FBQ0gsSUFBSSxDQUFDLFVBQVUsRUFBRSxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLENBQUM7SUFDcEQsQ0FBQztJQUVPLG1DQUFTLEdBQWpCLFVBQ0ksSUFBc0IsRUFDdEIsS0FBYSxFQUNiLGFBQXVHO1FBRXZHLElBQU0sV0FBVyxHQUFHLFFBQVEsQ0FBQyxhQUFhLENBQUMsS0FBSyxDQUFDLENBQUM7UUFDbEQsV0FBVyxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsY0FBYyxFQUFFLGNBQVksS0FBTyxDQUFDLENBQUM7UUFFL0QsSUFBTSxJQUFJLEdBQUcsSUFBSSxhQUFhLENBQUMsSUFBSSxDQUFDLGVBQWUsRUFBRSxJQUFJLENBQUMsbUJBQW1CLENBQUMsQ0FBQztRQUMvRSxJQUFJLENBQUMsVUFBVSxFQUFFLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxDQUFDO1FBRW5DLFdBQVcsQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRSxDQUFDLENBQUM7UUFFdkMsSUFBTSxPQUFPLEdBQUcsUUFBUSxDQUFDLGFBQWEsQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUM5QyxJQUFNLGVBQWUsR0FBRyxJQUFJLENBQUMsdUJBQXVCLENBQUMsU0FBUyxDQUFDLEtBQUssQ0FBQyxDQUFDO1FBQ3RFLE9BQU8sQ0FBQyxTQUFTLEdBQUcsZUFBZSxDQUFDO1FBRXBDLE9BQU87WUFDSCxJQUFJLE1BQUE7WUFDSixHQUFHLEVBQUU7Z0JBQ0QsS0FBSyxFQUFFLE9BQU87Z0JBQ2QsVUFBVSxFQUFFLGVBQWU7Z0JBQzNCLFdBQVcsRUFBRSxTQUFTLENBQUMsT0FBTyxDQUFDLFdBQVcsQ0FBQztnQkFDM0Msc0JBQXNCLEVBQUU7b0JBQ3BCLElBQU0sbUJBQW1CLEdBQUcsV0FBVyxDQUFDLGFBQWEsQ0FBQywwQkFBMEIsQ0FBQyxDQUFDO29CQUNsRixPQUFPLENBQUMsbUJBQW1CLElBQUksV0FBVyxDQUFnQixDQUFDO2dCQUMvRCxDQUFDO2dCQUNELElBQUksTUFBQTthQUNQO1NBQ0osQ0FBQztJQUNOLENBQUM7SUFFTSxpQ0FBTyxHQUFkLFVBQWUsR0FBVztRQUN0QixJQUFNLE9BQU8sR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBQy9CLElBQUksQ0FBQyxZQUFZLENBQUMsUUFBUSxDQUFDLE9BQU8sQ0FBQyxDQUFDO0lBQ3hDLENBQUM7SUFFTSxnQ0FBTSxHQUFiO1FBQ0ksT0FBTyxJQUFJLENBQUMsWUFBWSxJQUFJLElBQUksQ0FBQyxZQUFZLENBQUMsTUFBTSxFQUFFLENBQUM7SUFDM0QsQ0FBQztJQUVTLGlDQUFPLEdBQWpCO1FBQ0ksSUFBSSxJQUFJLENBQUMsZUFBZSxJQUFJLElBQUksQ0FBQyxlQUFlLENBQUMsT0FBTyxFQUFFLEVBQUU7WUFDeEQsSUFBSSxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsZUFBZSxDQUFDLENBQUM7U0FDMUM7UUFDRCxpQkFBTSxPQUFPLFdBQUUsQ0FBQztJQUNwQixDQUFDO0lBRU8sdUNBQWEsR0FBckIsVUFBc0IsU0FBaUI7UUFDbkMsUUFBUSxTQUFTLEVBQUU7WUFDZixLQUFLLGVBQWUsQ0FBQyxRQUFRO2dCQUN6QixPQUFPLGNBQWMsQ0FBQztZQUMxQixLQUFLLGVBQWUsQ0FBQyxVQUFVO2dCQUMzQixPQUFPLFdBQVcsQ0FBQztZQUN2QjtnQkFDSSxPQUFPLGtCQUFrQixDQUFDO1NBQ2pDO0lBQ0wsQ0FBQztJQXRHYSx3QkFBUSxHQUFHLE1BQU0sQ0FBQztJQUNsQiwwQkFBVSxHQUFHLFFBQVEsQ0FBQztJQVNFO1FBQXJDLFNBQVMsQ0FBQyx5QkFBeUIsQ0FBQztvRUFBMEQ7SUFrQi9GO1FBREMsYUFBYTsrQ0FnQmI7SUE0REwsc0JBQUM7Q0FBQSxBQXhHRCxDQUFxQyxTQUFTLEdBd0c3QztTQXhHWSxlQUFlIn0=