import { Component, PostConstruct, _, RefSelector } from '@ag-grid-community/core';
import { IDateTimeListModel, DateTimeListModel, Page, Entry } from './dateTimeListModel';

interface DateTimeListOptions {
    onValueSelect?: (value: Date) => void;
}

export class DateTimeList_agStack extends Component {
    private static TEMPLATE = /*html*/
        `<div class="ag-date-time-list">
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
    @RefSelector('eLabelsRow') private eLabelsRow: HTMLElement;
    @RefSelector('eEntriesTable') private eEntriesTable: HTMLElement;

    private currentPageNumber = 0;
    private model: IDateTimeListModel = new DateTimeListModel();

    constructor(private options: DateTimeListOptions = {}) {
        super(DateTimeList_agStack.TEMPLATE);
    }

    @PostConstruct
    private init(): void {
        this.addDestroyableEventListener(this.ePrevPageButton, 'click', this.navigate.bind(this, -1));
        this.addDestroyableEventListener(this.eNextPageButton, 'click', this.navigate.bind(this, 1));
        this.showPage(0);
    }

    private showPage(number: number) {
        this.currentPageNumber = number;
        const page = this.model.getPage(new Date(), number);

        this.eTitle.textContent = page.title;

        const rows = splitArray(page.entries, page.columns.length);

        this.eLabelsRow.innerHTML = '';
        page.columns.forEach(column => {
            const eLabel = _.loadTemplate(`<div class="ag-date-time-list-page-column-label"></div>`);
            eLabel.textContent = column.label;
            this.eLabelsRow.appendChild(eLabel);
        });

        this.eEntriesTable.innerHTML = '';
        rows.forEach(row => {
            const eEntriesRow = _.loadTemplate(`<div class="ag-date-time-list-page-entries-row"></div>`);
            row.forEach(entry => {
                const eEntry = _.loadTemplate(`<button class="ag-date-time-list-page-entry"></button>`);
                eEntry.textContent = entry.label;
                eEntry.addEventListener('click', this.handleEntryClick.bind(this, entry));
                if (entry.isPadding) {
                    _.addCssClass(eEntry, 'ag-date-time-list-page-entry-is-padding');
                }
                eEntriesRow.appendChild(eEntry);
            });
            this.eEntriesTable.appendChild(eEntriesRow);
        });
    }

    private handleEntryClick(entry: Entry) {
        if (this.options.onValueSelect) {
            this.options.onValueSelect(entry.value);
        }
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
