import type { IComponent, IDragAndDropImage } from 'ag-stack';
import { RefPlaceholder, _clearElement } from 'ag-stack';

import type { AgGridCommon } from '../interfaces/iCommon';
import type { ElementParams } from '../utils/element';
import type { IconName } from '../utils/icon';
import { _createIcon } from '../utils/icon';
import { Component } from '../widgets/component';
import dragAndDropImageComponentCSS from './dragAndDropImageComponent.css';
import type { DragAndDropIcon, GridDragSource } from './dragAndDropService';
import type { DragSource } from './rowDragTypes';

export interface IDragAndDropImageParams<TData = any, TContext = any> extends AgGridCommon<TData, TContext> {
    dragSource: DragSource;
}

export interface IDragAndDropImageComponent<
    TData = any,
    TContext = any,
    TParams extends Readonly<IDragAndDropImageParams<TData, TContext>> = IDragAndDropImageParams<TData, TContext>,
>
    extends IComponent<TParams>, IDragAndDropImage {}

const DragAndDropElement: ElementParams = {
    tag: 'div',
    cls: 'ag-dnd-ghost ag-unselectable',
    children: [
        { tag: 'span', ref: 'eIcon', cls: 'ag-dnd-ghost-icon ag-shake-left-to-right' },
        { tag: 'div', ref: 'eLabel', cls: 'ag-dnd-ghost-label' },
    ],
};
export class DragAndDropImageComponent extends Component implements IDragAndDropImageComponent<any, any> {
    private dragSource: GridDragSource | null = null;

    private readonly eIcon: HTMLElement = RefPlaceholder;
    private readonly eLabel: HTMLElement = RefPlaceholder;

    private dropIconMap: { [key in DragAndDropIcon]: Element };

    constructor() {
        super();
        this.registerCSS(dragAndDropImageComponentCSS);
    }

    public postConstruct(): void {
        const create = (iconName: IconName) => _createIcon(iconName, this.beans, null);
        this.dropIconMap = {
            pinned: create('columnMovePin'),
            hide: create('columnMoveHide'),
            move: create('columnMoveMove'),
            left: create('columnMoveLeft'),
            right: create('columnMoveRight'),
            group: create('columnMoveGroup'),
            aggregate: create('columnMoveValue'),
            pivot: create('columnMovePivot'),
            notAllowed: create('dropNotAllowed'),
        };
    }

    public init(params: IDragAndDropImageParams): void {
        this.dragSource = params.dragSource;
        this.setTemplate(DragAndDropElement);
    }

    public override destroy(): void {
        this.dragSource = null;
        super.destroy();
    }

    public setIcon(iconName: DragAndDropIcon | null, shake: boolean): void {
        const { eIcon, dragSource, dropIconMap, gos } = this;
        const eGhost = this.getGui();

        _clearElement(eIcon);

        if (!iconName) {
            iconName = dragSource?.getDefaultIconName ? dragSource.getDefaultIconName() : 'notAllowed';
        }
        const eIconChild = dropIconMap[iconName];

        eGhost.classList.toggle('ag-dnd-ghost-not-allowed', iconName === 'notAllowed');
        eIcon.classList.toggle('ag-shake-left-to-right', shake);

        if (eIconChild === dropIconMap['hide'] && gos.get('suppressDragLeaveHidesColumns')) {
            return;
        }
        if (eIconChild) {
            eIcon.appendChild(eIconChild);
        }
    }

    public setLabel(label: string): void {
        this.eLabel.textContent = label;
    }
}
