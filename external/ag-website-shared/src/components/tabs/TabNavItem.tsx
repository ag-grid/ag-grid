import classnames from 'classnames';
import type { ComponentPropsWithRef } from 'react';

export const TabNavItem = ({
    label,
    selected,
    tabProps,
}: {
    label: string;
    selected: boolean;
    /** From `useTabList().getTabProps` */
    tabProps: ComponentPropsWithRef<'button'>;
}) => {
    return (
        <li className="tabs-nav-item" role="presentation">
            <button className={classnames('button-style-none', 'tabs-nav-link', { active: selected })} {...tabProps}>
                {label}
            </button>
        </li>
    );
};
