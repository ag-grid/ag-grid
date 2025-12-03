import type { Component, ISideBar, ISideBarService, _ComponentSelector, _NamedBean } from 'ag-grid-community';
import { _BeanStub } from 'ag-grid-community';

import { AgSideBarSelector } from './agSideBar';

export class SideBarService extends _BeanStub implements _NamedBean, ISideBarService {
    beanName = 'sideBar' as const;

    public comp: ISideBar;

    public getSelector(): _ComponentSelector<Component> {
        return AgSideBarSelector;
    }
}
