import type { NamedBean } from '../context/bean';
import { BeanStub } from '../context/beanStub';
import type { AgColumn } from '../entities/agColumn';
import type { AgColumnGroup } from '../entities/agColumnGroup';
import type { RowNode } from '../entities/rowNode';

/** @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time. */
export interface CellCssClassProviderParams {
    column: AgColumn;
    rowNode: RowNode;
}

/** @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time. */
export interface HeaderCssClassProviderParams {
    column: AgColumn | null;
    columnGroup: AgColumnGroup | null;
}

/** @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time. */
export interface ColumnCssClassProvider {
    getCellCssClasses?(params: CellCssClassProviderParams): string[];
    getHeaderCssClasses?(params: HeaderCssClassProviderParams): string[];
}

export class ColumnCssClassService extends BeanStub implements NamedBean {
    public readonly beanName = 'columnCssClassSvc' as const;

    private readonly providers: ColumnCssClassProvider[] = [];

    public addProvider(provider: ColumnCssClassProvider): void {
        this.providers.push(provider);
    }

    public getCellClasses(column: AgColumn, rowNode: RowNode): string[] {
        const providers = this.providers;
        const classes: string[] = [];
        const params: CellCssClassProviderParams = { column, rowNode };

        for (const provider of providers) {
            const providerClasses = provider.getCellCssClasses?.(params);
            if (!providerClasses?.length) {
                continue;
            }

            for (const cssClass of providerClasses) {
                classes.push(cssClass);
            }
        }

        return classes;
    }

    public getHeaderClasses(column: AgColumn | null, columnGroup: AgColumnGroup | null): string[] {
        const providers = this.providers;
        const classes: string[] = [];
        const params: HeaderCssClassProviderParams = { column, columnGroup };

        for (const provider of providers) {
            const providerClasses = provider.getHeaderCssClasses?.(params);
            if (!providerClasses?.length) {
                continue;
            }

            for (const cssClass of providerClasses) {
                classes.push(cssClass);
            }
        }

        return classes;
    }
}
