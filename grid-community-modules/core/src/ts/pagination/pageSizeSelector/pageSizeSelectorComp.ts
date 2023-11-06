import { Component } from "../../widgets/component";
import { Autowired, PostConstruct } from "../../context/context";
import { LocaleService } from "../../localeService";
import { GridOptionsService } from "../../gridOptionsService";
import { PaginationProxy } from "../paginationProxy";
import { AgSelect } from "../../main";
import { clearElement } from "../../utils/dom";
import {warnOnce} from "../../utils/function";

export class PageSizeSelectorComp extends Component {

    @Autowired('localeService') protected readonly localeService: LocaleService;
    @Autowired('gridOptionsService') protected readonly gridOptionsService: GridOptionsService;
    @Autowired('paginationProxy') private paginationProxy: PaginationProxy;

    static defaultPageSizeOptions =  [20, 50, 100];

    private selectPageSizeComp: AgSelect | undefined;

    constructor() {
        super(
            `<span class="ag-paging-page-size"></span>`
        );
    }

    @PostConstruct
    private init() {
        this.addManagedPropertyListener(
            'paginationPageSizeSelector',
            () => this.onPageSizeSelectorValuesChange(),
        );
    }

    private get isSelectorVisible() {
        return this.selectPageSizeComp !== undefined;
    }

    private handlePageSizeItemSelected = (): void => {
        if (!this.selectPageSizeComp) {
            return;
        }

        const newValue = this.selectPageSizeComp.getValue();
        if (!newValue) { return; }

        const newPageSize = Number(newValue);
        if (isNaN(newPageSize) || newPageSize < 1) { return; }
        if (newPageSize === this.paginationProxy.getPageSize()) { return; }

        this.gridOptionsService.updateGridOptions({ options: { paginationPageSize: newPageSize } });
    };

    public toggleSelectDisplay(show: boolean) {
        if (this.isSelectorVisible) { this.reset(); }
        if (!show) {
            return;
        }

        this.reloadPageSizesSelector();
        if (!this.selectPageSizeComp) {
            return;
        }

        this.appendChild(this.selectPageSizeComp);
    }

    private reset(): void {
        clearElement(this.getGui());

        if (this.selectPageSizeComp) {
            this.destroyBean(this.selectPageSizeComp);
            this.selectPageSizeComp = undefined;
        }
    }

    private onPageSizeSelectorValuesChange(): void {
        if (!this.isSelectorVisible) {
            return;
        }

        this.reloadPageSizesSelector();
    }

    private reloadPageSizesSelector(): void {
        const pageSizesList = this.getPageSizeSelectorValues();

        let currentPageSize = this.paginationProxy.getPageSize();
        if (!currentPageSize || !pageSizesList.includes(currentPageSize)) {
            currentPageSize = pageSizesList[0];
            this.paginationProxy.setPageSize(currentPageSize);
        }

        const options = pageSizesList.map(
            value => ({ value: String(value), text: String(value) })
        );

        if (this.selectPageSizeComp) {
            this.destroyBean(this.selectPageSizeComp);
            this.selectPageSizeComp = undefined;
        }

        const localeTextFunc = this.localeService.getLocaleTextFunc();
        const localisedLabel = localeTextFunc('pageSizeShowLabel', 'Show');

        this.selectPageSizeComp = this.createManagedBean(new AgSelect());
        this.selectPageSizeComp.addOptions(options)
            .setValue(String(currentPageSize))
            .setLabel(localisedLabel)
            .setLabelAlignment('left')
            .setAriaLabel(localisedLabel)
            .onValueChange(() => this.handlePageSizeItemSelected());
    }

    private getPageSizeSelectorValues(): number[] {
        const paginationPageSizeSelector = this.gridOptionsService.get('paginationPageSizeSelector');
        if (Array.isArray(paginationPageSizeSelector)) {
            if (paginationPageSizeSelector.length === 0) {
                warnOnce('ag-grid: The paginationPageSizeSelector grid option is an empty array. This is most likely a mistake. ' +
                    'If you want to hide the page size selector, please set the paginationPageSizeSelector to false or undefined.');
                return PageSizeSelectorComp.defaultPageSizeOptions;
            }

            const hasInvalidValues = paginationPageSizeSelector.some(value => {
                const isNumber = typeof value === 'number';
                const isPositive = value > 0;

                if (!isNumber) {
                    warnOnce('ag-grid: The paginationPageSizeSelector grid option contains a non-numeric value. ' +
                        'Please make sure that all values in the paginationPageSizeSelector array are numbers.');
                }

                if (!isPositive) {
                    warnOnce('ag-grid: The paginationPageSizeSelector grid option contains a negative number or zero. ' +
                        'Please make sure that all values in the paginationPageSizeSelector array are positive.');
                }

                return !isNumber || !isPositive;
            });

            if (hasInvalidValues) {
                return PageSizeSelectorComp.defaultPageSizeOptions;
            }

            return paginationPageSizeSelector.sort((a, b) => a - b);
        }

        return PageSizeSelectorComp.defaultPageSizeOptions;
    }

    public destroy() {
        this.toggleSelectDisplay(false);
        super.destroy();
    }
}
