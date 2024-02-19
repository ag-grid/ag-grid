import iconNameToSvg from './quartz-icons-fragments';

export default () => {
  let result = ':ag-current-theme .ag-icon { background-color: currentColor; }\n';
  for (const [iconName, iconSvg] of Object.entries(iconNameToSvg)) {
    result += `:ag-current-theme .ag-icon-${iconName} { mask-image: url('data:image/svg+xml,${encodeURIComponent(iconSvg)}'); }\n`;
  }
  return result;
};
