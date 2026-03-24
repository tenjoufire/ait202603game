import { CANVAS_HEIGHT, CANVAS_WIDTH, COLORS } from '../constants';
import type { SpriteAtlas } from '../core/sprite-atlas';

export const drawTitleScreen = (context: CanvasRenderingContext2D, atlas: SpriteAtlas): void => {
  // Background gradient
  const bgGrad = context.createRadialGradient(
    CANVAS_WIDTH / 2, CANVAS_HEIGHT * 0.35, 20,
    CANVAS_WIDTH / 2, CANVAS_HEIGHT * 0.35, CANVAS_WIDTH * 0.7,
  );
  bgGrad.addColorStop(0, '#0d1b3e');
  bgGrad.addColorStop(1, '#02040a');
  context.fillStyle = bgGrad;
  context.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

  // Decorative sprite showcase
  const showcaseY = 120;
  const sprites: Parameters<typeof atlas.draw>[1][] = [
    'player', 'slime', 'goblin', 'skeleton', 'dark-mage', 'dragon',
    'chest-closed', 'potion', 'iron-sword', 'scroll',
  ];
  const totalW = sprites.length * 40;
  const startX = (CANVAS_WIDTH - totalW) / 2;
  sprites.forEach((key, i) => {
    atlas.draw(context, key, startX + i * 40 + 4, showcaseY, 32);
  });

  // Title
  context.textAlign = 'center';
  context.textBaseline = 'middle';
  context.shadowColor = '#3b82f6';
  context.shadowBlur = 30;
  context.font = 'bold 32px monospace';
  context.fillStyle = '#f8fafc';
  context.fillText('AI Tour ダンジョン', CANVAS_WIDTH / 2, 200);
  context.shadowBlur = 0;

  context.font = '16px monospace';
  context.fillStyle = '#94a3b8';
  context.fillText('〜 Copilotと一緒に冒険 〜', CANVAS_WIDTH / 2, 236);

  // Divider
  const divGrad = context.createLinearGradient(CANVAS_WIDTH * 0.2, 0, CANVAS_WIDTH * 0.8, 0);
  divGrad.addColorStop(0, 'transparent');
  divGrad.addColorStop(0.5, '#3b82f6');
  divGrad.addColorStop(1, 'transparent');
  context.fillStyle = divGrad;
  context.fillRect(CANVAS_WIDTH * 0.2, 260, CANVAS_WIDTH * 0.6, 1);

  // Blinking "Press Enter"
  const blink = Math.floor(Date.now() / 600) % 2 === 0;
  if (blink) {
    context.font = 'bold 18px monospace';
    context.fillStyle = '#60a5fa';
    context.fillText('▶  Enter で開始', CANVAS_WIDTH / 2, 310);
  }

  // Controls
  context.font = '14px monospace';
  context.fillStyle = '#475569';
  const controls = [
    '移動: 矢印キー / WASD',
    'I: インベントリ    . / Space: 待機    >: 階段',
    '体当たりで敵を攻撃、NPCに話しかける',
  ];
  controls.forEach((line, i) => {
    context.fillText(line, CANVAS_WIDTH / 2, 370 + i * 24);
  });

  // Footer
  context.font = '12px monospace';
  context.fillStyle = '#334155';
  context.fillText('Procedural Pixel-Art Roguelike — Built with Copilot', CANVAS_WIDTH / 2, CANVAS_HEIGHT - 30);
  context.textAlign = 'left';
};