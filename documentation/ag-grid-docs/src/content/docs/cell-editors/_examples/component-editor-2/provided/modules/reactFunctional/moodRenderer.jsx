import React, { useMemo } from 'react';

export default (props) => {
    const imageForMood = (mood) =>
        'https://www.ag-grid.com/example-assets/smileys/' + (mood === 'Happy' ? 'happy.png' : 'sad.png');

    const mood = useMemo(() => imageForMood(props.value), [props.value]);

    return (
        <div className="mood-renderer">
            <img width="20px" src={mood} />
        </div>
    );
};
