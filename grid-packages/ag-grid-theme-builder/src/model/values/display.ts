export type Display = 'block' | 'none';

export type DisplayValue = {
  type: 'display';
  display: Display;
};

export const display = (display: Display): DisplayValue => ({
  type: 'display',
  display,
});

export const parseCssDisplay = (css: string): DisplayValue | null => {
  return css === 'block' || css === 'none' ? display(css) : null;
};

export const displayToCss = ({ display }: DisplayValue): string => display;
