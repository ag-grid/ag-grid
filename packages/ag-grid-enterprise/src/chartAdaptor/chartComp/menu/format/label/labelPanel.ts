import {
    _,
    AgColorPicker,
    AgGroupComponent,
    AgSelect,
    Autowired,
    Component,
    PostConstruct,
    RefSelector
} from "ag-grid-community";
import {ChartTranslator} from "../../../chartTranslator";

export type LabelFont = {
    family?: string;
    style?: string;
    weight?: string;
    size?: number;
    color?: string;
};

export interface LabelPanelParams {
    name?: string;
    enabled: boolean;
    suppressEnabledCheckbox?: boolean;
    setEnabled?: (enabled: boolean) => void;
    initialFont: LabelFont;
    setFont: (font: LabelFont) => void;
}

export class LabelPanel extends Component {

    public static TEMPLATE =
        `<div>
            <ag-group-component ref="labelsGroup">
                <ag-select ref="labelFontFamilySelect"></ag-select>
                <ag-select ref="labelFontWeightSelect"></ag-select>
                <div class="ag-group-subgroup">
                    <ag-select ref="labelFontSizeSelect"></ag-select>
                    <ag-color-picker ref="labelColorPicker"></ag-color-picker>
                </div>
            </ag-group-component>
        </div>`;

    @RefSelector('labelsGroup') private labelsGroup: AgGroupComponent;
    @RefSelector('labelFontFamilySelect') private labelFontFamilySelect: AgSelect;
    @RefSelector('labelFontWeightSelect') private labelFontWeightSelect: AgSelect;
    @RefSelector('labelFontSizeSelect') private labelFontSizeSelect: AgSelect;
    @RefSelector('labelColorPicker') private labelColorPicker: AgColorPicker;

    @Autowired('chartTranslator') private chartTranslator: ChartTranslator;

    private params: LabelPanelParams;
    private activeComps: Component[] = [];

    constructor(params: LabelPanelParams) {
        super();
        this.params = params;
    }

    @PostConstruct
    private init() {
        this.setTemplate(LabelPanel.TEMPLATE);

        this.initGroup();
        this.initFontSelects();
        this.initFontColorPicker();
    }

    public addCompToPanel(comp: Component) {
        this.labelsGroup.addItem(comp);
        this.activeComps.push(comp);
    }

    public setEnabled(enabled: boolean): void {
        this.labelsGroup.setEnabled(enabled);
    }

    private initGroup() {
        this.labelsGroup
            .setTitle(this.params.name ? this.params.name : this.chartTranslator.translate('labels'))
            .setEnabled(this.params.enabled)
            .hideEnabledCheckbox(!!this.params.suppressEnabledCheckbox)
            .hideOpenCloseIcons(true)
            .onEnableChange(enabled => {
                if (this.params.setEnabled) {
                    this.params.setEnabled(enabled);
                }
            });
    }

    private initFontSelects() {
        type FontOptions = 'family' | 'weight' | 'size';

        const initSelect = (property: FontOptions, input: AgSelect, values: string[], sortedValues: boolean) => {

            const fontValue = this.params.initialFont[property];

            let initialValue = values[0];
            if (fontValue) {
                const fontValueAsStr = `${fontValue}`;
                const lowerCaseFontValue = _.exists(fontValueAsStr) ? fontValueAsStr.toLowerCase() : '';
                const lowerCaseValues = values.map(value => value.toLowerCase());

                // check for known font values using lowercase
                const valueIndex = lowerCaseValues.indexOf(lowerCaseFontValue);
                const unknownUserProvidedFont = valueIndex < 0;

                if (unknownUserProvidedFont) {
                    const capitalisedFontValue = _.capitalise(fontValueAsStr);

                    // add user provided font to list
                    values.push(capitalisedFontValue);

                    if (sortedValues) { values.sort(); }

                    initialValue = capitalisedFontValue;
                } else {
                    initialValue = values[valueIndex];
                }
            }

            const options = values.map(value => {
                return {value: value, text: value};
            });

            input.addOptions(options)
                .setValue(`${initialValue}`)
                .onValueChange(newValue => this.params.setFont({[property]: newValue}));
        };

        const fonts = [
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
            'Verdana, sans-serif',
        ];

        initSelect('family', this.labelFontFamilySelect, fonts, true);

        const weightKeys: string[] = ['normal', 'bold', 'italic', 'boldItalic'];
        initSelect('weight', this.labelFontWeightSelect, this.getWeigthNames(weightKeys), false);

        const sizes = ['8', '10', '12', '14', '16', '18', '20', '22', '24', '26', '28', '30', '32', '34', '36'];
        this.labelFontSizeSelect.setLabel(this.chartTranslator.translate('size'));
        initSelect('size', this.labelFontSizeSelect, sizes, true);
    }

    private initFontColorPicker() {
        this.labelColorPicker
            .setLabel(this.chartTranslator.translate('color'))
            .setInputWidth(45)
            .setValue(`${this.params.initialFont.color}`)
            .onValueChange(newColor => this.params.setFont({color: newColor}));
    }

    private getWeigthNames(keys: string[]) {
        return keys.map(key => this.chartTranslator.translate(key));
    }

    private destroyActiveComps(): void {
        this.activeComps.forEach(comp => {
            _.removeFromParent(comp.getGui());
            comp.destroy();
        });
    }

    public destroy(): void {
        this.destroyActiveComps();
        super.destroy();
    }
}
