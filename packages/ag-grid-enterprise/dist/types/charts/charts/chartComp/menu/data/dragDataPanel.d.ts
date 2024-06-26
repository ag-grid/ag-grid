import type { BeanCollection } from 'ag-grid-community';
import { Component } from 'ag-grid-community';
import type { AgGroupComponent } from 'ag-grid-enterprise';
import { AgPillSelect } from '../../../../widgets/agPillSelect';
import type { ChartController } from '../../chartController';
import type { ColState } from '../../model/chartDataModel';
import type { ChartTranslationKey, ChartTranslationService } from '../../services/chartTranslationService';
export declare abstract class DragDataPanel extends Component {
    protected readonly chartController: ChartController;
    protected readonly allowMultipleSelection: boolean;
    private readonly maxSelection;
    protected chartTranslationService: ChartTranslationService;
    wireBeans(beans: BeanCollection): void;
    protected groupComp: AgGroupComponent;
    protected valuePillSelect?: AgPillSelect<ColState>;
    private valueSelect?;
    constructor(chartController: ChartController, allowMultipleSelection: boolean, maxSelection: number | undefined, template?: string);
    addItem(eItem: HTMLElement): void;
    protected createGroup(columns: ColState[], valueFormatter: (colState: ColState) => string, selectLabelKey: ChartTranslationKey, dragSourceId: string, skipAnimation?: () => boolean): void;
    protected refreshValueSelect(columns: ColState[]): void;
    private createValueSelectParams;
    private onValueChange;
    destroy(): void;
}
