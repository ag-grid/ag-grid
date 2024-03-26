import { Component } from "../../widgets/component";
import { Autowired, PostConstruct } from "../../context/context";
import { AgSelect } from "../../widgets/agSelect";
import { Events } from "../../eventKeys";
import { PaginationChangedEvent } from "../../events";
import { PaginationProxy } from "../../pagination/paginationProxy";
import { WithoutGridCommon } from "../../interfaces/iCommon";
import { clearElement } from "../../utils/dom";
import { warnOnce } from "../../utils/function";

export class PageSizeSelectorComp extends Component {

    @Autowired('paginationProxy') private paginationProxy: PaginationProxy;

    private selectPageSizeComp: AgSelect | undefined;
    private hasEmptyOption = false;

    constructor() {
        super(/* html */`<span class="ag-paging-page-size"></span>`);
    }

    @PostConstruct
    private init() {
        this.addManagedPropertyListener('paginationPageSizeSelector', () => {
            this.onPageSizeSelectorValuesChange();
        });

        this.addManagedListener(
            this.eventService,
            Events.EVENT_PAGINATION_CHANGED,
            (event) => this.handlePaginationChanged(event),
        );
    }

    private handlePageSizeItemSelected = (): void => {
        if (!this.selectPageSizeComp) { return; }

        const newValue = this.selectPageSizeComp.getValue();

        if (!newValue) { return; }

        const paginationPageSize = Number(newValue);

        if (
            isNaN(paginationPageSize) ||
            paginationPageSize < 1 ||
            paginationPageSize === this.paginationProxy.getPageSize()
        ) { return; }

        this.paginationProxy.setPageSize(paginationPageSize, 'pageSizeSelector');

        if (this.hasEmptyOption) {
            // Toggle the selector to force a refresh of the options and hide the empty option,
            // as it's no longer needed.
            this.toggleSelectDisplay(true);
        }

        this.selectPageSizeComp.getFocusableElement().focus();
    };

    private handlePaginationChanged(paginationChangedEvent?: WithoutGridCommon<PaginationChangedEvent>): void {
        if (!this.selectPageSizeComp || !paginationChangedEvent?.newPageSize) { return; }

        const paginationPageSize = this.paginationProxy.getPageSize();
        if (this.getPageSizeSelectorValues().includes(paginationPageSize)) {
            this.selectPageSizeComp.setValue(paginationPageSize.toString());
        } else {
            if (this.hasEmptyOption) {
                this.selectPageSizeComp.setValue('');
            } else {
                this.toggleSelectDisplay(true);
            }
        }
    }

    public toggleSelectDisplay(show: boolean) {
        if (this.selectPageSizeComp) {
            this.reset();
        }

        if (!show) { return; }

        this.reloadPageSizesSelector();

        if (!this.selectPageSizeComp) { return; }

        this.appendChild(this.selectPageSizeComp);
    }

    private reset(): void {
        clearElement(this.getGui());

        if (!this.selectPageSizeComp) { return; }

        this.destroyBean(this.selectPageSizeComp);
        this.selectPageSizeComp = undefined;
    }

    private onPageSizeSelectorValuesChange(): void {
        if (!this.selectPageSizeComp) { return; }

        if (this.shouldShowPageSizeSelector()) {
            this.reloadPageSizesSelector();
        }
    }

    public shouldShowPageSizeSelector(): boolean {
        return (
            this.gos.get('pagination') &&
            !this.gos.get('suppressPaginationPanel') &&
            !this.gos.get('paginationAutoPageSize') &&
            this.gos.get('paginationPageSizeSelector') !== false
        );
    }

    private reloadPageSizesSelector(): void {
        const pageSizeOptions: (number | string)[] = this.getPageSizeSelectorValues();
        const paginationPageSizeOption: number = this.paginationProxy.getPageSize();
        const shouldAddAndSelectEmptyOption = !paginationPageSizeOption || !pageSizeOptions.includes(paginationPageSizeOption)
        if (shouldAddAndSelectEmptyOption) {
            // When the paginationPageSize option is set to a value that is
            // not in the list of page size options.
            pageSizeOptions.unshift('');

            warnOnce(
                `The paginationPageSize grid option is set to a value that is not in the list of page size options.
                Please make sure that the paginationPageSize grid option is set to one of the values in the 
                paginationPageSizeSelector array, or set the paginationPageSizeSelector to false to hide the page size selector.`
            );
        }

        if (this.selectPageSizeComp) {
            this.destroyBean(this.selectPageSizeComp);
            this.selectPageSizeComp = undefined;
        }

        const localeTextFunc = this.localeService.getLocaleTextFunc();
        const localisedLabel = localeTextFunc('pageSizeSelectorLabel', 'Page Size:');

        const options = pageSizeOptions.map(value => ({
            value: String(value),
            text: String(value)
        }));

        const localisedAriaLabel = localeTextFunc('ariaPageSizeSelectorLabel', 'Page Size');

        this.selectPageSizeComp = this.createManagedBean(new AgSelect())
            .addOptions(options)
            .setValue(String(shouldAddAndSelectEmptyOption ? '' : paginationPageSizeOption))
            .setAriaLabel(localisedAriaLabel)
            .setLabel(localisedLabel)
            .onValueChange(() => this.handlePageSizeItemSelected());

        this.hasEmptyOption = shouldAddAndSelectEmptyOption;
    }

    private getPageSizeSelectorValues(): number[] {
        const defaultValues = [20, 50, 100];
        const paginationPageSizeSelectorValues = this.gos.get('paginationPageSizeSelector');

        if (
            !Array.isArray(paginationPageSizeSelectorValues) ||
            !this.validateValues(paginationPageSizeSelectorValues)
        ) {
            return defaultValues;
        }

        return [...paginationPageSizeSelectorValues].sort((a, b) => a - b);
    }

    private validateValues(values: number[]): boolean {
        if (!values.length) {
            warnOnce(
                `The paginationPageSizeSelector grid option is an empty array. This is most likely a mistake.
                If you want to hide the page size selector, please set the paginationPageSizeSelector to false.`
            );

            return false;
        }

        for (let i = 0; i < values.length; i++) {
            const value = values[i];
            const isNumber = typeof value === 'number';
            const isPositive = value > 0;

            if (!isNumber) {
                warnOnce(
                    `The paginationPageSizeSelector grid option contains a non-numeric value.
                    Please make sure that all values in the paginationPageSizeSelector array are numbers.`
                );
                return false;
            }

            if (!isPositive) {
                warnOnce(
                    `The paginationPageSizeSelector grid option contains a negative number or zero.
                    Please make sure that all values in the paginationPageSizeSelector array are positive.`
                );

                return false;
            }
        }

        return true;
    }

    public destroy() {
        this.toggleSelectDisplay(false);
        super.destroy();
    }
}
