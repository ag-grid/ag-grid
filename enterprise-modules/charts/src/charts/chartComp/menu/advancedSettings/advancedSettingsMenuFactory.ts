import type { BeanCollection, FocusService, NamedBean } from '@ag-grid-community/core';
import { BeanStub, TabGuardComp } from '@ag-grid-community/core';
import { AgDialog } from '@ag-grid-enterprise/core';

import type { ChartTranslationService } from '../../services/chartTranslationService';
import type { ChartMenuContext } from '../chartMenuContext';
import { AdvancedSettingsPanel } from './advancedSettingsPanel';

export class AdvancedSettingsMenuFactory extends BeanStub implements NamedBean {
    beanName = 'advancedSettingsMenuFactory' as const;

    private focusService: FocusService;
    private chartTranslationService: ChartTranslationService;

    public wireBeans(beans: BeanCollection): void {
        this.focusService = beans.focusService;
        this.chartTranslationService = beans.chartTranslationService as ChartTranslationService;
    }

    private activeMenu?: AdvancedSettingsMenu;
    private activeDialog?: AgDialog;

    public showMenu(chartMenuContext: ChartMenuContext, eventSource?: HTMLElement): void {
        this.hideMenu();

        const menu = this.createBean(new AdvancedSettingsMenu(chartMenuContext));

        this.activeDialog = this.createBean(
            new AgDialog({
                title: this.chartTranslationService.translate('advancedSettings'),
                component: menu,
                width: 300,
                height: 400,
                resizable: true,
                movable: true,
                centered: true,
                closable: true,
                afterGuiAttached: () => {
                    this.focusService.findFocusableElements(menu.getGui())[0]?.focus();
                },
                closedCallback: () => {
                    this.activeMenu = this.destroyBean(this.activeMenu);
                    this.activeDialog = undefined;
                    eventSource?.focus({ preventScroll: true });
                },
            })
        );

        this.activeMenu = menu;
    }

    public hideMenu(): void {
        if (this.activeDialog) {
            this.destroyBean(this.activeDialog);
        }
    }

    public override destroy(): void {
        this.activeMenu = this.destroyBean(this.activeMenu);
        this.activeDialog = this.destroyBean(this.activeDialog);
        super.destroy();
    }
}

class AdvancedSettingsMenu extends TabGuardComp {
    private focusService: FocusService;

    public wireBeans(beans: BeanCollection): void {
        this.focusService = beans.focusService;
    }

    private static TEMPLATE = /* html */ `<div class="ag-chart-advanced-settings"></div>`;

    private advancedSettingsPanel: AdvancedSettingsPanel;

    constructor(private readonly chartMenuContext: ChartMenuContext) {
        super(AdvancedSettingsMenu.TEMPLATE);
    }

    public postConstruct(): void {
        this.advancedSettingsPanel = this.createManagedBean(new AdvancedSettingsPanel(this.chartMenuContext));
        this.getGui().appendChild(this.advancedSettingsPanel.getGui());
        this.initialiseTabGuard({
            onTabKeyDown: this.onTabKeyDown.bind(this),
            focusTrapActive: true,
        });
    }

    protected onTabKeyDown(e: KeyboardEvent) {
        if (e.defaultPrevented) {
            return;
        }

        e.preventDefault();

        const backwards = e.shiftKey;
        const panelGui = this.advancedSettingsPanel.getGui();
        const nextEl = this.focusService.findNextFocusableElement(panelGui, false, backwards);

        if (nextEl) {
            nextEl.focus();
        } else {
            const focusableElements = this.focusService.findFocusableElements(panelGui);
            if (focusableElements.length) {
                focusableElements[backwards ? focusableElements.length - 1 : 0].focus();
            }
        }
    }
}
