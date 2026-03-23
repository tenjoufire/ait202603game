import { CANVAS_HEIGHT, CANVAS_WIDTH, COLORS, LOG_HEIGHT, SIDEBAR_WIDTH, UI_FONT } from '../constants';
import type { Enemy } from '../entities/enemy';
import type { Player } from '../entities/player';
import { drawMinimap } from './minimap';

export const drawHud = (
  context: CanvasRenderingContext2D,
  player: Player,
  enemies: Enemy[],
  floor: number,
  mapExploredPercent: number,
  map: Parameters<typeof drawMinimap>[1],
): void => {
  const panelX = CANVAS_WIDTH - SIDEBAR_WIDTH;
  context.fillStyle = COLORS.uiBg;
  context.fillRect(panelX, 0, SIDEBAR_WIDTH, CANVAS_HEIGHT - LOG_HEIGHT);
  context.strokeStyle = COLORS.uiMuted;
  context.strokeRect(panelX, 0, SIDEBAR_WIDTH, CANVAS_HEIGHT - LOG_HEIGHT);
  context.font = UI_FONT;
  context.fillStyle = COLORS.uiText;
  context.textBaseline = 'top';

  const lines = [
    `Floor: B${floor}`,
    `HP: ${player.hp}/${player.maxHp}`,
    `ATK: ${player.attack}`,
    `DEF: ${player.defense}`,
    `LV: ${player.level}`,
    `EXP: ${player.exp}/${player.expToNext}`,
    `Score: ${player.score}`,
    `敵残数: ${enemies.length}`,
    `踏破率: ${mapExploredPercent}%`,
  ];

  context.fillText('STATUS', panelX + 16, 16);
  lines.forEach((line, index) => {
    context.fillText(line, panelX + 16, 48 + index * 22);
  });

  context.fillStyle = COLORS.hpBarBg;
  context.fillRect(panelX + 16, 80, 160, 10);
  context.fillStyle = COLORS.hpBar;
  context.fillRect(panelX + 16, 80, (160 * player.hp) / player.maxHp, 10);

  context.fillStyle = COLORS.expBarBg;
  context.fillRect(panelX + 16, 168, 160, 10);
  context.fillStyle = COLORS.expBar;
  context.fillRect(panelX + 16, 168, (160 * player.exp) / player.expToNext, 10);

  context.fillStyle = COLORS.uiText;
  context.fillText('MINIMAP', panelX + 16, 230);
  drawMinimap(context, map, player, enemies, panelX + 16, 260, 160, 120);

  context.fillText('装備', panelX + 16, 400);
  context.fillStyle = COLORS.uiMuted;
  context.fillText(`武器: ${player.equippedWeapon?.name ?? 'なし'}`, panelX + 16, 424);
  context.fillText(`防具: ${player.equippedArmor?.name ?? 'なし'}`, panelX + 16, 446);
};