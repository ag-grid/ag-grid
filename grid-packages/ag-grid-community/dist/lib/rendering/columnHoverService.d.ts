import { BeanStub } from "../context/beanStub";
import { Column } from "../entities/column";
export declare class ColumnHoverService extends BeanStub {
    private selectedColumns;
    setMouseOver(columns: Column[]): void;
    clearMouseOver(): void;
    isHovered(column: Column): boolean;
}
