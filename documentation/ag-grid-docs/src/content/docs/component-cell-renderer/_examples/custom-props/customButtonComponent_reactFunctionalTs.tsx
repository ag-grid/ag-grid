import { CustomCellRendererProps } from "@ag-grid-community/react";
import React from "react";

interface CustomButtonParams extends CustomCellRendererProps {
  onClick: () => void;
}

export default (params: CustomButtonParams) => {
  return (
    <button onClick={params.onClick}>Launch!</button>
  )
}
