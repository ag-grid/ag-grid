import React, {Component} from "react";
import { ICellRendererParams } from "@ag-grid-community/core";

export default function cellRenderer(props: ICellRendererParams) {
  const handleClick = () => {
    props.api.startEditingCell({
      rowIndex: props.rowIndex,
      colKey: props.column!.getId(),
    });
  };
  return (
    <span>
      <button style={{ height: '30px'}} onClick={handleClick}>✎</button>
      <span style={{ paddingLeft: '4px'}}>{props.value}</span>
    </span>
  );
}