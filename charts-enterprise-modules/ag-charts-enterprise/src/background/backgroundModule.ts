import { _ModuleSupport, PixelSize, Opacity } from 'ag-charts-community';
import { Background } from './background';

export const BackgroundModule: _ModuleSupport.RootModule = {
    type: 'root',
    optionsKey: 'background',
    packageType: 'enterprise',
    chartTypes: ['cartesian', 'polar', 'hierarchy'],
    initialiseModule: (ctx) => {
        return {
            instance: new Background(ctx),
        };
    },
};

export interface AgChartBackgroundImage {
    /** URL of the image */
    url: string;

    /** Distance from the left border of the chart to the left border of the image. If neither left nor right specified, the image is centred horizontally. */
    left?: PixelSize;
    /** Distance from the top border of the chart to the top border of the image. If neither top nor bottom specified, the image is centred vertically. */
    top?: PixelSize;
    /** Distance from the right border of the chart to the right border of the image. If neither left nor right specified, the image is centred horizontally. */
    right?: PixelSize;
    /** Distance from the bottom border of the chart to the bottom border of the image. If neither top nor bottom specified, the image is centred vertically. */
    bottom?: PixelSize;

    /** Width of the image. If both left and right specified, width is ignored. If width is not determined but height does,
     * width computed to preserve the original width/height ratio. Otherwise the original width is used. */
    width?: PixelSize;

    /** Height of the image. If both top and bottom specified, height is ignored. If height is not determined but width does,
     * height computed to preserve the original width/height ratio. Otherwise the original height is used. */
    height?: PixelSize;

    /** Opacity of the image. */
    opacity?: Opacity;
}
