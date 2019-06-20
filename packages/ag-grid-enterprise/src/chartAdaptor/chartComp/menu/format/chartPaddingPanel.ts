import {AgGroupComponent, Component, PostConstruct, RefSelector} from "ag-grid-community";
import {ChartController} from "../../chartController";
import {Chart} from "../../../../charts/chart/chart";

export class ChartPaddingPanel extends Component {

    public static TEMPLATE =
        `<div> 
            <ag-group-component ref="labelChartPadding">     
                <div class="ag-column-tool-panel-column-group" style="padding: 10px 5px 5px 25px">
                     <span ref="labelPaddingTop" style="padding-right: 5px"></span>   
                     <input style="width: 38px" ref="inputPaddingTop" type="text" style="padding-right: 15px">   
                     <span ref="labelPaddingRight" style="padding-left: 15px; padding-right: 5px"></span>       
                     <input style="width: 38px" ref="inputPaddingRight" type="text" style="padding-right: 15px">   
                </div>
                
                <div class="ag-column-tool-panel-column-group" style="padding: 5px 5px 0px 5px">
                     <span ref="labelPaddingBottom" style="padding-right: 5px"></span>   
                     <input style="width: 38px" ref="inputPaddingBottom" type="text">   
                     <span ref="labelPaddingLeft" style="padding-left: 22px; padding-right: 5px"></span>       
                     <input style="width: 38px" ref="inputPaddingLeft" type="text">   
                </div>   
            </ag-group-component>         
        </div>`;

    @RefSelector('labelChartPadding') private labelChartPadding: AgGroupComponent;

    @RefSelector('labelPaddingTop') private labelPaddingTop: HTMLElement;
    @RefSelector('inputPaddingTop') private inputPaddingTop: HTMLInputElement;

    @RefSelector('labelPaddingRight') private labelPaddingRight: HTMLElement;
    @RefSelector('inputPaddingRight') private inputPaddingRight: HTMLInputElement;

    @RefSelector('labelPaddingBottom') private labelPaddingBottom: HTMLElement;
    @RefSelector('inputPaddingBottom') private inputPaddingBottom: HTMLInputElement;

    @RefSelector('labelPaddingLeft') private labelPaddingLeft: HTMLElement;
    @RefSelector('inputPaddingLeft') private inputPaddingLeft: HTMLInputElement;

    private readonly chartController: ChartController;
    private chart: Chart;

    constructor(chartController: ChartController) {
        super();
        this.chartController = chartController;
    }

    @PostConstruct
    private init() {
        this.setTemplate(ChartPaddingPanel.TEMPLATE);

        const chartProxy = this.chartController.getChartProxy();
        this.chart = chartProxy.getChart();

        this.initChartPaddingItems();
    }

    private initChartPaddingItems() {

        this.labelChartPadding.setLabel('Chart Padding');

        this.labelPaddingTop.innerHTML = 'Top';
        this.inputPaddingTop.value = `${this.chart.padding.top}`;
        this.addDestroyableEventListener(this.inputPaddingTop, 'input', () => {
            this.chart.padding.top = Number.parseInt(this.inputPaddingTop.value);
            this.chart.performLayout();
        });

        this.labelPaddingRight.innerHTML = 'Right';
        this.inputPaddingRight.value = `${this.chart.padding.right}`;
        this.addDestroyableEventListener(this.inputPaddingRight, 'input', () => {
            this.chart.padding.right = Number.parseInt(this.inputPaddingRight.value);
            this.chart.performLayout();
        });

        this.labelPaddingBottom.innerHTML = 'Bottom';
        this.inputPaddingBottom.value = `${this.chart.padding.bottom}`;
        this.addDestroyableEventListener(this.inputPaddingBottom, 'input', () => {
            this.chart.padding.bottom = Number.parseInt(this.inputPaddingBottom.value);
            this.chart.performLayout();
        });

        this.labelPaddingLeft.innerHTML = 'Left';
        this.inputPaddingLeft.value = `${this.chart.padding.left}`;
        this.addDestroyableEventListener(this.inputPaddingLeft, 'input', () => {
            this.chart.padding.left = Number.parseInt(this.inputPaddingLeft.value);
            this.chart.performLayout();
        });
    }
}