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
    resize: boolean;
}

interface DialogRect {
    x: number;
    y: number;
    width: number;
    height: number;
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

const isSameRect = (a: DialogRect, b: DialogRect): boolean =>
    a.x === b.x && a.y === b.y && a.width === b.width && a.height === b.height;

/**
 * Moves and resizes a dialog without dragging. The Move and Resize button in the title bar starts a mode in which a
 * ghost of the dialog, drawn behind it, shows where it will go: the arrow keys move the ghost and Shift with the arrow
 * keys resizes it, and a bar of step buttons over the top of the dialog's content does the same for pointer users,
 * arrows for its position, and minus and plus for its width and height. The dialog itself stays where it is, so the
 * buttons stay under the pointer, until the mode ends: Enter, the button, Tab or clicking away move the dialog to the
 * ghost, and Escape leaves it where it was.
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
    /** The ghost, behind the dialog, and its outline, over the dialog, so it shows as it shrinks within the dialog. */
    private eGhost: HTMLElement;
    private eGhostOutline: HTMLElement;
    private readonly stepButtons: StepButton[] = [];
    private active = false;
    /** Where the dialog will go as the mode ends. */
    private ghost: DialogRect | null = null;

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
        const createGroup = (cls: string, label: string, resize: boolean, defs: [string, string, number, number][]) => {
            const eGroup = _createAgElement({ tag: 'div', cls: `ag-dialog-step-buttons ${cls}`, role: 'group' });
            _setAriaLabel(eGroup, label);
            const eLabel = _createAgElement({ tag: 'span', cls: 'ag-dialog-step-buttons-label', children: label });
            // the group is already named by it
            _setAriaHidden(eLabel, true);
            eGroup.appendChild(eLabel);
            for (const [buttonLabel, iconName, x, y] of defs) {
                const el = createButton('ag-dialog-step-button', buttonLabel, iconName);
                this.stepButtons.push({ el, x, y, resize });
                eGroup.appendChild(el);
            }
            return eGroup;
        };

        this.ePositionButtons = createGroup('ag-dialog-position-buttons', translate('position', 'Position'), false, [
            [translate('moveLeft', 'Move Left'), 'menuMoveLeft', -STEP, 0],
            [translate('moveUp', 'Move Up'), 'menuMoveUp', 0, -STEP],
            [translate('moveDown', 'Move Down'), 'menuMoveDown', 0, STEP],
            [translate('moveRight', 'Move Right'), 'menuMoveRight', STEP, 0],
        ]);
        this.eWidthButtons = createGroup('ag-dialog-width-buttons', translate('width', 'Width'), true, [
            [translate('ariaLabelNarrower', 'Narrower'), 'calculatedColumnRemove', -STEP, 0],
            [translate('ariaLabelWider', 'Wider'), 'calculatedColumnAdd', STEP, 0],
        ]);
        this.eHeightButtons = createGroup('ag-dialog-height-buttons', translate('height', 'Height'), true, [
            [translate('ariaLabelShorter', 'Shorter'), 'calculatedColumnRemove', 0, -STEP],
            [translate('ariaLabelTaller', 'Taller'), 'calculatedColumnAdd', 0, STEP],
        ]);

        // laid over the top of the content, so starting the mode doesn't change the dialog's size
        const eBar = _createAgElement({ tag: 'div', cls: 'ag-dialog-move-resize-bar' });
        eBar.append(this.ePositionButtons, this.eWidthButtons, this.eHeightButtons);
        this.eBar = eBar;

        const createGhostLayer = (cls: string) => {
            const el = _createAgElement({ tag: 'div', cls: `ag-dialog-ghost ${cls}` });
            _setAriaHidden(el, true);
            return el;
        };
        this.eGhost = createGhostLayer('ag-dialog-ghost-fill');
        this.eGhostOutline = createGhostLayer('ag-dialog-ghost-outline');

        eTitleBarButtons.prepend(eToggle);
        eTitleBar.after(eBar);
        this.refreshAvailability();

        _addManagedElementListeners(this, eToggle, { click: () => this.setActive(!this.active) });
        for (const { el, x, y, resize } of this.stepButtons) {
            _addManagedElementListeners(this, el, { click: () => this.stepGhost(x, y, resize) });
        }
        // dragging the dialog itself moves it straight away, so the ghost drops what it hadn't applied
        this.addManagedListeners(this.params.positionableFeature, {
            dragStart: () => this.syncGhost(),
            dragEnd: () => {
                this.syncGhost();
                // a resize handle passes focus to the dialog, so give it back for the arrow keys
                if (this.active) {
                    this.eToggle.focus({ preventScroll: true });
                }
            },
        });
        // keep focus on the Move and Resize button, as a press on a step button or anywhere in the bar would take it
        _addManagedElementListeners(this, eBar, { mousedown: (e: MouseEvent) => e.preventDefault() });
        _addManagedElementListeners(this, eDialog, {
            keydown: this.onKeyDown.bind(this),
            // clicking away, out of the dialog or onto a control in it, finishes; pressing on its edges or a blank part
            // of it focuses the dialog itself, which doesn't
            focusout: (e: FocusEvent) => {
                const target = e.relatedTarget as Node | null;
                if (this.active && target !== eDialog && !this.isControl(target)) {
                    this.setActive(false);
                }
            },
        });
    }

    public override destroy(): void {
        for (const el of [this.eToggle, this.eBar, this.eGhost, this.eGhostOutline]) {
            el?.remove();
        }
        super.destroy();
    }

    /** Matches the ghost to the dialog, after it has moved or resized some other way, as by dragging or maximising. */
    public syncGhost(): void {
        if (this.active) {
            this.ghost = this.getDialogRect();
            this.refreshGhost();
        }
    }

    /** Shows or hides the Move and Resize button, as the dialog becomes movable or resizable or stops being so. */
    public refreshAvailability(): void {
        const { positionableFeature } = this.params;
        const available = positionableFeature.isMovable() || positionableFeature.isResizable();
        _setDisplayed(this.eToggle, available);
        if (available) {
            this.refreshStepButtonsDisplayed();
        } else {
            this.setActive(false, false);
        }
    }

    /**
     * Shows the bar only while moving and resizing, with the groups for what the dialog allows. Hidden by class rather
     * than by CSS alone, so the grid's own Tab handling never lands on the step buttons.
     */
    private refreshStepButtonsDisplayed(): void {
        const { eTitleBar, positionableFeature } = this.params;
        const resizable = positionableFeature.isResizable();
        _setDisplayed(this.eBar, this.active);
        _setDisplayed(this.ePositionButtons, positionableFeature.isMovable());
        _setDisplayed(this.eWidthButtons, resizable);
        _setDisplayed(this.eHeightButtons, resizable);
        if (this.active) {
            this.eBar.style.top = `${eTitleBar.offsetTop + eTitleBar.offsetHeight}px`;
        }
    }

    /** Starts or ends the mode. Ending it moves the dialog to the ghost, unless `apply` is false, as for Escape. */
    private setActive(active: boolean, apply = true): void {
        if (active === this.active) {
            return;
        }
        const { eDialog, onStart } = this.params;
        if (active) {
            onStart();
            this.ghost = this.getDialogRect();
            // in the dialog's own popup wrapper, so the ghost shares its position and stacks just behind it
            eDialog.before(this.eGhost);
            eDialog.after(this.eGhostOutline);
            this.eToggle.focus({ preventScroll: true });
        } else {
            if (apply && this.ghost) {
                this.setDialogRect(this.ghost);
            }
            this.ghost = null;
            this.eGhost.remove();
            this.eGhostOutline.remove();
        }
        this.active = active;
        eDialog.classList.toggle('ag-dialog-move-resize-active', active);
        _setAriaPressed(this.eToggle, active);
        this.refreshStepButtonsDisplayed();
        if (active) {
            this.refreshGhost();
            this.announceInstructions();
        }
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
            this.setActive(false, false);
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
        this.stepGhost(x, y, shiftKey);
    }

    private stepGhost(x: number, y: number, resize: boolean): void {
        const next = this.getNextGhost(x, y, resize);
        if (next) {
            this.ghost = next;
            this.refreshGhost();
        }
    }

    /** Where a step would take the ghost, or null if the dialog can't move or resize that way. */
    private getNextGhost(x: number, y: number, resize: boolean): DialogRect | null {
        const { ghost } = this;
        const { positionableFeature } = this.params;
        if (!ghost || !(resize ? positionableFeature.isResizable() : positionableFeature.isMovable())) {
            return null;
        }
        return this.fitDialogRect(
            resize
                ? { ...ghost, width: ghost.width + x, height: ghost.height + y }
                : { ...ghost, x: ghost.x + x, y: ghost.y + y }
        );
    }

    /**
     * Where the dialog would end up if moved and sized to `rect`, kept within the grid and its size limits as it would
     * be. Found by trying it on the dialog and putting the dialog back before the browser draws it.
     */
    private fitDialogRect(rect: DialogRect): DialogRect {
        const current = this.getDialogRect();
        this.setDialogRect(rect);
        const fitted = this.getDialogRect();
        this.setDialogRect(current);
        return fitted;
    }

    private getDialogRect(): DialogRect {
        const { positionableFeature } = this.params;
        const { x, y } = positionableFeature.getPosition();
        return { x, y, width: positionableFeature.getWidth()!, height: positionableFeature.getHeight()! };
    }

    private setDialogRect({ x, y, width, height }: DialogRect): void {
        const { positionableFeature } = this.params;
        // move first, so the new size fits, then move again in case the old size held the dialog off
        positionableFeature.offsetElement(x, y);
        if (positionableFeature.isResizable()) {
            positionableFeature.setWidth(width);
            positionableFeature.setHeight(height);
        }
        positionableFeature.offsetElement(x, y);
    }

    /** Draws the ghost once it differs from the dialog, and greys out the steps it can't take. */
    private refreshGhost(): void {
        const { ghost } = this;
        if (!ghost) {
            return;
        }
        const shown = !isSameRect(ghost, this.getDialogRect());
        for (const el of [this.eGhost, this.eGhostOutline]) {
            _setDisplayed(el, shown);
            Object.assign(el.style, {
                left: `${ghost.x}px`,
                top: `${ghost.y}px`,
                width: `${ghost.width}px`,
                height: `${ghost.height}px`,
            });
        }
        for (const { el, x, y, resize } of this.stepButtons) {
            const next = this.getNextGhost(x, y, resize);
            _setAriaDisabled(el, !next || isSameRect(next, ghost));
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
