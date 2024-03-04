import { ICellRendererParams } from "@ag-grid-community/core";

export function CompanyRenderer(params: ICellRendererParams) {
    const link = `<a href="https://en.wikipedia.org/wiki/${params.value}" target="_blank">${params.value}</a>`
    return link
  }