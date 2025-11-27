import type {
    FormulaDataSource,
    FormulaDataSourceParams,
    GetFormulaParams,
    IFormulaDataService,
    NamedBean,
    SetFormulaParams,
} from 'ag-grid-community';
import { BeanStub, _addGridCommonParams, _isExpressionString } from 'ag-grid-community';

export class FormulaDataService extends BeanStub implements IFormulaDataService, NamedBean {
    public readonly beanName = 'formulaDataSvc' as const;

    private dataSource?: FormulaDataSource;
    private hasSource: boolean = false;

    public postConstruct(): void {
        const dataSource = this.gos.get('formulaDataSource');
        if (dataSource) {
            this.setDataSource(dataSource);
        }
    }

    public hasDataSource(): boolean {
        return this.hasSource;
    }

    public hasFormula(params: GetFormulaParams): boolean {
        const { dataSource } = this;
        if (!dataSource) {
            return false;
        }

        if (dataSource.hasFormula) {
            return dataSource.hasFormula(params);
        }

        const formula = dataSource.getFormula?.(params);

        return _isExpressionString(formula);
    }

    public getFormula(params: GetFormulaParams): string | undefined {
        return this.dataSource?.getFormula?.(params);
    }

    public setFormula(params: SetFormulaParams): void {
        this.dataSource?.setFormula(params);
    }

    private setDataSource(dataSource: FormulaDataSource): void {
        this.dataSource = dataSource;
        this.hasSource = true;
        dataSource.init?.(this.createInitParams());
    }

    private createInitParams(): FormulaDataSourceParams {
        return _addGridCommonParams(this.gos, {});
    }

    public override destroy(): void {
        this.dataSource?.destroy?.();
        super.destroy();
    }
}
