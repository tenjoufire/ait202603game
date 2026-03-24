import { CANVAS_HEIGHT, CANVAS_WIDTH, COLORS, LOG_HEIGHT, SIDEBAR_WIDTH } from '../constants';
import type { Enemy } from '../entities/enemy';
import type { Player } from '../entities/player';
import { drawMinimap } from './minimap';

const drawBar = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  ratio: number,
  fg: string,
  bg: string,
): void => {
  // Background
  ctx.fillStyle = bg;
  ctx.fillRect(x, y, w, h);
  // Foreground
  const fillW = Math.max(0, Math.min(w, w * ratio));
  const grad = ctx.createLinearGradient(x, y, x, y + h);
  grad.addColorStop(0, fg);
  grad.addColorStop(1, shadeColor(fg, -30));
  ctx.fillStyle = grad;
  ctx.fillRect(x, y, fillW, h);
  // Shine
  ctx.fillStyle = 'rgba(255,255,255,0.08)';
  ctx.fillRect(x, y, fillW, Math.ceil(h / 2));
};

const shadeColor = (color: string, percent: number): string => {
  const num = parseInt(color.replace('#', ''), 16);
  const r = Math.min(255, Math.max(0, (num >> 16) + percent));
  const g = Math.min(255, Math.max(0, ((num >> 8) & 0x00ff) + percent));
  const b = Math.min(255, Math.max(0, (num & 0x0000ff) + percent));
  return `rgb(${r},${g},${b})`;
};

export const drawHud = (
  context: CanvasRenderingContext2D,
  player: Player,
  enemies: Enemy[],
  floor: number,
  mapExploredPercent: number,
  map: Parameters<typeof drawMinimap>[1],
): void => {
  const panelX = CANVAS_WIDTH - SIDEBAR_WIDTH;
  const panelH = CANVAS_HEIGHT - LOG_HEIGHT;

  // Panel background gradient
  const grad = context.createLinearGradient(panelX, 0, CANVAS_WIDTH, 0);
  grad.addColorStop(0, '#0b1120');
  grad.addColorStop(1, '#070d1a');
  context.fillStyle = grad;
  context.fillRect(panelX, 0, SIDEBAR_WIDTH, panelH);
  // Left border accent
  context.fillStyle = '#1e3a5f';
  context.fillRect(panelX, 0, 1, panelH);

  context.textBaseline = 'top';
  context.textAlign = 'left';

  // Section: Floor
  context.font = 'bold 15px monospace';
  context.fillStyle = '#60a5fa';
  context.fillText(`▸ B${floor}F`, panelX + 14, 14);

  // HP bar
  let y = 40;
  context.font = '12px monospace';
  context.fillStyle = '#94a3b8';
  context.fillText('HP', panelX + 14, y);
  context.fillStyle = '#e5e7eb';
  context.textAlign = 'right';
  context.fillText(`${player.hp}/${player.maxHp}`, panelX + SIDEBAR_WIDTH - 14, y);
  context.textAlign = 'left';
  drawBar(context, panelX + 14, y + 16, SIDEBAR_WIDTH - 28, 8, player.hp / player.maxHp, '#ef4444', '#2a0f0f');

  // EXP bar
  y = 72;
  context.fillStyle = '#94a3b8';
  context.fillText('EXP', panelX + 14, y);
  context.fillStyle = '#e5e7eb';
  context.textAlign = 'right';
  context.fillText(`${player.exp}/${player.expToNext}`, panelX + SIDEBAR_WIDTH - 14, y);
  context.textAlign = 'left';
  drawBar(context, panelX + 14, y + 16, SIDEBAR_WIDTH - 28, 8, player.exp / player.expToNext, '#38bdf8', '#0c2236');

  // Stats section
  y = 104;
  context.fillStyle = '#1e3a5f';
  context.fillRect(panelX + 14, y, SIDEBAR_WIDTH - 28, 1);
  y += 8;

  const stats = [
    { label: 'LV', value: `${player.level}`, color: '#fcd34d' },
    { label: 'ATK', value: `${player.attack}`, color: '#f87171' },
    { label: 'DEF', value: `${player.defense}`, color: '#60a5fa' },
    { label: 'Score', value: `${player.score}`, color: '#a78bfa' },
  ];

  stats.forEach((stat, i) => {
    const sx = panelX + 14 + (i % 2) * 88;
    const sy = y + Math.floor(i / 2) * 22;
    context.font = '12px monospace';
    context.fillStyle = '#64748b';
    context.fillText(stat.label, sx, sy);
    context.fillStyle = stat.color;
    context.textAlign = 'right';
    context.fillText(stat.value, sx + 78, sy);
    context.textAlign = 'left';
  });

  // Info section
  y += 52;
  context.fillStyle = '#1e3a5f';
  context.fillRect(panelX + 14, y, SIDEBAR_WIDTH - 28, 1);
  y += 8;
  context.font = '12px monospace';
  context.fillStyle = '#64748b';
  context.fillText(`敵: ${enemies.length}`, panelX + 14, y);
  context.fillText(`踏破: ${mapExploredPercent}%`, panelX + 100, y);

  // Equipment section
  y += 24;
  context.fillStyle = '#1e3a5f';
  context.fillRect(panelX + 14, y, SIDEBAR_WIDTH - 28, 1);
  y += 8;
  context.font = 'bold 12px monospace';
  context.fillStyle = '#60a5fa';
  context.fillText('装備', panelX + 14, y);
  y += 18;
  context.font = '12px monospace';
  context.fillStyle = player.equippedWeapon ? '#fbbf24' : '#475569';
  context.fillText(`⚔ ${player.equippedWeapon?.name ?? 'なし'}`, panelX + 14, y);
  y += 16;
  context.fillStyle = player.equippedArmor ? '#60a5fa' : '#475569';
  context.fillText(`🛡 ${player.equippedArmor?.name ?? 'なし'}`, panelX + 14, y);

  // Minimap
  y += 28;
  context.fillStyle = '#1e3a5f';
  context.fillRect(panelX + 14, y, SIDEBAR_WIDTH - 28, 1);
  y += 8;
  context.font = 'bold 12px monospace';
  context.fillStyle = '#60a5fa';
  context.fillText('MAP', panelX + 14, y);
  drawMinimap(context, map, player, enemies, panelX + 14, y + 18, SIDEBAR_WIDTH - 28, 100);
};