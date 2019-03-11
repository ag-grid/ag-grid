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

    protected postConstruct() {
        super.postConstruct();

        this.setTitle(this.title);

        const messageBodyComp = new MessageBody();
        this.addFeature(this.getContext(), messageBodyComp);

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
                <button ref="eOk">OK</button>
            </div>
        </div>`;

    @RefSelector('eCenter') private eCenter: HTMLElement;
    @RefSelector('eOk') private eOk: HTMLElement;

    constructor() {
        super(MessageBody.TEMPLATE);
    }

    public setMessage(message: string): void {
        this.eCenter.innerText = message;
    }

    @PostConstruct
    private postConstruct(): void {
        this.addDestroyableEventListener(this.eOk, 'click', this.onBtOk.bind(this));
    }

    private onBtOk() {
        this.dispatchEvent({type: 'onBtOk'});
    }

}