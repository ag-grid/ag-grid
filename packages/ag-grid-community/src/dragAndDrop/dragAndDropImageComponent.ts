import type { AgGridCommon } from '../interfaces/iCommon';
import type { IComponent } from '../interfaces/iComponent';
import { _clearElement } from '../utils/dom';
import type { IconName } from '../utils/icon';
import { _createIcon } from '../utils/icon';
import { Component, RefPlaceholder } from '../widgets/component';
import { dragAndDropImageComponentCSS } from './dragAndDropImageComponent.css-GENERATED';
import type { DragAndDropIcon, DragSource } from './dragAndDropService';

export interface IDragAndDropImageParams<TData = any, TContext = any> extends AgGridCommon<TData, TContext> {
    dragSource: DragSource;
}

export interface IDragAndDropImage {
    setIcon(iconName: string | null, shake: boolean): void;
    setLabel(label: string): void;
}

export interface IDragAndDropImageComponent<
    TData = any,
    TContext = any,
    TParams extends Readonly<IDragAndDropImageParams<TData, TContext>> = IDragAndDropImageParams<TData, TContext>,
> extends IComponent<TParams>,
        IDragAndDropImage {}

export class DragAndDropImageComponent extends Component implements IDragAndDropImageComponent<any, any> {
    private dragSource: DragSource | null = null;

    private readonly eIcon: HTMLElement = RefPlaceholder;
    private readonly eLabel: HTMLElement = RefPlaceholder;
    private readonly eGhost: HTMLElement = RefPlaceholder;

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

        this.setTemplate(
            // the wrapper div has no class - the drag and drop service adds the theme class to it
            /* html */
            `<div>
                <div class="ag-dnd-ghost ag-unselectable" data-ref="eGhost">
                    <span data-ref="eIcon" class="ag-dnd-ghost-icon ag-shake-left-to-right"></span>
                    <div data-ref="eLabel" class="ag-dnd-ghost-label"></div>
                </div>
            </div>`
        );
        // also apply theme class to the ghost element for backwards compatibility
        // with themes that use .ag-theme-classname.ag-dnd-ghost, which used to be
        // required before the theme class was also set on the wrapper.
        this.beans.environment.applyThemeClasses(this.eGhost);
    }

    public override destroy(): void {
        this.dragSource = null;
        super.destroy();
    }

    public setIcon(iconName: DragAndDropIcon | null, shake: boolean): void {
        const { eIcon, dragSource, dropIconMap, gos } = this;

        _clearElement(eIcon);

        let eIconChild: Element | null = null;

        if (!iconName) {
            iconName = dragSource?.getDefaultIconName ? dragSource.getDefaultIconName() : 'notAllowed';
        }
        eIconChild = dropIconMap[iconName];

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
