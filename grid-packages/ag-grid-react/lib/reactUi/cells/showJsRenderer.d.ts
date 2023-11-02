// ag-grid-react v30.2.1
import { ICellRendererComp } from 'ag-grid-community';
import { MutableRefObject } from 'react';
import { RenderDetails } from './cellComp';
declare const useJsCellRenderer: (showDetails: RenderDetails | undefined, showTools: boolean, eCellValue: HTMLElement | undefined, cellValueVersion: number, jsCellRendererRef: MutableRefObject<ICellRendererComp | undefined>, eGui: MutableRefObject<any>) => void;
export default useJsCellRenderer;
