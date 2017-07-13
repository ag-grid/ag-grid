// ag-grid-aurelia v12.0.0
import { ICellRenderer } from 'ag-grid/main';
export declare class AureliaCellRendererComponent implements ICellRenderer {
    private view;
    init(params: any): void;
    getGui(): HTMLElement;
    destroy(): void;
    refresh(params: any): boolean;
}
