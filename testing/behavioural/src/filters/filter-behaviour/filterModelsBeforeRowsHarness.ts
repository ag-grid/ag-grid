import type { ColDef, IDoesFilterPassParams, IFilterComp, IFilterParams } from 'ag-grid-community';

export const ROWS = [
    { athlete: 'Michael Phelps', age: 23, country: 'United States', height: 193, date: '2008-08-24' },
    { athlete: 'Natalie Coughlin', age: 25, country: 'United States', height: 173, date: '2008-08-24' },
    { athlete: 'Aleksey Nemov', age: 24, country: 'Russia', height: 174, date: '2000-10-01' },
    { athlete: 'Missy Franklin', age: 17, country: 'United States', height: 185, date: '2012-08-12' },
    { athlete: 'Ian Thorpe', age: 17, country: 'Australia', height: 195, date: '2000-10-01' },
];

export const AGE_LT_20 = { filterType: 'number', type: 'lessThan', filter: 20 };

/** The phase a test is in, and each model a `RecordingFilter` was given with the phase it came in. */
export const timeline = { phase: 'before', customSetModelSeen: [] as string[] };

export class RecordingFilter implements IFilterComp {
    private model: any = null;
    private params!: IFilterParams;
    private readonly gui = document.createElement('div');
    public init(params: IFilterParams): void {
        this.params = params;
    }
    public getGui(): HTMLElement {
        return this.gui;
    }
    public isFilterActive(): boolean {
        return this.model != null;
    }
    public doesFilterPass(params: IDoesFilterPassParams): boolean {
        return params.data.athlete.includes(this.model.value);
    }
    public getModel(): any {
        return this.model;
    }
    public setModel(model: any): void {
        timeline.customSetModelSeen.push(
            `${timeline.phase}:rows=${this.params.api.getDisplayedRowCount()}:${JSON.stringify(model)}`
        );
        this.model = model;
    }
}

export const BASE_COLS: ColDef[] = [
    { field: 'athlete', filter: true },
    { field: 'age', filter: true },
    { field: 'country', filter: true },
];
