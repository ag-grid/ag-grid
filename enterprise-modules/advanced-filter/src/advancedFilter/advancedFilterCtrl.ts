import type {
    AdvancedFilterBuilderVisibleChangedEvent,
    AdvancedFilterEnabledChangedEvent,
    CtrlsService,
    IAdvancedFilterCtrl,
    PopupService,
    WithoutGridCommon,
} from '@ag-grid-community/core';
import {
    Autowired,
    BeanStub,
    Events,
    _getAbsoluteHeight,
    _getAbsoluteWidth,
    _removeFromParent,
} from '@ag-grid-community/core';
import { AgDialog } from '@ag-grid-enterprise/core';

import { AdvancedFilterComp } from './advancedFilterComp';
import type { AdvancedFilterExpressionService } from './advancedFilterExpressionService';
import { AdvancedFilterHeaderComp } from './advancedFilterHeaderComp';
import { AdvancedFilterBuilderComp } from './builder/advancedFilterBuilderComp';

export class AdvancedFilterCtrl extends BeanStub implements IAdvancedFilterCtrl {
    @Autowired('ctrlsService') private ctrlsService: CtrlsService;
    @Autowired('popupService') private popupService: PopupService;
    @Autowired('advancedFilterExpressionService')
    private advancedFilterExpressionService: AdvancedFilterExpressionService;

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

    public postConstruct(): void {
        this.hasAdvancedFilterParent = !!this.gos.get('advancedFilterParent');

        this.ctrlsService.whenReady(() => this.setAdvancedFilterComp());

        this.addManagedListener(
            this.eventService,
            Events.EVENT_ADVANCED_FILTER_ENABLED_CHANGED,
            ({ enabled }: AdvancedFilterEnabledChangedEvent) => this.onEnabledChanged(enabled)
        );

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
        this.eHeaderComp = this.createManagedBean(
            new AdvancedFilterHeaderComp(this.enabled && !this.hasAdvancedFilterParent)
        );
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
        this.eBuilderDialog = this.createBean(
            new AgDialog({
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
                afterGuiAttached: () => this.eBuilderComp?.afterGuiAttached(),
            })
        );

        this.dispatchFilterBuilderVisibleChangedEvent(source, true);

        this.eBuilderDialog.addEventListener(AgDialog.EVENT_DESTROYED, () => {
            this.destroyBean(this.eBuilderComp);
            this.eBuilderComp = undefined;
            this.eBuilderDialog = undefined;
            this.setInputDisabled(false);
            this.dispatchEvent({
                type: AdvancedFilterCtrl.EVENT_BUILDER_CLOSED,
            });
            this.dispatchFilterBuilderVisibleChangedEvent(this.builderDestroySource ?? 'ui', false);
            this.builderDestroySource = undefined;
        });
    }

    private dispatchFilterBuilderVisibleChangedEvent(source: 'api' | 'ui', visible: boolean): void {
        const event: WithoutGridCommon<AdvancedFilterBuilderVisibleChangedEvent> = {
            type: Events.EVENT_ADVANCED_FILTER_BUILDER_VISIBLE_CHANGED,
            source,
            visible,
        };
        this.eventService.dispatchEvent(event);
    }

    private getBuilderDialogSize(): { width: number; height: number; minWidth: number } {
        const minWidth = this.gos.get('advancedFilterBuilderParams')?.minWidth ?? 500;
        const popupParent = this.popupService.getPopupParent();
        const maxWidth = Math.round(_getAbsoluteWidth(popupParent)) - 2; // assume 1 pixel border
        const maxHeight = Math.round(_getAbsoluteHeight(popupParent) * 0.75) - 2;

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
            type: Events.EVENT_HEADER_HEIGHT_CHANGED,
        });
    }

    private setAdvancedFilterComp(): void {
        this.destroyAdvancedFilterComp();
        if (!this.enabled) {
            return;
        }

        const advancedFilterParent = this.gos.get('advancedFilterParent');
        this.hasAdvancedFilterParent = !!advancedFilterParent;
        if (advancedFilterParent) {
            // unmanaged as can be recreated
            const eAdvancedFilterComp = this.createBean(new AdvancedFilterComp());
            const eAdvancedFilterCompGui = eAdvancedFilterComp.getGui();

            this.environment.applyThemeClasses(eAdvancedFilterCompGui);

            eAdvancedFilterCompGui.classList.add(this.gos.get('enableRtl') ? 'ag-rtl' : 'ag-ltr');

            advancedFilterParent.appendChild(eAdvancedFilterCompGui);

            this.eFilterComp = eAdvancedFilterComp;
        }
    }

    private setHeaderCompEnabled(): void {
        this.eHeaderComp?.setEnabled(this.enabled && !this.hasAdvancedFilterParent);
    }

    private destroyAdvancedFilterComp(): void {
        if (this.eFilterComp) {
            _removeFromParent(this.eFilterComp.getGui());
            this.destroyBean(this.eFilterComp);
        }
    }
}
