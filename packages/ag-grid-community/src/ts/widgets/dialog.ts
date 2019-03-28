import { DragService } from "../dragAndDrop/dragService";
import { RefSelector } from "./componentAnnotations";
import { Autowired, PostConstruct } from "../context/context";
import { PopupService } from "./popupService";
import { PopupComponent } from "./popupComponent";
import { _ } from "../utils";

type ResizableSides = 'topLeft' |
                      'top' |
                      'topRight' |
                      'right' |
                      'bottomRight' |
                      'bottom' |
                      'bottomLeft' |
                      'left';

type ResizableStructure = {
    [key in ResizableSides]?: boolean;
};

interface DialogOptions {
    movable?: boolean;
    resizable?: boolean | ResizableStructure;
    closable?: boolean;
    title?: string;
}

export class Dialog extends PopupComponent {

    private static TEMPLATE =
        `<div class="ag-dialog">
            <div ref="eTopLeftResizer" class="ag-resizer ag-resizer-topLeft"></div>
            <div ref="eTopResizer" class="ag-resizer ag-resizer-top"></div>
            <div ref="eTopRightResizer" class="ag-resizer ag-resizer-topRight"></div>
            <div ref="eRightResizer" class="ag-resizer ag-resizer-right"></div>
            <div ref="eBottomRightResizer" class="ag-resizer ag-resizer-bottomRight"></div>
            <div ref="eBottomResizer" class="ag-resizer ag-resizer-bottom"></div>
            <div ref="eBottomLeftResizer" class="ag-resizer ag-resizer-bottomLeft"></div>
            <div ref="eLeftResizer" class="ag-resizer ag-resizer-left"></div>
            <div ref="eTitleBar" class="ag-dialog-title-bar ag-unselectable">
                <span ref="eTitle" class="ag-dialog-title-bar-title"></span>
                <div ref="eTitleBarButtons">
                    <span ref="eClose" class="ag-dialog-button-close"></span>
                </div>
            </div>
            <div ref="eContentWrapper" class="ag-popup-window-content-wrapper"></div>
        </div>`;

    private config: DialogOptions | undefined;
    private resizable: ResizableStructure = {};
    private movable = false;
    private closable = true;
    private isMoving = false;
    private position = {
        x: 0,
        y: 0
    };

    public static DESTROY_EVENT = 'destroy';

    @Autowired('dragService') private dragService: DragService;
    @Autowired('popupService') private popupService: PopupService;

    @RefSelector('eContentWrapper') private eContentWrapper: HTMLElement;
    @RefSelector('eTitleBar') private eTitleBar: HTMLElement;
    @RefSelector('eTitle') private eTitle: HTMLElement;
    @RefSelector('eClose') private eClose: HTMLElement;

    @RefSelector('eTopLeftResizer') private eTopLeftResizer: HTMLElement;
    @RefSelector('eTopResizer') private eTopResizer: HTMLElement;
    @RefSelector('eTopRightResizer') private eTopRightResizer: HTMLElement;
    @RefSelector('eRightResizer') private eRightResizer: HTMLElement;
    @RefSelector('eBottomRightResizer') private eBottomRightResizer: HTMLElement;
    @RefSelector('eBottomResizer') private eBottomResizer: HTMLElement;
    @RefSelector('eBottomLeftResizer') private eBottomLeftResizer: HTMLElement;
    @RefSelector('eLeftResizer') private eLeftResizer: HTMLElement;

    protected close: () => void;

    constructor(config?: DialogOptions) {
        super(Dialog.TEMPLATE);
        this.config = config;
    }

    @PostConstruct
    protected postConstruct() {
        const { resizable, movable, closable, title } = this.config;

        if (resizable) {
            this.setResizable(resizable);
        }

        if (title) {
            this.setTitle(title);
        }

        this.setMovable(!!movable);
        this.setClosable(!!closable);

        this.close = this.popupService.addPopup(
            false,
            this.getGui(),
            false,
            this.destroy.bind(this)
        );

        this.addDestroyableEventListener(this.eClose, 'click', this.onBtClose.bind(this));
    }

    private getResizerElement(side: ResizableSides): HTMLElement | null {
        const map = {
            topLeft: this.eTopLeftResizer,
            top: this.eTopResizer,
            topRight: this.eTopRightResizer,
            right: this.eRightResizer,
            bottomRight: this.eBottomRightResizer,
            bottom: this.eBottomResizer,
            bottomLeft: this.eBottomLeftResizer,
            left: this.eLeftResizer
        };

        return map[side];
    }

    public setResizable(resizable: boolean | ResizableStructure) {
        if (typeof resizable === 'boolean') {
            resizable = {
                topLeft: resizable,
                top: resizable,
                topRight: resizable,
                right: resizable,
                bottomRight: resizable,
                bottom: resizable,
                bottomLeft: resizable,
                left: resizable
            };
        }

        const eGui = this.getGui();

        Object.keys(resizable).forEach(side => {
            const r = resizable as ResizableStructure;
            const s = side as ResizableSides;
            const val = !!r[s];
            const el = this.getResizerElement(s);

            if (!!this.resizable[s] !== val) {
                if (val) {
                    console.log(`add ${s} listeners`);
                } else {
                    console.log(`remove ${s} listeners`);
                }
            }
        });
    }

    public setMovable(movable: boolean) {
        if (movable !== this.movable) {
            this.movable = movable;

            if (movable) {
                this.dragService.addDragSource({
                    eElement: this.eTitleBar,
                    onDragStart: this.onDialogMoveStart.bind(this),
                    onDragging: this.onDialogMove.bind(this),
                    onDragStop: this.onDialogMoveEnd.bind(this)
                });
            }
        }

        const eGui = this.getGui();

        _.addOrRemoveCssClass(eGui, 'ag-dialog-movable', movable);
    }

    onDialogMoveStart() {
        this.isMoving = true;
    }

    onDialogMove(e: MouseEvent) {
        if (!this.isMoving) { return; }
        const { x, y } = this.position;
        const eGui = this.getGui();

        this.popupService.positionPopup({
            ePopup: this.getGui(),
            x: x + e.movementX,
            y: y + e.movementY,
            keepWithinBounds: true
        });

        this.position.x = parseInt(eGui.style.left, 10);
        this.position.y = parseInt(eGui.style.top, 10);
    }

    onDialogMoveEnd() {
        this.isMoving = false;
    }

    public setClosable(closable: boolean) {
        if (closable !== this.closable) {
            this.closable = closable;
        }

        const eGui = this.getGui();

        _.addOrRemoveCssClass(eGui, 'ag-dialog-closable', closable);
    }

    public setBody(eBody: HTMLElement) {
        this.eContentWrapper.appendChild(eBody);
    }

    public setTitle(title: string) {
        this.eTitle.innerText = title;
    }

    // called when user hits the 'x' in the top right
    private onBtClose() {
        this.close();
    }

    public destroy(): void {
        super.destroy();
        this.dispatchEvent({type: Dialog.DESTROY_EVENT});
    }
}