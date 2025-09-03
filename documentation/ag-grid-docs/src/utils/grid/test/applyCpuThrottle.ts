import { test as base } from '@playwright/test';

// Add CPU throttling hooks when cpuThrottle is specified

export const applyCpuThrottle = async ({ page, cpuThrottle }: any, testInfo: any) => {
    const envThrottle = process.env.CPU_THROTTLE ? parseInt(process.env.CPU_THROTTLE) : undefined;

    cpuThrottle = cpuThrottle ?? envThrottle;

    if (cpuThrottle && typeof cpuThrottle === 'number') {
        // Use test.step to make it more visible at the top level
        await base.step(`cpuThrottle (${cpuThrottle}x slower)`, async () => {
            const cdpSession = await page.context().newCDPSession(page);
            await cdpSession.send('Emulation.setCPUThrottlingRate', { rate: cpuThrottle! });

            // Add annotation to test for better visibility in reports
            testInfo.annotations.push({
                type: 'cpu-throttle',
                description: `CPU throttled ${cpuThrottle}x slower than normal`,
            });
        });
    }
};

export const clearCpuThrottle = async ({ page, cpuThrottle }: any) => {
    const envThrottle = process.env.CPU_THROTTLE ? parseInt(process.env.CPU_THROTTLE) : undefined;

    cpuThrottle = cpuThrottle ?? envThrottle;

    if (cpuThrottle && typeof cpuThrottle === 'number') {
        await base.step(`cpuThrottle (normal)`, async () => {
            const cdpSession = await page.context().newCDPSession(page);
            await cdpSession.send('Emulation.setCPUThrottlingRate', { rate: 1 }); // Reset to normal speed
            try {
                await cdpSession.detach();
            } catch (error) {
                // eslint-disable-next-line no-console
                console.error('Error detaching CDP session:', error);
            }
        });
    }
};
