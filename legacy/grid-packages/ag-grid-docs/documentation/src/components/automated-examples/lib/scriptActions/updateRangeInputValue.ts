interface UpdateRangeInputValueParams {
    element: HTMLInputElement;
    value: number;
}

export function updateRangeInputValue({ element, value }: UpdateRangeInputValueParams) {
    const valueString = value.toString();
    element.value = valueString;
    element.dispatchEvent(new Event('input', { bubbles: true }));
}
