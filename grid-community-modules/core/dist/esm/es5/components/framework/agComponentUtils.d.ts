// Type definitions for @ag-grid-community/core v29.2.0
// Project: https://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ag-grid/>
import { IComponent } from "../../interfaces/iComponent";
import { ICellRendererParams } from "../../rendering/cellRenderers/iCellRenderer";
import { BeanStub } from "../../context/beanStub";
export declare class AgComponentUtils extends BeanStub {
    private componentMetadataProvider;
    adaptFunction(propertyName: string, jsCompFunc: any): any;
    adaptCellRendererFunction(callback: any): {
        new (): IComponent<ICellRendererParams>;
    };
    doesImplementIComponent(candidate: any): boolean;
}
