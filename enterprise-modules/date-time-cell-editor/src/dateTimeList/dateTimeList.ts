import { Component, PostConstruct, _, RefSelector } from '@ag-grid-community/core';
import { IDateTimeListModel, DateTimeListModel, Entry } from './dateTimeListModel';

interface DateTimeListOptions {
    onValueSelect: (value: Date) => void;
    initialValue?: Date;
}

export class DateTimeList extends Component {
    private static TEMPLATE = /*html*/
        `<div class="ag-date-time-list" tabindex="-1">
            <div class="ag-date-time-list-page">
                <div class="ag-date-time-list-page-title-bar">
                    <button ref="ePrevPageButton" class="ag-date-time-list-page-prev-button">&lt;</button>
                    <div ref="eTitle" class="ag-date-time-list-page-title"></div>
                    <button ref="eNextPageButton" class="ag-date-time-list-page-next-button">&gt;</button>
                </div>
                <div ref="eLabelsRow" class="ag-date-time-list-page-column-labels-row"></div>
                <div ref="eEntriesTable" class="ag-date-time-list-page-entries"></div>
            </div>
        </div>
    `;

    @RefSelector('ePrevPageButton') private ePrevPageButton: HTMLButtonElement;
    @RefSelector('eTitle') private eTitle: HTMLElement;
    @RefSelector('eNextPageButton') private eNextPageButton: HTMLButtonElement;
    @RefSelector('eLabelsRow') private eLabelsRow: HTMLDivElement;
    @RefSelector('eEntriesTable') private eEntriesTable: HTMLDivElement;

    private currentPageNumber = 0;
    private model: IDateTimeListModel = new DateTimeListModel();
    private columnLabels: HTMLElement[] = [];
    private rowComps: DateTimeListPageEntriesRowComp[] = [];
    private onValueSelect: (value: Date) => void;
    private initialValue: Date;

    constructor(options: DateTimeListOptions) {
        super();
        this.onValueSelect = options.onValueSelect;
        this.initialValue = options.initialValue || new Date();
    }

    @PostConstruct
    public init(): void {
        this.setTemplate(DateTimeList.TEMPLATE);
        this.addDestroyableEventListener(this.ePrevPageButton, 'click', this.navigate.bind(this, -1));
        this.addDestroyableEventListener(this.eNextPageButton, 'click', this.navigate.bind(this, 1));
        this.showPage(0);
    }

    private showPage(number: number) {
        this.currentPageNumber = number;
        const page = this.model.getPage(this.initialValue, number);

        this.eTitle.textContent = page.title;
        
        const rows = splitArray(page.entries, page.columns.length);

        rows.forEach((row, i) => this.getRowComp(i).setEntries(row));
        this.rowComps.forEach((comp, i) => comp.setDisplayed(i < rows.length));

        page.columns.forEach((column, i) => this.getColumnLabel(i).textContent = column.label);
        this.columnLabels.forEach((columnLabel, i) => _.setDisplayed(columnLabel, i < page.columns.length));
    }

    private getRowComp(index: number ) {
        if (!this.rowComps[index]) {
            const rowComp = new DateTimeListPageEntriesRowComp(this.onValueSelect);
            this.appendChild(rowComp, this.eEntriesTable);
            this.rowComps[index] = rowComp;
        }
        return this.rowComps[index];
    }

    private getColumnLabel(index: number ) {
        if (!this.columnLabels[index]) {
            const label = _.loadTemplate(`<div class="ag-date-time-list-page-column-label"></div>`);
            this.appendChild(label, this.eLabelsRow);
            this.columnLabels[index] = label;
        }
        return this.columnLabels[index];
    }

    private navigate(relativePage: number) {
        this.showPage(this.currentPageNumber + relativePage);
    }
}

const splitArray = <T>(array: T[], chunkSize: number): T[][] => {
    const chunks: T[][] = [];
    array.forEach((value, i) => {
        const chunkIndex = Math.floor(i / chunkSize);
        chunks[chunkIndex] = chunks[chunkIndex] || [];
        chunks[chunkIndex].push(value);
    });
    return chunks;
};


class DateTimeListPageEntriesRowComp extends Component {
    private static TEMPLATE = /*html*/ `<div class="ag-date-time-list-page-entries-row"></div>`;

    private entryComps: DateTimeListPageEntryComp[] = [];

    public constructor(private onValueSelect: (value: Date) => void) {
        super(DateTimeListPageEntriesRowComp.TEMPLATE);
    }

    public setEntries(entries: Entry[]) {
        entries.forEach((entry, i) => this.getEntryComponent(i).setEntry(entry));
        this.entryComps.forEach((comp, i) => comp.setDisplayed(i < entries.length));
    }

    private getEntryComponent(index: number) {
        if (!this.entryComps[index]) {
            this.entryComps[index] = new DateTimeListPageEntryComp(this.onValueSelect);
            this.appendChild(this.entryComps[index]);
        }
        return this.entryComps[index];
    }
}


class DateTimeListPageEntryComp extends Component {
    private static TEMPLATE = /*html*/ `<button class="ag-date-time-list-page-entry"></button>`;

    private entry: Entry;

    public constructor(private onValueSelect: (value: Date) => void) {
        super(DateTimeListPageEntryComp.TEMPLATE);
        this.addDestroyableEventListener(this.getGui(), 'click', this.handleClick.bind(this));
    }

    public setEntry(entry: Entry) {
        this.entry = entry;
        this.getGui().textContent = entry.label;
        _.addOrRemoveCssClass(this.getGui(), 'ag-date-time-list-page-entry-is-padding', entry.isPadding);
    }

    private handleClick() {
        this.onValueSelect(this.entry.value);
    }
}
