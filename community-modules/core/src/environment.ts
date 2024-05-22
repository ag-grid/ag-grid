import { BeanStub } from './context/beanStub';
import { Autowired, Bean } from './context/context';
import { Events } from './eventKeys';
import { CssVariablesChanged } from './events';
import { WithoutGridCommon } from './interfaces/iCommon';
import { ResizeObserverService } from './misc/resizeObserverService';

const ROW_HEIGHT: Variable = {
    cssName: '--ag-row-height',
    changeKey: 'rowHeightChanged',
    // TODO This is an artificially small default so that we can see issues in our examples with delayed loading of styles, restore correct default pre-release
    defaultValue: 20,
    // defaultValue: 42,
};
const HEADER_HEIGHT: Variable = {
    cssName: '--ag-header-height',
    changeKey: 'headerHeightChanged',
    // TODO This is an artificially small default so that we can see issues in our examples with delayed loading of styles, restore correct default pre-release
    defaultValue: 30,
    // defaultValue: 48,
};
const LIST_ITEM_HEIGHT: Variable = {
    cssName: '--ag-list-item-height',
    changeKey: 'listItemHeightChanged',
    // TODO This is an artificially small default so that we can see issues in our examples with delayed loading of styles, restore correct default pre-release
    defaultValue: 10,
    // defaultValue: 24,
};
const CHART_MENU_PANEL_WIDTH: Variable = {
    cssName: '--ag-chart-menu-panel-width',
    changeKey: 'chartMenuPanelWidthChanged',
    // TODO This is an artificially small default so that we can see issues in our examples with delayed loading of styles, restore correct default pre-release
    defaultValue: 100,
    // defaultValue: 260,
};

let idCounter = 0;

@Bean('environment')
export class Environment extends BeanStub {
    @Autowired('resizeObserverService') private resizeObserverService: ResizeObserverService;
    @Autowired('eGridDiv') private eGridDiv: HTMLElement;

    private sizeEls = new Map<Variable, HTMLElement>();
    private lastKnownValues = new Map<Variable, number>();
    private themeClasses: readonly string[] = [];
    private eThemeAncestor: HTMLElement | null = null;
    private eMeasurementContainer: HTMLElement | null = null;

    private id = ++idCounter;

    public override postConstruct(): void {
        super.postConstruct();
        this.addManagedPropertyListener('rowHeight', () => this.refreshRowHeightVariable());
        this.themeClasses = this.getAncestorThemeClasses();
        this.setUpThemeClassObservers();
    }

    public getDefaultRowHeight(): number {
        return this.getCSSVariablePixelValue(ROW_HEIGHT);
    }

    public getDefaultHeaderHeight(): number {
        return this.getCSSVariablePixelValue(HEADER_HEIGHT);
    }

    public getDefaultListItemHeight() {
        return this.getCSSVariablePixelValue(LIST_ITEM_HEIGHT);
    }

    public getDefaultChartMenuPanelWidth(): number {
        return this.getCSSVariablePixelValue(CHART_MENU_PANEL_WIDTH);
    }

    public getThemeClasses(): readonly string[] {
        return this.themeClasses;
    }

    public applyThemeClasses(el: HTMLElement) {
        for (const className of Array.from(el.classList)) {
            if (className.startsWith('ag-theme-') && !this.themeClasses.includes(className)) {
                el.classList.remove(className);
            }
        }
        for (const className of this.themeClasses) {
            if (!el.classList.contains(className)) {
                el.classList.add(className);
            }
        }
    }

    public getThemeAncestorElement(): HTMLElement | null {
        return this.eThemeAncestor;
    }

    public refreshRowHeightVariable(): number {
        const oldRowHeight = this.eGridDiv.style.getPropertyValue('--ag-line-height').trim();
        const height = this.gos.get('rowHeight');

        if (height == null || isNaN(height) || !isFinite(height)) {
            if (oldRowHeight !== null) {
                this.eGridDiv.style.setProperty('--ag-line-height', null);
            }
            return -1;
        }

        const newRowHeight = `${height}px`;

        if (oldRowHeight != newRowHeight) {
            this.eGridDiv.style.setProperty('--ag-line-height', newRowHeight);
            return height;
        }

        return oldRowHeight != '' ? parseFloat(oldRowHeight) : -1;
    }

    private getCSSVariablePixelValue(variable: Variable): number {
        const cached = this.lastKnownValues.get(variable);
        if (cached != null) {
            return cached;
        }
        const measurement = this.measureSizeEl(variable);
        if (measurement === 'detached') {
            // TODO grid detached and never properly measured, handle this better
            return variable.defaultValue;
        }
        if (measurement === 'no-styles') {
            return variable.defaultValue;
        }
        this.lastKnownValues.set(variable, measurement);
        return measurement;
    }

    private measureSizeEl(variable: Variable): number | 'detached' | 'no-styles' {
        const sizeEl = this.getSizeEl(variable)!;
        if (sizeEl.offsetParent == null) {
            return 'detached';
        }
        const newSize = sizeEl.offsetWidth;
        return newSize === NO_VALUE_SENTINEL ? 'no-styles' : newSize;
    }

    private getSizeEl(variable: Variable): HTMLElement {
        let sizeEl = this.sizeEls.get(variable);
        if (sizeEl) {
            return sizeEl;
        }
        let container = this.eMeasurementContainer;
        if (!container) {
            container = this.eMeasurementContainer = document.createElement('div');
            container.className = 'ag-measurement-container';
            container.style.width = '0';
            container.style.overflow = 'hidden';
            container.style.visibility = 'hidden';
            this.eGridDiv.appendChild(container);
        }

        sizeEl = document.createElement('div');
        sizeEl.style.position = 'absolute';
        sizeEl.style.width = `var(${variable.cssName}, ${NO_VALUE_SENTINEL}px)`;
        container.appendChild(sizeEl);
        this.sizeEls.set(variable, sizeEl);

        let lastMeasurement = this.measureSizeEl(variable);

        if (lastMeasurement === 'no-styles') {
            console.warn(
                `AG Grid: no value for ${variable.cssName}. This usually means that the grid has been initialised before styles have been loaded. The default value of ${variable.defaultValue} will be used and updated when styles load.`
            );
        }

        const unsubscribe = this.resizeObserverService.observeResize(sizeEl, () => {
            const newMeasurement = this.measureSizeEl(variable);
            if (newMeasurement === 'detached' || newMeasurement === 'no-styles') {
                return;
            }
            this.lastKnownValues.set(variable, newMeasurement);
            if (newMeasurement !== lastMeasurement) {
                lastMeasurement = newMeasurement;
                this.fireGridStylesChangedEvent(variable.changeKey);
            }
        });
        this.addDestroyFunc(() => unsubscribe());

        return sizeEl;
    }

    private fireGridStylesChangedEvent(change: ChangeKey): void {
        const event: WithoutGridCommon<CssVariablesChanged> = {
            type: Events.EVENT_GRID_STYLES_CHANGED,
            [change]: true,
        };
        this.eventService.dispatchEvent(event);
    }

    private setUpThemeClassObservers() {
        const observer = new MutationObserver(() => {
            const newThemeClasses = this.getAncestorThemeClasses();
            if (!arraysEqual(newThemeClasses, this.themeClasses)) {
                this.themeClasses = newThemeClasses;
                this.fireGridStylesChangedEvent('themeChanged');
            }
        });

        let node: HTMLElement | null = this.eGridDiv;
        while (node) {
            observer.observe(node || this.eGridDiv, {
                attributes: true,
                attributeFilter: ['class'],
            });
            node = node.parentElement;
        }
    }

    private getAncestorThemeClasses(): readonly string[] {
        let el: HTMLElement | null = this.eGridDiv;
        const allThemeClasses: string[] = [];
        this.eThemeAncestor = null;
        while (el) {
            const themeClasses = Array.from(el.classList).filter((c) => c.startsWith('ag-theme-'));
            for (const themeClass of themeClasses) {
                this.eThemeAncestor = el;
                if (!allThemeClasses.includes(themeClass)) {
                    allThemeClasses.unshift(themeClass);
                }
            }
            el = el.parentElement;
        }
        return Object.freeze(allThemeClasses);
    }
}

const arraysEqual = <T>(a: readonly T[], b: readonly T[]): boolean =>
    a.length === b.length && a.findIndex((_, i) => a[i] !== b[i]) === -1;

type Variable = {
    cssName: string;
    changeKey: ChangeKey;
    defaultValue: number;
};

type ChangeKey =
    | 'themeChanged'
    | 'headerHeightChanged'
    | 'rowHeightChanged'
    | 'listItemHeightChanged'
    | 'chartMenuPanelWidthChanged';

const NO_VALUE_SENTINEL = 15538;
