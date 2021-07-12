import React, {Component, forwardRef, useImperativeHandle, useState} from 'react';

export default forwardRef((props, ref) => {
    const imageForMood = mood => 'https://www.ag-grid.com/example-assets/smileys/' + (mood === 'Happy' ? 'happy.png' : 'sad.png');

    const [mood, setMood] = useState(imageForMood(props.value));

    useImperativeHandle(ref, () => {
        return {
            refresh(params) {
                setMood(imageForMood(params.value));
            }
        };
    });

    return (
        <img width="20px" src={mood}/>
    );
});
