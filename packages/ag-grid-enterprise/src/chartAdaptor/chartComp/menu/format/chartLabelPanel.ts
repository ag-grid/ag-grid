import {
    _,
    AgColorPicker,
    AgGroupComponent,
    AgInputTextField,
    Component,
    PostConstruct,
    RefSelector
} from "ag-grid-community";
import {ChartController} from "../../chartController";
import {Chart} from "../../../../charts/chart/chart";

export interface ChartLabelPanelParams {
    chartController: ChartController;
    enabled: boolean;
    suppressEnabledCheckbox?: boolean;
    setEnabled?: (enabled: boolean) => void;
    getFont: () => string;
    setFont: (font: string) => void;
    getColor: () => string;
    setColor: (color: string) => void;
}

export class ChartLabelPanel extends Component {

    public static TEMPLATE =
        `<div>                               
            <ag-group-component ref="labelsGroup">
                <select ref="selectSeriesFont"></select>
                <select ref="selectSeriesFontWeight"></select>  
                <div class="ag-group-subgroup">
                    <ag-input-text-field ref="inputSeriesFontSize"></ag-input-text-field> 
                    <ag-color-picker ref="inputSeriesLabelColor"></ag-color-picker>                                         
                </div>              
            </ag-group-component>                        
        </div>`;

    @RefSelector('labelsGroup') private labelsGroup: AgGroupComponent;
    @RefSelector('selectSeriesFont') private selectSeriesFont: HTMLSelectElement;
    @RefSelector('selectSeriesFontWeight') private selectSeriesFontWeight: HTMLSelectElement;
    @RefSelector('inputSeriesLabelColor') private inputSeriesLabelColor: AgColorPicker;
    @RefSelector('inputSeriesFontSize') private inputSeriesFontSize: AgInputTextField;

    private chart: Chart;
    private params: ChartLabelPanelParams;
    private activeComps: Component[] = [];

    constructor(params: ChartLabelPanelParams) {
        super();
        this.params = params;
    }

    @PostConstruct
    private init() {
        this.setTemplate(ChartLabelPanel.TEMPLATE);

        const chartProxy = this.params.chartController.getChartProxy();
        this.chart = chartProxy.getChart();

        this.labelsGroup.setTitle('Labels');
        this.initSeriesLabels();
    }

    public addCompToPanel(comp: Component) {
        this.labelsGroup.addItem(comp);
        this.activeComps.push(comp);
    }

    private initSeriesLabels() {

        this.labelsGroup
            .setEnabled(this.params.enabled)
            .hideEnabledCheckbox(!!this.params.suppressEnabledCheckbox)
            .onEnableChange(enabled => {
                if (this.params.setEnabled) {
                    this.params.setEnabled(enabled);
                }
            });

        // // label enabled checkbox is optional, i.e. not included in legend panel
        // if (this.params.isEnabled) {
        //     this.cbSeriesLabelsEnabled.setLabel('Enabled');
        //     this.cbSeriesLabelsEnabled.setSelected(this.params.isEnabled());
        //     this.addDestroyableEventListener(this.cbSeriesLabelsEnabled, 'change', () => {
        //         if (this.params.setEnabled) {
        //             this.params.setEnabled(this.cbSeriesLabelsEnabled.isSelected());
        //         }
        //     });
        // } else {
        //     // remove / destroy enabled checkbox
        //     _.removeFromParent(this.cbSeriesLabelsEnabled.getGui());
        //     this.cbSeriesLabelsEnabled.destroy();
        // }

        const fonts = ['Verdana, sans-serif', 'Arial'];
        fonts.forEach((font: any) => {
            const option = document.createElement('option');
            option.value = font;
            option.text = font;
            this.selectSeriesFont.appendChild(option);
        });

        const completeLabelFont = this.params.getFont();
        const fontParts = completeLabelFont.split('px');
        const fontSize = fontParts[0];
        const font = fontParts[1].trim();

        this.selectSeriesFont.selectedIndex = fonts.indexOf(font);

        this.addDestroyableEventListener(this.selectSeriesFont, 'input', () => {
            const font = fonts[this.selectSeriesFont.selectedIndex];
            const fontSize = Number.parseInt(this.inputSeriesFontSize.getValue());
            this.params.setFont(`${fontSize}px ${font}`);
        });

        const fontWeights = ['normal', 'bold'];
        fontWeights.forEach((font: any) => {
            const option = document.createElement('option');
            option.value = font;
            option.text = font;
            this.selectSeriesFontWeight.appendChild(option);
        });

        // TODO
        // this.selectLegendFontWeight.selectedIndex = fonts.indexOf(font);
        // this.addDestroyableEventListener(this.selectLegendFontWeight, 'input', () => {
        //     const fontSize = Number.parseInt(this.selectLegendFontWeight.value);
        //     const font = fonts[this.selectLegendFontWeight.selectedIndex];
        //     this.chart.legend.labelFont = `bold ${fontSize}px ${font}`;
        //     this.chart.performLayout();
        // });

        this.inputSeriesFontSize
            .setLabel('Size')
            .setValue(fontSize)
            .setLabelWidth(40)
            .setWidth(70)
            .onInputChange(newFontSize => {
                const font = fonts[this.selectSeriesFont.selectedIndex];
                this.params.setFont(`${newFontSize}px ${font}`);
            });

        this.inputSeriesLabelColor
            .setLabel("Color")
            .setLabelWidth(40)
            .setWidth(70)
            .setValue(this.params.getColor())
            .onColorChange(newColor => this.params.setColor(newColor));

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