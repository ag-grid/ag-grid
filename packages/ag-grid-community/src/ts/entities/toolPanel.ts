import {ICellRendererComp, ICellRendererFunc} from "../rendering/cellRenderers/iCellRenderer";

export interface ToolPanelComponentDef {
    key: string,
    buttonLabel: string,
    // To allow binding this to an specific icon
    iconKey: string,
    component?: {new(): ICellRendererComp} | ICellRendererFunc | string
    componentFramework?: any;
    componentParams?: any;
}

export interface ToolPanelDef {
    components?: ToolPanelComponentDef [];
    defaultTab?: string;
}