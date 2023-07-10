import { Component } from '../../widgets/component';
import { RefSelector } from '../../widgets/componentAnnotations';
import { Autowired, PostConstruct } from '../../context/context';
import { AgInputTextField } from '../../widgets/agInputTextField';
import { AgAutocompleteList } from './agAutocompleteList';
import { PopupPositionParams, PopupService } from '../../widgets/popupService';
import { exists } from '../../utils/generic';

export interface AutocompleteListParams {
    enabled: boolean;
    type?: string;
    entries?: AutocompleteEntry[];
}

export interface AutocompleteEntry {
    key: string;
    displayValue?: any;
}
export interface AgAutocompleteParams {
    listGenerator: (value: string | null | undefined, position: number) => AutocompleteListParams;
}

export class AgAutocomplete extends Component {
    @Autowired('popupService') private popupService: PopupService;

    @RefSelector('eAutocompleteInput') private eAutocompleteInput: AgInputTextField;

    private isListOpen = false;
    private shouldDisplayList = false;
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
    protected init(): void {
        this.eAutocompleteInput.onValueChange(value => this.onValueChanged(value));
    }

    private onValueChanged(value?: string | null): void {
        const position = this.eAutocompleteInput.getInputElement().selectionStart;
        const autocompleteListParams = this.params!.listGenerator(value, position ?? 0);
        if (!autocompleteListParams.type || autocompleteListParams.type !== this.autocompleteListParams?.type) {
            this.autocompleteListParams = autocompleteListParams;
            this.autocompleteList?.updateList(autocompleteListParams);
        }
        this.identifySubValue(value);
        if (this.shouldDisplayList) {
            if (!this.isListOpen) {
               this.openList();
            }
            if (exists(value)) {
                this.autocompleteList!.setSearch(value);
            }
        } else {
            if (this.isListOpen) {
                this.closeList();
            }
        }
    }

    private identifySubValue(value?: string | null): void {
        if (exists(value)) {
            this.shouldDisplayList = true;
        } else {
            this.shouldDisplayList = false;
        }
    }

    private openList(): void {
        this.isListOpen = true;
        this.autocompleteList = this.createBean(new AgAutocompleteList(this.autocompleteListParams.entries!));
        const ePopupGui = this.autocompleteList.getGui();

        const positionParams: PopupPositionParams & { type: string, eventSource: HTMLElement } = {
            ePopup: ePopupGui,
            type: 'autocomplete',
            eventSource: this.getGui(),
            position: 'under',
            alignSide: this.gridOptionsService.is('enableRtl') ? 'right' : 'left',
            keepWithinBounds: true
        };

        const positionCallback = this.popupService.positionPopupByComponent.bind(this.popupService, positionParams)

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
}
