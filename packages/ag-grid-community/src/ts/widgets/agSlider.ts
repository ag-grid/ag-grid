import {RefSelector} from "./componentAnnotations";
import {Component} from "./component";

export class AgSlider extends Component {
    private static TEMPLATE =
        `<div>                        
            <input type="range" ref="eSlider">         
            <input type="number" ref="eInput" />
        </div>`;

    @RefSelector('eLabel') protected eLabel: HTMLElement;
    @RefSelector('eSlider') private eSlider: HTMLInputElement;
    @RefSelector('eInput') private eInput: HTMLInputElement;

    constructor() {
        super(AgSlider.TEMPLATE);
    }

    public onInputChange(callbackFn: (newValue: number) => void) {
        this.addDestroyableEventListener(this.eInput, 'input', () => {
            const newVal = parseInt(this.eInput.value, 10);
            this.eSlider.value = this.eInput.value;
            callbackFn(newVal);
        });

        this.addDestroyableEventListener(this.eSlider, 'input', () => {
            const newVal = parseInt(this.eSlider.value, 10);
            this.eInput.value = this.eSlider.value;
            callbackFn(newVal);
        });

        return this;
    }

    public setLabel(label: string): this {
        return this;
    }

    public setValue(value: string): this {
        if (this.eInput.value === value) {
            return this;
        }

        this.eInput.value = value;
        this.eSlider.value = value;

        return this;
    }
}