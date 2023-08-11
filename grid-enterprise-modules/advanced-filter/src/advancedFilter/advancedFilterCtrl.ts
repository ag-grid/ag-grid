import {
    AdvancedFilterEnabledChangedEvent,
    Autowired,
    BeanStub,
    CtrlsService,
    Events,
    FocusService,
    IAdvancedFilterCtrl,
    PostConstruct,
    _
} from "@ag-grid-community/core";
import { AdvancedFilterHeaderComp } from "./advancedFilterHeaderComp";
import { AdvancedFilterComp } from "./advancedFilterComp";

export class AdvancedFilterCtrl extends BeanStub implements IAdvancedFilterCtrl {
    @Autowired('focusService') private focusService: FocusService;
    @Autowired('ctrlsService') private ctrlsService: CtrlsService;

    private eAdvancedFilterHeaderComp: AdvancedFilterHeaderComp | undefined;
    private eAdvancedFilterComp: AdvancedFilterComp | undefined;
    private hasAdvancedFilterParent: boolean;

    constructor(private enabled: boolean) {
        super();
    }

    @PostConstruct
    private postConstruct(): void {
        this.hasAdvancedFilterParent = !!this.gridOptionsService.get('advancedFilterParent');

        this.ctrlsService.whenReady(() => this.setAdvancedFilterComp());

        this.addManagedListener(this.eventService, Events.EVENT_ADVANCED_FILTER_ENABLED_CHANGED,
            ({ enabled }: AdvancedFilterEnabledChangedEvent) => this.onEnabledChanged(enabled));

        this.addManagedPropertyListener('advancedFilterParent', () => this.updateComps());

        this.addDestroyFunc(() => this.destroyAdvancedFilterComp());
    }

    public setupHeaderComp(eCompToInsertBefore: HTMLElement): void {
        this.eAdvancedFilterHeaderComp = this.createManagedBean(new AdvancedFilterHeaderComp(this.enabled && !this.hasAdvancedFilterParent));
        eCompToInsertBefore.insertAdjacentElement('beforebegin', this.eAdvancedFilterHeaderComp.getGui());
    }

    public focusHeaderComp(): boolean {
        if (this.eAdvancedFilterHeaderComp) {
            this.eAdvancedFilterHeaderComp.getFocusableElement().focus();
            return true;
        }
        return false;
    }

    public refreshComp(): void {
        this.eAdvancedFilterComp?.refresh();
        this.eAdvancedFilterHeaderComp?.refresh();
    }

    public getHeaderHeight(): number {
        return this.eAdvancedFilterHeaderComp?.getHeight() ?? 0;
    }

    public setInputDisabled(disabled: boolean): void {
        this.eAdvancedFilterComp?.setInputDisabled(disabled);
        this.eAdvancedFilterHeaderComp?.setInputDisabled(disabled);
    }

    private onEnabledChanged(enabled: boolean): void {
        this.enabled = enabled;
        this.updateComps();
    }

    private updateComps(): void {
        this.setAdvancedFilterComp();
        this.setHeaderCompEnabled();
        this.eventService.dispatchEvent({
            type: Events.EVENT_HEADER_HEIGHT_CHANGED
        });
    }

    private setAdvancedFilterComp(): void {
        this.destroyAdvancedFilterComp();
        if (!this.enabled) { return; }

        const advancedFilterParent = this.gridOptionsService.get('advancedFilterParent');
        this.hasAdvancedFilterParent = !!advancedFilterParent;
        if (advancedFilterParent) {
            // unmanaged as can be recreated
            const eAdvancedFilterComp = this.createBean(new AdvancedFilterComp());
            const eAdvancedFilterCompGui = eAdvancedFilterComp.getGui();
            
            const { allThemes } = this.environment.getTheme();
            
            if (allThemes.length) {
                eAdvancedFilterCompGui.classList.add(...allThemes);
            }
            
            eAdvancedFilterCompGui.classList.add(this.gridOptionsService.is('enableRtl') ? 'ag-rtl' : 'ag-ltr');
            
            if (this.focusService.isKeyboardMode()) {
                eAdvancedFilterCompGui.classList.add(FocusService.AG_KEYBOARD_FOCUS);
            }
            
            advancedFilterParent.appendChild(eAdvancedFilterCompGui);

            this.eAdvancedFilterComp = eAdvancedFilterComp;
        }
    }

    private setHeaderCompEnabled(): void {
        this.eAdvancedFilterHeaderComp?.setEnabled(this.enabled && !this.hasAdvancedFilterParent);
    }

    private destroyAdvancedFilterComp(): void {
        if (this.eAdvancedFilterComp) {
            _.removeFromParent(this.eAdvancedFilterComp.getGui());
            this.destroyBean(this.eAdvancedFilterComp);
        }
    }
}
