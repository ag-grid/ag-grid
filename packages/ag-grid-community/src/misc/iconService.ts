import type { IIconService } from '../agStack/interfaces/iIconService';
import type { NamedBean } from '../context/bean';
import { BeanStub } from '../context/beanStub';
import type { AgColumn } from '../entities/agColumn';
import type { IconName } from '../utils/icon';
import { _createIconNoSpan } from '../utils/icon';

export class IconService extends BeanStub implements NamedBean, IIconService<IconName, { column?: AgColumn | null }> {
    beanName = 'iconSvc' as const;

    public createIconNoSpan(iconName: IconName, params?: { column?: AgColumn<any> | null }): Element | undefined {
        return _createIconNoSpan(iconName, this.beans, params?.column);
    }
}
