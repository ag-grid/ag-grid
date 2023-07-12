import { Component } from '../../widgets/component';
import { RefSelector } from '../../widgets/componentAnnotations';
import { Autowired, PostConstruct } from '../../context/context';
import { AgInputTextField } from '../../widgets/agInputTextField';
import { AgAutocompleteList } from './agAutocompleteList';
import { PopupPositionParams, PopupService } from '../../widgets/popupService';
import { exists } from '../../utils/generic';
import { KeyCode } from '../../constants/keyCode';

export interface AutocompleteListParams {
    enabled: boolean;
    type?: string;
    searchString?: string;
    entries?: AutocompleteEntry[];
}

export interface AutocompleteEntry {
    key: string;
    displayValue?: any;
}
export interface AgAutocompleteParams {
    onValueChanged?: (value: string | null) => void;
    valueValidator?: (value: string | null) => string | null;
    listGenerator: (value: string | null, position: number) => AutocompleteListParams;
    onConfirmed: (value: string | null) => void;
    valueUpdater: (value: string | null, position: number, updatedValuePart: string) => { updatedValue: string, updatedPosition: number };
}

export class AgAutocomplete extends Component {
    @Autowired('popupService') private popupService: PopupService;

    @RefSelector('eAutocompleteInput') private eAutocompleteInput: AgInputTextField;

    private isListOpen = false;
    private autocompleteList: AgAutocompleteList | null;
    private hidePopup: () => void;
    private autocompleteListParams: AutocompleteListParams;

    constructor(private params?: AgAutocompleteParams) {
        super(/* html */`
            <div class="ag-floating-filter-input" role="presentation">
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
    protected init(params?: AgAutocompleteParams): void {
        this.params = params ?? this.params;
        this.eAutocompleteInput.onValueChange(value => this.onValueChanged(value));
        this.eAutocompleteInput.getInputElement().setAttribute('autocomplete', 'off');

        this.addGuiEventListener('keydown', this.onKeyDown.bind(this));
    }

    private onValueChanged(value?: string | null): void {
        const parsedValue = value ?? null;
        this.params!.onValueChanged?.(parsedValue);
        this.verifyValue(parsedValue);
        this.updateAutocompleteList(parsedValue, this.eAutocompleteInput.getInputElement().selectionStart ?? 0);
    }

    private updateAutocompleteList(value: string | null, position: number): void {
        const autocompleteListParams = this.params!.listGenerator(value, position);
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
                event.preventDefault();
                this.closeList();
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
            const eInput = this.eAutocompleteInput.getInputElement();
            const { updatedValue, updatedPosition } = this.params!.valueUpdater(
                this.eAutocompleteInput.getValue()!,
                eInput.selectionStart ?? 0,
                selectedValue
            );
            this.eAutocompleteInput.setValue(updatedValue);
            eInput.setSelectionRange(updatedPosition, updatedPosition);
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
        const originalPosition = this.eAutocompleteInput.getInputElement().selectionStart;
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
        this.updateAutocompleteList(value, position);
    }

    private forceOpenList(): void {
        this.onValueChanged(this.eAutocompleteInput.getValue());
    }

    private verifyValue(value: string | null): void {
        const { valueValidator: valueVerifier } = this.params!;
        if (!valueVerifier) { return; }
        const errorMessage = valueVerifier(value);
        this.eAutocompleteInput.getInputElement().setCustomValidity(errorMessage ?? '');
    }

    private openList(): void {
        this.isListOpen = true;
        this.autocompleteList = this.createBean(new AgAutocompleteList(
            this.autocompleteListParams.entries!,
            () => this.confirmSelection()
        ));
        const ePopupGui = this.autocompleteList.getGui();

        const positionParams: PopupPositionParams & { type: string, eventSource: HTMLElement } = {
            ePopup: ePopupGui,
            type: 'autocomplete',
            eventSource: this.getGui(),
            position: 'under',
            alignSide: this.gridOptionsService.is('enableRtl') ? 'right' : 'left',
            keepWithinBounds: true
        };

        const translate = this.localeService.getLocaleTextFunc();

        const addPopupRes = this.popupService.addPopup({
            eChild: ePopupGui,
            closeOnEsc: true,
            closedCallback: () => { 
                // TODO
            },
            anchorToElement: this.getGui(),
            positionCallback: () => this.popupService.positionPopupByComponent(positionParams),
            ariaLabel: translate('ariaLabelAutocomplete', 'Autocomplete')
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
