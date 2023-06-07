var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { _, Autowired, Component, PostConstruct, RefSelector } from "@ag-grid-community/core";
export class FontPanel extends Component {
    constructor(params) {
        super();
        this.activeComps = [];
        this.params = params;
    }
    init() {
        const groupParams = {
            cssIdentifier: 'charts-format-sub-level',
            direction: 'vertical',
            suppressOpenCloseIcons: true
        };
        this.setTemplate(FontPanel.TEMPLATE, { fontGroup: groupParams });
        this.initGroup();
        this.initFontFamilySelect();
        this.initFontWeightStyleSelect();
        this.initFontSizeSelect();
        this.initFontColorPicker();
    }
    addCompToPanel(comp) {
        this.fontGroup.addItem(comp);
        this.activeComps.push(comp);
    }
    setEnabled(enabled) {
        this.fontGroup.setEnabled(enabled);
    }
    initGroup() {
        this.fontGroup
            .setTitle(this.params.name || this.chartTranslationService.translate('font'))
            .setEnabled(this.params.enabled)
            .hideEnabledCheckbox(!!this.params.suppressEnabledCheckbox)
            .hideOpenCloseIcons(true)
            .onEnableChange(enabled => {
            if (this.params.setEnabled) {
                this.params.setEnabled(enabled);
            }
        });
    }
    initFontFamilySelect() {
        const families = [
            'Arial, sans-serif',
            'Aria Black, sans-serif',
            'Book Antiqua,  serif',
            'Charcoal, sans-serif',
            'Comic Sans MS, cursive',
            'Courier, monospace',
            'Courier New, monospace',
            'Gadget, sans-serif',
            'Geneva, sans-serif',
            'Helvetica, sans-serif',
            'Impact, sans-serif',
            'Lucida Console, monospace',
            'Lucida Grande, sans-serif',
            'Lucida Sans Unicode,  sans-serif',
            'Monaco, monospace',
            'Palatino Linotype, serif',
            'Palatino, serif',
            'Times New Roman, serif',
            'Times, serif',
            'Verdana, sans-serif'
        ];
        const { family } = this.params.initialFont;
        let initialValue = families[0];
        if (family) {
            // check for known values using lowercase
            const lowerCaseValues = families.map(f => f.toLowerCase());
            const valueIndex = lowerCaseValues.indexOf(family.toLowerCase());
            if (valueIndex >= 0) {
                initialValue = families[valueIndex];
            }
            else {
                // add user provided value to list
                const capitalisedFontValue = _.capitalise(family);
                families.push(capitalisedFontValue);
                initialValue = capitalisedFontValue;
            }
        }
        const options = families.sort().map(value => ({ value, text: value }));
        this.familySelect.addOptions(options)
            .setInputWidth('flex')
            .setValue(`${initialValue}`)
            .onValueChange(newValue => this.params.setFont({ family: newValue }));
    }
    initFontSizeSelect() {
        const sizes = [8, 10, 12, 14, 16, 18, 20, 22, 24, 26, 28, 30, 32, 34, 36];
        const { size } = this.params.initialFont;
        if (!_.includes(sizes, size)) {
            sizes.push(size);
        }
        const options = sizes.sort((a, b) => a - b).map(value => ({ value: `${value}`, text: `${value}` }));
        this.sizeSelect.addOptions(options)
            .setInputWidth('flex')
            .setValue(`${size}`)
            .onValueChange(newValue => this.params.setFont({ size: parseInt(newValue, 10) }));
        this.sizeSelect.setLabel(this.chartTranslationService.translate('size'));
    }
    initFontWeightStyleSelect() {
        const { weight = 'normal', style = 'normal' } = this.params.initialFont;
        const weightStyles = [
            { name: 'normal', weight: 'normal', style: 'normal' },
            { name: 'bold', weight: 'bold', style: 'normal' },
            { name: 'italic', weight: 'normal', style: 'italic' },
            { name: 'boldItalic', weight: 'bold', style: 'italic' }
        ];
        let selectedOption = weightStyles.find(x => x.weight === weight && x.style === style);
        if (!selectedOption) {
            selectedOption = { name: 'predefined', weight, style };
            weightStyles.unshift(selectedOption);
        }
        const options = weightStyles.map(ws => ({
            value: ws.name,
            text: this.chartTranslationService.translate(ws.name),
        }));
        this.weightStyleSelect.addOptions(options)
            .setInputWidth('flex')
            .setValue(selectedOption.name)
            .onValueChange(newValue => {
            const selectedWeightStyle = weightStyles.find(x => x.name === newValue);
            this.params.setFont({ weight: selectedWeightStyle.weight, style: selectedWeightStyle.style });
        });
    }
    initFontColorPicker() {
        this.colorPicker
            .setLabel(this.chartTranslationService.translate('color'))
            .setInputWidth(45)
            .setValue(`${this.params.initialFont.color}`)
            .onValueChange(newColor => this.params.setFont({ color: newColor }));
    }
    addItemToPanel(item) {
        this.fontGroup.addItem(item);
        this.activeComps.push(item);
    }
    destroyActiveComps() {
        this.activeComps.forEach(comp => {
            _.removeFromParent(comp.getGui());
            this.destroyBean(comp);
        });
    }
    destroy() {
        this.destroyActiveComps();
        super.destroy();
    }
}
FontPanel.TEMPLATE = `<div class="ag-font-panel">
            <ag-group-component ref="fontGroup">
                <ag-select ref="familySelect"></ag-select>
                <ag-select ref="weightStyleSelect"></ag-select>
                <div class="ag-charts-font-size-color">
                    <ag-select ref="sizeSelect"></ag-select>
                    <ag-color-picker ref="colorPicker"></ag-color-picker>
                </div>
            </ag-group-component>
        </div>`;
__decorate([
    RefSelector('fontGroup')
], FontPanel.prototype, "fontGroup", void 0);
__decorate([
    RefSelector('familySelect')
], FontPanel.prototype, "familySelect", void 0);
__decorate([
    RefSelector('weightStyleSelect')
], FontPanel.prototype, "weightStyleSelect", void 0);
__decorate([
    RefSelector('sizeSelect')
], FontPanel.prototype, "sizeSelect", void 0);
__decorate([
    RefSelector('colorPicker')
], FontPanel.prototype, "colorPicker", void 0);
__decorate([
    Autowired('chartTranslationService')
], FontPanel.prototype, "chartTranslationService", void 0);
__decorate([
    PostConstruct
], FontPanel.prototype, "init", null);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZm9udFBhbmVsLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vc3JjL2NoYXJ0cy9jaGFydENvbXAvbWVudS9mb3JtYXQvZm9udFBhbmVsLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7OztBQUFBLE9BQU8sRUFDSCxDQUFDLEVBSUQsU0FBUyxFQUNULFNBQVMsRUFDVCxhQUFhLEVBQ2IsV0FBVyxFQUNkLE1BQU0seUJBQXlCLENBQUM7QUFxQmpDLE1BQU0sT0FBTyxTQUFVLFNBQVEsU0FBUztJQXlCcEMsWUFBWSxNQUF1QjtRQUMvQixLQUFLLEVBQUUsQ0FBQztRQUhKLGdCQUFXLEdBQWdCLEVBQUUsQ0FBQztRQUlsQyxJQUFJLENBQUMsTUFBTSxHQUFHLE1BQU0sQ0FBQztJQUN6QixDQUFDO0lBR08sSUFBSTtRQUNSLE1BQU0sV0FBVyxHQUEyQjtZQUN4QyxhQUFhLEVBQUUseUJBQXlCO1lBQ3hDLFNBQVMsRUFBRSxVQUFVO1lBQ3JCLHNCQUFzQixFQUFFLElBQUk7U0FDL0IsQ0FBQztRQUNGLElBQUksQ0FBQyxXQUFXLENBQUMsU0FBUyxDQUFDLFFBQVEsRUFBRSxFQUFDLFNBQVMsRUFBRSxXQUFXLEVBQUMsQ0FBQyxDQUFDO1FBRS9ELElBQUksQ0FBQyxTQUFTLEVBQUUsQ0FBQztRQUNqQixJQUFJLENBQUMsb0JBQW9CLEVBQUUsQ0FBQztRQUM1QixJQUFJLENBQUMseUJBQXlCLEVBQUUsQ0FBQztRQUNqQyxJQUFJLENBQUMsa0JBQWtCLEVBQUUsQ0FBQztRQUMxQixJQUFJLENBQUMsbUJBQW1CLEVBQUUsQ0FBQztJQUMvQixDQUFDO0lBRU0sY0FBYyxDQUFDLElBQWU7UUFDakMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDN0IsSUFBSSxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7SUFDaEMsQ0FBQztJQUVNLFVBQVUsQ0FBQyxP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