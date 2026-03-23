import { MAX_HIGH_SCORES } from '../constants';
import { decideEnemyStep } from '../systems/ai';
import { attackTarget, grantExperience } from '../systems/combat';
import { computeVisibleTiles } from '../systems/fov';
import { useInventoryItem, tryAddItem } from '../systems/inventory';
import { canMoveTo, moveActor } from '../systems/movement';
import { generateDungeon, type DungeonMap } from '../map/dungeon-generator';
import { InputHandler, type InputAction } from './input-handler';
import { Renderer, type RenderState } from './renderer';
import { createPlayer, type Player } from '../entities/player';
import type { Enemy } from '../entities/enemy';
import type { Item } from '../entities/item';
import { Random } from '../utils/random';
import { pushMessages } from '../ui/message-log';

type GameState = RenderState;

const HIGH_SCORE_KEY = 'ait202603game.highscores';

export class Game {
  private readonly renderer: Renderer;
  private readonly input: InputHandler;
  private readonly random = new Random();
  private state: GameState = 'title';
  private floor = 1;
  private map!: DungeonMap;
  private player!: Player;
  private enemies: Enemy[] = [];
  private items: Item[] = [];
  private messages: string[] = [];
  private visibleTiles = new Set<string>();
  private animationFrame = 0;
  private highScores: number[] = [];

  constructor(canvas: HTMLCanvasElement) {
    this.renderer = new Renderer(canvas);
    this.input = new InputHandler((action) => this.handleAction(action));
    this.highScores = this.loadHighScores();
  }

  start(): void {
    this.loop();
  }

  private loop = (): void => {
    this.renderer.render({
      state: this.state,
      floor: this.floor,
      player: this.player ?? createPlayer(0, 0),
      enemies: this.enemies,
      items: this.items,
      map: this.map ?? generateDungeon(1, 1).map,
      messages: this.messages,
      visibleTiles: this.visibleTiles,
      highScores: this.highScores,
    });
    this.animationFrame = window.requestAnimationFrame(this.loop);
  };

  private handleAction(action: InputAction): void {
    if (this.state === 'title') {
      if (action === 'start') {
        this.startNewGame();
      }
      return;
    }

    if (this.state === 'gameover' || this.state === 'victory') {
      if (action === 'start') {
        this.startNewGame();
      }
      return;
    }

    if (this.state === 'inventory') {
      if (action === 'cancel' || action === 'inventory') {
        this.state = 'playing';
        return;
      }
      if (typeof action === 'object' && action.type === 'inventory-slot') {
        const result = useInventoryItem(this.player, action.index, this.enemies);
        this.messages = pushMessages(this.messages, result.messages);
        this.cleanupDefeatedEnemies();
        this.advanceTurn();
        this.state = 'playing';
      }
      return;
    }

    if (action === 'inventory') {
      this.state = 'inventory';
      return;
    }

    if (action === 'wait') {
      this.messages = pushMessages(this.messages, ['様子をうかがった。']);
      this.advanceTurn();
      return;
    }

    if (action === 'descend') {
      if (this.player.x === this.map.stairs.x && this.player.y === this.map.stairs.y) {
        this.floor += 1;
        const wasVictory = this.floor > 5;
        if (wasVictory) {
          this.finishRun('victory');
          return;
        }
        this.generateFloor();
        this.messages = pushMessages(this.messages, [`B${this.floor} に降りた。`]);
      } else {
        this.messages = pushMessages(this.messages, ['ここには階段がない。']);
      }
      return;
    }

    if (typeof action === 'object' && action.type === 'move') {
      this.handleMove(action.dx, action.dy);
    }
  }

  private startNewGame(): void {
    this.floor = 1;
    this.messages = ['迷宮へようこそ。'];
    this.player = createPlayer(0, 0);
    this.generateFloor();
    this.state = 'playing';
  }

  private generateFloor(): void {
    const floorSeed = Date.now() + this.floor * 100;
    const { map, start, enemies, items } = generateDungeon(this.floor, floorSeed);
    this.map = map;
    this.enemies = enemies;
    this.items = items;
    this.player.x = start.x;
    this.player.y = start.y;
    this.refreshVisibility();
  }

  private refreshVisibility(): void {
    this.visibleTiles = computeVisibleTiles(this.player, this.player.fovRadius, (x, y) => this.map.tiles[y]?.[x]?.blocksSight ?? true);
    for (const key of this.visibleTiles) {
      const [x, y] = key.split(',').map(Number);
      if (this.map.explored[y]?.[x] !== undefined) {
        this.map.explored[y][x] = true;
      }
    }
  }

  private handleMove(dx: number, dy: number): void {
    const nextX = this.player.x + dx;
    const nextY = this.player.y + dy;
    const enemy = this.enemies.find((candidate) => candidate.x === nextX && candidate.y === nextY);
    if (enemy) {
      const result = attackTarget(this.player, enemy, this.random);
      const entries = [`プレイヤーの攻撃。${enemy.name}に${result.damage}ダメージ。`];
      if (result.defeated) {
        entries.push(...grantExperience(this.player, enemy));
      }
      this.messages = pushMessages(this.messages, entries);
      this.cleanupDefeatedEnemies();
      if (enemy.name === 'ドラゴン' && result.defeated) {
        this.finishRun('victory');
        return;
      }
      this.advanceTurn();
      return;
    }

    const blockers = this.enemies.filter((candidate) => candidate.hp > 0);
    if (!canMoveTo(this.map, nextX, nextY, blockers)) {
      return;
    }

    moveActor(this.player, dx, dy);
    this.pickupItemsAtPlayer();
    if (this.player.x === this.map.stairs.x && this.player.y === this.map.stairs.y) {
      this.messages = pushMessages(this.messages, ['階段を見つけた。 > で次の階へ。']);
    }
    this.advanceTurn();
  }

  private pickupItemsAtPlayer(): void {
    const picked = this.items.filter((item) => item.x === this.player.x && item.y === this.player.y);
    if (picked.length === 0) {
      return;
    }
    const messages: string[] = [];
    for (const item of picked) {
      if (tryAddItem(this.player, item)) {
        messages.push(`${item.name}を拾った。`);
      } else {
        messages.push(`インベントリがいっぱいで${item.name}を拾えない。`);
      }
    }
    this.items = this.items.filter((item) => item.x !== this.player.x || item.y !== this.player.y || !this.player.inventory.includes(item));
    this.messages = pushMessages(this.messages, messages);
  }

  private advanceTurn(): void {
    this.enemyPhase();
    this.cleanupDefeatedEnemies();
    this.refreshVisibility();
    if (this.player.hp <= 0) {
      this.finishRun('gameover');
      return;
    }
    this.player.score = this.computeScore();
  }

  private enemyPhase(): void {
    for (const enemy of this.enemies) {
      if (enemy.hp <= 0) {
        continue;
      }

      const distance = Math.abs(enemy.x - this.player.x) + Math.abs(enemy.y - this.player.y);
      if (distance <= enemy.attackRange) {
        const result = attackTarget(enemy, this.player, this.random);
        this.messages = pushMessages(this.messages, [`${enemy.name}の攻撃。プレイヤーに${result.damage}ダメージ。`]);
        if (this.player.hp <= 0) {
          return;
        }
        continue;
      }

      const blockers = [
        ...this.enemies.filter((candidate) => candidate.id !== enemy.id && candidate.hp > 0),
        this.player,
      ];
      const step = decideEnemyStep(enemy, this.player, this.map, blockers, this.random);
      if (step && !(step.x === this.player.x && step.y === this.player.y)) {
        enemy.x = step.x;
        enemy.y = step.y;
      }
    }
  }

  private cleanupDefeatedEnemies(): void {
    this.enemies = this.enemies.filter((enemy) => enemy.hp > 0);
  }

  private computeScore(): number {
    return this.player.exp + this.floor * 100 + this.player.hp * 2 + (this.player.level - 1) * 25;
  }

  private finishRun(state: Extract<GameState, 'gameover' | 'victory'>): void {
    this.player.score = this.computeScore();
    this.state = state;
    this.highScores = this.storeHighScore(this.player.score);
  }

  private loadHighScores(): number[] {
    try {
      const raw = window.localStorage.getItem(HIGH_SCORE_KEY);
      const parsed = raw ? JSON.parse(raw) : [];
      return Array.isArray(parsed) ? parsed.filter((value): value is number => typeof value === 'number') : [];
    } catch {
      return [];
    }
  }

  private storeHighScore(score: number): number[] {
    const scores = [...this.highScores, score].sort((a, b) => b - a).slice(0, MAX_HIGH_SCORES);
    try {
      window.localStorage.setItem(HIGH_SCORE_KEY, JSON.stringify(scores));
    } catch {
      return scores;
    }
    return scores;
  }
}