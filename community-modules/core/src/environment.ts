import type { NamedBean } from './context/bean';
import { BeanStub } from './context/beanStub';
import type { BeanCollection } from './context/context';
import type { GridTheme } from './entities/gridOptions';
import type { ResizeObserverService } from './misc/resizeObserverService';
import { _errorOnce, _warnOnce } from './utils/function';

const ROW_HEIGHT: Variable = {
    cssName: '--ag-row-height',
    changeKey: 'rowHeightChanged',
    defaultValue: 42,
};
const HEADER_HEIGHT: Variable = {
    cssName: '--ag-header-height',
    changeKey: 'headerHeightChanged',
    defaultValue: 48,
};
const LIST_ITEM_HEIGHT: Variable = {
    cssName: '--ag-list-item-height',
    changeKey: 'listItemHeightChanged',
    defaultValue: 24,
};

export class Environment extends BeanStub implements NamedBean {
    beanName = 'environment' as const;

    private resizeObserverService: ResizeObserverService;
    private eGridDiv: HTMLElement;

    public wireBeans(beans: BeanCollection): void {
        this.resizeObserverService = beans.resizeObserverService;
        this.eGridDiv = beans.eGridDiv;
    }

    private sizeEls = new Map<Variable, HTMLElement>();
    private lastKnownValues = new Map<Variable, number>();
    private ancestorThemeClasses: readonly string[] = [];
    private eMeasurementContainer: HTMLElement | undefined;
    private sizesMeasured = false;

    private gridTheme: GridTheme | null = null;

    public postConstruct(): void {
        this.addManagedPropertyListener('theme', () => this.handleThemeGridOptionChange());
        this.handleThemeGridOptionChange();
        this.addDestroyFunc(() => this.stopUsingTheme());

        this.addManagedPropertyListener('rowHeight', () => this.refreshRowHeightVariable());
        this.ancestorThemeClasses = this.readAncestorThemeClasses();
        this.setUpThemeClassObservers();
        this.getSizeEl(ROW_HEIGHT);
        this.getSizeEl(HEADER_HEIGHT);
        this.getSizeEl(LIST_ITEM_HEIGHT);
    }

    public getDefaultRowHeight(): number {
        return this.getCSSVariablePixelValue(ROW_HEIGHT);
    }

    public getDefaultHeaderHeight(): number {
        return this.getCSSVariablePixelValue(HEADER_HEIGHT);
    }

    public getDefaultColumnMinWidth(): number {
        // This replaces a table of hard-coded defaults for each theme, and is a
        // reasonable default that somewhat approximates the old table. This
        // value only needs to be a non-insane default - Applications are
        // expected to set column-specific defaults based on the icons and
        // header cell text they need to display
        return Math.min(36, this.getDefaultRowHeight());
    }

    public getDefaultListItemHeight() {
        return this.getCSSVariablePixelValue(LIST_ITEM_HEIGHT);
    }

    public hasMeasuredSizes(): boolean {
        return this.sizesMeasured;
    }

    public getGridThemeClass(): string | null {
        return this.gridTheme?.getCssClass() || null;
    }

    public getThemeClasses(): readonly string[] {
        return this.gridTheme ? [this.gridTheme.getCssClass()] : this.ancestorThemeClasses;
    }

    public applyThemeClasses(el: HTMLElement) {
        const themeClasses = this.getThemeClasses();
        for (const className of Array.from(el.classList)) {
            if (className.startsWith('ag-theme-') && !themeClasses.includes(className)) {
                el.classList.remove(className);
            }
        }
        el.classList.add(...themeClasses);
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
        if (measurement === 'detached' || measurement === 'no-styles') {
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
        if (newSize === NO_VALUE_SENTINEL) return 'no-styles';
        this.sizesMeasured = true;
        return newSize;
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
            if (this.gos.get('theme')) {
                // Avoid setting a theme class in legacy theme (non Theming API)
                // mode, because Sass styles don't support custom property
                // inheritance, so setting a theme class here resets the custom
                // properties defined on the grid's wrapper element
                this.applyThemeClasses(container);
            }
            this.eGridDiv.appendChild(container);
        }

        sizeEl = document.createElement('div');
        sizeEl.style.width = `var(${variable.cssName}, ${NO_VALUE_SENTINEL}px)`;
        container.appendChild(sizeEl);
        this.sizeEls.set(variable, sizeEl);

        let lastMeasurement = this.measureSizeEl(variable);

        if (lastMeasurement === 'no-styles') {
            _warnOnce(
                `no value for ${variable.cssName}. This usually means that the grid has been initialised before styles have been loaded. The default value of ${variable.defaultValue} will be used and updated when styles load.`
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
        this.eventService.dispatchEvent({
            type: 'gridStylesChanged',
            [change]: true,
        });
    }

    private setUpThemeClassObservers() {
        const observer = new MutationObserver(() => {
            const newThemeClasses = this.readAncestorThemeClasses();
            if (!arraysEqual(newThemeClasses, this.ancestorThemeClasses)) {
                this.ancestorThemeClasses = newThemeClasses;
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
        this.addDestroyFunc(() => observer.disconnect());
    }

    private readAncestorThemeClasses(): readonly string[] {
        let el: HTMLElement | null = this.eGridDiv;
        const allThemeClasses: string[] = [];
        while (el) {
            const themeClasses = Array.from(el.classList).filter((c) => c.startsWith('ag-theme-'));
            for (const themeClass of themeClasses) {
                if (!allThemeClasses.includes(themeClass)) {
                    allThemeClasses.unshift(themeClass);
                }
            }
            el = el.parentElement;
        }
        return Object.freeze(allThemeClasses);
    }

    private handleThemeGridOptionChange(): void {
        const { gos, eMeasurementContainer, gridTheme: oldGridTheme } = this;
        const newGridTheme = gos.get('theme') || null;
        if (newGridTheme !== oldGridTheme) {
            oldGridTheme?.stopUse();
            this.gridTheme = newGridTheme;
            newGridTheme?.startUse({
                loadThemeGoogleFonts: gos.get('loadThemeGoogleFonts'),
                container: this.eGridDiv,
            });
            if (eMeasurementContainer) {
                this.applyThemeClasses(eMeasurementContainer);
            }
            this.fireGridStylesChangedEvent('themeChanged');
        }
    }

    private stopUsingTheme(): void {
        this.gridTheme?.stopUse();
        this.gridTheme = null;
    }
}

const arraysEqual = <T>(a: readonly T[], b: readonly T[]): boolean =>
    a.length === b.length && a.findIndex((_, i) => a[i] !== b[i]) === -1;

type Variable = {
    cssName: string;
    changeKey: ChangeKey;
    defaultValue: number;
};

type ChangeKey = 'themeChanged' | 'headerHeightChanged' | 'rowHeightChanged' | 'listItemHeightChanged';

const NO_VALUE_SENTINEL = 15538;
