import {
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

    public toggleFilterBuilder(): void {
        if (this.eBuilderDialog) {
            this.destroyBean(this.eBuilderDialog);
            return;
        }

        this.setInputDisabled(true);

        const { width, height } = this.getBuilderDialogSize();

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
            minWidth: this.gridOptionsService.get('advancedFilterParams')?.builderMinWidth ?? 500,
            afterGuiAttached: () => this.eBuilderComp?.afterGuiAttached()
        }));

        this.eBuilderDialog.addEventListener(AgDialog.EVENT_DESTROYED, () => {
            this.destroyBean(this.eBuilderComp);
            this.eBuilderComp = undefined;
            this.eBuilderDialog = undefined;
            this.setInputDisabled(false);
            this.dispatchEvent({
                type: AdvancedFilterCtrl.EVENT_BUILDER_CLOSED
            });
        });
    }

    private getBuilderDialogSize(): { width: number, height: number; } {
        const popupParent = this.popupService.getPopupParent();
        const maxWidth = Math.round(_.getAbsoluteWidth(popupParent));
        const maxHeight = Math.round(_.getAbsoluteHeight(popupParent) * 0.75);

        const width = Math.min(600, maxWidth);
        const height = Math.min(600, maxHeight);

        return { width, height };
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
            const gridCtrl = this.ctrlsService.getGridCtrl();
            eAdvancedFilterComp.addManagedListener(
                gridCtrl,
                Events.EVENT_KEYBOARD_FOCUS,
                () => eAdvancedFilterCompGui.classList.add(FocusService.AG_KEYBOARD_FOCUS)
            );
            eAdvancedFilterComp.addManagedListener(
                gridCtrl,
                Events.EVENT_MOUSE_FOCUS,
                () => eAdvancedFilterCompGui.classList.remove(FocusService.AG_KEYBOARD_FOCUS)
            );

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
