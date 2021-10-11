import React, { forwardRef } from "react"

const VersionDropdownMenu = forwardRef((props, ref) => {
  let versions = props.versions

  const createVersionOptions = versions => {
    let result = ""
    versions.forEach(version => {
      result += `<option value=${version}>${version}</option>`
    })
    return result
  }

  return (
    <div style={{ paddingLeft: "10px", paddingTop: "10px" }}>
      <select
        ref={ref}
        onChange={event => props.onChange(event)}
        dangerouslySetInnerHTML={{ __html: createVersionOptions(versions) }}
      ></select>
    </div>
  )
})

export default VersionDropdownMenu
