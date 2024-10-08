import { _Scene } from 'ag-charts-community';

import type { BeanCollection } from 'ag-grid-community';
import { Component, _logError } from 'ag-grid-community';

import type { ChartTranslationKey, ChartTranslationService } from '../../../services/chartTranslationService';

const CANVAS_CLASS = 'ag-chart-mini-thumbnail-canvas';

export abstract class MiniChart extends Component {
    private chartTranslationService: ChartTranslationService;

    public wireBeans(beans: BeanCollection): void {
        this.chartTranslationService = beans.chartTranslationService as ChartTranslationService;
    }

    protected readonly size: number = 58;
    protected readonly padding: number = 5;
    protected readonly root: _Scene.Group = new _Scene.Group();
    protected readonly scene: _Scene.Scene;

    constructor(
        container: HTMLElement,
        protected tooltipName: ChartTranslationKey
    ) {
        super();

        const scene = new _Scene.Scene({
            width: this.size,
            height: this.size,
        });

        scene.canvas.element.classList.add(CANVAS_CLASS);
        scene.setRoot(this.root);
        scene.setContainer(container);

        this.scene = scene;
    }

    public postConstruct(): void {
        this.scene.canvas.element.title = this.chartTranslationService.translate(this.tooltipName);

        // Necessary to force scene graph render as we are not using the standalone factory.
        this.scene.render().catch((e: Error) => {
            _logError(108, { e });
        });
    }

    abstract updateColors(fills: string[], strokes: string[]): void;
}
