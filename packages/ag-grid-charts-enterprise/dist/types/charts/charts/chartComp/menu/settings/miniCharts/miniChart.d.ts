import type { BeanCollection } from 'ag-grid-community';
import { Component } from 'ag-grid-community';
import { _Scene } from 'ag-charts-community';
import type { ChartTranslationKey } from '../../../services/chartTranslationService';
export declare abstract class MiniChart extends Component {
    protected tooltipName: ChartTranslationKey;
    private chartTranslationService;
    wireBeans(beans: BeanCollection): void;
    protected readonly size: number;
    protected readonly padding: number;
    protected readonly root: _Scene.Group;
    protected readonly scene: _Scene.Scene;
    constructor(container: HTMLElement, tooltipName: ChartTranslationKey);
    postConstruct(): void;
    abstract updateColors(fills: string[], strokes: string[]): void;
}
