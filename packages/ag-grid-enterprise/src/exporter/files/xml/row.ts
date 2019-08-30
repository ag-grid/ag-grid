import { XmlElement, _ } from 'ag-grid-community';
import { ExcelCell, ExcelRow, ExcelXMLTemplate } from 'ag-grid-community';
import cell from './cell';

const row: ExcelXMLTemplate = {
    getTemplate(r: ExcelRow): XmlElement {
        const {cells} = r;

        return {
            name: "Row",
            children: _.map(cells, (it:ExcelCell):XmlElement => {
                return cell.getTemplate(it);
            })
        };
    }
};

export default row;
