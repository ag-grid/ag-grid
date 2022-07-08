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
