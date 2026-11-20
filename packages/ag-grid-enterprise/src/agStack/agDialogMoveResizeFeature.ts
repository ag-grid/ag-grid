import type {
    AgBeanCollection,
    AgElementParams,
    AgPositionableFeature,
    BaseEvents,
    BaseProperties,
    IPropertiesService,
} from 'ag-stack';
import {
    AgAbstractBean,
    KeyCode,
    _addManagedElementListeners,
    _createAgElement,
    _setAriaDisabled,
    _setAriaHidden,
    _setAriaLabel,
    _setAriaPressed,
    _setDisplayed,
} from 'ag-stack';

/** Pixels the dialog moves, or its edge moves, for one arrow key press or one button click. */
const STEP = 10;

interface StepButton {
    el: HTMLButtonElement;
    x: number;
    y: number;
}

interface DialogMoveResizeParams {
    eDialog: HTMLElement;
    eTitleBar: HTMLElement;
    eTitleBarButtons: HTMLElement;
    positionableFeature: AgPositionableFeature<any, any, any, any, any>;
    /** Called as the mode starts, so a maximised dialog can be restored first. */
    onStart: () => void;
}

const buttonParams = (cls: string): AgElementParams<string> => ({
    tag: 'button',
    cls: `ag-button ${cls}`,
    attrs: { type: 'button', tabindex: '-1' },
});

/**
 * Moves and resizes a dialog without dragging. The Move and Resize button in the title bar starts a mode in which
 * the arrow keys move the dialog and Shift with the arrow keys resizes it, and a bar of step buttons under the title
 * bar does the same for pointer users: arrows for its position, and minus and plus for its width and height. Enter or
 * the button finishes, and Escape puts the dialog back where it was.
 */
export class AgDialogMoveResizeFeature<
    TBeanCollection extends AgBeanCollection<TProperties, TGlobalEvents, TCommon, TPropertiesService>,
    TProperties extends BaseProperties,
    TGlobalEvents extends BaseEvents,
    TCommon,
    TPropertiesService extends IPropertiesService<TProperties>,
> extends AgAbstractBean<TBeanCollection, TProperties, TGlobalEvents, TPropertiesService> {
    private eToggle: HTMLButtonElement;
    private eBar: HTMLElement;
    private ePositionButtons: HTMLElement;
    private eWidthButtons: HTMLElement;
    private eHeightButtons: HTMLElement;
    private readonly moveButtons: StepButton[] = [];
    private readonly resizeButtons: StepButton[] = [];
    private active = false;
    /** Where the dialog was when the mode started, so Escape can put it back. */
    private start: { x: number; y: number; width: number; height: number } | null = null;
    /** How much the dialog grew, and moved up, to make room for the bar, both undone as the mode ends. */
    private barRoom = { height: 0, shift: 0 };

    constructor(private readonly params: DialogMoveResizeParams) {
        super();
    }

    public postConstruct(): void {
        const { eDialog, eTitleBar, eTitleBarButtons } = this.params;
        const translate = this.getLocaleTextFunc();
        const { iconSvc } = this.beans;
        const createButton = (cls: string, label: string, iconName: string): HTMLButtonElement => {
            const el = _createAgElement<HTMLButtonElement>(buttonParams(cls));
            _setAriaLabel(el, label);
            const icon = iconSvc.createIconNoSpan(iconName);
            if (icon) {
                el.appendChild(icon);
            }
            return el;
        };

        const eToggle = createButton(
            'ag-dialog-title-bar-button ag-dialog-move-resize-button',
            translate('ariaLabelMoveAndResize', 'Move and Resize'),
            'columnMoveMove'
        );
        // the one Tab stop: the step buttons are for pointer users, and keyboard users use the arrow keys
        eToggle.removeAttribute('tabindex');
        _setAriaPressed(eToggle, false);
        this.eToggle = eToggle;

        // each group is labelled with what it changes, so arrows read as moving and minus and plus as sizing
        const createGroup = (
            cls: string,
            label: string,
            buttons: StepButton[],
            defs: [string, string, number, number][]
        ) => {
            const eGroup = _createAgElement({ tag: 'div', cls: `ag-dialog-step-buttons ${cls}`, role: 'group' });
            _setAriaLabel(eGroup, label);
            const eLabel = _createAgElement({ tag: 'span', cls: 'ag-dialog-step-buttons-label', children: label });
            // the group is already named by it
            _setAriaHidden(eLabel, true);
            eGroup.appendChild(eLabel);
            for (const [buttonLabel, iconName, x, y] of defs) {
                const el = createButton('ag-dialog-step-button', buttonLabel, iconName);
                buttons.push({ el, x, y });
                eGroup.appendChild(el);
            }
            return eGroup;
        };

        this.ePositionButtons = createGroup(
            'ag-dialog-position-buttons',
            translate('position', 'Position'),
            this.moveButtons,
            [
                [translate('moveLeft', 'Move Left'), 'menuMoveLeft', -STEP, 0],
                [translate('moveUp', 'Move Up'), 'menuMoveUp', 0, -STEP],
                [translate('moveDown', 'Move Down'), 'menuMoveDown', 0, STEP],
                [translate('moveRight', 'Move Right'), 'menuMoveRight', STEP, 0],
            ]
        );
        this.eWidthButtons = createGroup('ag-dialog-width-buttons', translate('width', 'Width'), this.resizeButtons, [
            [translate('ariaLabelNarrower', 'Narrower'), 'calculatedColumnRemove', -STEP, 0],
            [translate('ariaLabelWider', 'Wider'), 'calculatedColumnAdd', STEP, 0],
        ]);
        this.eHeightButtons = createGroup(
            'ag-dialog-height-buttons',
            translate('height', 'Height'),
            this.resizeButtons,
            [
                [translate('ariaLabelShorter', 'Shorter'), 'calculatedColumnRemove', 0, -STEP],
                [translate('ariaLabelTaller', 'Taller'), 'calculatedColumnAdd', 0, STEP],
            ]
        );

        // in the flow under the title bar, so it never covers the dialog's content: the content gives up the room
        const eBar = _createAgElement({ tag: 'div', cls: 'ag-dialog-move-resize-bar' });
        eBar.append(this.ePositionButtons, this.eWidthButtons, this.eHeightButtons);
        this.eBar = eBar;

        eTitleBarButtons.prepend(eToggle);
        eTitleBar.after(eBar);
        this.refreshAvailability();

        _addManagedElementListeners(this, eToggle, { click: () => this.setActive(!this.active) });
        for (const { el, x, y } of this.moveButtons) {
            _addManagedElementListeners(this, el, { click: () => this.step(() => this.moveBy(x, y)) });
        }
        for (const { el, x, y } of this.resizeButtons) {
            _addManagedElementListeners(this, el, { click: () => this.step(() => this.resizeBy(x, y)) });
        }
        // keep focus on the Move and Resize button, as a press on a step button or anywhere in the bar would take it
        _addManagedElementListeners(this, eBar, { mousedown: (e: MouseEvent) => e.preventDefault() });
        _addManagedElementListeners(this, eDialog, {
            keydown: this.onKeyDown.bind(this),
            focusout: (e: FocusEvent) => {
                if (this.active && !this.isControl(e.relatedTarget as Node | null)) {
                    this.setActive(false);
                }
            },
        });
    }

    public override destroy(): void {
        this.eToggle?.remove();
        this.eBar?.remove();
        super.destroy();
    }

    /** Shows or hides the Move and Resize button, as the dialog becomes movable or resizable or stops being so. */
    public refreshAvailability(): void {
        const { positionableFeature } = this.params;
        const available = positionableFeature.isMovable() || positionableFeature.isResizable();
        _setDisplayed(this.eToggle, available);
        if (available) {
            this.refreshStepButtonsDisplayed();
        } else {
            this.setActive(false);
        }
    }

    /**
     * Shows the bar only while moving and resizing, with the groups for what the dialog allows. Hidden by class rather
     * than by CSS alone, so the grid's own Tab handling never lands on the step buttons.
     */
    private refreshStepButtonsDisplayed(): void {
        const { positionableFeature } = this.params;
        const resizable = positionableFeature.isResizable();
        _setDisplayed(this.eBar, this.active);
        _setDisplayed(this.ePositionButtons, positionableFeature.isMovable());
        _setDisplayed(this.eWidthButtons, resizable);
        _setDisplayed(this.eHeightButtons, resizable);
    }

    private setActive(active: boolean, revert = false): void {
        if (active === this.active) {
            return;
        }
        const { eDialog, positionableFeature, onStart } = this.params;
        if (active) {
            onStart();
            const { x, y } = positionableFeature.getPosition();
            this.start = { x, y, width: positionableFeature.getWidth()!, height: positionableFeature.getHeight()! };
            this.eToggle.focus({ preventScroll: true });
        }
        this.active = active;
        eDialog.classList.toggle('ag-dialog-move-resize-active', active);
        _setAriaPressed(this.eToggle, active);
        this.refreshStepButtonsDisplayed();
        if (active) {
            this.makeRoomForBar();
            this.refreshStepButtonsDisabled();
            this.announceInstructions();
            return;
        }
        if (revert && this.start) {
            const { x, y, width, height } = this.start;
            // move back first, so the old size fits, then move again in case the larger size held the dialog off
            positionableFeature.offsetElement(x, y);
            positionableFeature.setWidth(width);
            positionableFeature.setHeight(height);
            positionableFeature.offsetElement(x, y);
        } else {
            const { height, shift } = this.barRoom;
            positionableFeature.setHeight(positionableFeature.getHeight()! - height);
            positionableFeature.moveBy(0, shift);
        }
        this.start = null;
        this.barRoom = { height: 0, shift: 0 };
    }

    /**
     * Grows the dialog by the height of the bar, so its content keeps its size rather than being cut off, moving it up
     * first when there isn't room below.
     */
    private makeRoomForBar(): void {
        const { positionableFeature } = this.params;
        const needed = this.eBar.offsetHeight;
        const height = positionableFeature.getHeight()!;
        positionableFeature.setHeight(height + needed);
        let grown = positionableFeature.getHeight()! - height;
        let shift = 0;
        if (grown < needed) {
            const { y } = positionableFeature.getPosition();
            positionableFeature.moveBy(0, grown - needed);
            shift = y - positionableFeature.getPosition().y;
            positionableFeature.setHeight(height + needed);
            grown = positionableFeature.getHeight()! - height;
        }
        this.barRoom = { height: grown, shift };
    }

    /** The smallest height while the bar shows: the dialog's own minimum, plus the room made for the bar. */
    private getMinHeightWithBar(): number {
        return this.params.positionableFeature.getMinHeight() + this.barRoom.height;
    }

    private announceInstructions(): void {
        const translate = this.getLocaleTextFunc();
        const message = this.params.positionableFeature.isResizable()
            ? translate(
                  'ariaDialogMoveResizeInstructions',
                  'Arrow keys move the dialog, and Shift with the arrow keys resizes it. Press Enter to finish or Escape to cancel.'
              )
            : translate(
                  'ariaDialogMoveInstructions',
                  'Arrow keys move the dialog. Press Enter to finish or Escape to cancel.'
              );
        this.beans.ariaAnnounce?.announceValue(message, 'dialogMoveResize');
    }

    private onKeyDown(e: KeyboardEvent): void {
        if (!this.active) {
            return;
        }
        const { key, shiftKey } = e;
        if (key === KeyCode.ESCAPE) {
            // cancel the move rather than close the dialog
            e.preventDefault();
            e.stopPropagation();
            this.setActive(false, true);
            return;
        }
        if (key === KeyCode.ENTER) {
            e.preventDefault();
            this.setActive(false);
            return;
        }
        if (key === KeyCode.TAB) {
            this.setActive(false);
            return;
        }
        const direction = ARROW_STEPS[key];
        if (!direction) {
            return;
        }
        e.preventDefault();
        const [x, y] = direction;
        if (shiftKey) {
            this.step(() => this.resizeBy(x, y));
        } else {
            this.step(() => this.moveBy(x, y));
        }
    }

    private moveBy(x: number, y: number): void {
        const { positionableFeature } = this.params;
        if (positionableFeature.isMovable()) {
            positionableFeature.moveBy(x, y);
        }
    }

    private resizeBy(width: number, height: number): void {
        const { positionableFeature } = this.params;
        if (!positionableFeature.isResizable()) {
            return;
        }
        if (height < 0) {
            // the content keeps its minimum height, with the bar on top
            const room = Math.max(0, positionableFeature.getHeight()! - this.getMinHeightWithBar());
            height = Math.max(height, -room);
        }
        positionableFeature.resizeBy(width, height);
    }

    private step(action: () => void): void {
        action();
        this.refreshStepButtonsDisabled();
    }

    /** Disables each step button that can't move or resize the dialog any further, as at the edge or minimum size. */
    private refreshStepButtonsDisabled(): void {
        const { positionableFeature } = this.params;
        // only probe what the dialog allows
        if (positionableFeature.isMovable()) {
            for (const { el, x, y } of this.moveButtons) {
                _setAriaDisabled(el, !positionableFeature.canMoveBy(x, y));
            }
        }
        if (positionableFeature.isResizable()) {
            const canShrinkHeight = positionableFeature.getHeight()! > this.getMinHeightWithBar();
            for (const { el, x, y } of this.resizeButtons) {
                _setAriaDisabled(el, y < 0 ? !canShrinkHeight : !positionableFeature.canResizeBy(x, y));
            }
        }
    }

    private isControl(node: Node | null): boolean {
        return !!node && (this.eToggle.contains(node) || this.eBar.contains(node));
    }
}

const ARROW_STEPS: Record<string, [number, number] | undefined> = {
    [KeyCode.LEFT]: [-STEP, 0],
    [KeyCode.RIGHT]: [STEP, 0],
    [KeyCode.UP]: [0, -STEP],
    [KeyCode.DOWN]: [0, STEP],
};
