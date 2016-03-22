// Type definitions for ag-grid v4.0.5
// Project: http://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ceolter/>
// Definitions: https://github.com/borisyankov/DefinitelyTyped
import { Column } from "../entities/column";
export declare class HeaderTemplateLoader {
    static HEADER_CELL_DND_TEMPLATE: string;
    private static HEADER_CELL_TEMPLATE;
    private gridOptionsWrapper;
    createHeaderElement(column: Column): HTMLElement;
    createDefaultHeaderElement(column: Column): HTMLElement;
    private addInIcon(eTemplate, iconName, cssSelector, column, defaultIconFactory);
}
