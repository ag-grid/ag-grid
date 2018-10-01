import {ExcelOOXMLTemplate} from 'ag-grid-community';

const borderFactory: ExcelOOXMLTemplate = {
    getTemplate(border: Border) {
        const {left, right, top, bottom, diagonal} = border;

        return {
            name: "border",
            children: [{
                name: 'left',
                properties: { rawMap: { val: left } }
            },{
                name: 'right',
                properties: { rawMap: { val: right } }
            },{
                name: 'top',
                properties: { rawMap: { val: top } }
            },{
                name: 'bottom',
                properties: { rawMap: { val: bottom } }
            },{
                name: 'diagonal',
                properties: { rawMap: { val: diagonal } }
            }]
        };
    }
};

export default borderFactory;

export interface Border {
    left: string;
    right: string;
    top: string;
    bottom: string;
    diagonal: string;
}