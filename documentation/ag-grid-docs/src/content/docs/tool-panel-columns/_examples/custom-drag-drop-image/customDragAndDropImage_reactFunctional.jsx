import React, { useEffect, useRef, useState } from 'react';

export default (props) => {
    const getIcon = (name) => {
        if (name === 'left') {
            return 'fa-hand-point-left';
        }

        if (name === 'right') {
            return 'fa-hand-point-right';
        }

        if (name === 'notAllowed') {
            return 'fa-ban';
        }

        if (name === 'pinned') {
            return 'fa-thumbtack';
        }

        if (name === 'group') {
            return 'fa-layer-group';
        }

        if (name === 'aggregate') {
            return 'fa-table';
        }

        if (name === 'pivot') {
            return 'fa-ruler-combined';
        }

        return 'fa-walking';
    };

    return (
        <div className="my-custom-drag-and-drop-cover">
            <i className={`fas fa-2x ${getIcon(props.icon)}`}></i>
            <div>{props.label}</div>
        </div>
    );
};
