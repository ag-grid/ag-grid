import type { FindPart, ICellRendererComp, ICellRendererParams } from 'ag-grid-community';

import { getLatinText } from './data';

export class FullWidthCellRenderer implements ICellRendererComp {
    eGui!: HTMLElement;

    init(params: ICellRendererParams) {
        // trick to convert string of html into dom object
        const eTemp = document.createElement('div');
        eTemp.innerHTML = this.getTemplate(params);
        this.eGui = eTemp.firstElementChild as HTMLElement;
    }

    private getTemplate(params: ICellRendererParams) {
        // the flower row shares the same data as the parent row
        const data = params.node.data;

        const template = `<div class="full-width-panel">  
                <div class="full-width-flag">    
                    <img border="0" src="https://www.ag-grid.com/example-assets/large-flags/${data.code}.png">  
                </div>  
                <div class="full-width-summary">    
                    <span class="full-width-title">${data.name}</span><br/>
                    <label><b>Population:</b> ${data.population}</label><br/>
                    <label><b>Language:</b> ${data.language}</label><br/>  
                </div>  
                <div class="full-width-center">${this.latinText(params)} 
                </div>
            </div>`;

        return template;
    }

    private latinText(params: ICellRendererParams) {
        const { api, node } = params;
        const originalSampleText = 'Sample Text in a Paragraph';
        const originalLatinText = getLatinText();
        let numMatches = 0;
        const convert = (parts: FindPart[], defaultValue: string) => {
            if (!parts.length) {
                return defaultValue;
            }
            return parts
                .map(({ value, match, activeMatch }) => {
                    if (match) {
                        numMatches++;
                        return `<mark class="ag-find-match${activeMatch ? ' ag-find-active-match' : ''}">${value}</mark>`;
                    }
                    return value;
                })
                .join('');
        };
        const sample = convert(
            api.findGetParts({
                value: originalSampleText,
                node,
                column: null,
            }),
            originalSampleText
        );
        const latinText = convert(
            api.findGetParts({
                value: originalLatinText,
                node,
                column: null,
                precedingNumMatches: numMatches,
            }),
            originalLatinText
        );
        return `<p>${sample}</p><p>${latinText}</p>`;
    }

    getGui() {
        return this.eGui;
    }

    refresh(params: ICellRendererParams): boolean {
        return false;
    }
}
