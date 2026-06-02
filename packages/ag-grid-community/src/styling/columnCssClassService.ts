import type { NamedBean } from '../context/bean';
import { BeanStub } from '../context/beanStub';
import type { AgColumn } from '../entities/agColumn';
import type { AgColumnGroup } from '../entities/agColumnGroup';
import type { RowNode } from '../entities/rowNode';

const EMPTY_CLASSES: readonly string[] = [];

/** @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time. */
export interface ColumnCssClassProvider {
    getCellCssClasses?(column: AgColumn, rowNode: RowNode): readonly string[];
    getHeaderCssClasses?(column: AgColumn | null, columnGroup: AgColumnGroup | null): readonly string[];
}

export class ColumnCssClassService extends BeanStub implements NamedBean {
    public readonly beanName = 'columnCssClassSvc' as const;

    private readonly providers: ColumnCssClassProvider[] = [];
    private hasCellCssClassProviders = false;
    private hasHeaderCssClassProviders = false;

    public addProvider(provider: ColumnCssClassProvider): void {
        this.providers.push(provider);
        this.hasCellCssClassProviders ||= provider.getCellCssClasses != null;
        this.hasHeaderCssClassProviders ||= provider.getHeaderCssClasses != null;
    }

    public hasCellProviders(): boolean {
        return this.hasCellCssClassProviders;
    }

    public hasHeaderProviders(): boolean {
        return this.hasHeaderCssClassProviders;
    }

    public getCellClasses(column: AgColumn, rowNode: RowNode): readonly string[] {
        const providers = this.providers;
        let classes: string[] | undefined;

        for (const provider of providers) {
            const providerClasses = provider.getCellCssClasses?.(column, rowNode);
            if (!providerClasses?.length) {
                continue;
            }

            classes ??= [];
            for (const cssClass of providerClasses) {
                classes.push(cssClass);
            }
        }

        return classes ?? EMPTY_CLASSES;
    }

    public getHeaderClasses(column: AgColumn | null, columnGroup: AgColumnGroup | null): readonly string[] {
        const providers = this.providers;
        let classes: string[] | undefined;

        for (const provider of providers) {
            const providerClasses = provider.getHeaderCssClasses?.(column, columnGroup);
            if (!providerClasses?.length) {
                continue;
            }

            classes ??= [];
            for (const cssClass of providerClasses) {
                classes.push(cssClass);
            }
        }

        return classes ?? EMPTY_CLASSES;
    }
}
