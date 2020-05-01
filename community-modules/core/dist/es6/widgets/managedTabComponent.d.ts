// Type definitions for @ag-grid-community/core v23.1.0
// Project: http://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ag-grid/>
import { Component } from "./component";
export declare class ManagedTabComponent extends Component {
    private tabListener;
    protected onTabKeyDown(e: KeyboardEvent): void;
    private attachListenersToGui;
}
