import React from 'react';
import { ICellRendererParams } from "@ag-grid-community/core";
export default (props: ICellRendererParams<IOlympicData, number>) => <span>{new Array(props.value).fill('#').join('')}</span>;
