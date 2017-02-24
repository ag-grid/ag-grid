// Type definitions for ag-grid v8.1.1
// Project: http://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ceolter/>
import { Column } from "../../entities/column";
export declare class HeaderTemplateLoader {
    private static HEADER_CELL_TEMPLATE;
    private gridOptionsWrapper;
    createHeaderElement(column: Column): HTMLElement;
    createDefaultHeaderElement(column: Column): HTMLElement;
    private addInIcon(eTemplate, iconName, cssSelector, column, defaultIconFactory);
}
