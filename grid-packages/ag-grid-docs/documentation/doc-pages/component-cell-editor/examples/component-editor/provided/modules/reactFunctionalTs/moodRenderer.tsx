import React, { memo, useMemo } from "react";
import { CustomCellRendererProps } from "@ag-grid-community/react";

export default memo(({ value }: CustomCellRendererProps) => {
    const imageForMood = (mood: string) => 'https://www.ag-grid.com/example-assets/smileys/' + (mood === 'Happy' ? 'happy.png' : 'sad.png');

    const mood = useMemo(() => imageForMood(value), [value]);

    return (
        <img width="20px" src={mood} />
    );
});
