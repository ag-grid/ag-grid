// Type definitions for @ag-grid-community/core v31.1.0
// Project: https://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ag-grid/>
import { Component } from './component';
import { IMenuItemComp, IMenuItemParams } from '../interfaces/menuItem';
interface AgMenuItemRendererParams {
    cssClassPrefix?: string;
    isCompact?: boolean;
}
export declare class AgMenuItemRenderer extends Component implements IMenuItemComp {
    private params;
    private cssClassPrefix;
    constructor();
    init(params: IMenuItemParams & AgMenuItemRendererParams): void;
    configureDefaults(): boolean;
    private addIcon;
    private addName;
    private addShortcut;
    private addSubMenu;
    private getClassName;
    destroy(): void;
}
export {};
