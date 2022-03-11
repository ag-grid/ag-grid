// ag-grid-react v27.1.0
import { ICellRendererComp } from 'ag-grid-community';
import { MutableRefObject } from 'react';
import { RenderDetails } from './cellComp';
declare const useJsCellRenderer: (showDetails: RenderDetails, showTools: boolean, eCellValue: HTMLElement, cellValueVersion: number, jsCellRendererRef: MutableRefObject<ICellRendererComp>, eGui: MutableRefObject<any>) => void;
export default useJsCellRenderer;
