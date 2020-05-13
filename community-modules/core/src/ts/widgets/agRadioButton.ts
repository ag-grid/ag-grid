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

        this.addManagedListener(this.eventService, Events.EVENT_CHECKBOX_CHANGED, this.onChange.bind(this));
    }

    /**
     * This ensures that if another radio button in the same named group is selected, we deselect this radio button.
     * By default the browser does this for you, but we are managing classes ourselves in order to ensure input
     * elements are styled correctly in IE11, and the DOM 'changed' event is only fired when a button is selected,
     * not deselected, so we need to use our own event.
     */
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
