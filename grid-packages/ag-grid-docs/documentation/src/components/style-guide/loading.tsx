import React from 'react';

export const Loading = () => {
    return (
        <>
            <article aria-busy="true"></article>
            <button aria-busy="true">Please wait…</button>
        </>
    );
};
