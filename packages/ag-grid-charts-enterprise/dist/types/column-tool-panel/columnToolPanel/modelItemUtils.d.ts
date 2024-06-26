import type { AgColumn, BeanCollection, ColumnEventType, IAggFunc, NamedBean } from 'ag-grid-community';
import { BeanStub } from 'ag-grid-community';
import type { ColumnModelItem } from './columnModelItem';
export declare class ModelItemUtils extends BeanStub implements NamedBean {
    beanName: "modelItemUtils";
    private aggFuncService?;
    private columnModel;
    private columnApplyStateService;
    wireBeans(beans: BeanCollection): void;
    selectAllChildren(colTree: ColumnModelItem[], selectAllChecked: boolean, eventType: ColumnEventType): void;
    setColumn(col: AgColumn, selectAllChecked: boolean, eventType: ColumnEventType): void;
    setAllColumns(cols: AgColumn[], selectAllChecked: boolean, eventType: ColumnEventType): void;
    private extractAllLeafColumns;
    private setAllVisible;
    private setAllPivot;
    private setAllPivotActive;
    updateColumns(params: {
        columns: AgColumn[];
        visibleState?: {
            [key: string]: boolean;
        };
        pivotState?: {
            [key: string]: {
                pivot?: boolean;
                rowGroup?: boolean;
                aggFunc?: string | IAggFunc | null;
            };
        };
        eventType: ColumnEventType;
    }): void;
    createPivotState(column: AgColumn): {
        pivot?: boolean;
        rowGroup?: boolean;
        aggFunc?: string | IAggFunc | null;
    };
}
