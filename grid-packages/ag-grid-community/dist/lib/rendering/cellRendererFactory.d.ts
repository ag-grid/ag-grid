import { ICellRenderer, ICellRendererFunc } from "./cellRenderers/iCellRenderer";
export declare class CellRendererFactory {
    static ANIMATE_SLIDE: string;
    static ANIMATE_SHOW_CHANGE: string;
    static GROUP: string;
    private cellRendererMap;
    private init;
    addCellRenderer(key: string, cellRenderer: {
        new (): ICellRenderer;
    } | ICellRendererFunc): void;
    getCellRenderer(key: string): {
        new (): ICellRenderer;
    } | ICellRendererFunc | null;
}
