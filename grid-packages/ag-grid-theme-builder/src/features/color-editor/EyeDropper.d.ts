interface Window {
  EyeDropper?: {
    new (): { open(): Promise<{ sRGBHex: string }> };
  };
}
