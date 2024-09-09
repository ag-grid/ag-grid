import type { IDragAndDropImageParams } from '@ag-grid-community/core';

export interface ICustomHeaderParams {
    menuIcon: string;
}

export class CustomDragAndDropImage {
    private params!: IDragAndDropImageParams;
    private eGui!: HTMLElement;
    private eIcon!: HTMLElement;
    private eLabel!: HTMLElement;

    init(params: IDragAndDropImageParams) {
        this.params = params;
        const div = document.createElement('div');
        const eLabel = (this.eLabel = document.createElement('div'));
        const eIcon = (this.eIcon = document.createElement('i'));

        this.eGui = div;

        div.appendChild(eIcon);
        div.appendChild(eLabel);
        div.classList.add('my-custom-drag-and-drop-cover');
        eIcon.classList.add('fa-2x', 'fas');
    }

    getGui(): HTMLElement {
        return this.eGui;
    }

    setLabel(label: string) {
        this.eLabel.innerHTML = label;
    }

    setIcon(icon: string) {
        const { eIcon } = this;

        if (!eIcon) {
            return;
        }

        eIcon.classList.toggle('fa-hand-point-left', icon === 'left');
        eIcon.classList.toggle('fa-hand-point-right', icon === 'right');
        eIcon.classList.toggle('fa-ban', icon === 'notAllowed');
        eIcon.classList.toggle('fa-thumbtack', icon === 'pinned');
        eIcon.classList.toggle('fa-walking', icon === 'move');
    }
}
