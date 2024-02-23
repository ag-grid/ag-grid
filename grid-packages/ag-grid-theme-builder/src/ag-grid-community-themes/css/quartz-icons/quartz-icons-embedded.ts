import { agIconNameToSvgFragment } from './quartz-icons-fragments';

export default (params: Record<string, any>) => {
  let result = '.ag-icon { background-color: currentColor; }\n';
  for (const iconName of Object.keys(agIconNameToSvgFragment)) {
    const iconSvg = buildSvg(iconName, params.iconStrokeWidth || '1.5px');
    result += `.ag-icon-${iconName} { mask-image: url('data:image/svg+xml,${encodeURIComponent(iconSvg)}'); }\n`;
  }
  return result;
};

const buildSvg = (name: string, strokeWidth: string): string => {
  const svgFragment = agIconNameToSvgFragment[name];
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" class="ag-icon ag-icon-${name}" fill="none" stroke-linecap="round" stroke-linejoin="round" stroke="black" stroke-width="${strokeWidth}" viewBox="0 0 24 24">` +
    '<style>* { vector-effect: non-scaling-stroke; }</style>' +
    svgFragment +
    '</svg>'
  );
};
