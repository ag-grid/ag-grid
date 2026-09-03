/**
 * Params for components whose input fields support overriding the browser's
 * autocomplete/autofill behaviour.
 * @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time.
 */
export interface IAutoCompleteComponentParams {
    /**
     * Overrides the browser's autocomplete/autofill behaviour by updating the `autocomplete` attribute on the component's input field(s).
     * Possible values are:
     * - `true` to allow the **default** browser autocomplete/autofill behaviour.
     * - `false` to disable the browser autocomplete/autofill behaviour by setting the `autocomplete` attribute to `off`.
     * - A **string** to be used as the [autocomplete](https://developer.mozilla.org/en-US/docs/Web/HTML/Attributes/autocomplete) attribute value.
     * If omitted, the value of `enableInputAutoComplete` is used.
     * Some browsers do not respect setting the HTML attribute `autocomplete="off"` and display the auto-fill prompts anyway.
     */
    browserAutoComplete?: boolean | string;
}
