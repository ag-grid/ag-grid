var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { Autowired, Component, PostConstruct, RefSelector } from "@ag-grid-community/core";
import { getMaxValue } from "../formatPanel";
export class AxisTicksPanel extends Component {
    constructor(chartOptionsService) {
        super();
        this.chartOptionsService = chartOptionsService;
    }
    init() {
        const groupParams = {
            cssIdentifier: 'charts-format-sub-level',
            direction: 'vertical',
            suppressOpenCloseIcons: true
        };
        this.setTemplate(AxisTicksPanel.TEMPLATE, { axisTicksGroup: groupParams });
        this.initAxisTicks();
    }
    initAxisTicks() {
        this.axisTicksGroup
            .setTitle(this.chartTranslationService.translate("ticks"))
            .hideOpenCloseIcons(true)
            .hideEnabledCheckbox(true);
        this.axisTicksColorPicker
            .setLabel(this.chartTranslationService.translate("color"))
            .setLabelWidth("flex")
            .setInputWidth(45)
            .setValue(this.chartOptionsService.getAxisProperty("tick.color"))
            .onValueChange(newColor => this.chartOptionsService.setAxisProperty("tick.color", newColor));
        const initInput = (expression, input, label, defaultMaxValue) => {
            const currentValue = this.chartOptionsService.getAxisProperty(expression);
            input.setLabel(label)
                .setMaxValue(getMaxValue(currentValue, defaultMaxValue))
                .setValue(`${currentValue}`)
                .setTextFieldWidth(45)
                .onValueChange(newValue => this.chartOptionsService.setAxisProperty(expression, newValue));
        };
        initInput("tick.width", this.axisTicksWidthSlider, this.chartTranslationService.translate("width"), 10);
        initInput("tick.size", this.axisTicksSizeSlider, this.chartTranslationService.translate("length"), 30);
    }
}
AxisTicksPanel.TEMPLATE = `<div>
            <ag-group-component ref="axisTicksGroup">
                <ag-color-picker ref="axisTicksColorPicker"></ag-color-picker>
                <ag-slider ref="axisTicksWidthSlider"></ag-slider>
                <ag-slider ref="axisTicksSizeSlider"></ag-slider>
            </ag-group-component>
        </div>`;
__decorate([
    RefSelector('axisTicksGroup')
], AxisTicksPanel.prototype, "axisTicksGroup", void 0);
__decorate([
    RefSelector('axisTicksColorPicker')
], AxisTicksPanel.prototype, "axisTicksColorPicker", void 0);
__decorate([
    RefSelector('axisTicksWidthSlider')
], AxisTicksPanel.prototype, "axisTicksWidthSlider", void 0);
__decorate([
    RefSelector('axisTicksSizeSlider')
], AxisTicksPanel.prototype, "axisTicksSizeSlider", void 0);
__decorate([
    Autowired('chartTranslationService')
], AxisTicksPanel.prototype, "chartTranslationService", void 0);
__decorate([
    PostConstruct
], AxisTicksPanel.prototype, "init", null);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXhpc1RpY2tzUGFuZWwuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9zcmMvY2hhcnRzL2NoYXJ0Q29tcC9tZW51L2Zvcm1hdC9heGlzL2F4aXNUaWNrc1BhbmVsLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7OztBQUFBLE9BQU8sRUFJSCxTQUFTLEVBQ1QsU0FBUyxFQUNULGFBQWEsRUFDYixXQUFXLEVBQ2QsTUFBTSx5QkFBeUIsQ0FBQztBQUdqQyxPQUFPLEVBQUUsV0FBVyxFQUFFLE1BQU0sZ0JBQWdCLENBQUM7QUFHN0MsTUFBTSxPQUFPLGNBQWUsU0FBUSxTQUFTO0lBa0J6QyxZQUE2QixtQkFBd0M7UUFDakUsS0FBSyxFQUFFLENBQUM7UUFEaUIsd0JBQW1CLEdBQW5CLG1CQUFtQixDQUFxQjtJQUVyRSxDQUFDO0lBR08sSUFBSTtRQUNSLE1BQU0sV0FBVyxHQUEyQjtZQUN4QyxhQUFhLEVBQUUseUJBQXlCO1lBQ3hDLFNBQVMsRUFBRSxVQUFVO1lBQ3JCLHNCQUFzQixFQUFFLElBQUk7U0FDL0IsQ0FBQztRQUNGLElBQUksQ0FBQyxXQUFXLENBQUMsY0FBYyxDQUFDLFFBQVEsRUFBRSxFQUFDLGNBQWMsRUFBRSxXQUFXLEVBQUMsQ0FBQyxDQUFDO1FBQ3pFLElBQUksQ0FBQyxhQUFhLEVBQUUsQ0FBQztJQUN6QixDQUFDO0lBRU8sYUFBYTtRQUNqQixJQUFJLENBQUMsY0FBYzthQUNkLFFBQVEsQ0FBQyxJQUFJLENBQUMsdUJBQXVCLENBQUMsU0FBUyxDQUFDLE9BQU8sQ0FBQyxDQUFDO2FBQ3pELGtCQUFrQixDQUFDLElBQUksQ0FBQzthQUN4QixtQkFBbUIsQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUUvQixJQUFJLENBQUMsb0JBQW9CO2FBQ3BCLFFBQVEsQ0FBQyxJQUFJLENBQUMsdUJBQXVCLENBQUMsU0FBUyxDQUFDLE9BQU8sQ0FBQyxDQUFDO2FBQ3pELGFBQWEsQ0FBQyxNQUFNLENBQUM7YUFDckIsYUFBYSxDQUFDLEVBQUUsQ0FBQzthQUNqQixRQUFRLENBQUMsSUFBSSxDQUFDLG1CQUFtQixDQUFDLGVBQWUsQ0FBQyxZQUFZLENBQUMsQ0FBQzthQUNoRSxhQUFhLENBQUMsUUFBUSxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsbUJBQW1CLENBQUMsZUFBZSxDQUFDLFlBQVksRUFBRSxRQUFRLENBQUMsQ0FBQyxDQUFDO1FBRWpHLE1BQU0sU0FBUyxHQUFHLENBQUMsVUFBa0IsRUFBRSxLQUFlLEVBQUUsS0FBYSxFQUFFLGVBQXVCLEVBQUUsRUFBRTtZQUM5RixNQUFNLFlBQVksR0FBRyxJQUFJLENBQUMsbUJBQW1CLENBQUMsZUFBZSxDQUFTLFVBQVUsQ0FBQyxDQUFDO1lBQ2xGLEtBQUssQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDO2lCQUNoQixXQUFXLENBQUMsV0FBVyxDQUFDLFlBQVksRUFBRSxlQUFlLENBQUMsQ0FBQztpQkFDdkQsUUFBUSxDQUFDLEdBQUcsWUFBWSxFQUFFLENBQUM7aUJBQzNCLGlCQUFpQixDQUFDLEVBQUUsQ0FBQztpQkFDckIsYUFBYSxDQUFDLFFBQVEsQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLG1CQUFtQixDQUFDLGVBQWUsQ0FBQyxVQUFVLEVBQUUsUUFBUSxDQUFDLENBQUMsQ0FBQztRQUNuRyxDQUFDLENBQUM7UUFFRixTQUFTLENBQUMsWUFBWSxFQUFFLElBQUksQ0FBQyxvQkFBb0IsRUFBRSxJQUFJLENBQUMsdUJBQXVCLENBQUMsU0FBUyxDQUFDLE9BQU8sQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDO1FBQ3hHLFNBQVMsQ0FBQyxXQUFXLEVBQUUsSUFBSSxDQUFDLG1CQUFtQixFQUFFLElBQUksQ0FBQyx1QkFBdUIsQ0FBQyxTQUFTLENBQUMsUUFBUSxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUM7SUFDM0csQ0FBQzs7QUF2RGEsdUJBQVEsR0FDbEI7Ozs7OztlQU1PLENBQUM7QUFFbUI7SUFBOUIsV0FBVyxDQUFDLGdCQUFnQixDQUFDO3NEQUEwQztBQUNuQztJQUFwQyxXQUFXLENBQUMsc0JBQXNCLENBQUM7NERBQTZDO0FBQzVDO0lBQXBDLFdBQVcsQ0FBQyxzQkFBc0IsQ0FBQzs0REFBd0M7QUFDeEM7SUFBbkMsV0FBVyxDQUFDLHFCQUFxQixDQUFDOzJEQUF1QztBQUVwQztJQUFyQyxTQUFTLENBQUMseUJBQXlCLENBQUM7K0RBQTBEO0FBTy9GO0lBREMsYUFBYTswQ0FTYiJ9