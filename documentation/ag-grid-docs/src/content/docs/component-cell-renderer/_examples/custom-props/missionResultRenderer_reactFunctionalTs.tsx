import { CustomCellRendererProps } from "@ag-grid-community/react";
import React from "react";

interface MissionCellRendererParams extends CustomCellRendererProps {
  src?: (params: boolean) => string;
}

export default (params: MissionCellRendererParams) => {
  const defaultImgSrc = `https://www.ag-grid.com/example-assets/icons/${
    params.value ? "tick-in-circle" : "cross-in-circle"
  }.png`
  const imgSrc = params.src ? params.src(params.value) : defaultImgSrc

  return (
    <span
    className="missionSpan"
  >
    {
      <img
        alt={`${params.value}`}
        src={imgSrc}
        className="missionIcon"
      />
    }
  </span>
  )
}
