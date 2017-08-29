// Type definitions for ag-grid v12.0.2
// Project: http://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ceolter/>
import { Component } from "../../widgets/component";
export declare class PaginationComp extends Component {
    private gridOptionsWrapper;
    private eventService;
    private paginationProxy;
    private rowRenderer;
    private btFirst;
    private btPrevious;
    private btNext;
    private btLast;
    private lbRecordCount;
    private lbFirstRowOnPage;
    private lbLastRowOnPage;
    private eSummaryPanel;
    private lbCurrent;
    private lbTotal;
    constructor();
    private postConstruct();
    private onPaginationChanged();
    private setCurrentPageLabel();
    private getTemplate();
    private onBtNext();
    private onBtPrevious();
    private onBtFirst();
    private onBtLast();
    private enableOrDisableButtons();
    private updateRowLabels();
    private isZeroPagesToDisplay();
    private setTotalLabels();
}
