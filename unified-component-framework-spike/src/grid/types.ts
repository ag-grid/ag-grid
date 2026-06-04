export interface ValueGetterParams {
  data: Record<string, unknown>;
  rowIndex: number;
}

export interface ColDef {
  name: string;
  label: string;
  width: number;
  pin?: "left" | "right";
  valueGetter?: (params: ValueGetterParams) => unknown;
}

export interface GridProps {
  rowData: Record<string, unknown>[];
  colDefs: ColDef[];
  rowHeight: number;
  headerRowHeight: number;
  pinnedTopRowData?: Record<string, unknown>[];
  pinnedBottomRowData?: Record<string, unknown>[];
  bufferRows?: number;      // Extra rows to render outside viewport (default: 5)
  maxPoolSize?: number;     // Max hidden rows to keep in pool (default: 20)
}

export interface VisibleRange {
  start: number;
  end: number;
}
