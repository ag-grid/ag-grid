import {_, Autowired, Component, PostConstruct} from "ag-grid-community";

import {ChartTranslator} from "../../../chartTranslator";
import {Group} from "../../../../../charts/scene/group";
import {Scene} from "../../../../../charts/scene/scene";

export abstract class MiniChart extends Component {
    protected tooltipName: string;

    @Autowired('chartTranslator') protected chartTranslator: ChartTranslator;
    protected readonly size = 58;
    protected readonly padding = 5;
    protected readonly stroke = 'gray';
    protected readonly strokeWidth = 1;
    protected readonly axisOvershoot = 3;
    protected readonly root = new Group();
    protected readonly scene: Scene;

    constructor(parent: HTMLElement, tooltipName: string) {
        super();

        const scene = new Scene({
            width: this.size,
            height: this.size
        });

        scene.root = this.root;
        scene.parent = parent;

        this.scene = scene;
        this.tooltipName = tooltipName;
    }

    @PostConstruct
    protected init() {
        this.scene.canvas.element.title = this.chartTranslator.translate(this.tooltipName);
    }

    abstract updateColors(fills: string[], strokes: string[]): void;
}
