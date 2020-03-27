import { Component, PostConstruct, _ } from '@ag-grid-community/core';
import { IDateTimeListModel, DateTimeListModel } from './dateTimeListModel';

interface DateTimeListOptions {
    onValueSelect?: (value: Date) => void;
}

export class DateTimeList extends Component {
    private static TEMPLATE = `<div class="ag-date-time-list"></div>`;

    private currentPageNumber = 0;
    private model: IDateTimeListModel = new DateTimeListModel();

    constructor(private options: DateTimeListOptions = {}) {
        super(DateTimeList.TEMPLATE);
    }

    @PostConstruct
    private init(): void {
        this.showPage(0);
        this.addDestroyableEventListener(this.getGui(), 'click', this.handleClick.bind(this));
    }

    private showPage(number: number) {
        this.currentPageNumber = number;
        const page = this.model.getPage(new Date(), number);
        const rows = splitArray(page.entries, page.columns.length);
        this.getGui().innerHTML = '';
        const ePage = div('page',
            div('page-title-bar',
                button(['page-button', 'prev-page-button'], "<"),
                div('page-title', page.title),
                button(['page-button', 'next-page-button'], ">"),
            ),
            div('page-entries',
                div('page-column-labels-row',
                    page.columns.map(column => div('page-column-label', column.label))),
                    rows.map(
                        row => div('page-entries-row', row.map(
                            entry => {
                                const b = button(['page-entry', entry.isPadding && 'page-entry-is-padding'], entry.label);
                                (b as any).entryValue = entry.value;
                                return b;
                            }
                        )
                    )
                )
            )
        );
        this.getGui().appendChild(ePage);
    }

    private handleClick(e: MouseEvent) {
        let target = e.target as HTMLElement;
        // find nearest button if any
        while (target.nodeName !== 'BUTTON') {
            target = target.parentElement;
            if (!target || target === this.getGui()) {
                return;
            }
        }
        const className = target.className;

        if (className.indexOf('next-page-button') !== -1) {
            this.showPage(this.currentPageNumber + 1);
        }

        if (className.indexOf('prev-page-button') !== -1) {
            this.showPage(this.currentPageNumber - 1);
        }

        if (className.indexOf('prev-page-button') !== -1) {
            this.showPage(this.currentPageNumber - 1);
        }

        if (className.indexOf('page-entry') !== -1 && this.options.onValueSelect) {
            // TODO a nicer way of setting listeners
            this.options.onValueSelect((target as any).entryValue);
        }
    }
}

const elementBuilder = (tagName: string) => (
    className: string | Array<string | boolean | undefined | null>,
    ...children: Array<HTMLElement[] | HTMLElement | string>
): HTMLElement => {
    if (Array.isArray(className)) {
        className = className.filter(Boolean);
    } else {
        className = [className];
    }
    const element = document.createElement(tagName);
    element.className = className.map(c => 'ag-date-time-list-' + c).join(' ');
    children.forEach(child => {
        if (child instanceof HTMLElement) {
            element.appendChild(child);
        } else if (typeof child === 'string') {
            element.appendChild(document.createTextNode(child));
        } else {
            child.forEach(subChild => element.appendChild(subChild));
        }
    });
    return element;
};

const div = elementBuilder("div");
const button = elementBuilder("button");

const splitArray = <T>(array: T[], chunkSize: number): T[][] => {
    const chunks: T[][] = [];
    array.forEach((value, i) => {
        const chunkIndex = Math.floor(i / chunkSize);
        chunks[chunkIndex] = chunks[chunkIndex] || [];
        chunks[chunkIndex].push(value);
    });
    return chunks;
};
