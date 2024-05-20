import React, { memo, useMemo } from 'react';

export default memo((props) => {
    const imageForMood = (mood) =>
        'https://www.ag-grid.com/example-assets/smileys/' + (mood === 'Happy' ? 'happy.png' : 'sad.png');

    const mood = useMemo(() => imageForMood(props.value), [props.value]);

    return <img width="20px" src={mood} />;
});
