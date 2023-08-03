import {
    AdvancedFilterEnabledChangedEvent,
    Autowired,
    ColumnModel,
    Component,
    Events,
    FilterManager,
    FocusService,
    KeyCode,
    PostConstruct,
    RefSelector,
    _
} from "@ag-grid-community/core";
import { AdvancedFilterComp } from "./advancedFilterComp";

export class AdvancedFilterHeaderComp extends Component {
    @RefSelector('eAdvancedFilterHeader') private eAdvancedFilterHeader: HTMLElement;
    @Autowired('filterManager') private filterManager: FilterManager;
    @Autowired('columnModel') private columnModel: ColumnModel;
    @Autowired('focusService') private focusService: FocusService;

    private eAdvancedFilter: AdvancedFilterComp | undefined;
    private enabled = false;

    constructor() {
        super(/* html */ `
            <div class="ag-advanced-filter-header" role="presentation" ref="eAdvancedFilterHeader" tabindex="-1">
            </div>`);
    }

    @PostConstruct
    private postConstruct(): void {
        _.setDisplayed(this.eAdvancedFilterHeader, false);
        this.setupAdvancedFilter(this.filterManager.isAdvancedFilterEnabled());

        this.addDestroyFunc(() => this.destroyBean(this.eAdvancedFilter));

        this.addManagedListener(this.eventService, Events.EVENT_ADVANCED_FILTER_ENABLED_CHANGED,
            ({ enabled }: AdvancedFilterEnabledChangedEvent) => this.setupAdvancedFilter(enabled));

        this.addGuiEventListener('keydown', (event: KeyboardEvent) => this.onKeyDown(event));

        this.addGuiEventListener('focusout', (event: FocusEvent) => {
            if (!this.getFocusableElement().contains(event.relatedTarget as HTMLElement)) {
                this.focusService.clearAdvancedFilterColumn();
            }
        });
    }

    private setupAdvancedFilter(enabled: boolean): void {
        if (enabled === this.enabled) { return; }
        if (enabled) {
            // unmanaged as can be recreated
            this.eAdvancedFilter = this.createBean(new AdvancedFilterComp());
            const eGui = this.eAdvancedFilter.getGui();
            
            const height = `${this.columnModel.getFloatingFiltersHeight()}px`;
            this.getGui().style.height = height;
            this.getGui().style.minHeight = height;

            this.eAdvancedFilterHeader.appendChild(eGui);
        } else {
            _.clearElement(this.eAdvancedFilterHeader);
            this.destroyBean(this.eAdvancedFilter)
        }
        _.setDisplayed(this.eAdvancedFilterHeader, enabled);
        this.enabled = enabled;
    }

    private onKeyDown(event: KeyboardEvent): void {
        switch (event.key) {
            case KeyCode.ENTER: {
                if (this.hasFocus()) {
                    if (this.focusService.focusInto(this.getFocusableElement())) {
                        event.preventDefault();
                    }
                }
                break;
            }
            case KeyCode.ESCAPE:
                if (!this.hasFocus()) {
                    this.getFocusableElement().focus();
                }
                break;
            case KeyCode.UP:
                this.navigateUpDown(true, event);
                break;
            case KeyCode.DOWN:
                this.navigateUpDown(false, event);
                break;
            case KeyCode.TAB:
                if (this.hasFocus()) {
                    this.navigateLeftRight(event);
                } else {
                    const nextFocusableEl = this.focusService.findNextFocusableElement(this.getFocusableElement(), null, event.shiftKey);
                    if (nextFocusableEl) {
                        event.preventDefault();
                        nextFocusableEl.focus();
                    } else {
                        this.navigateLeftRight(event);
                    }
                }
                break;
        }
    }

    private navigateUpDown(backwards: boolean, event: KeyboardEvent): void {
        if (this.hasFocus()) {
            if (this.focusService.focusNextFromAdvancedFilter(backwards)) {
                event.preventDefault();
            };
        }
    }

    private navigateLeftRight(event: KeyboardEvent): void {
        if (event.shiftKey
            ? this.focusService.focusLastHeader()
            : this.focusService.focusNextFromAdvancedFilter(false, true)) {
            event.preventDefault();
        }
    }

    private hasFocus(): boolean {
        const eDocument = this.gridOptionsService.getDocument();
        return eDocument.activeElement === this.getFocusableElement();
    }
}
