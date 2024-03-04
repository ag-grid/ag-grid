import { CustomCellRendererProps } from "@ag-grid-community/react";
import React from "react";

export default (params: CustomCellRendererProps) => {
  return (
    <a href={`https://en.wikipedia.org/wiki/${params.value}`} target="_blank">
      {params.value}
    </a>
  )
}
