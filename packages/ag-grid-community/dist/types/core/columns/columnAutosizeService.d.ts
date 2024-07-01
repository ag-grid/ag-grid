import type { NamedBean } from '../context/bean';
import { BeanStub } from '../context/beanStub';
import type { BeanCollection } from '../context/context';
import type { AgColumnGroup } from '../entities/agColumnGroup';
import type { ColumnEventType } from '../events';
import type { ColKey, Maybe } from './columnModel';
export declare class ColumnAutosizeService extends BeanStub implements NamedBean {
    beanName: "columnAutosizeService";
    private columnModel;
    private visibleColsService;
    private animationFrameService;
    private autoWidthCalculator;
    private eventDispatcher;
    private ctrlsService;
    private renderStatusService?;
    private timesDelayed;
    wireBeans(beans: BeanCollection): void;
    autoSizeCols(params: {
        colKeys: ColKey[];
        skipHeader?: boolean;
        skipHeaderGroups?: boolean;
        stopAtGroup?: AgColumnGroup;
        source?: ColumnEventType;
    }): void;
    autoSizeColumn(key: Maybe<ColKey>, source: ColumnEventType, skipHeader?: boolean): void;
    private autoSizeColumnGroupsByColumns;
    autoSizeAllColumns(source: ColumnEventType, skipHeader?: boolean): void;
    private normaliseColumnWidth;
}
