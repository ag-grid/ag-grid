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
    // eslint-disable-next-line
    <select
      aria-label={"Select Release Version"}
      ref={ref}
      onChange={event => props.onChange(event)}
      dangerouslySetInnerHTML={{ __html: createVersionOptions(versions) }}
    ></select>
  )
})

export default VersionDropdownMenu
