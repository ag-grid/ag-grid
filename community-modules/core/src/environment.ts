import { Bean, Autowired, PostConstruct } from './context/context';
import { BeanStub } from './context/beanStub';
import { Events } from './eventKeys';
import { ResizeObserverService } from './misc/resizeObserverService';
import { WithoutGridCommon } from './interfaces/iCommon';
import { CssVariablesChanged } from './events';

@Bean('environment')
export class Environment extends BeanStub {
    @Autowired('resizeObserverService') private resizeObserverService: ResizeObserverService;
    @Autowired('eGridDiv') private eGridDiv: HTMLElement;

    private calculatedVariableValues = new Map<string, number>();
    private themeClasses: readonly string[] = [];
    private eThemeAncestor: HTMLElement | null = null;
    private eMeasurementContainer: HTMLElement | null = null;

    @PostConstruct
    private postConstruct(): void {
        this.addManagedPropertyListener('rowHeight', () => this.refreshRowHeightVariable());
        this.themeClasses = this.getAncestorThemeClasses();
        this.setUpThemeClassObservers();
    }

    public getDefaultChartMenuPanelWidth(): number {
        // TODO This is an artificially small default so that we can see issues in our examples with delayed loading of styles, restore correct default pre-release
        return this.readCSSVariablePixelValue('--ag-chart-menu-panel-width', 'chartMenuPanelWidthChanged', 100);
        // return this.readCSSVariablePixelValue('--ag-chart-menu-panel-width', 'chartMenuPanelWidthChanged', 260);
    }

    public getDefaultHeaderHeight(): number {
        // TODO This is an artificially small default so that we can see issues in our examples with delayed loading of styles, restore correct default pre-release
        return this.readCSSVariablePixelValue('--ag-header-height', 'headerHeightChanged', 30);
        // return this.readCSSVariablePixelValue('--ag-header-height', 'headerHeightChanged', 48);
    }

    public getDefaultRowHeight(): number {
        // TODO This is an artificially small default so that we can see issues in our examples with delayed loading of styles, restore correct default pre-release
        return this.readCSSVariablePixelValue('--ag-row-height', 'rowHeightChanged', 20);
        // return this.readCSSVariablePixelValue('--ag-row-height', 'rowHeightChanged', 42);
    }

    public getDefaultListItemHeight() {
        // TODO This is an artificially small default so that we can see issues in our examples with delayed loading of styles, restore correct default pre-release
        return this.readCSSVariablePixelValue('--ag-list-item-height', 'listItemHeightChanged', 10);
        // return this.readCSSVariablePixelValue('--ag-list-item-height', 'listItemHeightChanged', 24);
    }

    public getThemeClasses(): readonly string[] {
        return this.themeClasses;
    }

    public applyThemeClasses(el: HTMLElement) {
        for (const className of Array.from(el.classList)) {
            if (className.startsWith("ag-theme-") && !this.themeClasses.includes(className)) {
                el.classList.remove(className)
            }
        }
        for (const className of this.themeClasses) {
            if (!el.classList.contains(className)) {
                el.classList.add(className)
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

    private readCSSVariablePixelValue(variable: string, change: ChangeKey, defaultValue: number): number {
        let container = this.eMeasurementContainer;
        if (!container) {
            container = this.eMeasurementContainer = document.createElement('div');
            container.className = 'ag-measurement-container';
            this.eGridDiv.appendChild(container);
        }

        const existingValue = this.calculatedVariableValues.get(variable);
        if (existingValue != null) {
            return existingValue;
        }

        const sizeDiv = document.createElement('div');
        sizeDiv.style.width = `var(${variable}, ${defaultValue}px)`;
        sizeDiv.style.visibility = 'hidden';
        sizeDiv.style.position = 'absolute';
        container.appendChild(sizeDiv);

        const measureSizeDiv = () => {
            let newSize = sizeDiv.offsetWidth;
            if (newSize === 0) {
                console.warn(`AG Grid: no value for ${variable}. This usually means that the grid has been initialised before styles have been loaded. The default value of ${defaultValue} will be used, and updated when styles load.`);
                newSize = defaultValue;
            }
            this.calculatedVariableValues.set(variable, newSize);
            return newSize;
        };

        const unsubscribe = this.resizeObserverService.observeResize(sizeDiv, () => {
            const oldSize = this.calculatedVariableValues.get(variable);
            const newSize = measureSizeDiv();
            if (oldSize !== newSize) {
                this.fireGridStylesChangedEvent(change);
            }
        });
        this.addDestroyFunc(() => unsubscribe());

        return measureSizeDiv();
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

type ChangeKey =
    | 'themeChanged'
    | 'headerHeightChanged'
    | 'rowHeightChanged'
    | 'listItemHeightChanged'
    | 'chartMenuPanelWidthChanged';
