import {forwardRef, useImperativeHandle, useState} from "react"

const DepOrBreakFilterComponent = forwardRef((props, ref) => {
    const [isDeprecatedChecked, setIsDeprecatedChecked] = useState(false)
    const [isBreakingChecked, setIsBreakingChecked] = useState(false)

    useImperativeHandle(ref, () => {
        return {
            doesFilterPass(params) {
                if (isDeprecatedChecked && isBreakingChecked) {
                    return (
                        !!params.data.deprecationNotes || !!params.data.breakingChangesNotes
                    )
                } else if (isBreakingChecked) {
                    return !!params.data.breakingChangesNotes
                } else if (isDeprecatedChecked) {
                    return !!params.data.deprecationNotes
                } else {
                    return true
                }
            },

            isFilterActive() {
                return isBreakingChecked || isDeprecatedChecked
            },

            getModel() {
                let breakingChange = isBreakingChecked ? "Breaking Change" : ""
                let deprecated = isDeprecatedChecked ? "Deprecated" : ""
                return {values: [breakingChange, deprecated]}
            },

            setModel(model) {
                if (model.isArray && model.length > 0)
                    model.forEach(value => {
                        if (value === "Breaking Change") {
                            setIsBreakingChecked(true)
                        }
                        if (value === "Deprecated") {
                            setIsDeprecatedChecked(true)
                        }
                    })
            },
            checkboxChanged(checkboxName, checked) {
                if (checkboxName === "deprecated") {
                    setIsDeprecatedChecked(checked)
                }
                if (checkboxName === "breakingChange") {
                    setIsBreakingChecked(checked)
                }
                props.filterChangedCallback()
            },
        }
    })
})
export default DepOrBreakFilterComponent
