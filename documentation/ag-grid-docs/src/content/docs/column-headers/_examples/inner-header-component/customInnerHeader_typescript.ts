import type { IHeaderParams, IInnerHeaderComponent } from 'ag-grid-community';

export interface ICustomInnerHeaderParams {
    icon: string;
}

export class CustomInnerHeader implements IInnerHeaderComponent {
    private agParams!: ICustomInnerHeaderParams & IHeaderParams;
    private eGui!: HTMLDivElement;
    private eText!: HTMLElement;

    init(agParams: ICustomInnerHeaderParams & IHeaderParams) {
        const eGui = (this.eGui = document.createElement('div'));
        eGui.classList.add('customInnerHeader');
        const textNode = document.createElement('span');
        this.eText = textNode;

        textNode.textContent = agParams.displayName;

        if (agParams.icon) {
            const icon = document.createElement('i');
            icon.classList.add('fa', `${agParams.icon}`);
            eGui.appendChild(icon);
        }

        eGui.appendChild(textNode);
    }

    getGui() {
        return this.eGui;
    }

    refresh(params: ICustomInnerHeaderParams & IHeaderParams) {
        this.eText.textContent = params.displayName;
        return true;
    }
}
