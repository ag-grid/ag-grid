import { DragListenerParams } from "../dragAndDrop/dragService";
import { Autowired } from "../context/context";
import { PopupService } from "./popupService";
import { Maximizable } from "../rendering/mixins/maximizable";
import { Resizable, ResizableStructure } from "../rendering/mixins/resizable";
import { Movable } from "../rendering/mixins/movable";
import { PanelOptions, AgPanel } from "./agPanel";
import { _ } from "../utils";

export interface DialogOptions extends PanelOptions {
    eWrapper?: HTMLElement;
    modal?: boolean;
    alwaysOnTop?: boolean;
    movable?: boolean;
    resizable?: boolean | ResizableStructure;
    maximizable?: boolean;
    x?: number;
    y?: number;
    centered?: boolean;
}

export class AgDialog extends Resizable(Maximizable(Movable(AgPanel))) {

    moveElement: HTMLElement;
    moveElementDragListener: DragListenerParams;

    config: DialogOptions | undefined;

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
    renderComponent() {
        const eGui = this.getGui();
        const { alwaysOnTop, modal } = this.config;

        this.close = this.popupService.addPopup(
            modal,
            eGui,
            true,
            this.destroy.bind(this),
            undefined,
            alwaysOnTop
        );

        eGui.focus();
    }
}