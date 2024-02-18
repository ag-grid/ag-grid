export type FontStyle = 'normal' | 'italic' | 'oblique';
export type FontWeight = 'normal' | 'bold' | 'bolder' | 'lighter' | '100' | '200' | '300' | '400' | '500' | '600' | '700' | '800' | '900' | '1000' | number;
export type FontFamily = string;
export type FontSize = number;
export type MarkerShape = 'circle' | 'cross' | 'diamond' | 'heart' | 'plus' | 'triangle' | 'square' | any;
/** Alias to denote that a value should be a CSS-compliant color string, such as `#FFFFFF` or `rgb(255, 255, 255)` or `white`. */
export type CssColor = string;
/** Alias to denote that a value reflects an alpha opacity in the range [0, 1]. */
export type Opacity = number;
/** Alias to denote that a value is a measurement in pixels. */
export type PixelSize = number;
/** Alias to denote that a value is a ratio, usually in the range [0, 1]. */
export type Ratio = number;
/** Alias to denote that a value is a duration in milliseconds */
export type DurationMs = number;
/** Alias to denote that a value is an angle in degrees */
export type Degree = number;
/** Alias to denote that a value is an axis value. */
export type AxisValue = any;
export type TextAlign = 'left' | 'center' | 'right';
/**
 * Text wrapping strategy for labels.
 * - `'always'` will always wrap text to fit within the tile.
 * - `'hyphenate'` is similar to `'always'`, but inserts a hyphen (`-`) if forced to wrap in the middle of a word.
 * - `'on-space'` will only wrap on white space. If there is no possibility to wrap a line on space and satisfy the tile dimensions, the text will be truncated.
 * - `'never'` disables text wrapping.
 * Default: `'on-space'`
 */
export type TextWrap = 'never' | 'always' | 'hyphenate' | 'on-space';
/**
 * Adjusts the behaviour of labels when they overflow
 * - `'ellipsis'` will truncate the text to fit, appending an ellipsis (...)
 * - `'hide'` only displays the label if it completely fits within its bounds, and removes it if it would overflow
 */
export type OverflowStrategy = 'ellipsis' | 'hide';
/**
 * Define a range within which an interaction can trigger on a point with one of:
 * A distance in pixels from a point within which the event can be triggered.
 * - `'exact'` triggers when the event occurs directly over a point.
 * - `'nearest'` always tracks the nearest point anywhere on the chart.
 */
export type InteractionRange = PixelSize | 'exact' | 'nearest';
export type VerticalAlign = 'top' | 'middle' | 'bottom';
export type Direction = 'vertical' | 'horizontal';
