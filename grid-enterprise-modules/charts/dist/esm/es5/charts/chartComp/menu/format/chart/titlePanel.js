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
import { _, AgSlider, Autowired, Component, PostConstruct } from "@ag-grid-community/core";
import { FontPanel } from "../fontPanel";
var TitlePanel = /** @class */ (function (_super) {
    __extends(TitlePanel, _super);
    function TitlePanel(chartOptionsService) {
        var _this = _super.call(this, TitlePanel.TEMPLATE) || this;
        _this.chartOptionsService = chartOptionsService;
        _this.activePanels = [];
        return _this;
    }
    TitlePanel.prototype.init = function () {
        this.initFontPanel();
        this.titlePlaceholder = this.chartTranslationService.translate('titlePlaceholder');
    };
    TitlePanel.prototype.hasTitle = function () {
        var title = this.getOption('title');
        return title && title.enabled && title.text && title.text.length > 0;
    };
    TitlePanel.prototype.initFontPanel = function () {
        var _this = this;
        var hasTitle = this.hasTitle();
        var setFont = function (font, isSilent) {
            if (font.family) {
                _this.setOption('title.fontFamily', font.family, isSilent);
            }
            if (font.weight) {
                _this.setOption('title.fontWeight', font.weight, isSilent);
            }
            if (font.style) {
                _this.setOption('title.fontStyle', font.style, isSilent);
            }
            if (font.size) {
                _this.setOption('title.fontSize', font.size, isSilent);
            }
            if (font.color) {
                _this.setOption('title.color', font.color, isSilent);
            }
        };
        var initialFont = {
            family: this.getOption('title.fontFamily'),
            style: this.getOption('title.fontStyle'),
            weight: this.getOption('title.fontWeight'),
            size: this.getOption('title.fontSize'),
            color: this.getOption('title.color')
        };
        if (!hasTitle) {
            setFont(initialFont, true);
        }
        var fontPanelParams = {
            name: this.chartTranslationService.translate('title'),
            enabled: hasTitle,
            suppressEnabledCheckbox: false,
            initialFont: initialFont,
            setFont: setFont,
            setEnabled: function (enabled) {
                if (_this.toolbarExists()) {
                    // extra padding is only included when the toolbar is present
                    var topPadding = _this.getOption('padding.top');
                    _this.setOption('padding.top', enabled ? topPadding - 20 : topPadding + 20);
                }
                _this.setOption('title.enabled', enabled);
                var currentTitleText = _this.getOption('title.text');
                var replaceableTitleText = currentTitleText === 'Title' || (currentTitleText === null || currentTitleText === void 0 ? void 0 : currentTitleText.trim().length) === 0;
                if (enabled && replaceableTitleText) {
                    _this.setOption('title.text', _this.titlePlaceholder);
                }
            }
        };
        var fontPanelComp = this.createBean(new FontPanel(fontPanelParams));
        // add the title spacing slider to font panel
        fontPanelComp.addItemToPanel(this.createSpacingSlicer());
        this.getGui().appendChild(fontPanelComp.getGui());
        this.activePanels.push(fontPanelComp);
        // edits to the title can disable it, so keep the checkbox in sync:
        this.addManagedListener(this.eventService, 'chartTitleEdit', function () {
            fontPanelComp.setEnabled(_this.hasTitle());
        });
    };
    TitlePanel.prototype.createSpacingSlicer = function () {
        var _this = this;
        var spacingSlider = this.createBean(new AgSlider());
        var currentValue = this.chartOptionsService.getChartOption('title.spacing');
        spacingSlider.setLabel(this.chartTranslationService.translate('spacing'))
            .setMaxValue(Math.max(currentValue, 100))
            .setValue("" + currentValue)
            .setTextFieldWidth(45)
            .onValueChange(function (newValue) { return _this.chartOptionsService.setChartOption('title.spacing', newValue); });
        return spacingSlider;
    };
    TitlePanel.prototype.toolbarExists = function () {
        var toolbarItemsFunc = this.gridOptionsService.getCallback('getChartToolbarItems');
        if (!toolbarItemsFunc) {
            return true;
        }
        var params = {
            defaultItems: ['chartUnlink', 'chartDownload']
        };
        var topItems = ['chartLink', 'chartUnlink', 'chartDownload'];
        return topItems.some(function (v) { var _a; return (_a = (toolbarItemsFunc && toolbarItemsFunc(params))) === null || _a === void 0 ? void 0 : _a.includes(v); });
    };
    TitlePanel.prototype.getOption = function (expression) {
        return this.chartOptionsService.getChartOption(expression);
    };
    TitlePanel.prototype.setOption = function (property, value, isSilent) {
        this.chartOptionsService.setChartOption(property, value, isSilent);
    };
    TitlePanel.prototype.destroyActivePanels = function () {
        var _this = this;
        this.activePanels.forEach(function (panel) {
            _.removeFromParent(panel.getGui());
            _this.destroyBean(panel);
        });
    };
    TitlePanel.prototype.destroy = function () {
        this.destroyActivePanels();
        _super.prototype.destroy.call(this);
    };
    TitlePanel.TEMPLATE = "<div></div>";
    __decorate([
        Autowired('chartTranslationService')
    ], TitlePanel.prototype, "chartTranslationService", void 0);
    __decorate([
        PostConstruct
    ], TitlePanel.prototype, "init", null);
    return TitlePanel;
}(Component));
export default TitlePanel;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGl0bGVQYW5lbC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uL3NyYy9jaGFydHMvY2hhcnRDb21wL21lbnUvZm9ybWF0L2NoYXJ0L3RpdGxlUGFuZWwudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQUEsT0FBTyxFQUNILENBQUMsRUFDRCxRQUFRLEVBQ1IsU0FBUyxFQUVULFNBQVMsRUFFVCxhQUFhLEVBRWhCLE1BQU0seUJBQXlCLENBQUM7QUFDakMsT0FBTyxFQUFRLFNBQVMsRUFBbUIsTUFBTSxjQUFjLENBQUM7QUFJaEU7SUFBd0MsOEJBQVM7SUFTN0Msb0JBQTZCLG1CQUF3QztRQUFyRSxZQUNJLGtCQUFNLFVBQVUsQ0FBQyxRQUFRLENBQUMsU0FDN0I7UUFGNEIseUJBQW1CLEdBQW5CLG1CQUFtQixDQUFxQjtRQUg3RCxrQkFBWSxHQUFnQixFQUFFLENBQUM7O0lBS3ZDLENBQUM7SUFHTyx5QkFBSSxHQUFaO1FBQ0ksSUFBSSxDQUFDLGFBQWEsRUFBRSxDQUFDO1FBQ3JCLElBQUksQ0FBQyxnQkFBZ0IsR0FBRyxJQUFJLENBQUMsdUJBQXVCLENBQUMsU0FBUyxDQUFDLGtCQUFrQixDQUFDLENBQUM7SUFDdkYsQ0FBQztJQUVPLDZCQUFRLEdBQWhCO1FBQ0ksSUFBTSxLQUFLLEdBQVEsSUFBSSxDQUFDLFNBQVMsQ0FBQyxPQUFPLENBQUMsQ0FBQztRQUMzQyxPQUFPLEtBQUssSUFBSSxLQUFLLENBQUMsT0FBTyxJQUFJLEtBQUssQ0FBQyxJQUFJLElBQUksS0FBSyxDQUFDLElBQUksQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDO0lBQ3pFLENBQUM7SUFFTyxrQ0FBYSxHQUFyQjtRQUFBLGlCQXlEQztRQXhERyxJQUFNLFFBQVEsR0FBRyxJQUFJLENBQUMsUUFBUSxFQUFFLENBQUM7UUFFakMsSUFBTSxPQUFPLEdBQUcsVUFBQyxJQUFVLEVBQUUsUUFBa0I7WUFDM0MsSUFBSSxJQUFJLENBQUMsTUFBTSxFQUFFO2dCQUFFLEtBQUksQ0FBQyxTQUFTLENBQUMsa0JBQWtCLEVBQUUsSUFBSSxDQUFDLE1BQU0sRUFBRSxRQUFRLENBQUMsQ0FBQzthQUFFO1lBQy9FLElBQUksSUFBSSxDQUFDLE1BQU0sRUFBRTtnQkFBRSxLQUFJLENBQUMsU0FBUyxDQUFDLGtCQUFrQixFQUFFLElBQUksQ0FBQyxNQUFNLEVBQUUsUUFBUSxDQUFDLENBQUM7YUFBRTtZQUMvRSxJQUFJLElBQUksQ0FBQyxLQUFLLEVBQUU7Z0JBQUUsS0FBSSxDQUFDLFNBQVMsQ0FBQyxpQkFBaUIsRUFBRSxJQUFJLENBQUMsS0FBSyxFQUFFLFFBQVEsQ0FBQyxDQUFDO2FBQUU7WUFDNUUsSUFBSSxJQUFJLENBQUMsSUFBSSxFQUFFO2dCQUFFLEtBQUksQ0FBQyxTQUFTLENBQUMsZ0JBQWdCLEVBQUUsSUFBSSxDQUFDLElBQUksRUFBRSxRQUFRLENBQUMsQ0FBQzthQUFFO1lBQ3pFLElBQUksSUFBSSxDQUFDLEtBQUssRUFBRTtnQkFBRSxLQUFJLENBQUMsU0FBUyxDQUFDLGFBQWEsRUFBRSxJQUFJLENBQUMsS0FBSyxFQUFFLFFBQVEsQ0FBQyxDQUFDO2FBQUU7UUFDNUUsQ0FBQyxDQUFDO1FBRUYsSUFBTSxXQUFXLEdBQUc7WUFDaEIsTUFBTSxFQUFFLElBQUksQ0FBQyxTQUFTLENBQUMsa0JBQWtCLENBQUM7WUFDMUMsS0FBSyxFQUFFLElBQUksQ0FBQyxTQUFTLENBQUMsaUJBQWlCLENBQUM7WUFDeEMsTUFBTSxFQUFFLElBQUksQ0FBQyxTQUFTLENBQUMsa0JBQWtCLENBQUM7WUFDMUMsSUFBSSxFQUFFLElBQUksQ0FBQyxTQUFTLENBQVMsZ0JBQWdCLENBQUM7WUFDOUMsS0FBSyxFQUFFLElBQUksQ0FBQyxTQUFTLENBQUMsYUFBYSxDQUFDO1NBQ3ZDLENBQUM7UUFFRixJQUFJLENBQUMsUUFBUSxFQUFFO1lBQ1gsT0FBTyxDQUFDLFdBQVcsRUFBRSxJQUFJLENBQUMsQ0FBQztTQUM5QjtRQUVELElBQU0sZUFBZSxHQUFvQjtZQUNyQyxJQUFJLEVBQUUsSUFBSSxDQUFDLHVCQUF1QixDQUFDLFNBQVMsQ0FBQyxPQUFPLENBQUM7WUFDckQsT0FBTyxFQUFFLFFBQVE7WUFDakIsdUJBQXVCLEVBQUUsS0FBSztZQUM5QixXQUFXLGFBQUE7WUFDWCxPQUFPLFNBQUE7WUFDUCxVQUFVLEVBQUUsVUFBQyxPQUFPO2dCQUNoQixJQUFJLEtBQUksQ0FBQyxhQUFhLEVBQUUsRUFBRTtvQkFDdEIsNkRBQTZEO29CQUM3RCxJQUFNLFVBQVUsR0FBVyxLQUFJLENBQUMsU0FBUyxDQUFDLGFBQWEsQ0FBQyxDQUFDO29CQUN6RCxLQUFJLENBQUMsU0FBUyxDQUFDLGFBQWEsRUFBRSxPQUFPLENBQUMsQ0FBQyxDQUFDLFVBQVUsR0FBRyxFQUFFLENBQUMsQ0FBQyxDQUFDLFVBQVUsR0FBRyxFQUFFLENBQUMsQ0FBQztpQkFDOUU7Z0JBRUQsS0FBSSxDQUFDLFNBQVMsQ0FBQyxlQUFlLEVBQUUsT0FBTyxDQUFDLENBQUM7Z0JBQ3pDLElBQU0sZ0JBQWdCLEdBQUcsS0FBSSxDQUFDLFNBQVMsQ0FBQyxZQUFZLENBQUMsQ0FBQztnQkFDdEQsSUFBTSxvQkFBb0IsR0FBRyxnQkFBZ0IsS0FBSyxPQUFPLElBQUksQ0FBQSxnQkFBZ0IsYUFBaEIsZ0JBQWdCLHVCQUFoQixnQkFBZ0IsQ0FBRSxJQUFJLEdBQUcsTUFBTSxNQUFLLENBQUMsQ0FBQztnQkFDbkcsSUFBSSxPQUFPLElBQUksb0JBQW9CLEVBQUU7b0JBQ2pDLEtBQUksQ0FBQyxTQUFTLENBQUMsWUFBWSxFQUFFLEtBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDO2lCQUN2RDtZQUNMLENBQUM7U0FDSixDQUFDO1FBRUYsSUFBTSxhQUFhLEdBQUcsSUFBSSxDQUFDLFVBQVUsQ0FBQyxJQUFJLFNBQVMsQ0FBQyxlQUFlLENBQUMsQ0FBQyxDQUFDO1FBRXRFLDZDQUE2QztRQUM3QyxhQUFhLENBQUMsY0FBYyxDQUFDLElBQUksQ0FBQyxtQkFBbUIsRUFBRSxDQUFDLENBQUM7UUFFekQsSUFBSSxDQUFDLE1BQU0sRUFBRSxDQUFDLFdBQVcsQ0FBQyxhQUFhLENBQUMsTUFBTSxFQUFFLENBQUMsQ0FBQztRQUNsRCxJQUFJLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQyxhQUFhLENBQUMsQ0FBQztRQUV0QyxtRUFBbUU7UUFDbkUsSUFBSSxDQUFDLGtCQUFrQixDQUFDLElBQUksQ0FBQyxZQUFZLEVBQUUsZ0JBQWdCLEVBQUU7WUFDekQsYUFBYSxDQUFDLFVBQVUsQ0FBQyxLQUFJLENBQUMsUUFBUSxFQUFFLENBQUMsQ0FBQztRQUM5QyxDQUFDLENBQUMsQ0FBQztJQUNQLENBQUM7SUFFTyx3Q0FBbUIsR0FBM0I7UUFBQSxpQkFVQztRQVRHLElBQU0sYUFBYSxHQUFHLElBQUksQ0FBQyxVQUFVLENBQUMsSUFBSSxRQUFRLEVBQUUsQ0FBQyxDQUFDO1FBQ3RELElBQU0sWUFBWSxHQUFHLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxjQUFjLENBQVMsZUFBZSxDQUFDLENBQUM7UUFDdEYsYUFBYSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsdUJBQXVCLENBQUMsU0FBUyxDQUFDLFNBQVMsQ0FBQyxDQUFDO2FBQ3BFLFdBQVcsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLFlBQVksRUFBRSxHQUFHLENBQUMsQ0FBQzthQUN4QyxRQUFRLENBQUMsS0FBRyxZQUFjLENBQUM7YUFDM0IsaUJBQWlCLENBQUMsRUFBRSxDQUFDO2FBQ3JCLGFBQWEsQ0FBQyxVQUFBLFFBQVEsSUFBSSxPQUFBLEtBQUksQ0FBQyxtQkFBbUIsQ0FBQyxjQUFjLENBQUMsZUFBZSxFQUFFLFFBQVEsQ0FBQyxFQUFsRSxDQUFrRSxDQUFDLENBQUM7UUFFbkcsT0FBTyxhQUFhLENBQUM7SUFDekIsQ0FBQztJQUVPLGtDQUFhLEdBQXJCO1FBQ0ksSUFBTSxnQkFBZ0IsR0FBRyxJQUFJLENBQUMsa0JBQWtCLENBQUMsV0FBVyxDQUFDLHNCQUFzQixDQUFDLENBQUM7UUFDckYsSUFBSSxDQUFDLGdCQUFnQixFQUFFO1lBQUUsT0FBTyxJQUFJLENBQUM7U0FBRTtRQUV2QyxJQUFNLE1BQU0sR0FBa0Q7WUFDMUQsWUFBWSxFQUFFLENBQUMsYUFBYSxFQUFFLGVBQWUsQ0FBQztTQUNqRCxDQUFDO1FBQ0YsSUFBTSxRQUFRLEdBQXVCLENBQUMsV0FBVyxFQUFFLGFBQWEsRUFBRSxlQUFlLENBQUMsQ0FBQztRQUNuRixPQUFPLFFBQVEsQ0FBQyxJQUFJLENBQUMsVUFBQSxDQUFDLFlBQUksT0FBQSxNQUFBLENBQUMsZ0JBQWdCLElBQUksZ0JBQWdCLENBQUMsTUFBTSxDQUFDLENBQUMsMENBQUUsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFBLEVBQUEsQ0FBQyxDQUFDO0lBQzNGLENBQUM7SUFFTyw4QkFBUyxHQUFqQixVQUE4QixVQUFrQjtRQUM1QyxPQUFPLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxjQUFjLENBQUMsVUFBVSxDQUFDLENBQUM7SUFDL0QsQ0FBQztJQUVPLDhCQUFTLEdBQWpCLFVBQWtCLFFBQWdCLEVBQUUsS0FBVSxFQUFFLFFBQWtCO1FBQzlELElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxjQUFjLENBQUMsUUFBUSxFQUFFLEtBQUssRUFBRSxRQUFRLENBQUMsQ0FBQztJQUN2RSxDQUFDO0lBRU8sd0NBQW1CLEdBQTNCO1FBQUEsaUJBS0M7UUFKRyxJQUFJLENBQUMsWUFBWSxDQUFDLE9BQU8sQ0FBQyxVQUFBLEtBQUs7WUFDM0IsQ0FBQyxDQUFDLGdCQUFnQixDQUFDLEtBQUssQ0FBQyxNQUFNLEVBQUUsQ0FBQyxDQUFDO1lBQ25DLEtBQUksQ0FBQyxXQUFXLENBQUMsS0FBSyxDQUFDLENBQUM7UUFDNUIsQ0FBQyxDQUFDLENBQUM7SUFDUCxDQUFDO0lBRVMsNEJBQU8sR0FBakI7UUFDSSxJQUFJLENBQUMsbUJBQW1CLEVBQUUsQ0FBQztRQUMzQixpQkFBTSxPQUFPLFdBQUUsQ0FBQztJQUNwQixDQUFDO0lBMUhhLG1CQUFRLEdBQWMsYUFBYSxDQUFDO0lBRVo7UUFBckMsU0FBUyxDQUFDLHlCQUF5QixDQUFDOytEQUEwRDtJQVUvRjtRQURDLGFBQWE7MENBSWI7SUE0R0wsaUJBQUM7Q0FBQSxBQTdIRCxDQUF3QyxTQUFTLEdBNkhoRDtlQTdIb0IsVUFBVSJ9