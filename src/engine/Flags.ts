/**
 * Flags is a feature flag implementation for Excalibur. They can only be operated **before {@apilink Engine} construction**
 * after which they are frozen and are read-only.
 *
 * Flags are used to enable experimental or preview features in Excalibur.
 */
export class Flags {
  private static _FROZEN = false;
  private static _FLAGS: Record<string, boolean> = {};

  /**
   * Force excalibur to load the Canvas 2D graphics context fallback
   * @warning not all features of excalibur are supported in the Canvas 2D fallback
   */
  public static useCanvasGraphicsContext() {
    Flags.enable('use-canvas-context');
  }

  /**
   * Force excalibur to use the less optimized image renderer
   */
  public static useLegacyImageRenderer() {
    Flags.enable('use-legacy-image-renderer');
  }

  /**
   * Freeze all flag modifications making them readonly
   */
  public static freeze() {
    Flags._FROZEN = true;
  }

  /**
   * Resets internal flag state, not meant to be called by users. Only used for testing.
   *
   * Calling this in your game is UNSUPPORTED
   * @internal
   */
  public static _reset() {
    Flags._FROZEN = false;
    Flags._FLAGS = {};
  }
  /**
   * Enable a specific feature flag by name. **Note: can only be set before {@apilink Engine} constructor time**
   * @param flagName
   */
  public static enable(flagName: string): void {
    if (this._FROZEN) {
      throw Error('Feature flags can only be enabled before Engine constructor time');
    }
    Flags._FLAGS[flagName] = true;
  }

  /**
   * Disable a specific feature flag by name. **Note: can only be set before {@apilink Engine} constructor time**
   * @param flagName
   */
  public static disable(flagName: string): void {
    if (this._FROZEN) {
      throw Error('Feature flags can only be disabled before Engine constructor time');
    }
    Flags._FLAGS[flagName] = false;
  }

  /**
   * Check if a flag is enabled. If the flag is disabled or does not exist `false` is returned
   * @param flagName
   */
  public static isEnabled(flagName: string): boolean {
    return !!Flags._FLAGS[flagName];
  }

  /**
   * Show a list of currently known flags
   */
  public static show(): string[] {
    return Object.keys(Flags._FLAGS);
  }
}
