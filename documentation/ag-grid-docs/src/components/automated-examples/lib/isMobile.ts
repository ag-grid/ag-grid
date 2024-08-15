import breakpoints from '@design-system/breakpoint.module.scss';

const AUTOMATED_EXAMPLE_MEDIUM_WIDTH = parseInt(breakpoints['automated-row-grouping-medium'], 10);

export const isMobile = () => window.innerWidth <= AUTOMATED_EXAMPLE_MEDIUM_WIDTH;
