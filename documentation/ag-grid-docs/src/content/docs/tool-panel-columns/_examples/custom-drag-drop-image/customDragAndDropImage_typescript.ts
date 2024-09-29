import type { IDragAndDropImageParams } from 'ag-grid-community';

export interface ICustomHeaderParams {
    menuIcon: string;
}

export class CustomDragAndDropImage {
    private params!: IDragAndDropImageParams;
    private eGui!: HTMLElement;
    private eIcon!: HTMLElement;
    private eLabel!: HTMLElement;

    init(params: IDragAndDropImageParams & { accentColour: string }) {
        this.params = params;
        const div = document.createElement('div');
        const eLabel = (this.eLabel = document.createElement('div'));
        const eIcon = (this.eIcon = document.createElement('i'));

        this.eGui = div;

        div.style.setProperty('background-color', params.accentColour);

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
        const { eIcon, params } = this;
        const { dragSource } = params;

        if (!eIcon || !dragSource) {
            return;
        }

        if (!icon) {
            icon = dragSource.getDefaultIconName ? dragSource.getDefaultIconName() : 'notAllowed';
        }

        if (icon === 'hide' && params.api.getGridOption('suppressDragLeaveHidesColumns')) {
            return;
        }

        eIcon.classList.toggle('fa-hand-point-left', icon === 'left');
        eIcon.classList.toggle('fa-hand-point-right', icon === 'right');
        eIcon.classList.toggle('fa-ban', icon === 'notAllowed');
        eIcon.classList.toggle('fa-mask', icon === 'hide');
        eIcon.classList.toggle('fa-thumbtack', icon === 'pinned');
        eIcon.classList.toggle('fa-walking', icon === 'move');
        eIcon.classList.toggle('fa-layer-group', icon === 'group');
        eIcon.classList.toggle('fa-table', icon === 'aggregate');
        eIcon.classList.toggle('fa-ruler-combined', icon === 'pivot');
    }
}
