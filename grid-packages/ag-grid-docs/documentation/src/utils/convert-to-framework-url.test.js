import convertToFrameworkUrl from './convert-to-framework-url';
import supportedFrameworks from './supported-frameworks';

describe('convertToFrameworkUrl', () => {
    it.each(supportedFrameworks)
        ('returns grid URLs for %s grid pages', framework => {
            expect(convertToFrameworkUrl('/getting-started/', framework)).toBe(`/${framework}-data-grid/getting-started/`);
        });

    it.each(supportedFrameworks)
        ('returns chart URLs for %s chart pages', framework => {
            expect(convertToFrameworkUrl('/charts-overview/', framework)).toBe(`/${framework}-charts/overview/`);
        });
});
