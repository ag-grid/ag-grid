import {
    AgColorPicker,
    AgGroupComponent,
    AgSlider,
    Autowired,
    Component,
    PostConstruct,
    RefSelector,
} from "ag-grid-community";
import {ChartTranslator} from "../../../chartTranslator";
import {BarChartProxy} from "../../../chartProxies/cartesian/barChartProxy";
import {PieChartProxy} from "../../../chartProxies/polar/pieChartProxy";
import {DoughnutChartProxy} from "../../../chartProxies/polar/doughnutChartProxy";
import {AreaChartProxy} from "../../../chartProxies/cartesian/areaChartProxy";
import {ShadowProperty} from "../../../chartProxies/chartProxy";

type ShadowProxy = BarChartProxy | AreaChartProxy | PieChartProxy | DoughnutChartProxy;

export class ShadowPanel extends Component {

    public static TEMPLATE =
        `<div>
            <ag-group-component ref="shadowGroup">
                <ag-color-picker ref="shadowColorPicker"></ag-color-picker>
                <ag-slider ref="shadowBlurSlider"></ag-slider>
                <ag-slider ref="shadowXOffsetSlider"></ag-slider>
                <ag-slider ref="shadowYOffsetSlider"></ag-slider>
            </ag-group-component>
        </div>`;

    @RefSelector('shadowGroup') private shadowGroup: AgGroupComponent;
    @RefSelector('shadowColorPicker') private shadowColorPicker: AgColorPicker;
    @RefSelector('shadowBlurSlider') private shadowBlurSlider: AgSlider;
    @RefSelector('shadowXOffsetSlider') private shadowXOffsetSlider: AgSlider;
    @RefSelector('shadowYOffsetSlider') private shadowYOffsetSlider: AgSlider;

    @Autowired('chartTranslator') private chartTranslator: ChartTranslator;

    private chartProxy: ShadowProxy;

    constructor(chartProxy: ShadowProxy) {
        super();
        this.chartProxy = chartProxy;
    }

    @PostConstruct
    private init() {
        this.setTemplate(ShadowPanel.TEMPLATE);

        this.shadowBlurSlider.setTextFieldWidth(45);
        this.shadowXOffsetSlider.setTextFieldWidth(45);
        this.shadowYOffsetSlider.setTextFieldWidth(45);

        this.initSeriesShadow();
    }

    private initSeriesShadow() {
        this.shadowGroup
            .setTitle(this.chartTranslator.translate('shadow'))
            .setEnabled(this.chartProxy.getShadowEnabled())
            .hideOpenCloseIcons(true)
            .hideEnabledCheckbox(false)
            .onEnableChange(newValue => this.chartProxy.setShadowProperty('enabled', newValue));

        this.shadowColorPicker
            .setLabel(this.chartTranslator.translate('color'))
            .setLabelWidth('flex')
            .setInputWidth(45)
            .setValue('rgba(0,0,0,0.5)')
            .onValueChange(newValue => this.chartProxy.setShadowProperty('color', newValue));

        const initInput = (input: AgSlider, property: ShadowProperty, maxValue: number) => {
            input.setLabel(this.chartTranslator.translate(property))
                .setValue(this.chartProxy.getShadowProperty(property))
                .setMaxValue(maxValue)
                .onValueChange(newValue => this.chartProxy.setShadowProperty(property, newValue));
        };

        initInput(this.shadowBlurSlider, 'blur', 20);
        initInput(this.shadowXOffsetSlider, 'xOffset', 20);
        initInput(this.shadowYOffsetSlider, 'yOffset', 20);
    }
}
