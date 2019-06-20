import { Component } from "./component";
import { PostConstruct } from "../context/context";
import { RefSelector } from "./componentAnnotations";
import { AgInputTextField } from "./agInputTextField";
import { _ } from "../utils";

type ColorMode = 'hex' | 'hsl' | 'rgba';
interface ColorPickerConfig {
    hideTextField?: boolean;
    color: string;
    mode: ColorMode;
};

export class AgColorPicker extends Component {
    private static TEMPLATE =
        `<div class="ag-color-picker">
            <div class="ag-color-button" ref="eButton"></div>
            <ag-input-text-field ref="eInput"></ag-input-text-field>
        </div>`;

        @RefSelector('eButton') private eButton: HTMLElement;
        @RefSelector('eInput') private eInput: AgInputTextField;

        private hideTextField: boolean = false;
        private mode: ColorMode = 'hex';
        private color: string;

        constructor(config?: ColorPickerConfig) {
            super(AgColorPicker.TEMPLATE);

            if (config) {
                if (config.hideTextField) { this.hideTextField = config.hideTextField; }
                if (config.mode && config.mode !== 'hex') { this.mode = config.mode; }
                if (config.color) { this.color = config.color; }
            }
        }

        @PostConstruct
        private postConstruct() {
            this.setHideTextField(this.hideTextField);
            if (this.color) {
                this.setValue(this.color);
            }
            this.addDestroyableEventListener(this.eInput.getInputElement(), 'blur', () => {
                this.setValue(this.eInput.getValue());
            });
        }

        private setHideTextField(hide: boolean) {
            _.addOrRemoveCssClass(this.eInput.getGui(), 'ag-hidden', hide);
        }

        public toggleInputVisibility(visible?: boolean) {
            visible = visible != null ? visible : this.hideTextField;

            this.setHideTextField(!visible);
        }

        public getInputElement(): HTMLInputElement {
            return this.eInput.getInputElement();
        }

        public getValue(): string {
            return this.color;
        }

        public setValue(color: string) {
            this.color = color;
            this.eButton.style.backgroundColor = color;
            this.eInput.setValue(this.color);
            this.dispatchEvent({ type: 'valueChange' });
        }
}