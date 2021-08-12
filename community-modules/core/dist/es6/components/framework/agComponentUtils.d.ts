// Type definitions for @ag-grid-community/core v26.0.0
// Project: http://www.ag-grid.com/
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
