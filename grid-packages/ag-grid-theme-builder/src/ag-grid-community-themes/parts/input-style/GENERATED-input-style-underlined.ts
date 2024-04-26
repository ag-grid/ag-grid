const _css = {
  text: `:where(input[class^=ag-]:not([type]),input[class^=ag-][type=text],input[class^=ag-][type=number],input[class^=ag-][type=tel],input[class^=ag-][type=date],input[class^=ag-][type=datetime-local],textarea[class^=ag-]){border-left:none;border-right:none;border-top:none}`,
};
export const inputStyleUnderlinedCSS = () => _css.text;
