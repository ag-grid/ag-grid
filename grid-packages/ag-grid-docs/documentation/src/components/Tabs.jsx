import React, { useState } from 'react';
import classnames from 'classnames';

import styles from './Tabs.module.scss';
import { doOnEnter } from './key-handlers';

export const Tabs = (props) => {
    const { children } = props;
    const realChildren = children.filter((child) => child?.props?.label != null);

    const [selected, setSelected] = useState(realChildren[0].props.label);

    return <div className={styles['tabs']}>
        <ul className="nav nav-tabs">
            {realChildren.map(({ props: { label = '' } }, idx) => {
                return (
                    <li>
                        <a
                            href={`#${label}`}
                            className={classnames('nav-link', {'active': label === selected})}
                            key={label}
                            onClick={(e) => { setSelected(label); e.preventDefault(); }}
                            onKeyDown={(e) => doOnEnter(e, () => { setSelected(label); })}
                            role="tab"
                            tabIndex={idx}
                        >
                            <p>{label}</p>
                        </a>
                    </li>
                );
            })}
        </ul>
        <div className={styles['tab-content']}>
            <div className="tab-pane show active">
                {realChildren.find(({ props: { label } }) => label === selected)}
            </div>
        </div>
    </div>;
};
