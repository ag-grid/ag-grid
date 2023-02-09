import React from 'react';
import { Icon, iconMap } from '../../components/Icon';

export const Icons = () => {
    return (
        <>
            {Object.keys(iconMap).map((key) => {
                return (
                    <div key={key}>
                        <p className="item-label">
                            <Icon name={key} /> <code>&lt;Icon name="{key}" /&gt;</code>
                        </p>
                    </div>
                );
            })}
        </>
    );
};
