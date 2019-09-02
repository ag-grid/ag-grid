import {_, Autowired, Component} from "ag-grid-community";

import {ChartTranslator} from "../../../chartTranslator";
import {Group} from "../../../../../charts/scene/group";
import {Scene} from "../../../../../charts/scene/scene";

export abstract class MiniChart extends Component {
    @Autowired('chartTranslator') protected chartTranslator: ChartTranslator;
    protected readonly size = 58;
    protected readonly padding = 5;
    protected readonly stroke = 'gray';
    protected readonly strokeWidth = 1;
    protected readonly root = new Group();
    protected readonly scene: Scene = (() => {
        const scene = new Scene({
            width: this.size,
            height: this.size
        });
        scene.root = this.root;
        return scene;
    })();

    readonly element: HTMLElement = this.scene.canvas.element;

    abstract updateColors(fills: string[], strokes: string[]): void;
}
