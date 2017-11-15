// Type definitions for ag-grid v14.2.0
// Project: http://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ag-grid/>
import { Column } from "../../entities/column";
export declare class HeaderTemplateLoader {
    private static HEADER_CELL_TEMPLATE;
    private gridOptionsWrapper;
    createHeaderElement(column: Column): HTMLElement;
    createDefaultHeaderElement(column: Column): HTMLElement;
    private addInIcon(eTemplate, iconName, cssSelector, column);
}
