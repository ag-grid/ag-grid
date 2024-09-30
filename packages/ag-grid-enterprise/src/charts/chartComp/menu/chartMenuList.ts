import type {
    BeanCollection,
    FocusService,
    IAfterGuiAttachedParams,
    MenuItemDef,
    NamedBean,
    PopupService,
} from 'ag-grid-community';
import { BeanStub, Component, RefPlaceholder, _createIconNoSpan, _isNothingFocused } from 'ag-grid-community';

import { AgMenuList } from '../../../widgets/agMenuList';
import type { ChartController } from '../chartController';
import type { ChartMenuService } from '../services/chartMenuService';
import type { ChartTranslationService } from '../services/chartTranslationService';
import type { ChartMenuContext } from './chartMenuContext';

export class ChartMenuListFactory extends BeanStub implements NamedBean {
    beanName = 'chartMenuListFactory' as const;

    private popupService: PopupService;
    private chartMenuService: ChartMenuService;
    private chartTranslationService: ChartTranslationService;

    public wireBeans(beans: BeanCollection): void {
        this.popupService = beans.popupService!;
        this.chartMenuService = beans.chartMenuService as ChartMenuService;
        this.chartTranslationService = beans.chartTranslationService as ChartTranslationService;
    }

    private activeChartMenuList?: ChartMenuList;

    public showMenuList(params: {
        eventSource: HTMLElement;
        showMenu: () => void;
        chartMenuContext: ChartMenuContext;
    }): void {
        const { eventSource, showMenu, chartMenuContext } = params;
        const areChartToolPanelsEnabled = this.chartMenuService.doChartToolPanelsExist(
            chartMenuContext.chartController
        );
        const menuItems = this.mapWithStockItems(
            this.getMenuItems(chartMenuContext.chartController, areChartToolPanelsEnabled),
            chartMenuContext,
            showMenu,
            eventSource,
            areChartToolPanelsEnabled
        );
        if (!menuItems.length) {
            return;
        }
        const chartMenuList = this.createBean(new ChartMenuList(menuItems));
        this.activeChartMenuList = chartMenuList;

        let multiplier = -1;
        let alignSide: 'left' | 'right' = 'left';

        if (this.gos.get('enableRtl')) {
            multiplier = 1;
            alignSide = 'right';
        }

        const eGui = chartMenuList.getGui();

        this.popupService.addPopup({
            modal: true,
            eChild: eGui,
            closeOnEsc: true,
            closedCallback: () => {
                this.destroyBean(chartMenuList);
                this.activeChartMenuList = undefined;
                if (_isNothingFocused(this.gos)) {
                    eventSource.focus({ preventScroll: true });
                }
            },
            afterGuiAttached: (params) => chartMenuList.afterGuiAttached(params),
            positionCallback: () => {
                {
                    this.popupService.positionPopupByComponent({
                        type: 'chartMenu',
                        eventSource,
                        ePopup: eGui,
                        alignSide,
                        nudgeX: 4 * multiplier,
                        nudgeY: 4,
                        position: 'under',
                        keepWithinBounds: true,
                    });
                }
            },
            ariaLabel: 'Chart Menu',
        });
    }

    private getMenuItems(
        chartController: ChartController,
        areChartToolPanelsEnabled: boolean
    ): (MenuItemDef | string)[] {
        const defaultItems = [
            ...(areChartToolPanelsEnabled ? ['chartEdit'] : []),
            ...(chartController.isEnterprise() ? ['chartAdvancedSettings'] : []),
            chartController.isChartLinked() ? 'chartUnlink' : 'chartLink',
            'chartDownload',
        ];
        const chartMenuItems = this.gos.get('chartMenuItems');
        if (!chartMenuItems) {
            return defaultItems;
        } else if (Array.isArray(chartMenuItems)) {
            return chartMenuItems;
        } else {
            return chartMenuItems(
                this.gos.addGridCommonParams({
                    defaultItems,
                })
            );
        }
    }

    private mapWithStockItems(
        originalList: (MenuItemDef | string)[],
        chartMenuContext: ChartMenuContext,
        showMenu: () => void,
        eventSource: HTMLElement,
        areChartToolPanelsEnabled: boolean
    ): MenuItemDef[] {
        if (!originalList) {
            return [];
        }
        const resultList: MenuItemDef[] = [];

        originalList.forEach((menuItemOrString) => {
            let result: MenuItemDef | null;
            if (typeof menuItemOrString === 'string') {
                result = this.getStockMenuItem(
                    menuItemOrString,
                    chartMenuContext,
                    showMenu,
                    eventSource,
                    areChartToolPanelsEnabled
                );
            } else {
                result = { ...menuItemOrString };
            }
            if (!result) {
                return;
            }

            const { subMenu } = result;
            if (Array.isArray(subMenu)) {
                result.subMenu = this.mapWithStockItems(
                    subMenu,
                    chartMenuContext,
                    showMenu,
                    eventSource,
                    areChartToolPanelsEnabled
                );
            }

            resultList.push(result);
        });

        return resultList;
    }

    private getStockMenuItem(
        key: string,
        chartMenuContext: ChartMenuContext,
        showMenu: () => void,
        eventSource: HTMLElement,
        areChartToolPanelsEnabled: boolean
    ): MenuItemDef | null {
        switch (key) {
            case 'chartEdit':
                return areChartToolPanelsEnabled
                    ? this.createMenuItem(
                          this.chartTranslationService.translate('chartEdit'),
                          'chartsMenuEdit',
                          showMenu
                      )
                    : null;
            case 'chartAdvancedSettings':
                return this.createMenuItem(
                    this.chartTranslationService.translate('chartAdvancedSettings'),
                    'chartsMenuAdvancedSettings',
                    () => this.chartMenuService.openAdvancedSettings(chartMenuContext, eventSource)
                );
            case 'chartUnlink':
                return chartMenuContext.chartController.isChartLinked()
                    ? this.createMenuItem(this.chartTranslationService.translate('chartUnlink'), 'unlinked', () =>
                          this.chartMenuService.toggleLinked(chartMenuContext)
                      )
                    : null;
            case 'chartLink':
                return !chartMenuContext.chartController.isChartLinked()
                    ? this.createMenuItem(this.chartTranslationService.translate('chartLink'), 'linked', () =>
                          this.chartMenuService.toggleLinked(chartMenuContext)
                      )
                    : null;
            case 'chartDownload':
                return this.createMenuItem(this.chartTranslationService.translate('chartDownload'), 'save', () =>
                    this.chartMenuService.downloadChart(chartMenuContext)
                );
        }
        return null;
    }

    private createMenuItem(name: string, iconName: string, action: () => void): MenuItemDef {
        return {
            name,
            icon: _createIconNoSpan(iconName, this.gos, null),
            action,
        };
    }

    public override destroy(): void {
        this.destroyBean(this.activeChartMenuList);
        super.destroy();
    }
}

class ChartMenuList extends Component {
    private focusService: FocusService;

    public wireBeans(beans: BeanCollection) {
        this.focusService = beans.focusService;
    }

    private readonly eChartsMenu: HTMLElement = RefPlaceholder;

    private hidePopupFunc: () => void;
    private mainMenuList: AgMenuList;

    constructor(private readonly menuItems: (MenuItemDef | string)[]) {
        super(/* html */ `
            <div data-ref="eChartsMenu" role="presentation" class="ag-menu ag-chart-menu-popup"></div>
        `);
    }

    public postConstruct(): void {
        this.mainMenuList = this.createManagedBean(new AgMenuList(0));
        this.mainMenuList.addMenuItems(this.menuItems);
        this.mainMenuList.addEventListener('closeMenu', this.onHidePopup.bind(this));
        this.eChartsMenu.appendChild(this.mainMenuList.getGui());
    }

    private onHidePopup(): void {
        this.hidePopupFunc?.();
    }

    public afterGuiAttached({ hidePopup }: IAfterGuiAttachedParams): void {
        if (hidePopup) {
            this.hidePopupFunc = hidePopup;
            this.addDestroyFunc(hidePopup);
        }
        this.focusService.focusInto(this.mainMenuList.getGui());
    }
}
