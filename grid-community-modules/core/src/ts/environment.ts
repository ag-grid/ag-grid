import { Bean, Autowired, PostConstruct } from './context/context';
import { BeanStub } from "./context/beanStub";
import { exists } from './utils/generic';
import { Events } from './eventKeys';
import { WithoutGridCommon } from './interfaces/iCommon';
import { CssVariablesChanged } from './events';

export type SASS_PROPERTIES = 'headerHeight' | 'headerCellMinWidth' | 'listItemHeight' | 'rowHeight' | 'chartMenuPanelWidth';

interface HardCodedSize {
    [key: string]: {
        [key in SASS_PROPERTIES]?: number;
    };
}

const DEFAULT_ROW_HEIGHT = 25;
const MIN_COL_WIDTH = 10;

const MAT_GRID_SIZE = 8;
const BASE_GRID_SIZE = 4;
const BALHAM_GRID_SIZE = 4;
const ALPINE_GRID_SIZE = 6;

const HARD_CODED_SIZES: HardCodedSize = {
    // this item is required for custom themes
    'ag-theme-custom': {
        headerHeight: 25,
        headerCellMinWidth: 24,
        listItemHeight: BASE_GRID_SIZE * 5,
        rowHeight: 25,
        chartMenuPanelWidth: 220
    },
    'ag-theme-material': {
        headerHeight: MAT_GRID_SIZE * 7,
        headerCellMinWidth: 48,
        listItemHeight: MAT_GRID_SIZE * 4,
        rowHeight: MAT_GRID_SIZE * 6,
        chartMenuPanelWidth: 240
    },
    'ag-theme-balham': {
        headerHeight: BALHAM_GRID_SIZE * 8,
        headerCellMinWidth: 24,
        listItemHeight: BALHAM_GRID_SIZE * 6,
        rowHeight: BALHAM_GRID_SIZE * 7,
        chartMenuPanelWidth: 220
    },
    'ag-theme-alpine': {
        headerHeight: ALPINE_GRID_SIZE * 8,
        headerCellMinWidth: 36,
        listItemHeight: ALPINE_GRID_SIZE * 4,
        rowHeight: ALPINE_GRID_SIZE * 7,
        chartMenuPanelWidth: 240
    }
};

/**
 * this object contains a list of Sass variables and an array
 * of CSS styles required to get the correct value.
 * eg. $virtual-item-height requires a structure, so we can get its height.
 * <div class="ag-theme-balham">
 *     <div class="ag-virtual-list-container">
 *         <div class="ag-virtual-list-item"></div>
 *     </div>
 * </div>
 */
const SASS_PROPERTY_BUILDER: { [key in SASS_PROPERTIES]: string[] } = {
    headerHeight: ['ag-header-row'],
    headerCellMinWidth: ['ag-header-cell'],
    listItemHeight: ['ag-virtual-list-item'],
    rowHeight: ['ag-row'],
    chartMenuPanelWidth: ['ag-chart-docked-container']
};

@Bean('environment')
export class Environment extends BeanStub {

    @Autowired('eGridDiv') private eGridDiv: HTMLElement;

    private calculatedSizes: HardCodedSize | null = {};
    private mutationObserver: MutationObserver;

    @PostConstruct
    private postConstruct(): void {
        const el = this.getTheme().el ?? this.eGridDiv;

        this.mutationObserver = new MutationObserver(() => {
            this.calculatedSizes = {};
            this.fireGridStylesChangedEvent();
        });

        this.mutationObserver.observe(el || this.eGridDiv, {
            attributes: true,
            attributeFilter: ['class']
        });
    }

    private fireGridStylesChangedEvent(): void {
        const event: WithoutGridCommon<CssVariablesChanged> = {
            type: Events.EVENT_GRID_STYLES_CHANGED
        }
        this.eventService.dispatchEvent(event);
    }

    private getSassVariable(key: SASS_PROPERTIES): number | undefined {
        const { themeFamily, el } = this.getTheme();

        if (!themeFamily || themeFamily.indexOf('ag-theme') !== 0) { return; }

        if (!this.calculatedSizes) {
            this.calculatedSizes = {};
        }

        if (!this.calculatedSizes[themeFamily]) {
            this.calculatedSizes[themeFamily] = {};
        }

        const size = this.calculatedSizes[themeFamily][key];

        if (size != null) {
            return size;
        }

        this.calculatedSizes[themeFamily][key] = this.calculateValueForSassProperty(key, themeFamily, el);

        return this.calculatedSizes[themeFamily][key];
    }

    private calculateValueForSassProperty(property: SASS_PROPERTIES, theme: string, themeElement?: HTMLElement): number | undefined {
        const useTheme = 'ag-theme-' + (theme.match('material') ? 'material' : theme.match('balham') ? 'balham' : theme.match('alpine') ? 'alpine' : 'custom');
        const defaultValue = HARD_CODED_SIZES[useTheme][property];
        const eDocument = this.gridOptionsService.getDocument();

        if (!themeElement) {
            themeElement = this.eGridDiv;
        }

        if (!SASS_PROPERTY_BUILDER[property]) { return defaultValue; }

        const classList = SASS_PROPERTY_BUILDER[property];
        const div = eDocument.createElement('div');
        
        // this will apply SASS variables that were manually added to the current theme
        const classesFromThemeElement = Array.from(themeElement.classList)
        div.classList.add(theme,...classesFromThemeElement);

        div.style.position = 'absolute';

        const el: HTMLDivElement = classList.reduce((prevEl: HTMLDivElement, currentClass: string) => {
            const currentDiv = eDocument.createElement('div');
            currentDiv.style.position = 'static';
            currentDiv.classList.add(currentClass);
            prevEl.appendChild(currentDiv);

            return currentDiv;
        }, div);

        let calculatedValue = 0;

        if (eDocument.body) {
            eDocument.body.appendChild(div);
            const sizeName = property.toLowerCase().indexOf('height') !== -1 ? 'height' : 'width';
            calculatedValue = parseInt(window.getComputedStyle(el)[sizeName]!, 10);
            eDocument.body.removeChild(div);
        }

        return calculatedValue || defaultValue;
    }

    public isThemeDark(): boolean {
        const { theme } = this.getTheme();
        return !!theme && theme.indexOf('dark') >= 0;
    }

    public chartMenuPanelWidth(): number | undefined {
        return this.getSassVariable('chartMenuPanelWidth');
    }

    public getTheme(): { theme?: string; el?: HTMLElement; themeFamily?: string; allThemes: string[] } {
        const reg = /\bag-(material|(?:theme-([\w\-]*)))\b/g;
        let el: HTMLElement | undefined = this.eGridDiv;
        let themeMatch: RegExpMatchArray | null = null;
        let allThemes: string[] = [];

        while (el) {
            themeMatch = reg.exec(el.className);
            if (!themeMatch) {
                el = el.parentElement || undefined;
            } else {
                const matched = el.className.match(reg);
                if (matched) {
                    allThemes = matched;
                }
                break;
            }
        }

        if (!themeMatch) { return { allThemes }; }

        const theme = themeMatch[0];

        return { theme, el, themeFamily: theme.replace(/-dark$/, ''), allThemes };
    }

    // Material data table has strict guidelines about whitespace, and these values are different than the ones
    // ag-grid uses by default. We override the default ones for the sake of making it better out of the box
    public getFromTheme(defaultValue: number, sassVariableName: SASS_PROPERTIES): number;
    public getFromTheme(defaultValue: null, sassVariableName: SASS_PROPERTIES): number | null | undefined;
    public getFromTheme(defaultValue: any, sassVariableName: SASS_PROPERTIES): any {
        return this.getSassVariable(sassVariableName) ?? defaultValue;
    }

    public getDefaultRowHeight(): number {
        return this.getFromTheme(DEFAULT_ROW_HEIGHT, 'rowHeight');
    }

    public getListItemHeight() {
        return this.getFromTheme(20, 'listItemHeight');
    }

    public setRowHeightVariable(height: number): void {
        const oldRowHeight = this.eGridDiv.style.getPropertyValue('--ag-line-height').trim();
        const newRowHeight = `${height}px`;

        if (oldRowHeight != newRowHeight) {
            this.eGridDiv.style.setProperty('--ag-line-height', newRowHeight);
        }
    }

    public getMinColWidth(): number {
        const measuredMin = this.getFromTheme(null, 'headerCellMinWidth');
        return exists(measuredMin) ? Math.max(measuredMin, MIN_COL_WIDTH) : MIN_COL_WIDTH;
    }

    protected destroy(): void {
        this.calculatedSizes = null;

        if (this.mutationObserver) {
            this.mutationObserver.disconnect();
        }

        super.destroy();
    }
}