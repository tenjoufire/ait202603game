import type { Entity } from './entity';

export type NpcRole = 'healer' | 'sage' | 'merchant';

export interface Npc extends Entity {
  role: NpcRole;
  dialogue: string[];
  interacted: boolean;
}

export interface NpcTemplate {
  key: NpcRole;
  name: string;
  char: string;
  color: string;
  dialogue: string[];
}

export const NPC_TEMPLATES: NpcTemplate[] = [
  {
    key: 'healer',
    name: '回復の精霊',
    char: '♥',
    color: '#4ade80',
    dialogue: ['傷ついた冒険者よ…私が癒してあげよう。', 'HPを全回復した。'],
  },
  {
    key: 'sage',
    name: '賢者AI',
    char: '☆',
    color: '#a78bfa',
    dialogue: ['私はこの迷宮を知り尽くしたAIだ。', 'ヒント: 階段は最も遠い部屋にある。'],
  },
  {
    key: 'merchant',
    name: '行商人',
    char: '$',
    color: '#facc15',
    dialogue: ['やぁ、冒険者！何か持っていきな。'],
  },
];

export const createNpc = (template: NpcTemplate, x: number, y: number, suffix: string): Npc => ({
  id: `npc-${template.key}-${suffix}`,
  name: template.name,
  char: template.char,
  color: template.color,
  blocksMovement: true,
  x,
  y,
  role: template.key,
  dialogue: template.dialogue,
  interacted: false,
});
