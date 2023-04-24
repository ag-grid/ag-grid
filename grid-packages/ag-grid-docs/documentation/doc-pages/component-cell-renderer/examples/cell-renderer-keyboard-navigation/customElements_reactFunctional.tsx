import React from "react"
import { ICellRendererParams } from '@ag-grid-community/core';

export default ({ data }: ICellRendererParams) => {
  return (
    <div className="custom-element">
      <button>Age: {data.age ? data.age : '?'}</button>
      <input value={data.country ? data.country : ''} />
      <a href={`https://www.google.com/search?q=${data.sport}`} target="_blank">{data.sport}</a>
    </div>
  )
}
