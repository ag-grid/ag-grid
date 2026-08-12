import type { IColumnSelectionLabelRendererComp, IColumnSelectionLabelRendererParams } from 'ag-grid-community';

interface CustomColumnLabelParams {
    columnIcon: string;
    columnGroupIcon: string;
}

export class CustomColumnLabel implements IColumnSelectionLabelRendererComp {
    private readonly eGui = document.createElement('span');

    public init(params: IColumnSelectionLabelRendererParams & CustomColumnLabelParams): void {
        this.eGui.className = 'custom-column-label';
        this.refreshLabel(params);
    }

    public getGui(): HTMLElement {
        return this.eGui;
    }

    public refresh(params: IColumnSelectionLabelRendererParams & CustomColumnLabelParams): boolean {
        this.refreshLabel(params);
        return true;
    }

    private refreshLabel(params: IColumnSelectionLabelRendererParams & CustomColumnLabelParams): void {
        const isGroup = params.columnGroup != null;
        this.eGui.dataset.kind = isGroup ? 'group' : 'column';
        this.eGui.dataset.source = params.source;
        this.eGui.replaceChildren();

        const icon = document.createElement('span');
        icon.className = 'custom-column-label-icon';
        icon.textContent = isGroup ? params.columnGroupIcon : params.columnIcon;

        const text = document.createElement('span');
        text.className = 'custom-column-label-text';
        text.textContent = params.displayName;

        this.eGui.append(icon, text);
    }
}
