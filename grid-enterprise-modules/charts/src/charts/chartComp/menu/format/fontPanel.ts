import {
    _,
    AgGroupComponent,
    AgGroupComponentParams,
    AgSelectParams,
    Autowired,
    Component,
    PostConstruct,
    RefSelector
} from "@ag-grid-community/core";
import { AgColorPickerParams } from "../../../../widgets/agColorPicker";
import { ChartOptionsProxy } from "../../services/chartOptionsService";
import { ChartTranslationService } from "../../services/chartTranslationService";
import { ChartMenuUtils } from "../chartMenuUtils";

interface Font {
    fontFamily?: string;
    fontStyle?: string;
    fontWeight?: string;
    fontSize?: number;
    color?: string;
}

export interface FontPanelParams {
    name?: string;
    enabled: boolean;
    suppressEnabledCheckbox?: boolean;
    setEnabled?: (enabled: boolean) => void;
    fontModelProxy: {
        setValue: <K extends keyof Font>(key: K, value: Font[K]) => void;
        getValue: <K extends keyof Font>(key: K) => Font[K];
    }
}

export class FontPanel extends Component {

    public static TEMPLATE = /* html */
        `<div class="ag-font-panel">
            <ag-group-component ref="fontGroup">
                <ag-select ref="familySelect"></ag-select>
                <ag-select ref="weightStyleSelect"></ag-select>
                <div class="ag-charts-font-size-color">
                    <ag-select ref="sizeSelect"></ag-select>
                    <ag-color-picker ref="colorPicker"></ag-color-picker>
                </div>
            </ag-group-component>
        </div>`;

    @RefSelector('fontGroup') private fontGroup: AgGroupComponent;

    @Autowired('chartTranslationService') private readonly chartTranslationService: ChartTranslationService;
    @Autowired('chartMenuUtils') private readonly chartMenuUtils: ChartMenuUtils;

    private params: FontPanelParams;
    private activeComps: Component[] = [];

    constructor(params: FontPanelParams) {
        super();
        this.params = params;
    }

    @PostConstruct
    private init() {
        const fontGroupParams: AgGroupComponentParams = {
            cssIdentifier: 'charts-format-sub-level',
            direction: 'vertical',
            suppressOpenCloseIcons: true,
            title: this.params.name || this.chartTranslationService.translate('font'),
            enabled: this.params.enabled,
            suppressEnabledCheckbox: !!this.params.suppressEnabledCheckbox,
            onEnableChange: enabled => {
                if (this.params.setEnabled) {
                    this.params.setEnabled(enabled);
                }
            }
        };
        this.setTemplate(FontPanel.TEMPLATE, {
            fontGroup: fontGroupParams,
            familySelect: this.getFamilySelectParams(),
            weightStyleSelect: this.getWeightStyleSelectParams(),
            sizeSelect: this.getSizeSelectParams(),
            colorPicker: this.getColorPickerParams()
        });
    }

    public addCompToPanel(comp: Component) {
        this.fontGroup.addItem(comp);
        this.activeComps.push(comp);
    }

    public setEnabled(enabled: boolean): void {
        this.fontGroup.setEnabled(enabled);
    }

    private getFamilySelectParams(): AgSelectParams {
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

        const family = this.getInitialFontValue('fontFamily');
        let initialValue = families[0];

        if (family) {
            // check for known values using lowercase
            const lowerCaseValues = families.map(f => f.toLowerCase());
            const valueIndex = lowerCaseValues.indexOf(family.toLowerCase());

            if (valueIndex >= 0) {
                initialValue = families[valueIndex];
            } else {
                // add user provided value to list
                const capitalisedFontValue = _.capitalise(family);

                families.push(capitalisedFontValue);

                initialValue = capitalisedFontValue;
            }
        }

        const options = families.sort().map(value => ({ value, text: value }));

        return {
            options,
            inputWidth: 'flex',
            value: `${initialValue}`,
            onValueChange: newValue => this.setFont({ fontFamily: newValue! })
        };
    }

    private getSizeSelectParams(): AgSelectParams {
        const sizes = [8, 10, 12, 14, 16, 18, 20, 22, 24, 26, 28, 30, 32, 34, 36];
        const size = this.getInitialFontValue('fontSize');

        if (!_.includes(sizes, size)) {
            sizes.push(size!);
        }

        const options = sizes.sort((a, b) => a - b).map(value => ({ value: `${value}`, text: `${value}` }));

        return {
            options,
            inputWidth: 'flex',
            value: `${size}`,
            onValueChange: newValue => this.setFont({ fontSize: parseInt(newValue!, 10) }),
            label: this.chartTranslationService.translate('size')
        };
    }

    private getWeightStyleSelectParams(): AgSelectParams {
        const weight = this.getInitialFontValue('fontWeight') ?? 'normal';
        const style = this.getInitialFontValue('fontStyle') ?? 'normal';

        const weightStyles: { name: string, weight: string, style: string }[] = [
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

        return {
            options,
            inputWidth: 'flex',
            value: selectedOption.name,
            onValueChange: newValue => {
                const selectedWeightStyle = weightStyles.find(x => x.name === newValue);

                this.setFont({ fontWeight: selectedWeightStyle!.weight, fontStyle: selectedWeightStyle!.style });
            }
        };
    }

    private getColorPickerParams(): AgColorPickerParams {
        const chartOptionsProxy: ChartOptionsProxy = {
            getValue: () => this.getInitialFontValue('color') as any,
            setValue: (color: string) => this.setFont({ color })
        } as any;
        return this.chartMenuUtils.getDefaultColorPickerParams(
            chartOptionsProxy,
            'color'
        );
    }

    public addItemToPanel(item: Component) {
        this.fontGroup.addItem(item);
        this.activeComps.push(item);
    }

    private destroyActiveComps(): void {
        this.activeComps.forEach(comp => {
            _.removeFromParent(comp.getGui());
            this.destroyBean(comp);
        });
    }

    protected destroy(): void {
        this.destroyActiveComps();
        super.destroy();
    }

    private setFont(font: Font): void {
        const { setValue } = this.params.fontModelProxy;
        Object.entries(font).forEach(([fontKey, value]: [keyof Font, any]) => {
            if (value) {
                setValue(fontKey, value);
            }
        });
    }

    private getInitialFontValue<K extends keyof Font>(fontKey: K): Font[K] {
        return this.params.fontModelProxy.getValue(fontKey);
    }
}
