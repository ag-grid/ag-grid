import { BeanStub } from "../../../context/beanStub";
import { Column } from "../../../entities/column";
import { HeaderCellCtrl } from "./headerCellCtrl";
export declare class SelectAllFeature extends BeanStub {
    private rowModel;
    private selectionService;
    private cbSelectAllVisible;
    private processingEventFromCheckbox;
    private column;
    private headerCellCtrl;
    private cbSelectAll;
    constructor(column: Column);
    onSpaceKeyDown(e: KeyboardEvent): void;
    getCheckboxGui(): HTMLElement;
    setComp(ctrl: HeaderCellCtrl): void;
    private onNewColumnsLoaded;
    private onDisplayedColumnsChanged;
    private showOrHideSelectAll;
    private onModelChanged;
    private onSelectionChanged;
    private updateStateOfCheckbox;
    private refreshSelectAllLabel;
    private checkSelectionType;
    private checkRightRowModelType;
    private onCbSelectAll;
    private isCheckboxSelection;
    private isFilteredOnly;
    private isCurrentPageOnly;
}
