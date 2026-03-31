import type { Entity } from './entity';

export type TrapKind = 'spike' | 'poison' | 'teleport';

export interface Trap extends Entity {
  kind: TrapKind;
  triggered: boolean;
  damage: number;
}

export interface TrapTemplate {
  key: TrapKind;
  name: string;
  damage: number;
}

export const TRAP_TEMPLATES: TrapTemplate[] = [
  { key: 'spike', name: 'トゲ罠', damage: 25 },
  { key: 'poison', name: '毒の罠', damage: 15 },
  { key: 'teleport', name: 'テレポート罠', damage: 0 },
];

export const createTrap = (template: TrapTemplate, x: number, y: number, suffix: string): Trap => ({
  id: `trap-${template.key}-${suffix}`,
  name: template.name,
  char: '.',
  color: '#9c7b4f',
  blocksMovement: false,
  x,
  y,
  kind: template.key,
  triggered: false,
  damage: template.damage,
});
