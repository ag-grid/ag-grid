import type { NamedBean } from '../context/bean';
import { BeanStub } from '../context/beanStub';
import type { AgColumn } from '../entities/agColumn';
export declare class ColumnHoverService extends BeanStub implements NamedBean {
    beanName: "columnHoverService";
    private selectedColumns;
    setMouseOver(columns: AgColumn[]): void;
    clearMouseOver(): void;
    isHovered(column: AgColumn): boolean;
}
