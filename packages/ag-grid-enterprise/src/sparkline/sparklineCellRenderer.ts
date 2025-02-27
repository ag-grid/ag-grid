import type {
    AgChartInstance,
    AgChartTheme,
    AgChartThemeName,
    AgSparklineOptions,
    AgSparklineTooltipRendererParams,
    AgSparklineTooltipRendererResult,
    AgTooltipRendererResult,
} from 'ag-charts-types';

import type { ICellRenderer, ISparklineCellRendererParams } from 'ag-grid-community';
import { Component, RefPlaceholder, _observeResize } from 'ag-grid-community';

import { wrapFn } from './sparklinesUtils';

export const DEFAULT_THEMES = ['ag-default', 'ag-material', 'ag-sheets', 'ag-polychroma', 'ag-vivid'];

function tooltipRendererWithXValue(
    params: AgSparklineTooltipRendererParams<unknown>
): AgSparklineTooltipRendererResult {
    return { content: `${params.xValue} ${params.yValue}` };
}

function tooltipRenderer(params: AgSparklineTooltipRendererParams<unknown>): AgSparklineTooltipRendererResult {
    return { content: `${params.yValue}` };
}

export class SparklineCellRenderer extends Component implements ICellRenderer {
    private readonly eSparkline: HTMLElement = RefPlaceholder;
    private sparklineInstance?: AgChartInstance<any>;
    private sparklineOptions: AgSparklineOptions;
    private params: ISparklineCellRendererParams<any, any> | undefined;
    private cachedWidth = 0;
    private cachedHeight = 0;

    constructor() {
        super();

        // Manually construct DOM to avoid costly HTML parsing on fast-scrolling.
        const wrapper = document.createElement('div');
        wrapper.classList.add('ag-sparkline-wrapper');
        const eSparkline = document.createElement('span');
        eSparkline.dataset['ref'] = 'eSparkline';
        wrapper.appendChild(eSparkline);

        this.setTemplateFromElement(wrapper);
    }

    postConstruct(): void {
        this.addManagedPropertyListeners(['chartThemeOverrides', 'chartThemes'], (_event) => this.refresh(this.params));
    }

    public init(params: ISparklineCellRendererParams): void {
        // Guess initial width/height to allow synchronous sparkline initialisation, otherwise
        // rendering gets deferred until after a browser layout + paint, after which a resize event
        // is triggered.
        this.cachedHeight = (params.node.rowHeight ?? 0) - 3;
        const columnWidth = params.column?.getActualWidth() ?? 0;
        // Default width of 200 should be ignored, wait for resize.
        this.cachedWidth = columnWidth === 200 ? 0 : columnWidth - 2;

        this.refresh(params);
        const unsubscribeFromResize = _observeResize(this.beans, this.getGui(), this.resizeHandler.bind(this));
        this.addDestroyFunc(() => unsubscribeFromResize());
    }

    private resizeHandler(entries: ResizeObserverEntry[]) {
        for (const item of entries) {
            if (item.target !== this.getGui()) continue;

            // Use the provided sizes to avoid forced re-layout by reading clientWidth/clientHeight
            // after a DOM mutation.
            const { inlineSize: width, blockSize: height } = item.contentBoxSize[0];

            if (this.cachedWidth === width && this.cachedHeight === height) {
                return;
            }

            this.cachedWidth = width;
            this.cachedHeight = height;
            this.refresh(this.params);
        }
    }

    private getThemeName(): string {
        const availableThemes = this.gos.get('chartThemes');
        return (availableThemes || DEFAULT_THEMES)[0];
    }

    public refresh(params?: ISparklineCellRendererParams): boolean {
        this.params = params;
        const width = this.cachedWidth;
        const height = this.cachedHeight;

        if (!this.sparklineInstance && params && width > 0 && height) {
            this.sparklineOptions = {
                container: this.eSparkline,
                width,
                height,
                ...params.sparklineOptions,
                data: this.processData(params.value),
            } as AgSparklineOptions;

            if (this.sparklineOptions.tooltip?.renderer) {
                this.wrapTooltipRenderer();
            } else {
                const renderer = this.getDefaultTooltipRenderer();
                this.sparklineOptions.tooltip = {
                    ...this.sparklineOptions.tooltip,
                    renderer,
                };
            }

            // Only bar sparklines have itemStyler
            const theme = this.sparklineOptions?.theme as AgChartTheme;
            if (this.sparklineOptions.type === 'bar' && this.sparklineOptions.itemStyler) {
                this.wrapItemStyler(this.sparklineOptions);
            } else if (theme?.overrides?.bar?.series?.itemStyler) {
                this.wrapItemStyler(theme.overrides.bar.series);
            }

            this.updateTheme(this.sparklineOptions);

            // create new sparkline
            this.sparklineInstance = params.createSparkline!(this.sparklineOptions);
            return true;
        } else if (this.sparklineInstance) {
            this.sparklineOptions.width = width;
            this.sparklineOptions.height = height;
            const data = this.processData(params?.value);
            this.sparklineOptions.data = data;

            const themeChanged = this.updateTheme(this.sparklineOptions);
            if (themeChanged) {
                this.sparklineInstance.updateDelta(this.sparklineOptions);
            } else {
                // Fast path for updating data or width/height to match Charts fast path
                this.sparklineInstance.updateDelta({ data, width, height });
            }

            return true;
        }
        return false;
    }

    private updateTheme(sparklineOptions: AgSparklineOptions): boolean {
        const themeName = this.getThemeName() as AgChartThemeName;
        let themeChanged = false;
        if (typeof sparklineOptions.theme === 'string' || !sparklineOptions.theme) {
            themeChanged = sparklineOptions.theme !== themeName;
            sparklineOptions.theme = themeName;
        } else if (sparklineOptions.theme) {
            themeChanged = sparklineOptions.theme.baseTheme !== themeName;
            sparklineOptions.theme.baseTheme = themeName;
        }
        return themeChanged;
    }

    private processData(data: any[] = []) {
        if (data.length === 0) {
            return data;
        }

        return data.filter((item) => item != null);
    }

    private createContext() {
        return {
            data: this.params?.data,
            cellData: this.params?.value,
        };
    }

    private getDefaultTooltipRenderer(userRendererResult?: AgTooltipRendererResult) {
        const userTitle = userRendererResult?.title;
        const xKeyProvided = this.sparklineOptions.xKey;
        const tupleData = Array.isArray(this.sparklineOptions.data?.[0]);

        const showXValue = !userTitle && (xKeyProvided || tupleData);

        return showXValue ? tooltipRendererWithXValue : tooltipRenderer;
    }

    private wrapItemStyler(container: { itemStyler?: any }) {
        container!.itemStyler = wrapFn(container.itemStyler, (fn, stylerParams: any): any => {
            return fn({
                ...stylerParams,
                context: this.createContext(),
            });
        });
    }

    private wrapTooltipRenderer() {
        this.sparklineOptions.tooltip = {
            ...this.sparklineOptions.tooltip,
            renderer: wrapFn(this.sparklineOptions.tooltip!.renderer!, (fn, tooltipParams: any): any => {
                const userRendererResult = fn({
                    ...tooltipParams,
                    context: this.createContext(),
                });

                if (typeof userRendererResult === 'string') {
                    return userRendererResult;
                }
                return {
                    ...this.getDefaultTooltipRenderer(userRendererResult)(tooltipParams),
                    ...userRendererResult,
                };
            }),
        };
    }

    public override destroy() {
        super.destroy();
        this.sparklineInstance?.destroy();
    }
}
