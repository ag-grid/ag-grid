import React, { forwardRef, useImperativeHandle, useState } from 'react';
import { CustomCellRendererProps } from "@ag-grid-community/react";

export default forwardRef((props: CustomCellRendererProps, ref) => {
    const imageForMood = (mood: string) => 'https://www.ag-grid.com/example-assets/smileys/' + (mood === 'Happy' ? 'happy.png' : 'sad.png');

    const [mood, setMood] = useState(imageForMood(props.value));

    useImperativeHandle(ref, () => {
        return {
            refresh(params: CustomCellRendererProps) {
                setMood(imageForMood(params.value));
            }
        };
    });

    return (
        <img width="20px" src={mood} />
    );
});
