/**
 * @ag-grid-community/core - Advanced Data Grid / Data Table supporting Javascript / Typescript / React / Angular / Vue
 * @version v29.3.5
 * @link https://www.ag-grid.com/
 * @license MIT
 */
"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Environment = void 0;
const context_1 = require("./context/context");
const beanStub_1 = require("./context/beanStub");
const generic_1 = require("./utils/generic");
const eventKeys_1 = require("./eventKeys");
const DEFAULT_ROW_HEIGHT = 25;
const MIN_COL_WIDTH = 10;
const MAT_GRID_SIZE = 8;
const BASE_GRID_SIZE = 4;
const BALHAM_GRID_SIZE = 4;
const ALPINE_GRID_SIZE = 6;
const HARD_CODED_SIZES = {
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
const SASS_PROPERTY_BUILDER = {
    headerHeight: ['ag-header-row'],
    headerCellMinWidth: ['ag-header-cell'],
    listItemHeight: ['ag-virtual-list-item'],
    rowHeight: ['ag-row'],
    chartMenuPanelWidth: ['ag-chart-docked-container']
};
let Environment = class Environment extends beanStub_1.BeanStub {
    constructor() {
        super(...arguments);
        this.calculatedSizes = {};
    }
    postConstruct() {
        var _a;
        const el = (_a = this.getTheme().el) !== null && _a !== void 0 ? _a : this.eGridDiv;
        this.mutationObserver = new MutationObserver(() => {
            this.calculatedSizes = {};
            this.fireGridStylesChangedEvent();
        });
        this.mutationObserver.observe(el || this.eGridDiv, {
            attributes: true,
            attributeFilter: ['class']
        });
    }
    fireGridStylesChangedEvent() {
        const event = {
            type: eventKeys_1.Events.EVENT_GRID_STYLES_CHANGED
        };
        this.eventService.dispatchEvent(event);
    }
    getSassVariable(key) {
        const { themeFamily, el } = this.getTheme();
        if (!themeFamily || themeFamily.indexOf('ag-theme') !== 0) {
            return;
        }
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
    calculateValueForSassProperty(property, theme, themeElement) {
        const useTheme = 'ag-theme-' + (theme.match('material') ? 'material' : theme.match('balham') ? 'balham' : theme.match('alpine') ? 'alpine' : 'custom');
        const defaultValue = HARD_CODED_SIZES[useTheme][property];
        const eDocument = this.gridOptionsService.getDocument();
        if (!themeElement) {
            themeElement = this.eGridDiv;
        }
        if (!SASS_PROPERTY_BUILDER[property]) {
            return defaultValue;
        }
        const classList = SASS_PROPERTY_BUILDER[property];
        const div = eDocument.createElement('div');
        // this will apply SASS variables that were manually added to the current theme
        const classesFromThemeElement = Array.from(themeElement.classList);
        div.classList.add(theme, ...classesFromThemeElement);
        div.style.position = 'absolute';
        const el = classList.reduce((prevEl, currentClass) => {
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
            calculatedValue = parseInt(window.getComputedStyle(el)[sizeName], 10);
            eDocument.body.removeChild(div);
        }
        return calculatedValue || defaultValue;
    }
    isThemeDark() {
        const { theme } = this.getTheme();
        return !!theme && theme.indexOf('dark') >= 0;
    }
    chartMenuPanelWidth() {
        return this.getSassVariable('chartMenuPanelWidth');
    }
    getTheme() {
        const reg = /\bag-(material|(?:theme-([\w\-]*)))\b/g;
        let el = this.eGridDiv;
        let themeMatch = null;
        let allThemes = [];
        while (el) {
            themeMatch = reg.exec(el.className);
            if (!themeMatch) {
                el = el.parentElement || undefined;
            }
            else {
                const matched = el.className.match(reg);
                if (matched) {
                    allThemes = matched;
                }
                break;
            }
        }
        if (!themeMatch) {
            return { allThemes };
        }
        const theme = themeMatch[0];
        return { theme, el, themeFamily: theme.replace(/-dark$/, ''), allThemes };
    }
    getFromTheme(defaultValue, sassVariableName) {
        var _a;
        return (_a = this.getSassVariable(sassVariableName)) !== null && _a !== void 0 ? _a : defaultValue;
    }
    getDefaultRowHeight() {
        return this.getFromTheme(DEFAULT_ROW_HEIGHT, 'rowHeight');
    }
    getListItemHeight() {
        return this.getFromTheme(20, 'listItemHeight');
    }
    setRowHeightVariable(height) {
        const oldRowHeight = this.eGridDiv.style.getPropertyValue('--ag-line-height').trim();
        const newRowHeight = `${height}px`;
        if (oldRowHeight != newRowHeight) {
            this.eGridDiv.style.setProperty('--ag-line-height', newRowHeight);
        }
    }
    getMinColWidth() {
        const measuredMin = this.getFromTheme(null, 'headerCellMinWidth');
        return generic_1.exists(measuredMin) ? Math.max(measuredMin, MIN_COL_WIDTH) : MIN_COL_WIDTH;
    }
    destroy() {
        this.calculatedSizes = null;
        if (this.mutationObserver) {
            this.mutationObserver.disconnect();
        }
        super.destroy();
    }
};
__decorate([
    context_1.Autowired('eGridDiv')
], Environment.prototype, "eGridDiv", void 0);
__decorate([
    context_1.PostConstruct
], Environment.prototype, "postConstruct", null);
Environment = __decorate([
    context_1.Bean('environment')
], Environment);
exports.Environment = Environment;
