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
import { _, Autowired, Component, PostConstruct, RefSelector } from "@ag-grid-community/core";
import { MiniChartsContainer } from "./miniChartsContainer";
import { ChartController } from "../../chartController";
var ChartSettingsPanel = /** @class */ (function (_super) {
    __extends(ChartSettingsPanel, _super);
    function ChartSettingsPanel(chartController) {
        var _this = _super.call(this, ChartSettingsPanel.TEMPLATE) || this;
        _this.miniChartsContainers = [];
        _this.cardItems = [];
        _this.activePaletteIndex = 0;
        _this.palettes = [];
        _this.themes = [];
        _this.chartController = chartController;
        return _this;
    }
    ChartSettingsPanel.prototype.postConstruct = function () {
        var _this = this;
        this.resetPalettes();
        this.ePrevBtn.insertAdjacentElement('afterbegin', _.createIconNoSpan('previous', this.gridOptionsService));
        this.eNextBtn.insertAdjacentElement('afterbegin', _.createIconNoSpan('next', this.gridOptionsService));
        this.addManagedListener(this.ePrevBtn, 'click', function () { return _this.setActivePalette(_this.getPrev(), 'left'); });
        this.addManagedListener(this.eNextBtn, 'click', function () { return _this.setActivePalette(_this.getNext(), 'right'); });
        // change the selected chart when a combo chart is modified via the data panel, i.e. the custom combo should be selected
        this.addManagedListener(this.chartController, ChartController.EVENT_CHART_TYPE_CHANGED, function () { return _this.resetPalettes(true); });
        this.addManagedListener(this.chartController, ChartController.EVENT_CHART_API_UPDATE, function () { return _this.resetPalettes(true); });
        this.scrollSelectedIntoView();
    };
    ChartSettingsPanel.prototype.scrollSelectedIntoView = function () {
        var _this = this;
        // the panel is not immediately visible due to the slide animation, so we add a
        // setTimeout to wait until the panel animation is over and is able to scroll
        setTimeout(function () {
            var isMiniChartsContainerVisible = function (miniChartsContainers) {
                return !miniChartsContainers.getGui().classList.contains('ag-hidden');
            };
            var currentMiniChartContainer = _this.miniChartsContainers.find(isMiniChartsContainerVisible);
            var currentChart = currentMiniChartContainer.getGui().querySelector('.ag-selected');
            if (currentChart) {
                var parent_1 = currentChart.offsetParent;
                if (parent_1) {
                    _this.eMiniChartsContainer.scrollTo(0, parent_1.offsetTop);
                }
            }
        }, 250);
    };
    ChartSettingsPanel.prototype.resetPalettes = function (forceReset) {
        var _this = this;
        var _a, _b;
        var palettes = this.chartController.getPalettes();
        var chartGroups = (_b = (_a = this.gridOptionsService.get('chartToolPanelsDef')) === null || _a === void 0 ? void 0 : _a.settingsPanel) === null || _b === void 0 ? void 0 : _b.chartGroupsDef;
        if ((_.shallowCompare(palettes, this.palettes) && !forceReset) || this.isAnimating) {
            return;
        }
        this.palettes = palettes;
        this.themes = this.chartController.getThemes();
        this.activePaletteIndex = this.themes.findIndex(function (name) { return name === _this.chartController.getChartThemeName(); });
        this.cardItems = [];
        _.clearElement(this.eCardSelector);
        this.destroyMiniCharts();
        this.palettes.forEach(function (palette, index) {
            var isActivePalette = _this.activePaletteIndex === index;
            var fills = palette.fills, strokes = palette.strokes;
            var miniChartsContainer = _this.createBean(new MiniChartsContainer(_this.chartController, fills, strokes, chartGroups));
            _this.miniChartsContainers.push(miniChartsContainer);
            _this.eMiniChartsContainer.appendChild(miniChartsContainer.getGui());
            _this.addCardLink(index);
            if (isActivePalette) {
                miniChartsContainer.updateSelectedMiniChart();
            }
            else {
                miniChartsContainer.setDisplayed(false);
            }
        });
        _.setDisplayed(this.eNavBar, this.palettes.length > 1);
        _.radioCssClass(this.cardItems[this.activePaletteIndex], 'ag-selected', 'ag-not-selected');
    };
    ChartSettingsPanel.prototype.addCardLink = function (index) {
        var _this = this;
        var link = document.createElement('div');
        link.classList.add('ag-chart-settings-card-item');
        this.addManagedListener(link, 'click', function () {
            _this.setActivePalette(index, index < _this.activePaletteIndex ? 'left' : 'right');
        });
        this.eCardSelector.appendChild(link);
        this.cardItems.push(link);
    };
    ChartSettingsPanel.prototype.getPrev = function () {
        var prev = this.activePaletteIndex - 1;
        if (prev < 0) {
            prev = this.palettes.length - 1;
        }
        return prev;
    };
    ChartSettingsPanel.prototype.getNext = function () {
        var next = this.activePaletteIndex + 1;
        if (next >= this.palettes.length) {
            next = 0;
        }
        return next;
    };
    ChartSettingsPanel.prototype.setActivePalette = function (index, animationDirection) {
        var _this = this;
        if (this.isAnimating || this.activePaletteIndex === index) {
            return;
        }
        _.radioCssClass(this.cardItems[index], 'ag-selected', 'ag-not-selected');
        var currentPalette = this.miniChartsContainers[this.activePaletteIndex];
        var currentGui = currentPalette.getGui();
        var futurePalette = this.miniChartsContainers[index];
        var nextGui = futurePalette.getGui();
        currentPalette.updateSelectedMiniChart();
        futurePalette.updateSelectedMiniChart();
        var multiplier = animationDirection === 'left' ? -1 : 1;
        var final = nextGui.style.left = (_.getAbsoluteWidth(this.getGui()) * multiplier) + "px";
        this.activePaletteIndex = index;
        this.isAnimating = true;
        var animatingClass = 'ag-animating';
        futurePalette.setDisplayed(true);
        currentPalette.addCssClass(animatingClass);
        futurePalette.addCssClass(animatingClass);
        this.chartController.setChartThemeName(this.themes[index]);
        window.setTimeout(function () {
            currentGui.style.left = -parseFloat(final) + "px";
            nextGui.style.left = '0px';
        }, 0);
        window.setTimeout(function () {
            _this.isAnimating = false;
            currentPalette.removeCssClass(animatingClass);
            futurePalette.removeCssClass(animatingClass);
            currentPalette.setDisplayed(false);
        }, 300);
    };
    ChartSettingsPanel.prototype.destroyMiniCharts = function () {
        _.clearElement(this.eMiniChartsContainer);
        this.miniChartsContainers = this.destroyBeans(this.miniChartsContainers);
    };
    ChartSettingsPanel.prototype.destroy = function () {
        this.destroyMiniCharts();
        _super.prototype.destroy.call(this);
    };
    ChartSettingsPanel.TEMPLATE = "<div class=\"ag-chart-settings-wrapper\">\n            <div ref=\"eMiniChartsContainer\" class=\"ag-chart-settings-mini-charts-container ag-scrollable-container\"></div>\n            <div ref=\"eNavBar\" class=\"ag-chart-settings-nav-bar\">\n                <div ref=\"ePrevBtn\" class=\"ag-chart-settings-prev\">\n                    <button type=\"button\" class=\"ag-button ag-chart-settings-prev-button\"></button>\n                </div>\n                <div ref=\"eCardSelector\" class=\"ag-chart-settings-card-selector\"></div>\n                <div ref=\"eNextBtn\" class=\"ag-chart-settings-next\">\n                    <button type=\"button\" class=\"ag-button ag-chart-settings-next-button\"></button>\n                </div>\n            </div>\n        </div>";
    __decorate([
        Autowired('resizeObserverService')
    ], ChartSettingsPanel.prototype, "resizeObserverService", void 0);
    __decorate([
        RefSelector('eMiniChartsContainer')
    ], ChartSettingsPanel.prototype, "eMiniChartsContainer", void 0);
    __decorate([
        RefSelector('eNavBar')
    ], ChartSettingsPanel.prototype, "eNavBar", void 0);
    __decorate([
        RefSelector('eCardSelector')
    ], ChartSettingsPanel.prototype, "eCardSelector", void 0);
    __decorate([
        RefSelector('ePrevBtn')
    ], ChartSettingsPanel.prototype, "ePrevBtn", void 0);
    __decorate([
        RefSelector('eNextBtn')
    ], ChartSettingsPanel.prototype, "eNextBtn", void 0);
    __decorate([
        PostConstruct
    ], ChartSettingsPanel.prototype, "postConstruct", null);
    return ChartSettingsPanel;
}(Component));
export { ChartSettingsPanel };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2hhcnRTZXR0aW5nc1BhbmVsLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vc3JjL2NoYXJ0cy9jaGFydENvbXAvbWVudS9zZXR0aW5ncy9jaGFydFNldHRpbmdzUGFuZWwudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQUEsT0FBTyxFQUFFLENBQUMsRUFBRSxTQUFTLEVBQUUsU0FBUyxFQUFFLGFBQWEsRUFBRSxXQUFXLEVBQXlCLE1BQU0seUJBQXlCLENBQUM7QUFDckgsT0FBTyxFQUFFLG1CQUFtQixFQUFFLE1BQU0sdUJBQXVCLENBQUM7QUFFNUQsT0FBTyxFQUFFLGVBQWUsRUFBRSxNQUFNLHVCQUF1QixDQUFDO0FBSXhEO0lBQXdDLHNDQUFTO0lBa0M3Qyw0QkFBWSxlQUFnQztRQUE1QyxZQUNJLGtCQUFNLGtCQUFrQixDQUFDLFFBQVEsQ0FBQyxTQUdyQztRQWZPLDBCQUFvQixHQUEwQixFQUFFLENBQUM7UUFDakQsZUFBUyxHQUFrQixFQUFFLENBQUM7UUFJOUIsd0JBQWtCLEdBQUcsQ0FBQyxDQUFDO1FBQ3ZCLGNBQVEsR0FBMEIsRUFBRSxDQUFDO1FBQ3JDLFlBQU0sR0FBYSxFQUFFLENBQUM7UUFPMUIsS0FBSSxDQUFDLGVBQWUsR0FBRyxlQUFlLENBQUM7O0lBQzNDLENBQUM7SUFHTywwQ0FBYSxHQUFyQjtRQURBLGlCQWNDO1FBWkcsSUFBSSxDQUFDLGFBQWEsRUFBRSxDQUFDO1FBRXJCLElBQUksQ0FBQyxRQUFRLENBQUMscUJBQXFCLENBQUMsWUFBWSxFQUFFLENBQUMsQ0FBQyxnQkFBZ0IsQ0FBQyxVQUFVLEVBQUUsSUFBSSxDQUFDLGtCQUFrQixDQUFFLENBQUMsQ0FBQztRQUM1RyxJQUFJLENBQUMsUUFBUSxDQUFDLHFCQUFxQixDQUFDLFlBQVksRUFBRSxDQUFDLENBQUMsZ0JBQWdCLENBQUMsTUFBTSxFQUFFLElBQUksQ0FBQyxrQkFBa0IsQ0FBRSxDQUFDLENBQUM7UUFFeEcsSUFBSSxDQUFDLGtCQUFrQixDQUFDLElBQUksQ0FBQyxRQUFRLEVBQUUsT0FBTyxFQUFFLGNBQU0sT0FBQSxLQUFJLENBQUMsZ0JBQWdCLENBQUMsS0FBSSxDQUFDLE9BQU8sRUFBRSxFQUFFLE1BQU0sQ0FBQyxFQUE3QyxDQUE2QyxDQUFDLENBQUM7UUFDckcsSUFBSSxDQUFDLGtCQUFrQixDQUFDLElBQUksQ0FBQyxRQUFRLEVBQUUsT0FBTyxFQUFFLGNBQU0sT0FBQSxLQUFJLENBQUMsZ0JBQWdCLENBQUMsS0FBSSxDQUFDLE9BQU8sRUFBRSxFQUFFLE9BQU8sQ0FBQyxFQUE5QyxDQUE4QyxDQUFDLENBQUM7UUFFdEcsd0hBQXdIO1FBQ3hILElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxJQUFJLENBQUMsZUFBZSxFQUFFLGVBQWUsQ0FBQyx3QkFBd0IsRUFBRSxjQUFNLE9BQUEsS0FBSSxDQUFDLGFBQWEsQ0FBQyxJQUFJLENBQUMsRUFBeEIsQ0FBd0IsQ0FBQyxDQUFDO1FBQ3hILElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxJQUFJLENBQUMsZUFBZSxFQUFFLGVBQWUsQ0FBQyxzQkFBc0IsRUFBRSxjQUFNLE9BQUEsS0FBSSxDQUFDLGFBQWEsQ0FBQyxJQUFJLENBQUMsRUFBeEIsQ0FBd0IsQ0FBQyxDQUFDO1FBQ3RILElBQUksQ0FBQyxzQkFBc0IsRUFBRSxDQUFDO0lBQ2xDLENBQUM7SUFFTyxtREFBc0IsR0FBOUI7UUFBQSxpQkFpQkM7UUFoQkcsK0VBQStFO1FBQy9FLDZFQUE2RTtRQUM3RSxVQUFVLENBQUM7WUFDUCxJQUFNLDRCQUE0QixHQUFHLFVBQUMsb0JBQXlDO2dCQUMzRSxPQUFPLENBQUMsb0JBQW9CLENBQUMsTUFBTSxFQUFFLENBQUMsU0FBUyxDQUFDLFFBQVEsQ0FBQyxXQUFXLENBQUMsQ0FBQztZQUMxRSxDQUFDLENBQUE7WUFDRCxJQUFNLHlCQUF5QixHQUFHLEtBQUksQ0FBQyxvQkFBb0IsQ0FBQyxJQUFJLENBQUMsNEJBQTRCLENBQUMsQ0FBQztZQUMvRixJQUFNLFlBQVksR0FBRyx5QkFBMEIsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxhQUFhLENBQUMsY0FBYyxDQUFnQixDQUFDO1lBRXRHLElBQUksWUFBWSxFQUFFO2dCQUNkLElBQU0sUUFBTSxHQUFHLFlBQVksQ0FBQyxZQUEyQixDQUFDO2dCQUN4RCxJQUFJLFFBQU0sRUFBRTtvQkFDUixLQUFJLENBQUMsb0JBQW9CLENBQUMsUUFBUSxDQUFDLENBQUMsRUFBRSxRQUFNLENBQUMsU0FBUyxDQUFDLENBQUM7aUJBQzNEO2FBQ0o7UUFDTCxDQUFDLEVBQUUsR0FBRyxDQUFDLENBQUM7SUFDWixDQUFDO0lBRU8sMENBQWEsR0FBckIsVUFBc0IsVUFBb0I7UUFBMUMsaUJBbUNDOztRQWxDRyxJQUFNLFFBQVEsR0FBRyxJQUFJLENBQUMsZUFBZSxDQUFDLFdBQVcsRUFBRSxDQUFDO1FBQ3BELElBQU0sV0FBVyxHQUFHLE1BQUEsTUFBQSxJQUFJLENBQUMsa0JBQWtCLENBQUMsR0FBRyxDQUFDLG9CQUFvQixDQUFDLDBDQUFFLGFBQWEsMENBQUUsY0FBYyxDQUFDO1FBRXJHLElBQUksQ0FBQyxDQUFDLENBQUMsY0FBYyxDQUFDLFFBQVEsRUFBRSxJQUFJLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsSUFBSSxJQUFJLENBQUMsV0FBVyxFQUFFO1lBQ2hGLE9BQU87U0FDVjtRQUVELElBQUksQ0FBQyxRQUFRLEdBQUcsUUFBUSxDQUFDO1FBQ3pCLElBQUksQ0FBQyxNQUFNLEdBQUcsSUFBSSxDQUFDLGVBQWUsQ0FBQyxTQUFTLEVBQUUsQ0FBQztRQUMvQyxJQUFJLENBQUMsa0JBQWtCLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxTQUFTLENBQUMsVUFBQSxJQUFJLElBQUksT0FBQSxJQUFJLEtBQUssS0FBSSxDQUFDLGVBQWUsQ0FBQyxpQkFBaUIsRUFBRSxFQUFqRCxDQUFpRCxDQUFDLENBQUM7UUFDM0csSUFBSSxDQUFDLFNBQVMsR0FBRyxFQUFFLENBQUM7UUFFcEIsQ0FBQyxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsYUFBYSxDQUFDLENBQUM7UUFFbkMsSUFBSSxDQUFDLGlCQUFpQixFQUFFLENBQUM7UUFFekIsSUFBSSxDQUFDLFFBQVEsQ0FBQyxPQUFPLENBQUMsVUFBQyxPQUFPLEVBQUUsS0FBSztZQUNqQyxJQUFNLGVBQWUsR0FBRyxLQUFJLENBQUMsa0JBQWtCLEtBQUssS0FBSyxDQUFDO1lBQ2xELElBQUEsS0FBSyxHQUFjLE9BQU8sTUFBckIsRUFBRSxPQUFPLEdBQUssT0FBTyxRQUFaLENBQWE7WUFDbkMsSUFBTSxtQkFBbUIsR0FBRyxLQUFJLENBQUMsVUFBVSxDQUFDLElBQUksbUJBQW1CLENBQUMsS0FBSSxDQUFDLGVBQWUsRUFBRSxLQUFLLEVBQUUsT0FBTyxFQUFFLFdBQVcsQ0FBQyxDQUFDLENBQUM7WUFFeEgsS0FBSSxDQUFDLG9CQUFvQixDQUFDLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxDQUFDO1lBQ3BELEtBQUksQ0FBQyxvQkFBb0IsQ0FBQyxXQUFXLENBQUMsbUJBQW1CLENBQUMsTUFBTSxFQUFFLENBQUMsQ0FBQztZQUNwRSxLQUFJLENBQUMsV0FBVyxDQUFDLEtBQUssQ0FBQyxDQUFDO1lBRXhCLElBQUksZUFBZSxFQUFFO2dCQUNqQixtQkFBbUIsQ0FBQyx1QkFBdUIsRUFBRSxDQUFDO2FBQ2pEO2lCQUFNO2dCQUNILG1CQUFtQixDQUFDLFlBQVksQ0FBQyxLQUFLLENBQUMsQ0FBQzthQUMzQztRQUNMLENBQUMsQ0FBQyxDQUFDO1FBRUgsQ0FBQyxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsT0FBTyxFQUFFLElBQUksQ0FBQyxRQUFRLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxDQUFDO1FBQ3ZELENBQUMsQ0FBQyxhQUFhLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsa0JBQWtCLENBQUMsRUFBRSxhQUFhLEVBQUUsaUJBQWlCLENBQUMsQ0FBQztJQUMvRixDQUFDO0lBRU8sd0NBQVcsR0FBbkIsVUFBb0IsS0FBYTtRQUFqQyxpQkFVQztRQVRHLElBQU0sSUFBSSxHQUFHLFFBQVEsQ0FBQyxhQUFhLENBQUMsS0FBSyxDQUFDLENBQUM7UUFDM0MsSUFBSSxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsNkJBQTZCLENBQUMsQ0FBQztRQUVsRCxJQUFJLENBQUMsa0JBQWtCLENBQUMsSUFBSSxFQUFFLE9BQU8sRUFBRTtZQUNuQyxLQUFJLENBQUMsZ0JBQWdCLENBQUMsS0FBSyxFQUFFLEtBQUssR0FBRyxLQUFJLENBQUMsa0JBQWtCLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUM7UUFDckYsQ0FBQyxDQUFDLENBQUM7UUFFSCxJQUFJLENBQUMsYUFBYSxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUNyQyxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztJQUM5QixDQUFDO0lBRU8sb0NBQU8sR0FBZjtRQUNJLElBQUksSUFBSSxHQUFHLElBQUksQ0FBQyxrQkFBa0IsR0FBRyxDQUFDLENBQUM7UUFFdkMsSUFBSSxJQUFJLEdBQUcsQ0FBQyxFQUFFO1lBQ1YsSUFBSSxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQztTQUNuQztRQUVELE9BQU8sSUFBSSxDQUFDO0lBQ2hCLENBQUM7SUFFTyxvQ0FBTyxHQUFmO1FBQ0ksSUFBSSxJQUFJLEdBQUcsSUFBSSxDQUFDLGtCQUFrQixHQUFHLENBQUMsQ0FBQztRQUV2QyxJQUFJLElBQUksSUFBSSxJQUFJLENBQUMsUUFBUSxDQUFDLE1BQU0sRUFBRTtZQUM5QixJQUFJLEdBQUcsQ0FBQyxDQUFDO1NBQ1o7UUFFRCxPQUFPLElBQUksQ0FBQztJQUNoQixDQUFDO0lBRU8sNkNBQWdCLEdBQXhCLFVBQXlCLEtBQWEsRUFBRSxrQkFBc0M7UUFBOUUsaUJBd0NDO1FBdkNHLElBQUksSUFBSSxDQUFDLFdBQVcsSUFBSSxJQUFJLENBQUMsa0JBQWtCLEtBQUssS0FBSyxFQUFFO1lBQUUsT0FBTztTQUFFO1FBRXRFLENBQUMsQ0FBQyxhQUFhLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxLQUFLLENBQUMsRUFBRSxhQUFhLEVBQUUsaUJBQWlCLENBQUMsQ0FBQztRQUV6RSxJQUFNLGNBQWMsR0FBRyxJQUFJLENBQUMsb0JBQW9CLENBQUMsSUFBSSxDQUFDLGtCQUFrQixDQUFDLENBQUM7UUFDMUUsSUFBTSxVQUFVLEdBQUcsY0FBYyxDQUFDLE1BQU0sRUFBRSxDQUFDO1FBQzNDLElBQU0sYUFBYSxHQUFHLElBQUksQ0FBQyxvQkFBb0IsQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUN2RCxJQUFNLE9BQU8sR0FBRyxhQUFhLENBQUMsTUFBTSxFQUFFLENBQUM7UUFFdkMsY0FBYyxDQUFDLHVCQUF1QixFQUFFLENBQUM7UUFDekMsYUFBYSxDQUFDLHVCQUF1QixFQUFFLENBQUM7UUFFeEMsSUFBTSxVQUFVLEdBQUcsa0JBQWtCLEtBQUssTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQzFELElBQU0sS0FBSyxHQUFHLE9BQU8sQ0FBQyxLQUFLLENBQUMsSUFBSSxHQUFNLENBQUMsQ0FBQyxDQUFDLGdCQUFnQixDQUFDLElBQUksQ0FBQyxNQUFNLEVBQUUsQ0FBQyxHQUFHLFVBQVUsQ0FBQyxPQUFJLENBQUM7UUFFM0YsSUFBSSxDQUFDLGtCQUFrQixHQUFHLEtBQUssQ0FBQztRQUVoQyxJQUFJLENBQUMsV0FBVyxHQUFHLElBQUksQ0FBQztRQUV4QixJQUFNLGNBQWMsR0FBRyxjQUFjLENBQUM7UUFFdEMsYUFBYSxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUNqQyxjQUFjLENBQUMsV0FBVyxDQUFDLGNBQWMsQ0FBQyxDQUFDO1FBQzNDLGFBQWEsQ0FBQyxXQUFXLENBQUMsY0FBYyxDQUFDLENBQUM7UUFFMUMsSUFBSSxDQUFDLGVBQWUsQ0FBQyxpQkFBaUIsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUM7UUFFM0QsTUFBTSxDQUFDLFVBQVUsQ0FBQztZQUNkLFVBQVUsQ0FBQyxLQUFLLENBQUMsSUFBSSxHQUFNLENBQUMsVUFBVSxDQUFDLEtBQUssQ0FBQyxPQUFJLENBQUM7WUFDbEQsT0FBTyxDQUFDLEtBQUssQ0FBQyxJQUFJLEdBQUcsS0FBSyxDQUFDO1FBQy9CLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztRQUVOLE1BQU0sQ0FBQyxVQUFVLENBQUM7WUFDZCxLQUFJLENBQUMsV0FBVyxHQUFHLEtBQUssQ0FBQztZQUV6QixjQUFjLENBQUMsY0FBYyxDQUFDLGNBQWMsQ0FBQyxDQUFDO1lBQzlDLGFBQWEsQ0FBQyxjQUFjLENBQUMsY0FBYyxDQUFDLENBQUM7WUFDN0MsY0FBYyxDQUFDLFlBQVksQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUN2QyxDQUFDLEVBQUUsR0FBRyxDQUFDLENBQUM7SUFDWixDQUFDO0lBRU8sOENBQWlCLEdBQXpCO1FBQ0ksQ0FBQyxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsb0JBQW9CLENBQUMsQ0FBQztRQUUxQyxJQUFJLENBQUMsb0JBQW9CLEdBQUcsSUFBSSxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsb0JBQW9CLENBQUMsQ0FBQztJQUM3RSxDQUFDO0lBRVMsb0NBQU8sR0FBakI7UUFDSSxJQUFJLENBQUMsaUJBQWlCLEVBQUUsQ0FBQztRQUN6QixpQkFBTSxPQUFPLFdBQUUsQ0FBQztJQUNwQixDQUFDO0lBak1hLDJCQUFRLEdBQ2xCLHV3QkFXTyxDQUFDO0lBRXdCO1FBQW5DLFNBQVMsQ0FBQyx1QkFBdUIsQ0FBQztxRUFBK0Q7SUFDN0Q7UUFBcEMsV0FBVyxDQUFDLHNCQUFzQixDQUFDO29FQUFvRDtJQUNoRTtRQUF2QixXQUFXLENBQUMsU0FBUyxDQUFDO3VEQUF1QztJQUNoQztRQUE3QixXQUFXLENBQUMsZUFBZSxDQUFDOzZEQUE2QztJQUNqRDtRQUF4QixXQUFXLENBQUMsVUFBVSxDQUFDO3dEQUF3QztJQUN2QztRQUF4QixXQUFXLENBQUMsVUFBVSxDQUFDO3dEQUF3QztJQW9CaEU7UUFEQyxhQUFhOzJEQWNiO0lBOElMLHlCQUFDO0NBQUEsQUFwTUQsQ0FBd0MsU0FBUyxHQW9NaEQ7U0FwTVksa0JBQWtCIn0=