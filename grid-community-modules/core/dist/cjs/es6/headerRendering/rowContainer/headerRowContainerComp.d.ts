// Type definitions for @ag-grid-community/core v29.2.0
// Project: https://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ag-grid/>
import { ColumnPinnedType } from '../../entities/column';
import { Component } from '../../widgets/component';
export declare class HeaderRowContainerComp extends Component {
    private static PINNED_LEFT_TEMPLATE;
    private static PINNED_RIGHT_TEMPLATE;
    private static CENTER_TEMPLATE;
    private eCenterContainer;
    private eRowContainer;
    private pinned;
    private headerRowComps;
    private rowCompsList;
    constructor(pinned: ColumnPinnedType);
    private init;
    private selectAndSetTemplate;
    private destroyRowComps;
    private destroyRowComp;
    private setCtrls;
}
