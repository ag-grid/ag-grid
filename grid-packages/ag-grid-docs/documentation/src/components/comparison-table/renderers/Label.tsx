import React from 'react';
import { IconName, Icon } from '../../Icon';

export function Label({ value }: { value: { name: string; icon?: string; link: string; } }) {
    const iconName:IconName = value.icon;

    return <>
        {iconName && <Icon name={iconName}/>}
        <a href={value.link}>{value.name}</a>
    </>;
}