import type { AbstractColDef, AgColumn, BeanCollection, NamedBean } from 'ag-grid-community';
import { AgProvidedColumnGroup, BeanStub } from 'ag-grid-community';
export declare class ToolPanelColDefService extends BeanStub implements NamedBean {
    beanName: "toolPanelColDefService";
    private columnModel;
    wireBeans(beans: BeanCollection): void;
    createColumnTree(colDefs: AbstractColDef[]): (AgColumn | AgProvidedColumnGroup)[];
    syncLayoutWithGrid(syncLayoutCallback: (colDefs: AbstractColDef[]) => void): void;
    private getLeafPathTrees;
    private mergeLeafPathTrees;
    private addChildrenToGroup;
    private isColGroupDef;
    private getId;
}
