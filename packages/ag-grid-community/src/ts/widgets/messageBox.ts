import { AgDialog, DialogOptions } from "./agDialog";
import { PostConstruct } from "../context/context";
import { Component } from "./component";
import { RefSelector } from "./componentAnnotations";

interface MessageBoxConfig extends DialogOptions {
    message?: string;
}

export class MessageBox extends AgDialog {

    private message: string;

    constructor(config: MessageBoxConfig) {
        super(config);
        this.message = config.message;
    }

    postConstruct() {
        const messageBodyComp = new MessageBody();
        this.addFeature(this.getContext(), messageBodyComp);

        messageBodyComp.setMessage(this.message);
        this.setBodyComponent(messageBodyComp);

        super.postConstruct();

        this.addDestroyableEventListener(messageBodyComp, 'onBtOk', () => this.close());
    }
}

class MessageBody extends Component {

    private static TEMPLATE =
        `<div class="ag-message-box">
            <div ref="eCenter" class="ag-message-box-content"></div>
            <div ref="eButtons" class="ag-message-box-button-bar">
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