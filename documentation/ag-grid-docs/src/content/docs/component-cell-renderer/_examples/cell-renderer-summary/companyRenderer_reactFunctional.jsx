import React from "react";

export default (params) => {
  return (
    <a href={`https://en.wikipedia.org/wiki/${params.value}`} target="_blank">
      {params.value}
    </a>
  )
}
