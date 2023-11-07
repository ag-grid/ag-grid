import {
    AdvancedFilterBuilderVisibleChangedEvent,
    AdvancedFilterEnabledChangedEvent,
    AgDialog,
    Autowired,
    BeanStub,
    CtrlsService,
    Events,
    FocusService,
    IAdvancedFilterCtrl,
    PopupService,
    PostConstruct,
    WithoutGridCommon,
    _
} from "@ag-grid-community/core";
import { AdvancedFilterHeaderComp } from "./advancedFilterHeaderComp";
import { AdvancedFilterComp } from "./advancedFilterComp";
import { AdvancedFilterBuilderComp } from "./builder/advancedFilterBuilderComp";
import { AdvancedFilterExpressionService } from "./advancedFilterExpressionService";

export class AdvancedFilterCtrl extends BeanStub implements IAdvancedFilterCtrl {
    @Autowired('focusService') private focusService: FocusService;
    @Autowired('ctrlsService') private ctrlsService: CtrlsService;
    @Autowired('popupService') private popupService: PopupService;
    @Autowired('advancedFilterExpressionService') private advancedFilterExpressionService: AdvancedFilterExpressionService;

    public static readonly EVENT_BUILDER_CLOSED = 'advancedFilterBuilderClosed';

    private eHeaderComp: AdvancedFilterHeaderComp | undefined;
    private eFilterComp: AdvancedFilterComp | undefined;
    private hasAdvancedFilterParent: boolean;
    private eBuilderComp: AdvancedFilterBuilderComp | undefined;
    private eBuilderDialog: AgDialog | undefined;
    private builderDestroySource?: 'api' | 'ui';

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

        this.addDestroyFunc(() => {
            this.destroyAdvancedFilterComp();
            this.destroyBean(this.eBuilderComp);
            if (this.eBuilderDialog && this.eBuilderDialog.isAlive()) {
                this.destroyBean(this.eBuilderDialog);
            }
        });
    }

    public setupHeaderComp(eCompToInsertBefore: HTMLElement): void {
        this.eHeaderComp = this.createManagedBean(new AdvancedFilterHeaderComp(this.enabled && !this.hasAdvancedFilterParent));
        eCompToInsertBefore.insertAdjacentElement('beforebegin', this.eHeaderComp.getGui());
    }

    public focusHeaderComp(): boolean {
        if (this.eHeaderComp) {
            this.eHeaderComp.getFocusableElement().focus();
            return true;
        }
        return false;
    }

    public refreshComp(): void {
        this.eFilterComp?.refresh();
        this.eHeaderComp?.refresh();
    }

    public refreshBuilderComp(): void {
        this.eBuilderComp?.refresh();
    }

    public getHeaderHeight(): number {
        return this.eHeaderComp?.getHeight() ?? 0;
    }

    public setInputDisabled(disabled: boolean): void {
        this.eFilterComp?.setInputDisabled(disabled);
        this.eHeaderComp?.setInputDisabled(disabled);
    }

    public toggleFilterBuilder(source: 'api' | 'ui', force?: boolean): void {
        if ((force && this.eBuilderDialog) || (force === false && !this.eBuilderDialog)) {
            // state requested is already active
            return;
        }
        if (this.eBuilderDialog) {
            this.builderDestroySource = source;
            this.destroyBean(this.eBuilderDialog);
            return;
        }

        this.setInputDisabled(true);

        const { width, height, minWidth } = this.getBuilderDialogSize();

        this.eBuilderComp = this.createBean(new AdvancedFilterBuilderComp());
        this.eBuilderDialog = this.createBean(new AgDialog({
            title: this.advancedFilterExpressionService.translate('advancedFilterBuilderTitle'),
            component: this.eBuilderComp,
            width,
            height,
            resizable: true,
            movable: true,
            maximizable: true,
            centered: true,
            closable: true,
            minWidth,
            afterGuiAttached: () => this.eBuilderComp?.afterGuiAttached()
        }));

        this.dispatchFilterBuilderVisibleChangedEvent(source, true);

        this.eBuilderDialog.addEventListener(AgDialog.EVENT_DESTROYED, () => {
            this.destroyBean(this.eBuilderComp);
            this.eBuilderComp = undefined;
            this.eBuilderDialog = undefined;
            this.setInputDisabled(false);
            this.dispatchEvent({
                type: AdvancedFilterCtrl.EVENT_BUILDER_CLOSED
            });
            this.dispatchFilterBuilderVisibleChangedEvent(this.builderDestroySource ?? 'ui', false);
            this.builderDestroySource = undefined;
        });
    }

    private dispatchFilterBuilderVisibleChangedEvent(source: 'api' | 'ui', visible: boolean): void {
        const event: WithoutGridCommon<AdvancedFilterBuilderVisibleChangedEvent> = {
            type: Events.EVENT_ADVANCED_FILTER_BUILDER_VISIBLE_CHANGED,
            source,
            visible
        };
        this.eventService.dispatchEvent(event);
    }

    private getBuilderDialogSize(): { width: number, height: number, minWidth: number } {
        const minWidth = this.gridOptionsService.get('advancedFilterBuilderParams')?.minWidth ?? 500;
        const popupParent = this.popupService.getPopupParent();
        const maxWidth = Math.round(_.getAbsoluteWidth(popupParent)) - 2; // assume 1 pixel border
        const maxHeight = Math.round(_.getAbsoluteHeight(popupParent) * 0.75) - 2;

        const width = Math.min(Math.max(600, minWidth), maxWidth);
        const height = Math.min(600, maxHeight);

        return { width, height, minWidth };
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
            
            eAdvancedFilterCompGui.classList.add(this.gridOptionsService.get('enableRtl') ? 'ag-rtl' : 'ag-ltr');

            advancedFilterParent.appendChild(eAdvancedFilterCompGui);

            this.eFilterComp = eAdvancedFilterComp;
        }
    }

    private setHeaderCompEnabled(): void {
        this.eHeaderComp?.setEnabled(this.enabled && !this.hasAdvancedFilterParent);
    }

    private destroyAdvancedFilterComp(): void {
        if (this.eFilterComp) {
            _.removeFromParent(this.eFilterComp.getGui());
            this.destroyBean(this.eFilterComp);
        }
    }
}
