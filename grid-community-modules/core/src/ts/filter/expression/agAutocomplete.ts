import { Component } from '../../widgets/component';
import { RefSelector } from '../../widgets/componentAnnotations';
import { Autowired, PostConstruct } from '../../context/context';
import { AgInputTextField } from '../../widgets/agInputTextField';
import { AgAutocompleteList } from './agAutocompleteList';
import { PopupPositionParams, PopupService } from '../../widgets/popupService';
import { KeyCode } from '../../constants/keyCode';
import { AutocompleteParams, AutocompleteListParams } from './autocompleteParams';

export class AgAutocomplete extends Component {
    @Autowired('popupService') private popupService: PopupService;

    @RefSelector('eAutocompleteInput') private eAutocompleteInput: AgInputTextField;

    private isListOpen = false;
    private autocompleteList: AgAutocompleteList | null;
    private hidePopup: () => void;
    private autocompleteListParams: AutocompleteListParams;
    private lastPosition: number = 0;

    constructor(private params?: AutocompleteParams) {
        super(/* html */`
            <div class="ag-autocomplete" role="presentation">
                <ag-input-text-field ref="eAutocompleteInput"></ag-input-text-field>
            </div>`);
    }

    public destroy(): void {
        super.destroy();
        if (this.autocompleteList) {
            this.destroyBean(this.autocompleteList);
        }
    }

    @PostConstruct
    protected init(params?: AutocompleteParams): void {
        this.params = params ?? this.params;
        this.eAutocompleteInput.onValueChange(value => this.onValueChanged(value));
        this.eAutocompleteInput.getInputElement().setAttribute('autocomplete', 'off');

        this.addGuiEventListener('keydown', this.onKeyDown.bind(this));

        this.addGuiEventListener('click', this.onClick.bind(this));
    }

    private onValueChanged(value?: string | null): void {
        const parsedValue = value ?? null;
        this.updateValue(parsedValue);
        this.updateAutocompleteList(parsedValue);
    }

    private updateValue(value: string | null): void {
        this.updateLastPosition();
        this.params!.onValueChanged?.(value);
        this.verifyValue(value);
    }

    private updateAutocompleteList(value: string | null): void {
        const autocompleteListParams = this.params!.listGenerator(value, this.lastPosition);
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
                this.onLeftRightKeyDown(key);
                break;
            case KeyCode.ESCAPE:
                this.onEscapeKeyDown(event);
                break;
            case KeyCode.SPACE:
                if (event.ctrlKey && !this.isListOpen) {
                    event.preventDefault;
                    this.forceOpenList();
                }
                break;
        }
    }

    private confirmSelection(): void {
        const selectedValue = this.autocompleteList?.getSelectedValue();
        if (selectedValue) {
            this.closeList();
            const { updatedValue, updatedPosition } = this.params!.valueUpdater({
                value: this.eAutocompleteInput.getValue()!,
                position: this.lastPosition,
                updateEntry: selectedValue,
                type: this.autocompleteListParams.type
            });
            this.eAutocompleteInput.setValue(updatedValue, true);
            this.setCaret(updatedPosition);
            this.updateValue(updatedValue);
        }
    }
    
    private onTabKeyDown(event: KeyboardEvent): void {
        if (this.isListOpen) {
            event.preventDefault();
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

    private onLeftRightKeyDown(key: string): void {
        // this executes before the caret is moved, so work out the correct position
        const originalPosition = this.lastPosition;
        const value = this.eAutocompleteInput.getValue() ?? null;
        let position = originalPosition ?? 0;
        if (key === KeyCode.LEFT) {
            position -= 1;
        } else if (key === KeyCode.RIGHT) {
            position += 1;
        }
        const length = value?.length ?? 0;
        if (position < 0) {
            position = 0;
        } else if (position > length) {
            position = length;
        }
        this.lastPosition = position;
        this.updateAutocompleteList(value);
    }

    private onEscapeKeyDown(event: KeyboardEvent): void {
        event.preventDefault();
        this.closeList();
        this.setCaret(this.lastPosition);
    }

    private onClick(): void {
        this.updateLastPosition();
        this.updateAutocompleteList(this.eAutocompleteInput.getValue() ?? null);
    }

    private setCaret(position: number): void {
        this.eAutocompleteInput.getFocusableElement().focus();
        this.eAutocompleteInput.getInputElement().setSelectionRange(position, position);
    }

    private forceOpenList(): void {
        this.onValueChanged(this.eAutocompleteInput.getValue());
    }

    private updateLastPosition(): void {
        this.lastPosition = this.eAutocompleteInput.getInputElement().selectionStart ?? 0;
    }

    private verifyValue(value: string | null): void {
        const { valueValidator: valueVerifier } = this.params!;
        if (!valueVerifier) { return; }
        const errorMessage = valueVerifier(value);
        this.eAutocompleteInput.getInputElement().setCustomValidity(errorMessage ?? '');
    }

    private openList(): void {
        this.isListOpen = true;
        this.autocompleteList = this.createBean(new AgAutocompleteList({
            autocompleteEntries: this.autocompleteListParams.entries!,
            onConfirmed: () => this.confirmSelection(),
            onCancelled: () => {
                this.closeList();
                this.setCaret(this.lastPosition);
            }
        }));
        const ePopupGui = this.autocompleteList.getGui();

        const positionParams: PopupPositionParams & { type: string, eventSource: HTMLElement } = {
            ePopup: ePopupGui,
            type: 'autocomplete',
            eventSource: this.getGui(),
            position: 'under',
            alignSide: this.gridOptionsService.is('enableRtl') ? 'right' : 'left',
            keepWithinBounds: true
        };

        const addPopupRes = this.popupService.addPopup({
            eChild: ePopupGui,
            anchorToElement: this.getGui(),
            positionCallback: () => this.popupService.positionPopupByComponent(positionParams),
            ariaLabel: this.params!.ariaLabel
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
        this.params!.onConfirmed(this.eAutocompleteInput.getValue() ?? null);
    }
}
