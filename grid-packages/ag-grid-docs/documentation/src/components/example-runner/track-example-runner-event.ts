import { trackExampleRunner, trackOnceExampleRunner } from '../../utils/analytics';

type Params = {
    trackOnce?: boolean;
    exampleInfo: any;
} & (
    | {
          type: 'isVisible' | 'newTabClick' | 'openCodeClick' | 'viewPreviewClick' | 'viewCodeClick';
      }
    | {
          type: 'viewFileClick';
          extraProps: {
              filePath: string;
          };
      }
    | {
          type: 'importTypeSelect' | 'typescriptSelect' | 'reactSelect' | 'vue3Select';
          extraProps: {
              value: string;
          };
      }
);

export function trackExampleRunnerEvent(params: Params) {
    const { type, trackOnce, exampleInfo } = params;
    const trackingFunc = trackOnce ? trackOnceExampleRunner : trackExampleRunner;
    trackingFunc({
        type,
        pageName: exampleInfo.pageName,
        name: exampleInfo.name,
        framework: exampleInfo.framework,
        internalFramework: exampleInfo.internalFramework,
        library: exampleInfo.library,
        importType: exampleInfo.importType,
        ...(params as any).extraProps,
    });
}
