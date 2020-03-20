import { AgCheckbox } from './agCheckbox';
import { Events } from '../eventKeys';
import { CheckboxChangedEvent } from '../events';

export class AgRadioButton extends AgCheckbox {
    protected className = 'ag-radio-button';
    protected inputType = 'radio';

    protected isSelected(): boolean {
        return this.eInput.checked;
    }

    public toggle(): void {
        const nextValue = this.getNextValue();
        this.setValue(nextValue);
    }

    protected addInputListeners() {
        super.addInputListeners();

        this.addDestroyableEventListener(this.eventService, Events.EVENT_CHECKBOX_CHANGED, this.onChange.bind(this));
    }

    private onChange(event: CheckboxChangedEvent) {
        if (event.selected &&
            event.name &&
            this.eInput.name &&
            this.eInput.name === event.name &&
            event.id &&
            this.eInput.id !== event.id) {
            this.setValue(false, true);
        }
    }
}
