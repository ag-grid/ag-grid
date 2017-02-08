import {IComponent} from "../../interfaces/iComponent";
export interface ICellRendererParams{

}

export interface ICellRenderer {
    /** Get the cell to refresh. If this method is not provided, then when refresh is needed, the grid
     * will remove the component from the DOM and create a new component in it's place with the new values. */
    refresh?(params: any): void;
}

export interface ICellRendererComp extends ICellRenderer, IComponent<ICellRendererParams> {

}

export interface ICellRendererFunc {
    (params: any): HTMLElement | string
}