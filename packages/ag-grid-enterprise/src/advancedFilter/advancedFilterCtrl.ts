import { _getAbsoluteHeight, _getAbsoluteWidth, _initStyledRoot } from 'ag-stack';

import type {
    BeanCollection,
    CtrlsService,
    Environment,
    IAdvancedFilterCtrl,
    IPinnedSectionCompHost,
    PopupService,
} from 'ag-grid-community';
import { BeanStub, _clamp } from 'ag-grid-community';

import { Dialog } from '../widgets/dialog';
import { AdvancedFilterComp } from './advancedFilterComp';
import type { AdvancedFilterExpressionService } from './advancedFilterExpressionService';
import { AdvancedFilterHeaderComp } from './advancedFilterHeaderComp';
import { AdvancedFilterBuilderComp } from './builder/advancedFilterBuilderComp';

type AdvancedFilterCtrlEvent = 'advancedFilterBuilderClosed';
export class AdvancedFilterCtrl extends BeanStub<AdvancedFilterCtrlEvent> implements IAdvancedFilterCtrl {
    private ctrlsSvc: CtrlsService;
    private popupSvc: PopupService;
    private advFilterExpSvc: AdvancedFilterExpressionService;
    private environment: Environment;

    public wireBeans(beans: BeanCollection): void {
        this.ctrlsSvc = beans.ctrlsSvc;
        this.popupSvc = beans.popupSvc!;
        this.advFilterExpSvc = beans.advFilterExpSvc as AdvancedFilterExpressionService;
        this.environment = beans.environment;
    }

    private eHeaderComp: AdvancedFilterHeaderComp | undefined;
    private headerCompHost: IPinnedSectionCompHost | undefined;
    private eFilterComp: AdvancedFilterComp | undefined;
    private disconnectFilterComp: (() => void) | undefined;
    private hasAdvancedFilterParent: boolean;
    private eBuilderComp: AdvancedFilterBuilderComp | undefined;
    private eBuilderDialog: Dialog | undefined;
    private builderDestroySource?: 'api' | 'ui';

    constructor(private enabled: boolean) {
        super();
    }

    public postConstruct(): void {
        this.hasAdvancedFilterParent = !!this.gos.get('advancedFilterParent');

        this.ctrlsSvc.whenReady(this, () => this.setAdvancedFilterComp());

        this.addManagedEventListeners({
            advancedFilterEnabledChanged: ({ enabled }) => this.onEnabledChanged(enabled),
        });

        this.addManagedPropertyListener('advancedFilterParent', () => this.updateComps());
        this.addManagedPropertyListener('advancedFilterBuilderParams', (event) => {
            if (event.currentValue?.suppressFullScreenButton !== event.previousValue?.suppressFullScreenButton) {
                this.eBuilderDialog?.setMaximizable(event.currentValue?.suppressFullScreenButton ?? true);
            }
        });

        this.addDestroyFunc(() => {
            this.destroyFilterComp();
            if (this.eHeaderComp) {
                this.headerCompHost?.unmountComp(this.eHeaderComp.getGui());
                this.destroyBean(this.eHeaderComp);
                this.eHeaderComp = undefined;
                this.headerCompHost = undefined;
            }
            this.destroyBean(this.eBuilderComp);
            if (this.eBuilderDialog?.isAlive()) {
                this.destroyBean(this.eBuilderDialog);
            }
        });
    }

    public mountTopSectionComp(host: IPinnedSectionCompHost): void {
        this.headerCompHost = host;
        this.syncHeaderComp();
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

    public toggleFilterBuilder(params: { source: 'api' | 'ui'; force?: boolean; eventSource?: HTMLElement }): void {
        const { source, force, eventSource } = params;
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

        const { suppressFullScreenButton } = {
            suppressFullScreenButton: false,
            ...this.gos.get('advancedFilterBuilderParams'),
        };

        this.eBuilderComp = this.createBean(new AdvancedFilterBuilderComp());
        this.eBuilderDialog = this.createBean(
            new Dialog({
                title: this.advFilterExpSvc.translate('advancedFilterBuilderTitle'),
                component: this.eBuilderComp,
                width,
                height,
                resizable: true,
                movable: true,
                maximizable: !suppressFullScreenButton,
                centered: true,
                closable: true,
                minWidth,
                afterGuiAttached: () => this.eBuilderComp?.afterGuiAttached(),
                postProcessPopupParams: {
                    type: 'advancedFilterBuilder',
                    eventSource,
                },
            })
        );

        this.dispatchFilterBuilderVisibleChangedEvent(source, true);

        this.eBuilderDialog.addEventListener('destroyed', () => {
            this.destroyBean(this.eBuilderComp);
            this.eBuilderComp = undefined;
            this.eBuilderDialog = undefined;
            this.setInputDisabled(false);
            this.dispatchLocalEvent({
                type: 'advancedFilterBuilderClosed',
            });
            this.dispatchFilterBuilderVisibleChangedEvent(this.builderDestroySource ?? 'ui', false);
            this.builderDestroySource = undefined;
        });
    }

    private dispatchFilterBuilderVisibleChangedEvent(source: 'api' | 'ui', visible: boolean): void {
        this.eventSvc.dispatchEvent({
            type: 'advancedFilterBuilderVisibleChanged',
            source,
            visible,
        });
    }

    private getBuilderDialogSize(): { width: number; height: number; minWidth: number } {
        const minWidth = this.gos.get('advancedFilterBuilderParams')?.minWidth ?? 500;
        const popupParent = this.popupSvc.getPopupParent();
        const maxWidth = Math.round(_getAbsoluteWidth(popupParent)) - 2; // assume 1 pixel border
        const maxHeight = Math.round(_getAbsoluteHeight(popupParent) * 0.75) - 2;

        const width = _clamp(700, minWidth, maxWidth);
        const height = Math.min(600, maxHeight);

        return { width, height, minWidth };
    }

    private onEnabledChanged(enabled: boolean): void {
        this.enabled = enabled;
        this.updateComps();
    }

    private updateComps(): void {
        this.setAdvancedFilterComp();
        this.syncHeaderComp();
        this.eventSvc.dispatchEvent({
            type: 'headerHeightChanged',
        });
    }

    private setAdvancedFilterComp(): void {
        this.destroyFilterComp();
        if (!this.enabled) {
            return;
        }

        const advancedFilterParent = this.gos.get('advancedFilterParent');
        this.hasAdvancedFilterParent = !!advancedFilterParent;
        if (advancedFilterParent) {
            // unmanaged as can be recreated
            const eAdvancedFilterComp = this.createBean(new AdvancedFilterComp());
            const eAdvancedFilterCompGui = eAdvancedFilterComp.getGui();

            this.disconnectFilterComp = _initStyledRoot(this.environment, advancedFilterParent, eAdvancedFilterCompGui);

            this.eFilterComp = eAdvancedFilterComp;
        }
    }

    private syncHeaderComp(): void {
        const headerCompHost = this.headerCompHost;
        if (!headerCompHost) {
            return;
        }

        const shouldShowInPinnedTop = this.enabled && !this.hasAdvancedFilterParent;
        if (!shouldShowInPinnedTop) {
            if (!this.eHeaderComp) {
                return;
            }
            headerCompHost.unmountComp(this.eHeaderComp.getGui());
            this.destroyBean(this.eHeaderComp);
            this.eHeaderComp = undefined;
            return;
        }

        if (!this.eHeaderComp) {
            this.eHeaderComp = this.createManagedBean(new AdvancedFilterHeaderComp(true));
            headerCompHost.mountComp(this.eHeaderComp.getGui());
        }

        this.eHeaderComp.refreshLayout();
    }

    private destroyFilterComp(): void {
        this.disconnectFilterComp?.();
        this.destroyBean(this.eFilterComp);
    }
}
