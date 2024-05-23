import React from 'react';

export default (params) => {
    if (!params.value) {
        return;
    }
    return (
        <div>
            <div className="show-name">{params.value.name}</div>
            <div className="presenter-name">{params.value.presenter}</div>
        </div>
    );
};
