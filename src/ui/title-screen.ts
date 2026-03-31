import { CANVAS_HEIGHT, CANVAS_WIDTH } from '../constants';
import type { SpriteAtlas } from '../core/sprite-atlas';
import { DIFFICULTIES, DIFFICULTY_PRESETS, type Difficulty } from '../difficulty';

export const drawTitleScreen = (context: CanvasRenderingContext2D, atlas: SpriteAtlas, selectedDifficulty: Difficulty = 'normal'): void => {
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
  const showcaseY = 100;
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
  context.fillText('AI Tour ダンジョン', CANVAS_WIDTH / 2, 170);
  context.shadowBlur = 0;

  context.font = '16px monospace';
  context.fillStyle = '#94a3b8';
  context.fillText('〜 Copilotと一緒に冒険 〜', CANVAS_WIDTH / 2, 200);

  // Divider
  const divGrad = context.createLinearGradient(CANVAS_WIDTH * 0.2, 0, CANVAS_WIDTH * 0.8, 0);
  divGrad.addColorStop(0, 'transparent');
  divGrad.addColorStop(0.5, '#3b82f6');
  divGrad.addColorStop(1, 'transparent');
  context.fillStyle = divGrad;
  context.fillRect(CANVAS_WIDTH * 0.2, 220, CANVAS_WIDTH * 0.6, 1);

  // Difficulty selection
  context.font = 'bold 16px monospace';
  context.fillStyle = '#94a3b8';
  context.fillText('▲▼ 難易度を選択', CANVAS_WIDTH / 2, 248);

  const diffY = 278;
  DIFFICULTIES.forEach((diff, i) => {
    const preset = DIFFICULTY_PRESETS[diff];
    const y = diffY + i * 34;
    const isSelected = diff === selectedDifficulty;

    if (isSelected) {
      // Highlight background
      const boxW = 300;
      const boxH = 28;
      context.fillStyle = 'rgba(59, 130, 246, 0.15)';
      context.fillRect(CANVAS_WIDTH / 2 - boxW / 2, y - boxH / 2, boxW, boxH);
      // Left/right arrows
      context.font = 'bold 18px monospace';
      context.fillStyle = '#60a5fa';
      context.fillText('▸', CANVAS_WIDTH / 2 - 140, y);
      context.fillText('◂', CANVAS_WIDTH / 2 + 140, y);
    }

    context.font = isSelected ? 'bold 18px monospace' : '16px monospace';
    context.fillStyle = isSelected ? '#f8fafc' : '#64748b';
    context.fillText(`${preset.label}`, CANVAS_WIDTH / 2 - 40, y);

    context.font = '13px monospace';
    context.fillStyle = isSelected ? '#94a3b8' : '#475569';
    context.fillText(preset.description, CANVAS_WIDTH / 2 + 60, y);
  });

  // Blinking "Press Enter"
  const blink = Math.floor(Date.now() / 600) % 2 === 0;
  if (blink) {
    context.font = 'bold 18px monospace';
    context.fillStyle = '#60a5fa';
    context.fillText('▶  Enter で開始', CANVAS_WIDTH / 2, diffY + DIFFICULTIES.length * 34 + 20);
  }

  // Controls
  context.font = '14px monospace';
  context.fillStyle = '#475569';
  const controlsY = diffY + DIFFICULTIES.length * 34 + 56;
  const controls = [
    '移動: 矢印キー / WASD',
    'I: インベントリ    . / Space: 待機    >: 階段',
    '体当たりで敵を攻撃、NPCに話しかける',
  ];
  controls.forEach((line, i) => {
    context.fillText(line, CANVAS_WIDTH / 2, controlsY + i * 24);
  });

  // Footer
  context.font = '12px monospace';
  context.fillStyle = '#334155';
  context.fillText('Procedural Pixel-Art Roguelike — Built with Copilot', CANVAS_WIDTH / 2, CANVAS_HEIGHT - 30);
  context.textAlign = 'left';
};