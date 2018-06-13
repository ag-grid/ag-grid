// ag-grid-aurelia v13.0.2
import { ICellRenderer } from 'ag-grid/main';
export declare class AureliaCellRendererComponent implements ICellRenderer {
    private view;
    init(params: any): void;
    getGui(): HTMLElement;
    destroy(): void;
    refresh(params: any): boolean;
}
