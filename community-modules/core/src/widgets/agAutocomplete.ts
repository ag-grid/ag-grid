import { Component } from "./component";
import { RefSelector } from "./componentAnnotations";
import { Autowired, PostConstruct } from "../context/context";
import { AgInputTextField } from "./agInputTextField";
import { AgAutocompleteList } from "./agAutocompleteList";
import { PopupPositionParams, PopupService } from "./popupService";
import { KeyCode } from "../constants/keyCode";
import { AutocompleteEntry, AutocompleteListParams } from "./autocompleteParams";
import { AgEvent } from "../events";
import { makeNull } from "../utils/generic";

export interface AutocompleteValueChangedEvent extends AgEvent {
    value: string | null;
}

export interface AutocompleteValueConfirmedEvent extends AutocompleteValueChangedEvent {
    isValid: boolean;
}

export interface AutocompleteOptionSelectedEvent extends AutocompleteValueChangedEvent {
    position: number;
    updateEntry: AutocompleteEntry;
    autocompleteType?: string;
}

export interface AutocompleteValidChangedEvent extends AgEvent {
    isValid: boolean;
    validationMessage: string | null;
}

export class AgAutocomplete extends Component {
    public static EVENT_VALUE_CHANGED = 'eventValueChanged';
    public static EVENT_VALUE_CONFIRMED = 'eventValueConfirmed';
    public static EVENT_OPTION_SELECTED = 'eventOptionSelected';
    public static EVENT_VALID_CHANGED = 'eventValidChanged';

    @Autowired('popupService') private popupService: PopupService;

    @RefSelector('eAutocompleteInput') private eAutocompleteInput: AgInputTextField;

    private isListOpen = false;
    private autocompleteList: AgAutocompleteList | null;
    private hidePopup: () => void;
    private autocompleteListParams: AutocompleteListParams;
    private lastPosition: number = 0;
    private valid: boolean = true;
    private validationMessage: string | null;
    private listAriaLabel: string;
    private listGenerator?: (value: string | null, position: number) => AutocompleteListParams;
    private validator?: (value: string | null) => string | null;
    private forceLastSelection?: (lastSelection: AutocompleteEntry, searchString: string) => boolean;

    constructor() {
        super(/* html */`
            <div class="ag-autocomplete" role="presentation">
                <ag-input-text-field ref="eAutocompleteInput"></ag-input-text-field>
            </div>`);
    }

    @PostConstruct
    private postConstruct(): void {
        this.eAutocompleteInput.onValueChange(value => this.onValueChanged(value));
        this.eAutocompleteInput.getInputElement().setAttribute('autocomplete', 'off');

        this.addGuiEventListener('keydown', this.onKeyDown.bind(this));

        this.addGuiEventListener('click', this.updatePositionAndList.bind(this));

        this.addDestroyFunc(() => {
            this.destroyBean(this.autocompleteList);
        });

        this.addGuiEventListener('focusout', () => this.onFocusOut());
    }

    private onValueChanged(value?: string | null): void {
        const parsedValue = makeNull(value);
        this.updateValue(parsedValue);
        this.updateAutocompleteList(parsedValue);
    }

    private updateValue(value: string | null): void {
        this.updateLastPosition();
        this.dispatchEvent<AutocompleteValueChangedEvent>({
            type: AgAutocomplete.EVENT_VALUE_CHANGED,
            value
        });
        this.validate(value);
    }

    private updateAutocompleteList(value: string | null): void {
        const autocompleteListParams = this.listGenerator?.(value, this.lastPosition) ?? { enabled: false };
        if (!autocompleteListParams.type || autocompleteListParams.type !== this.autocompleteListParams?.type) {
            if (this.isListOpen) {
                this.closeList();
            }
        }
        this.autocompleteListParams = autocompleteListParams;
        if (this.autocompleteListParams?.enabled) {
            if (!this.isListOpen) {
               this.openList();
            }
            const { searchString } = this.autocompleteListParams;
            this.autocompleteList!.setSearch(searchString ?? '');
        } else {
            if (this.isListOpen) {
                this.closeList();
            }
        }
    }

    private onKeyDown(event: KeyboardEvent): void {
        const key = event.key;

        this.updateLastPosition();

        switch (key) {
            case KeyCode.ENTER:
                this.onEnterKeyDown(event);
                break;
            case KeyCode.TAB:
                this.onTabKeyDown(event);
                break;
            case KeyCode.DOWN:
            case KeyCode.UP:
                this.onUpDownKeyDown(event, key);
                break;
            case KeyCode.LEFT:
            case KeyCode.RIGHT:
            case KeyCode.PAGE_HOME:
            case KeyCode.PAGE_END:
                // input position is updated after this is called, so do async
                setTimeout(() => {
                    this.updatePositionAndList();
                });
                break;
            case KeyCode.ESCAPE:
                this.onEscapeKeyDown(event);
                break;
            case KeyCode.SPACE:
                if (event.ctrlKey && !this.isListOpen) {
                    event.preventDefault();
                    this.forceOpenList();
                }
                break;
        }
    }

    private confirmSelection(): void {
        const selectedValue = this.autocompleteList?.getSelectedValue();
        if (selectedValue) {
            this.closeList();
            this.dispatchEvent<AutocompleteOptionSelectedEvent>({
                type: AgAutocomplete.EVENT_OPTION_SELECTED,
                value: this.getValue()!,
                position: this.lastPosition,
                updateEntry: selectedValue,
                autocompleteType: this.autocompleteListParams.type
            });
        }
    }
    
    private onTabKeyDown(event: KeyboardEvent): void {
        if (this.isListOpen) {
            event.preventDefault();
            event.stopPropagation();
            this.confirmSelection();
        }    
    }
    
    private onEnterKeyDown(event: KeyboardEvent): void {
        event.preventDefault();
        if (this.isListOpen) {
            this.confirmSelection();
        } else {
            this.onCompleted();
        }
    }

    private onUpDownKeyDown(event: KeyboardEvent, key: string): void {
        event.preventDefault();
        if (!this.isListOpen) {
            this.forceOpenList();
        } else {
            this.autocompleteList?.onNavigationKeyDown(event, key);
        }
    }

    private onEscapeKeyDown(event: KeyboardEvent): void {
        if (this.isListOpen) {
            event.preventDefault();
            event.stopPropagation();
            this.closeList();
            this.setCaret(this.lastPosition, true);
        }
    }

    private onFocusOut(): void {
        if (this.isListOpen) { this.closeList(); }
    }

    private updatePositionAndList(): void {
        this.updateLastPosition();
        this.updateAutocompleteList(this.eAutocompleteInput.getValue() ?? null);
    }

    private setCaret(position: number, setFocus?: boolean): void {
        const eDocument = this.gos.getDocument();
        const activeEl = this.gos.getActiveDomElement();
        if (setFocus && (!activeEl || activeEl === eDocument.body)) {
            // clicking on the list loses focus, so restore
            this.eAutocompleteInput.getFocusableElement().focus();
        }
        const eInput = this.eAutocompleteInput.getInputElement()
        eInput.setSelectionRange(position, position);
        if (position === eInput.value.length) {
            // ensure the caret is visible
            eInput.scrollLeft = eInput.scrollWidth;
        }
    }

    private forceOpenList(): void {
        this.onValueChanged(this.eAutocompleteInput.getValue());
    }

    private updateLastPosition(): void {
        this.lastPosition = this.eAutocompleteInput.getInputElement().selectionStart ?? 0;
    }

    private validate(value: string | null): void {
        if (!this.validator) { return; }
        this.validationMessage = this.validator(value);
        this.eAutocompleteInput.getInputElement().setCustomValidity(this.validationMessage ?? '');
        this.valid = !this.validationMessage;
        this.dispatchEvent<AutocompleteValidChangedEvent>({
            type: AgAutocomplete.EVENT_VALID_CHANGED,
            isValid: this.valid,
            validationMessage: this.validationMessage
        })
    }

    private openList(): void {
        this.isListOpen = true;
        // this is unmanaged as it gets destroyed/created each time it is opened
        this.autocompleteList = this.createBean(new AgAutocompleteList({
            autocompleteEntries: this.autocompleteListParams.entries!,
            onConfirmed: () => this.confirmSelection(),
            forceLastSelection: this.forceLastSelection
        }));
        const ePopupGui = this.autocompleteList.getGui();

        const positionParams: PopupPositionParams & { type: string, eventSource: HTMLElement } = {
            ePopup: ePopupGui,
            type: 'autocomplete',
            eventSource: this.getGui(),
            position: 'under',
            alignSide: this.gos.get('enableRtl') ? 'right' : 'left',
            keepWithinBounds: true
        };

        const addPopupRes = this.popupService.addPopup({
            eChild: ePopupGui,
            anchorToElement: this.getGui(),
            positionCallback: () => this.popupService.positionPopupByComponent(positionParams),
            ariaLabel: this.listAriaLabel
        });
        this.hidePopup = addPopupRes.hideFunc;

        this.autocompleteList.afterGuiAttached();
    }

    private closeList(): void {
        this.isListOpen = false;
        this.hidePopup();
        this.destroyBean(this.autocompleteList);
        this.autocompleteList = null;
    }

    private onCompleted(): void {
        if (this.isListOpen) { this.closeList(); }
        this.dispatchEvent<AutocompleteValueConfirmedEvent>({
            type: AgAutocomplete.EVENT_VALUE_CONFIRMED,
            value: this.getValue(),
            isValid: this.isValid()
        });
    }

    public getValue(): string | null {
        return makeNull(this.eAutocompleteInput.getValue());
    }

    public setInputPlaceholder(placeholder: string): this {
        this.eAutocompleteInput.setInputPlaceholder(placeholder);
        return this;
    }

    public setInputAriaLabel(label?: string | null): this {
        this.eAutocompleteInput.setInputAriaLabel(label);
        return this;
    }

    public setListAriaLabel(label: string): this {
        this.listAriaLabel = label;
        return this;
    }

    public setListGenerator(listGenerator?: (value: string | null, position: number) => AutocompleteListParams): this {
        this.listGenerator = listGenerator;
        return this;
    }

    public setValidator(validator?: (value: string | null) => string | null): this {
        this.validator = validator;
        return this;
    }

    public isValid(): boolean {
        return this.valid;
    }

    public setValue(params: {
        value: string,
        position?: number,
        silent?: boolean,
        updateListOnlyIfOpen?: boolean,
        restoreFocus?: boolean
    }): void {
        const { value, position, silent, updateListOnlyIfOpen, restoreFocus } = params;
        this.eAutocompleteInput.setValue(value, true);
        this.setCaret(position ?? this.lastPosition, restoreFocus);
        if (!silent) {
            this.updateValue(value);
        }
        if (!updateListOnlyIfOpen || this.isListOpen) {
            this.updateAutocompleteList(value);
        }
    }

    public setForceLastSelection(forceLastSelection?: (lastSelection: AutocompleteEntry, searchString: string) => boolean): this {
        this.forceLastSelection = forceLastSelection;
        return this;
    }

    public setInputDisabled(disabled: boolean): this {
        this.eAutocompleteInput.setDisabled(disabled);
        return this;
    }
}
