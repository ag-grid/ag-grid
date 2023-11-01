import {Component} from "../../widgets/component";
import {Autowired, PostConstruct} from "../../context/context";
import {LocaleService} from "../../localeService";
import {GridOptionsService} from "../../gridOptionsService";
import {PaginationProxy} from "../paginationProxy";
import {AgSelect} from "../../main";
import {clearElement} from "../../utils/dom";

const defaultPageSizeSelectorValues = [10, 25, 50, 100];

export class PageSizeSelectorComp extends Component {

    @Autowired('localeService') protected readonly localeService: LocaleService;
    @Autowired('gridOptionsService') protected readonly gridOptionsService: GridOptionsService;
    @Autowired('paginationProxy') private paginationProxy: PaginationProxy;

    private eSelectPageSize: AgSelect | undefined;
    private ePageSizeLabel: HTMLElement | undefined;

    private paginationParams: {
        showPageSizeSelector?: boolean;
        pageSizeSelectorValues?: number[];
    } | undefined;

    constructor() {
        super(
            `<span class="ag-paging-page-size-comp"></span>`
        );
    }

    @PostConstruct
    private init() {
        this.paginationParams = this.gridOptionsService.get('paginationParams');
        this.addManagedPropertyListener('paginationParams', () => this.handlePaginationParamsChange());

        if (this.paginationParams?.showPageSizeSelector) {
            this.show();
        }
    }

    public get isMounted() {
        return typeof this.eSelectPageSize !== 'undefined';
    }

    private handlePageSizeItemSelected = (): void => {
        if (!this.eSelectPageSize) {
            return;
        }

        const newValue = this.eSelectPageSize.getValue();
        if (!newValue) { return; }

        const newPageSize = Number(newValue);
        if (isNaN(newPageSize) || newPageSize < 1) { return; }
        if (newPageSize === this.paginationProxy.getPageSize()) { return; }

        this.paginationProxy.setPageSize(newPageSize);
    };

    public show(): void {
        if (this.isMounted) {
            return;
        }

        const pageSizesList = this.getPageSizeSelectorValues();
        const currentPageSize = this.paginationProxy.getPageSize();

        const localeTextFunc = this.localeService.getLocaleTextFunc();
        const strPage = localeTextFunc('pageSizeShowLabel', 'Show');

        this.ePageSizeLabel = document.createElement('span');
        this.ePageSizeLabel.appendChild(document.createTextNode(strPage));

        this.eSelectPageSize = this.createManagedBean(new AgSelect());
        this.eSelectPageSize
            .onValueChange(() => this.handlePageSizeItemSelected())
            .resetOptions(pageSizesList.map(
                value => ({ value: String(value), text: String(value) })
            ));

        this.eSelectPageSize.setValue(String(currentPageSize));

        this.getGui().appendChild(this.ePageSizeLabel);
        this.getGui().appendChild(this.eSelectPageSize.getGui());
    }

    public hide(): void {
        clearElement(this.getGui());

        if (this.eSelectPageSize) {
            this.eSelectPageSize.destroy();
            this.eSelectPageSize = undefined;
        }

        if (this.ePageSizeLabel) {
            this.ePageSizeLabel = undefined;
        }
    }

    private handlePaginationParamsChange(): void {
        const oldPaginationParams = this.paginationParams;
        if (this.paginationParams?.pageSizeSelectorValues !== oldPaginationParams?.pageSizeSelectorValues) {
            this.handlePageSizeSelectorValuesChange();
        }
    }

    private handlePageSizeSelectorValuesChange(): void {
        if (!this.eSelectPageSize) {
            return;
        }

        const pageSizesList = this.getPageSizeSelectorValues();
        const currentPageSize = this.paginationProxy.getPageSize();
        this.eSelectPageSize.resetOptions(pageSizesList.map(
            value => ({ value: String(value), text: String(value) })
        ));

        if (pageSizesList.includes(currentPageSize)) {
            this.eSelectPageSize.setValue(String(currentPageSize));
        } else {
            const newPageSize = pageSizesList[0];
            this.paginationProxy.setPageSize(newPageSize);
            this.eSelectPageSize.setValue(String(newPageSize));
        }
    }

    private getPageSizeSelectorValues(): number[] {
        const paginationParams = this.gridOptionsService.get('paginationParams');
        return paginationParams?.pageSizeSelectorValues ?? defaultPageSizeSelectorValues;
    }

    public destroy() {
        this.hide();
        super.destroy();
    }
}
