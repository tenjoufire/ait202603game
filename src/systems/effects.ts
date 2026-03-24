/**
 * Visual effect system — manages temporary screen effects like
 * damage flashes, floating damage numbers, and hit sparks.
 */

export interface ScreenFlash {
  type: 'flash';
  color: string;
  alpha: number;
  duration: number;
  elapsed: number;
}

export interface DamageNumber {
  type: 'damage-number';
  value: number;
  x: number;
  y: number;
  color: string;
  duration: number;
  elapsed: number;
}

export interface HitSpark {
  type: 'hit-spark';
  x: number;
  y: number;
  color: string;
  particles: { dx: number; dy: number; size: number }[];
  duration: number;
  elapsed: number;
}

export interface ScreenShake {
  type: 'screen-shake';
  intensity: number;
  duration: number;
  elapsed: number;
}

export type VisualEffect = ScreenFlash | DamageNumber | HitSpark | ScreenShake;

export class EffectManager {
  private effects: VisualEffect[] = [];
  private lastTime = 0;

  addFlash(color: string, duration = 150): void {
    this.effects.push({ type: 'flash', color, alpha: 0.5, duration, elapsed: 0 });
  }

  addDamageNumber(value: number, x: number, y: number, color = '#ffffff'): void {
    this.effects.push({ type: 'damage-number', value, x, y, color, duration: 600, elapsed: 0 });
  }

  addHitSpark(x: number, y: number, color = '#fcd34d'): void {
    const particles = Array.from({ length: 6 }, () => ({
      dx: (Math.random() - 0.5) * 2,
      dy: (Math.random() - 0.5) * 2,
      size: 2 + Math.random() * 3,
    }));
    this.effects.push({ type: 'hit-spark', x, y, color, particles, duration: 300, elapsed: 0 });
  }

  addScreenShake(intensity = 4, duration = 200): void {
    this.effects.push({ type: 'screen-shake', intensity, duration, elapsed: 0 });
  }

  /** Call on player attack */
  onPlayerAttack(targetX: number, targetY: number, damage: number): void {
    this.addHitSpark(targetX, targetY, '#fcd34d');
    this.addDamageNumber(damage, targetX, targetY, '#ffffff');
    this.addFlash('rgba(255, 200, 50, 0.3)', 100);
  }

  /** Call when player is hit */
  onPlayerHit(damage: number, playerX: number, playerY: number): void {
    this.addFlash('rgba(255, 50, 50, 0.4)', 180);
    this.addScreenShake(5, 200);
    this.addDamageNumber(damage, playerX, playerY, '#ff6b6b');
  }

  /** Call when enemy is defeated */
  onEnemyDefeated(x: number, y: number): void {
    this.addHitSpark(x, y, '#ef4444');
    this.addFlash('rgba(255, 255, 255, 0.15)', 80);
  }

  update(timestamp: number): void {
    if (this.lastTime === 0) {
      this.lastTime = timestamp;
      return;
    }
    const dt = timestamp - this.lastTime;
    this.lastTime = timestamp;

    for (const effect of this.effects) {
      effect.elapsed += dt;
    }
    this.effects = this.effects.filter((e) => e.elapsed < e.duration);
  }

  getActiveEffects(): readonly VisualEffect[] {
    return this.effects;
  }

  getScreenOffset(): { x: number; y: number } {
    for (const effect of this.effects) {
      if (effect.type === 'screen-shake') {
        const progress = effect.elapsed / effect.duration;
        const decay = 1 - progress;
        const intensity = effect.intensity * decay;
        return {
          x: (Math.random() - 0.5) * 2 * intensity,
          y: (Math.random() - 0.5) * 2 * intensity,
        };
      }
    }
    return { x: 0, y: 0 };
  }

  hasActiveEffects(): boolean {
    return this.effects.length > 0;
  }
}
