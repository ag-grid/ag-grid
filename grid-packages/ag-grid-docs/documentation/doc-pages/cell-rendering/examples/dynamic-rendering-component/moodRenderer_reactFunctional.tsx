import React, { Component, forwardRef, useImperativeHandle, useState } from 'react';
import { ICellRendererParams } from "@ag-grid-community/core";

export default forwardRef((props: ICellRendererParams, ref) => {
    const imageForMood = (mood: string) => 'https://www.ag-grid.com/example-assets/smileys/' + (mood === 'Happy' ? 'happy.png' : 'sad.png');

    const [mood, setMood] = useState(imageForMood(props.value));

    useImperativeHandle(ref, () => {
        return {
            refresh(params: ICellRendererParams) {
                setMood(imageForMood(params.value));
            }
        };
    });

    return (
        <img width="20px" src={mood} />
    );
});
