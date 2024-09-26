import React from 'react';

import type { CustomDragAndDropImageProps } from 'ag-grid-react';

export default (props: CustomDragAndDropImageProps & { accentColour: string }) => {
    const getIcon = (icon: string | null): string | undefined => {
        const { dragSource, api } = props;

        if (!icon) {
            icon = dragSource.getDefaultIconName ? dragSource.getDefaultIconName() : 'notAllowed';
        }

        if (icon === 'hide' && api.getGridOption('suppressDragLeaveHidesColumns')) {
            return '';
        }

        if (icon === 'left') {
            return 'fa-hand-point-left';
        }

        if (icon === 'right') {
            return 'fa-hand-point-right';
        }

        if (icon === 'hide') {
            return 'fa-mask';
        }

        if (icon === 'notAllowed') {
            return 'fa-ban';
        }

        if (icon === 'pinned') {
            return 'fa-thumbtack';
        }

        return 'fa-walking';
    };

    return (
        <div className="my-custom-drag-and-drop-cover" style={{ backgroundColor: props.accentColour }}>
            <i className={`fas fa-2x ${getIcon(props.icon)}`}></i>
            <div>{props.label}</div>
        </div>
    );
};
