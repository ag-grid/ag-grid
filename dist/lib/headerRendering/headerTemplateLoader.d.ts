// Type definitions for ag-grid v5.0.2
// Project: http://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ceolter/>
// Definitions: https://github.com/borisyankov/DefinitelyTyped
import { Column } from "../entities/column";
export declare class HeaderTemplateLoader {
    private static HEADER_CELL_TEMPLATE;
    private gridOptionsWrapper;
    createHeaderElement(column: Column): HTMLElement;
    createDefaultHeaderElement(column: Column): HTMLElement;
    private addInIcon(eTemplate, iconName, cssSelector, column, defaultIconFactory);
}
