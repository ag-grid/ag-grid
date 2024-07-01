import type { NamedBean } from '../context/bean';
import { BeanStub } from '../context/beanStub';
import type { BeanCollection } from '../context/context';
import type { AgColumn } from '../entities/agColumn';
import type { AgColumnGroup } from '../entities/agColumnGroup';
export declare class AutoWidthCalculator extends BeanStub implements NamedBean {
    beanName: "autoWidthCalculator";
    private rowRenderer;
    private ctrlsService;
    wireBeans(beans: BeanCollection): void;
    private centerRowContainerCtrl;
    postConstruct(): void;
    getPreferredWidthForColumn(column: AgColumn, skipHeader?: boolean): number;
    getPreferredWidthForColumnGroup(columnGroup: AgColumnGroup): number;
    private addElementsToContainerAndGetWidth;
    private getAutoSizePadding;
    private getHeaderCellForColumn;
    private cloneItemIntoDummy;
}
