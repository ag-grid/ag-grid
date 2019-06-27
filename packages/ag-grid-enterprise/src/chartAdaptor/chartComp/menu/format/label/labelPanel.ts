import {
    _,
    AgColorPicker,
    AgGroupComponent,
    AgSelect,
    Component,
    PostConstruct,
    RefSelector
} from "ag-grid-community";
import { ChartController } from "../../../chartController";
import { Chart } from "../../../../../charts/chart/chart";

export type LabelFont = {
    family?: string;
    style?: string;
    weight?: string;
    size?: number;
    color?: string;
}

export interface LabelPanelParams {
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

    private chart: Chart;
    private params: LabelPanelParams;
    private activeComps: Component[] = [];
    private chartController: ChartController;

    constructor(chartController: ChartController, params: LabelPanelParams) {
        super();
        this.chartController = chartController;
        this.params = params;
    }

    @PostConstruct
    private init() {
        this.setTemplate(LabelPanel.TEMPLATE);

        const chartProxy = this.chartController.getChartProxy();
        this.chart = chartProxy.getChart();

        this.initGroup();
        this.initFontSelects();
        this.initFontColorPicker();
    }

    public addCompToPanel(comp: Component) {
        this.labelsGroup.addItem(comp);
        this.activeComps.push(comp);
    }

    private initGroup() {
        this.labelsGroup
            .setTitle('Labels')
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

        const initSelect = (property: FontOptions, input: AgSelect, values: string[]) => {

            const initialValue = this.params.initialFont[property] ? this.params.initialFont[property] : values[0];
            const options = values.map(value => {
                return {value: value, text: value};
            });

            input.addOptions(options)
                 .setValue(`${initialValue}`)
                 .onInputChange(newValue => this.params.setFont({[property]: newValue}));
        };

        const fonts = ['Arial', 'Verdana, sans-serif'];
        initSelect('family', this.labelFontFamilySelect, fonts);

        const weights = ['Normal', 'Bold', 'Italic', 'Bold Italic'];
        initSelect('weight', this.labelFontWeightSelect, weights);

        const sizes = ['8', '10', '12', '14', '16', '20', '22', '24', '26', '28', '30'];
        initSelect('size', this.labelFontSizeSelect, sizes);
    }

    private initFontColorPicker() {
        this.labelColorPicker
            .setLabel('Color')
            .setValue(`${this.params.initialFont.color}`)
            .onColorChange(newColor => this.params.setFont({color: newColor}));
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