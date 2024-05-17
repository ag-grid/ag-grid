import React from 'react';

export default (params) => {
    return (
        <a href={params.value} target="_blank">
            {new URL(params.value).hostname}
        </a>
    );
};
