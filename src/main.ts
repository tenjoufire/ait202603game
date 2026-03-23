import { CANVAS_HEIGHT, CANVAS_WIDTH } from './constants';
import { Game } from './core/game';
import './styles.css';

const canvas = document.getElementById('game');

if (!(canvas instanceof HTMLCanvasElement)) {
  throw new Error('Canvas element not found');
}

canvas.width = CANVAS_WIDTH;
canvas.height = CANVAS_HEIGHT;

const game = new Game(canvas);
game.start();