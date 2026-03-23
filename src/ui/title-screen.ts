import { CANVAS_HEIGHT, CANVAS_WIDTH, COLORS, TITLE_FONT, UI_FONT } from '../constants';

export const drawTitleScreen = (context: CanvasRenderingContext2D): void => {
  context.fillStyle = COLORS.bg;
  context.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  context.fillStyle = COLORS.uiText;
  context.textAlign = 'center';
  context.textBaseline = 'middle';
  context.font = TITLE_FONT;
  context.fillText('AI Tour ダンジョン', CANVAS_WIDTH / 2, 180);
  context.font = UI_FONT;
  context.fillText('Copilotと一緒に冒険', CANVAS_WIDTH / 2, 220);
  context.fillStyle = COLORS.uiMuted;
  context.fillText('Enter で開始', CANVAS_WIDTH / 2, 310);
  context.fillText('移動: 矢印キー / WASD', CANVAS_WIDTH / 2, 350);
  context.fillText('I: インベントリ  . または Space: 待機  >: 階段', CANVAS_WIDTH / 2, 380);
  context.fillText('ターン制ローグライクの基本形を実装済み', CANVAS_WIDTH / 2, 440);
  context.textAlign = 'left';
};