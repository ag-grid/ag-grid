import { ICellRendererParams } from '@ag-grid-community/core';
import React, { memo, useMemo } from 'react';

export default memo((props: ICellRendererParams) => {
    const imageForMood = (mood: string) =>
        'https://www.ag-grid.com/example-assets/smileys/' + (mood === 'Happy' ? 'happy.png' : 'sad.png');

    const mood = useMemo(() => imageForMood(props.value), [props.value]);

    return <img width="20px" src={mood} />;
});
