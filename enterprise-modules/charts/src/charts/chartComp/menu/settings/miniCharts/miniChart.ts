import { Autowired, Component, PostConstruct } from "@ag-grid-community/core";
import { ChartTranslationService } from "../../../services/chartTranslationService";
import { Group, Scene } from "ag-charts-community";

export abstract class MiniChart extends Component {

    @Autowired('chartTranslationService') protected chartTranslationService: ChartTranslationService;

    protected tooltipName: string;
    protected readonly size = 58;
    protected readonly padding = 5;
    protected readonly root = new Group();
    protected readonly scene: Scene;

    constructor(container: HTMLElement, tooltipName: string) {
        super();

        const scene = new Scene(window.document, this.size, this.size);
        scene.canvas.element.classList.add('ag-chart-mini-thumbnail-canvas');

        scene.root = this.root;
        scene.container = container;

        this.scene = scene;
        this.tooltipName = tooltipName;
    }

    @PostConstruct
    protected init() {
        this.scene.canvas.element.title = this.chartTranslationService.translate(this.tooltipName);
    }

    abstract updateColors(fills: string[], strokes: string[]): void;
}
