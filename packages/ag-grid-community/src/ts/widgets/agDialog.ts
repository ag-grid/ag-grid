import { DragListenerParams } from "../dragAndDrop/dragService";
import { Autowired } from "../context/context";
import { PopupService } from "./popupService";
import { Maximizable, IMaximizable } from "../rendering/mixins/maximizable";
import { Resizable, ResizableStructure, IResizable } from "../rendering/mixins/resizable";
import { Movable, IMovable } from "../rendering/mixins/movable";
import { PanelOptions, AgPanel } from "./agPanel";
import { _ } from "../utils";

export interface DialogOptions extends PanelOptions {
    eWrapper?: HTMLElement;
    alwaysOnTop?: boolean;
    movable?: boolean;
    resizable?: boolean | ResizableStructure;
    maximizable?: boolean;
    x?: number;
    y?: number;
    centered?: boolean;
}

@Resizable
@Movable
@Maximizable
export class AgDialog extends AgPanel implements IMovable, IResizable, IMaximizable {

    protected config: DialogOptions | undefined;
    protected popupParent: HTMLElement;
    protected moveElement: HTMLElement;
    protected moveElementDragListener: DragListenerParams;

    @Autowired('popupService') popupService: PopupService;

    constructor(config?: DialogOptions) {
        super(config);
    }

    postConstruct() {
        const eGui = this.getGui();

        _.addCssClass(eGui, 'ag-dialog');
        this.moveElement = this.eTitleBar;

        super.postConstruct();

        this.addDestroyableEventListener(eGui, 'focusin', (e: FocusEvent) => {
            if (eGui.contains(e.relatedTarget as HTMLElement)) { return; }
            this.popupService.bringPopupToFront(eGui);
        });
    }

    //  used by the Positionable Mixin
    protected renderComponent() {
        const eGui = this.getGui();
        const { alwaysOnTop } = this.config;

        this.close = this.popupService.addPopup(
            false,
            eGui,
            true,
            this.destroy.bind(this),
            undefined,
            alwaysOnTop
        );

        eGui.focus();
    }
}