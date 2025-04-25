import type {
    AgEvent,
    ComponentSelector,
    DragAndDropIcon,
    DragItem,
    DragSource,
    DragSourceType,
    DropTarget,
    ElementParams,
    ITooltipCtrl,
    TooltipFeature,
} from 'ag-grid-community';
import {
    Component,
    KeyCode,
    RefPlaceholder,
    TouchListener,
    _createIconNoSpan,
    _setAriaLabel,
    _setDisplayed,
} from 'ag-grid-community';

export type PillDragCompEvent = 'columnRemove';

const PillDragCompElement: ElementParams = {
    tag: 'span',
    role: 'option',
    children: [
        {
            tag: 'span',
            ref: 'eDragHandle',
            cls: 'ag-drag-handle ag-column-drop-cell-drag-handle',
            role: 'presentation',
        },
        { tag: 'span', ref: 'eText', cls: 'ag-column-drop-cell-text', attrs: { 'aria-hidden': 'true' } },
        { tag: 'span', ref: 'eButton', cls: 'ag-column-drop-cell-button', role: 'presentation' },
    ],
};
export abstract class PillDragComp<TItem> extends Component<PillDragCompEvent> {
    private readonly eText: HTMLElement = RefPlaceholder;
    private readonly eDragHandle: HTMLElement = RefPlaceholder;
    private readonly eButton: HTMLElement = RefPlaceholder;

    public abstract getItem(): TItem;
    public abstract isMovable(): boolean;

    protected abstract getDisplayName(): string;
    protected abstract getAriaDisplayName(): string;
    protected abstract getTooltip(): string | null | undefined;
    protected abstract createGetDragItem(): () => DragItem<TItem>;
    protected abstract getDragSourceType(): DragSourceType;
    private tooltipFeature?: TooltipFeature;

    constructor(
        private dragSourceDropTarget: DropTarget,
        private ghost: boolean,
        private horizontal: boolean,
        protected template?: ElementParams,
        protected agComponents?: ComponentSelector[]
    ) {
        super();
    }

    public postConstruct(): void {
        this.setTemplate(this.template ?? PillDragCompElement, this.agComponents);
        const eGui = this.getGui();

        const { beans, eDragHandle, eText, eButton } = this;

        this.addElementClasses(eGui);
        this.addElementClasses(eDragHandle, 'drag-handle');
        this.addElementClasses(eText, 'text');
        this.addElementClasses(eButton, 'button');

        eDragHandle.appendChild(_createIconNoSpan('columnDrag', beans)!);

        eButton.appendChild(_createIconNoSpan('cancel', beans)!);

        this.tooltipFeature = this.createOptionalManagedBean(
            beans.registry.createDynamicBean<TooltipFeature>('tooltipFeature', false, {
                getGui: () => this.getGui(),
            } as ITooltipCtrl)
        );

        this.setupComponents();

        if (!this.ghost && this.isDraggable()) {
            this.addDragSource();
        }

        this.setupAria();

        this.setupTooltip();
        this.activateTabIndex();

        this.refreshDraggable();
    }

    protected isDraggable(): boolean {
        return true;
    }

    protected refreshDraggable(): void {
        this.eDragHandle.classList.toggle('ag-column-select-column-readonly', !this.isDraggable());
    }

    protected setupAria() {
        const translate = this.getLocaleTextFunc();

        const ariaInstructions = [this.getAriaDisplayName()];

        this.addAdditionalAriaInstructions(ariaInstructions, translate);

        _setAriaLabel(this.getGui(), ariaInstructions.join('. '));
    }

    protected addAdditionalAriaInstructions(
        ariaInstructions: string[],
        translate: (key: string, defaultValue: string) => string
    ): void {
        if (this.isRemovable()) {
            const deleteAria = translate('ariaDropZoneColumnComponentDescription', 'Press DELETE to remove');
            ariaInstructions.push(deleteAria);
        }
    }

    private setupTooltip(): void {
        const refresh = () => this.tooltipFeature?.setTooltipAndRefresh(this.getTooltip());

        refresh();

        this.addManagedEventListeners({ newColumnsLoaded: refresh });
    }

    protected getDragSourceId(): string | undefined {
        return undefined;
    }

    protected getDefaultIconName(): DragAndDropIcon {
        return 'notAllowed';
    }

    private addDragSource(): void {
        const {
            beans: { dragAndDrop },
            eDragHandle,
        } = this;
        const getDragItem = this.createGetDragItem();
        const defaultIconName = this.getDefaultIconName();
        const dragSource: DragSource = {
            type: this.getDragSourceType(),
            sourceId: this.getDragSourceId(),
            eElement: eDragHandle,
            getDefaultIconName: () => defaultIconName,
            getDragItem,
            dragItemName: this.getDisplayName(),
        };

        dragAndDrop?.addDragSource(dragSource, true);
        this.addDestroyFunc(() => dragAndDrop?.removeDragSource(dragSource));
    }

    protected setupComponents(): void {
        this.eText.textContent = this.getDisplayValue();
        this.setupRemove();

        if (this.ghost) {
            this.addCss('ag-column-drop-cell-ghost');
        }
    }

    protected isRemovable(): boolean {
        return true;
    }

    protected refreshRemove(): void {
        _setDisplayed(this.eButton, this.isRemovable());
    }

    private setupRemove(): void {
        this.refreshRemove();

        const agEvent: AgEvent<PillDragCompEvent> = { type: 'columnRemove' };

        this.addGuiEventListener('keydown', (e: KeyboardEvent) => this.onKeyDown(e));

        this.addManagedElementListeners(this.eButton, {
            click: (mouseEvent: MouseEvent) => {
                this.dispatchLocalEvent(agEvent);
                mouseEvent.stopPropagation();
            },
        });

        const touchListener = new TouchListener(this.eButton);
        this.addManagedListeners(touchListener, {
            tap: () => this.dispatchLocalEvent(agEvent),
        });
        this.addDestroyFunc(touchListener.destroy.bind(touchListener));
    }

    protected onKeyDown(e: KeyboardEvent): void {
        const isDelete = e.key === KeyCode.DELETE;

        if (isDelete) {
            if (this.isRemovable()) {
                e.preventDefault();
                this.dispatchLocalEvent({ type: 'columnRemove' });
            }
        }
    }

    protected getDisplayValue(): string {
        return this.getDisplayName();
    }

    private addElementClasses(el: HTMLElement, suffix?: string) {
        suffix = suffix ? `-${suffix}` : '';
        const direction = this.horizontal ? 'horizontal' : 'vertical';
        el.classList.add(`ag-column-drop-cell${suffix}`, `ag-column-drop-${direction}-cell${suffix}`);
    }

    public override destroy(): void {
        super.destroy();
        (this.dragSourceDropTarget as any) = null;
    }
}
