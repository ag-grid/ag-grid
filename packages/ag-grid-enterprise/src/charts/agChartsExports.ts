import type { IntegratedModule } from 'ag-charts-types';

import type { NamedBean } from 'ag-grid-community';
import { BeanStub } from 'ag-grid-community';

import type { IAgChartsExports } from '../agStack/iAgChartsExports';

/** Bean to expose the AG Charts apis from a single location and not require a code dependency on ag-charts-community */
export class AgChartsExports extends BeanStub implements NamedBean, IAgChartsExports {
    beanName = 'agChartsExports' as const;

    isEnterprise = false;
    create: IAgChartsExports['create'];
    _Theme: IAgChartsExports['_Theme'];

    constructor(params: IntegratedModule) {
        super();
        this.create = params.create;
        this._Theme = params._Theme;
        this.isEnterprise = params.isEnterprise;
    }
}
