import {Autowired, Component, PostConstruct, _} from "@ag-grid-community/core";
import {ChartTranslator} from "../../../chartTranslator";
import {Group, Scene} from "ag-charts-community";

export abstract class MiniChart extends Component {
    protected tooltipName: string;

    @Autowired('chartTranslator') protected chartTranslator: ChartTranslator;
    protected readonly size = 58;
    protected readonly padding = 5;
    protected readonly root = new Group();
    protected readonly scene: Scene;

    constructor(container: HTMLElement, tooltipName: string) {
        super();

        const scene = new Scene(window.document, this.size, this.size);
        _.addCssClass(scene.canvas.element, 'ag-chart-mini-thumbnail-canvas');

        scene.root = this.root;
        scene.container = container;

        this.scene = scene;
        this.tooltipName = tooltipName;
    }

    @PostConstruct
    protected init() {
        this.scene.canvas.element.title = this.chartTranslator.translate(this.tooltipName);
    }

    abstract updateColors(fills: string[], strokes: string[]): void;
}
