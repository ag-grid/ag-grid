import { RefSelector } from "./componentAnnotations";
import { Autowired, Context, PostConstruct } from "../context/context";
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

    // NOTE - in time, the styles here will need to go to CSS files
    private static TEMPLATE =
        `<div class="ag-dialog">
            <div eRef="eTopLeftResizer" class="ag-resizer ag-resizer-topLeft"></div>
            <div eRef="eTopResizer" class="ag-resizer ag-resizer-top"></div>
            <div eRef="eTopRightResizer" class="ag-resizer ag-resizer-topRight"></div>
            <div eRef="eRightResizer" class="ag-resizer ag-resizer-right"></div>
            <div eRef="eBottomRightResizer" class="ag-resizer ag-resizer-bottomRight"></div>
            <div eRef="eBottomResizer" class="ag-resizer ag-resizer-bottom"></div>
            <div eRef="eBottomLeftResizer" class="ag-resizer ag-resizer-bottomLeft"></div>
            <div eRef="eLeftResizer" class="ag-resizer ag-resizer-left"></div>
            <div class="ag-dialog-title-bar">
                <span ref="eTitle" class="ag-dialog-title-bar-title"></span>
                <div ref="eTitleBarButtons">
                    <span ref="eClose" class="ag-dialog-button-close"></span>
                </div>
            </div>
            <div ref="eContentWrapper" class="ag-popup-window-content-wrapper"></div>
        </div>`;

    private resizable: ResizableStructure = {};
    private movable = false;
    private closable = true;

    public static DESTROY_EVENT = 'destroy';

    @Autowired('popupService') private popupService: PopupService;

    @RefSelector('eContentWrapper') private eContentWrapper: HTMLElement;
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

        if (!config) { return; }

        const { resizable, movable, closable, title } = config;

        if (resizable) {
            this.setResizable(resizable);
        }

        if (title) {
            this.setTitle(title);
        }

        this.setMovable(!!movable);
        this.setClosable(!!closable);
    }

    @PostConstruct
    protected postConstruct() {
        // need to show filter before positioning, as only after filter
        // is visible can we find out what the width of it is
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
        }

        const eGui = this.getGui();

        _.addOrRemoveCssClass(eGui, 'ag-dialog-movable', movable);
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