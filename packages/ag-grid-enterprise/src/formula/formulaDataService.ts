import type {
    FormulaDataSource,
    FormulaDataSourceParams,
    GetFormulaParams,
    IFormulaDataService,
    SetFormulaParams,
    _NamedBean,
} from 'ag-grid-community';
import { _BeanStub, _addGridCommonParams, _isExpressionString } from 'ag-grid-community';

export class FormulaDataService extends _BeanStub implements IFormulaDataService, _NamedBean {
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

    public getFormula(params: GetFormulaParams): string | undefined {
        const formula = this.dataSource?.getFormula(params);
        return _isExpressionString(formula) ? formula : undefined;
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
