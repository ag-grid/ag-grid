// @ag-grid-community/react v28.1.1
import { ICellRendererComp } from '@ag-grid-community/core';
import { MutableRefObject } from 'react';
import { RenderDetails } from './cellComp';
declare const useJsCellRenderer: (showDetails: RenderDetails, showTools: boolean, eCellValue: HTMLElement, cellValueVersion: number, jsCellRendererRef: MutableRefObject<ICellRendererComp<any>>, eGui: MutableRefObject<any>) => void;
export default useJsCellRenderer;
