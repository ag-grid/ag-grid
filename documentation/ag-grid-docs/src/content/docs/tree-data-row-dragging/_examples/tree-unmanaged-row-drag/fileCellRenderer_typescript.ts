import type { ICellRendererParams } from 'ag-grid-community';

import { type IFile, getFileCssIcon } from './fileUtils';

export class FileCellRenderer {
    private eGui!: any;

    init(params: ICellRendererParams<IFile>) {
        const cell = document.createElement('span');
        cell.className = 'filename';

        const icon = document.createElement('i');
        icon.className = getFileCssIcon(params.data?.type, params.value);
        cell.appendChild(icon);

        cell.appendChild(document.createTextNode(params.value));

        this.eGui = cell;
    }

    getGui() {
        return this.eGui;
    }
}
