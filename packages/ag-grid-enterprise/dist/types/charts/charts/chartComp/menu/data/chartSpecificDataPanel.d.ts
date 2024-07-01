import type { BeanCollection } from 'ag-grid-community';
import { Component } from 'ag-grid-community';
import type { ChartMenuContext } from '../chartMenuContext';
export declare class ChartSpecificDataPanel extends Component {
    private readonly chartMenuContext;
    private isOpen?;
    private chartTranslationService;
    private chartService;
    wireBeans(beans: BeanCollection): void;
    private readonly chartSpecificGroup;
    private directionSelect?;
    private groupTypeSelect?;
    private hasContent;
    constructor(chartMenuContext: ChartMenuContext, isOpen?: boolean | undefined);
    postConstruct(): void;
    refresh(): void;
    private getTitle;
    private createDirectionSelect;
    private updateDirectionSelect;
    private createGroupTypeSelect;
    private updateGroupTypeSelect;
    private updateDisplayed;
}
