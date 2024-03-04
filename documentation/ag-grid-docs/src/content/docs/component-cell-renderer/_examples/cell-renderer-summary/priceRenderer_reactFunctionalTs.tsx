import { CustomCellRendererProps } from "@ag-grid-community/react";
import React from "react";

export default (params: CustomCellRendererProps) => {
  let priceMultiplier: number = 1
  if (params.value > 5000000) {
    priceMultiplier = 2
  }
  if (params.value > 10000000) {
    priceMultiplier = 3
  }
  if (params.value > 25000000) {
    priceMultiplier = 4
  }
  if (params.value > 20000000) {
    priceMultiplier = 5
  }

  const priceArr: any[] = new Array(priceMultiplier).fill("")

  return (
    <span
      className="imgSpan"
    >
      {priceArr.map((_, index) => (
        <img
          key={index}
          src="https://www.ag-grid.com/example-assets/pound.png"
          className="priceIcon"
        />
      ))}
    </span>
  )
}
