import React from "react";

export default (params) => (
  <span
    className="imgSpan"
  >
    {params.value && (
      <img
        alt={`${params.value} Flag`}
        src={`https://www.ag-grid.com/example-assets/space-company-logos/${params.value.toLowerCase()}.png`}
        className="logo"
      />
    )}
  </span>
)