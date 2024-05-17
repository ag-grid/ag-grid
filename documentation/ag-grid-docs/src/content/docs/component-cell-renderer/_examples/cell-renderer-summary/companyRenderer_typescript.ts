import { ICellRendererParams } from '@ag-grid-community/core';

export function CompanyRenderer(params: ICellRendererParams) {
    const link = `<a href="${params.value}" target="_blank">${new URL(params.value).hostname}</a>`;
    return link;
}
