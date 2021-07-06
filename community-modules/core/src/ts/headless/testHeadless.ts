import { GridOptions } from "../entities/gridOptions";
import { HeadlessService } from "./headlessService";
import { clearElement } from "../utils/dom";

export class TestHeadless {

    public doSomething(eDiv: HTMLElement, gridOptions: GridOptions): void {

        const headlessService = (gridOptions.api as any).headlessService as HeadlessService;

        const headerRows = headlessService.getHeaderRows();
        const rows = headlessService.getRows();

        clearElement(eDiv);
        const eTable = document.createElement('table');

        headerRows.forEach(headerRow => {
            const eTr = document.createElement('tr');
            eTable.appendChild(eTr);

            headerRow.columns.forEach(col => {
                const eTh = document.createElement('th');
                eTr.appendChild(eTh);

                if (col.name != null) {
                    eTh.innerText = col.name;
                }
            });
        });

        rows.forEach(row => {
            const eTr = document.createElement('tr');
            eTable.appendChild(eTr);

            row.cells.forEach(cell => {
                const eTd = document.createElement('td');
                eTr.appendChild(eTd);

                if (cell.value != null) {
                    eTd.innerText = cell.value.toString();
                }
            });
        });

        eDiv.append(eTable);

        console.warn('TestHeadless.doSomething');
    }

}