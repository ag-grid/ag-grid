import { BeanStub } from "../../../context/beanStub";
import { Column } from "../../../entities/column";
import { HeaderCellCtrl } from "./headerCellCtrl";
export declare class SelectAllFeature extends BeanStub {
    private gridApi;
    private columnApi;
    private rowModel;
    private selectionService;
    private cbSelectAllVisible;
    private processingEventFromCheckbox;
    private column;
    private headerCellCtrl;
    private filteredOnly;
    private cbSelectAll;
    constructor(column: Column);
    onSpaceKeyPressed(e: KeyboardEvent): void;
    getCheckboxGui(): HTMLElement;
    setComp(ctrl: HeaderCellCtrl): void;
    private showOrHideSelectAll;
    private onModelChanged;
    private onSelectionChanged;
    private getNextCheckboxState;
    private updateStateOfCheckbox;
    private refreshSelectAllLabel;
    private getSelectionCount;
    private checkRightRowModelType;
    private onCbSelectAll;
    private isCheckboxSelection;
}
