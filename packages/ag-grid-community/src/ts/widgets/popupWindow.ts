import { Component } from "./component";
import { RefSelector } from "./componentAnnotations";
import { Autowired, Context, PostConstruct } from "../context/context";
import { PopupService } from "./popupService";

export class PopupWindow extends Component {

    // NOTE - in time, the styles here will need to go to CSS files
    private static TEMPLATE =
        `<div class="ag-popup-window" style="top: 40px; left: 40px; border: 1px solid black; position: fixed; background-color: white;">
            <div class="ag-popup-window-title-bar" style="background: #00e5ff; border-bottom: 1px solid black;">
                <span ref="eClose" class="ag-popup-window-close" style="margin: 2px; border: 1px solid grey; border-radius: 2px;">X</span>
                <span ref="eTitle" class="ag-popup-window-title" style="padding: 2px;">New Chart</span>
            </div>
            <div ref="eContentWrapper" class="ag-popup-window-content-wrapper"></div>
        </div>`;

    public static DESTROY_EVENT = 'destroy';

    @Autowired('popupService') private popupService: PopupService;

    @RefSelector('eContentWrapper') private eContentWrapper: HTMLElement;
    @RefSelector('eTitle') private eTitle: HTMLElement;
    @RefSelector('eClose') private eClose: HTMLElement;

    protected closePopup: () => void;

    constructor() {
        super(PopupWindow.TEMPLATE);
    }

    @PostConstruct
    protected postConstruct() {
        // need to show filter before positioning, as only after filter
        // is visible can we find out what the width of it is
        this.closePopup = this.popupService.addPopup(
            false,
            this.getGui(),
            false,
            this.destroy.bind(this)
        );

        this.addDestroyableEventListener(this.eClose, 'click', this.onBtClose.bind(this));
    }

    public setBody(eBody: HTMLElement) {
        this.eContentWrapper.appendChild(eBody);
    }

    public setTitle(title: string) {
        this.eTitle.innerText = title;
    }

    // called when user hits the 'x' in the top right
    private onBtClose() {
        this.closePopup();
    }

    public destroy(): void {
        super.destroy();
        this.dispatchEvent({type: PopupWindow.DESTROY_EVENT});
    }
}