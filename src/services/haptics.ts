/**
 * Tactile Haptic Vibration Feedback for Mobile Devices
 */

class HapticService {
  private enabled: boolean = true;

  public setEnabled(enabled: boolean) {
    this.enabled = enabled;
  }

  public isEnabled(): boolean {
    return this.enabled;
  }

  private vibrate(pattern: number | number[]) {
    if (!this.enabled) return;
    if (typeof window !== 'undefined' && 'navigator' in window && navigator.vibrate) {
      try {
        navigator.vibrate(pattern);
      } catch {
        // Ignore devices with restricted vibration permissions
      }
    }
  }

  /** Light micro-click for joystick/step moves */
  public light() {
    this.vibrate(15);
  }

  /** Button press feedback */
  public buttonClick() {
    this.vibrate(28);
  }

  /** Coin insertion impact */
  public coinInsert() {
    this.vibrate([30, 40, 45]);
  }

  /** Claw contacts plush surface */
  public clawTouch() {
    this.vibrate(50);
  }

  /** Claw grips with tension clamp */
  public clawGrip() {
    this.vibrate([40, 20, 60]);
  }

  /** Heartbeat suspense pulse while lifting */
  public liftPulse() {
    this.vibrate(25);
  }

  /** Sudden drop / slip shock - distinct slip jolt */
  public dollSlip() {
    this.vibrate([90, 40, 70]);
  }

  /** Chute drop - doll falls into prize hopper */
  public chuteDrop() {
    this.vibrate(75);
  }

  /** Triumphant victory pattern */
  public victory() {
    this.vibrate([50, 40, 50, 40, 100, 50, 180]);
  }

  /** Cabinet shake */
  public cabinetShake() {
    this.vibrate([60, 30, 60]);
  }
}

export const haptics = new HapticService();
