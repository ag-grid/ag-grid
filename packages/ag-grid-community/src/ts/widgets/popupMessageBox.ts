import { PopupWindow } from "./popupWindow";
import { Autowired, Context, PostConstruct } from "../context/context";
import { Component } from "./component";
import { RefSelector } from "./componentAnnotations";

export class PopupMessageBox extends PopupWindow {

    private readonly title: string;
    private readonly message: string;

    constructor(title: string, message: string) {
        super();
        this.title = title;
        this.message = message;
    }

    @PostConstruct
    protected postConstruct() {
        super.postConstruct();

        this.setTitle(this.title);

        const messageBodyComp = new MessageBody();
        this.addFeature(this.context, messageBodyComp);

        messageBodyComp.setMessage(this.message);
        this.setBody(messageBodyComp.getGui());

        this.addDestroyableEventListener(messageBodyComp, 'onBtOk', () => this.closePopup());
    }
}

class MessageBody extends Component {

    private static TEMPLATE =
        `<div>
            <div ref="eCenter"></div>
            <div ref="eButtons">
                <button (click)="onBtOk">OK</button>
            </div>
        </div>`;

    @Autowired('context') private context: Context;

    @RefSelector('eCenter') private eCenter: HTMLElement;

    constructor() {
        super(MessageBody.TEMPLATE);
    }

    public setMessage(message: string): void {
        this.eCenter.innerText = message;
    }

    @PostConstruct
    private postConstruct(): void {
        this.instantiate(this.context);
    }

    private onBtOk() {
        this.dispatchEvent({type: 'onBtOk'});
    }

}