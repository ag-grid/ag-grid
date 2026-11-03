import { TabGuardClassNames, _findFocusableElements } from 'ag-stack';

import type { NamedBean } from 'ag-grid-community';
import { BeanStub, Component, KeyCode } from 'ag-grid-community';

import { Dialog } from '../../../../widgets/dialog';
import type { ChartTranslationService } from '../../services/chartTranslationService';
import type { ChartMenuContext } from '../chartMenuContext';
import { AdvancedSettingsPanel } from './advancedSettingsPanel';

export class AdvancedSettingsMenuFactory extends BeanStub implements NamedBean {
    beanName = 'advSettingsMenuFactory' as const;

    private activeMenu?: AdvancedSettingsMenu;
    private activeDialog?: Dialog;

    public showMenu(chartMenuContext: ChartMenuContext, eventSource?: HTMLElement): void {
        this.hideMenu();

        const menu = this.createBean(new AdvancedSettingsMenu(chartMenuContext));

        const dialog = this.createBean(
            new Dialog({
                title: (this.beans.chartTranslation as ChartTranslationService).translate('advancedSettings'),
                component: menu,
                width: 300,
                height: 400,
                resizable: true,
                movable: true,
                centered: true,
                closable: true,
                afterGuiAttached: () => {
                    _findFocusableElements(menu.getGui())[0]?.focus();
                },
                closedCallback: () => {
                    this.activeMenu = this.destroyBean(this.activeMenu);
                    this.activeDialog = undefined;
                    eventSource?.focus({ preventScroll: true });
                },
            })
        );
        const dialogGui = dialog.getGui();
        dialog.addManagedElementListeners(dialogGui, {
            keydown: (e: KeyboardEvent) => trapTabFocus(e, dialogGui),
        });

        this.activeDialog = dialog;
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

class AdvancedSettingsMenu extends Component {
    constructor(private readonly chartMenuContext: ChartMenuContext) {
        super(/* html */ `<div class="ag-chart-advanced-settings"></div>`);
    }

    public postConstruct(): void {
        const advancedSettingsPanel = this.createManagedBean(new AdvancedSettingsPanel(this.chartMenuContext));
        this.getGui().appendChild(advancedSettingsPanel.getGui());
    }
}

/** Tab cycles through the dialog's controls, title bar buttons included, without leaving the dialog. */
function trapTabFocus(e: KeyboardEvent, root: HTMLElement): void {
    if (e.key !== KeyCode.TAB || e.defaultPrevented) {
        return;
    }

    e.preventDefault();

    const focusableElements = _findFocusableElements(root, `.${TabGuardClassNames.TAB_GUARD}`);
    const len = focusableElements.length;
    if (!len) {
        return;
    }

    const backwards = e.shiftKey;
    const index = focusableElements.findIndex((el) => el === e.target);
    let nextIndex = backwards ? len - 1 : 0;
    if (index >= 0) {
        nextIndex = (index + (backwards ? -1 : 1) + len) % len;
    }
    focusableElements[nextIndex].focus();
}
