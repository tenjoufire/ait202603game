export type InputAction =
  | 'start'
  | 'restart'
  | 'inventory'
  | 'cancel'
  | 'wait'
  | 'descend'
  | { type: 'move'; dx: number; dy: number }
  | { type: 'inventory-slot'; index: number };

const moveBindings = new Map<string, { dx: number; dy: number }>([
  ['ArrowUp', { dx: 0, dy: -1 }],
  ['ArrowDown', { dx: 0, dy: 1 }],
  ['ArrowLeft', { dx: -1, dy: 0 }],
  ['ArrowRight', { dx: 1, dy: 0 }],
  ['w', { dx: 0, dy: -1 }],
  ['s', { dx: 0, dy: 1 }],
  ['a', { dx: -1, dy: 0 }],
  ['d', { dx: 1, dy: 0 }],
]);

export class InputHandler {
  constructor(private readonly onAction: (action: InputAction) => void) {
    window.addEventListener('keydown', this.handleKeyDown);
  }

  dispose(): void {
    window.removeEventListener('keydown', this.handleKeyDown);
  }

  private readonly handleKeyDown = (event: KeyboardEvent): void => {
    const movement = moveBindings.get(event.key);
    if (movement) {
      event.preventDefault();
      this.onAction({ type: 'move', ...movement });
      return;
    }

    if (event.key === 'Enter') {
      event.preventDefault();
      this.onAction('start');
      return;
    }
    if (event.key === 'i' || event.key === 'I') {
      event.preventDefault();
      this.onAction('inventory');
      return;
    }
    if (event.key === 'Escape') {
      event.preventDefault();
      this.onAction('cancel');
      return;
    }
    if (event.key === ' ' || event.key === '.') {
      event.preventDefault();
      this.onAction('wait');
      return;
    }
    if (event.key === '>') {
      event.preventDefault();
      this.onAction('descend');
      return;
    }
    if (/^[1-9]$/.test(event.key)) {
      event.preventDefault();
      this.onAction({ type: 'inventory-slot', index: Number(event.key) - 1 });
    }
  };
}