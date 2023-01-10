// Type definitions for @ag-grid-community/core v29.0.0
// Project: https://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ag-grid/>
import { Component } from "../../../widgets/component";
import { AbstractHeaderCellCtrl } from "./abstractHeaderCellCtrl";
export declare abstract class AbstractHeaderCellComp<T extends AbstractHeaderCellCtrl> extends Component {
    protected ctrl: T;
    constructor(template: string, ctrl: T);
    getCtrl(): T;
}
