import type { BoardState } from '@/types/board';
import type { LevelConfig } from '@/types/level';
import { createEmptyBoard, setCell, getActiveTiles } from './board-model';
import { isDeadlocked } from '@/core/systems/deadlock-detector';

let tileIdCounter = 0;

function resetTileIdCounter(): void {
  tileIdCounter = 0;
}

function nextTileId(): string {
  tileIdCounter++;
  return `tile-${tileIdCounter}`;
}

export function generateBoard(config: LevelConfig): BoardState {
  const MAX_ATTEMPTS = 100;

  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
    const board = generateBoardOnce(config);
    if (!isDeadlocked(board)) return board;
  }

  return generateBoardOnce(config);
}

function generateBoardOnce(config: LevelConfig): BoardState {
  resetTileIdCounter();
  let board = createEmptyBoard(config.width, config.height);

  // Place obstacles
  for (const obs of config.obstacles) {
    board = setCell(board, obs.x, obs.y, {
      x: obs.x,
      y: obs.y,
      kind: 'obstacle',
      obstacleType: obs.type,
    });
  }

  // Collect available positions (not obstacles)
  const availablePositions: { x: number; y: number }[] = [];
  for (let y = 0; y < config.height; y++) {
    for (let x = 0; x < config.width; x++) {
      const cell = board.cells[y]![x]!;
      if (cell.kind === 'empty') {
        availablePositions.push({ x, y });
      }
    }
  }

  const totalSlots = availablePositions.length;

  if (config.fillBoard) {
    // Fill all slots: total must be even, each type must appear even times
    // Distribute tile types evenly across all slots
    const normalTypes = config.tileTypes.filter((t) => !config.specialTypes.includes(t));
    const specialTypes = config.specialTypes;

    // Allocate ~20% of slots to special types (2 of each special type = 1 pair)
    const specialPerType = 2; // Each special type appears as 1 pair
    let specialCount = specialTypes.length * specialPerType;
    if (specialCount % 2 !== 0) specialCount++; // ensure even

    const normalSlots = totalSlots - specialCount;
    const normalTypesCount = normalTypes.length;
    const perNormalType = Math.floor(normalSlots / normalTypesCount);
    // Adjust to ensure total is even and fills board
    let remaining = totalSlots - specialCount - perNormalType * normalTypesCount;

    const tileList: Array<{ type: string; special: boolean }> = [];

    // Add special tiles
    for (const st of specialTypes) {
      tileList.push({ type: st, special: true });
      tileList.push({ type: st, special: true });
    }

    // Add normal tiles
    for (const nt of normalTypes) {
      for (let i = 0; i < perNormalType; i++) {
        tileList.push({ type: nt, special: false });
      }
    }

    // Distribute remaining slots (always even number)
    let idx = 0;
    while (remaining >= 2) {
      const nt = normalTypes[idx % normalTypesCount]!;
      tileList.push({ type: nt, special: false });
      tileList.push({ type: nt, special: false });
      remaining -= 2;
      idx++;
    }

    // Fisher-Yates shuffle
    for (let i = tileList.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [tileList[i], tileList[j]] = [tileList[j]!, tileList[i]!];
    }

    // Place tiles
    const tiles: BoardState['tiles'] = {};
    const count = Math.min(tileList.length, availablePositions.length);

    for (let i = 0; i < count; i++) {
      const pos = availablePositions[i]!;
      const entry = tileList[i]!;
      const id = nextTileId();

      const tile = { id, type: entry.type, x: pos.x, y: pos.y, state: 'active' as const, special: entry.special };
      tiles[id] = tile;

      board = setCell(board, pos.x, pos.y, {
        x: pos.x,
        y: pos.y,
        kind: 'tile',
        tileId: id,
      });
    }

    return { ...board, tiles };
  }

  // Legacy: non-fill mode (shouldn't be used anymore but kept for compatibility)
  const tileTypes: string[] = [];
  for (const type of config.tileTypes) {
    tileTypes.push(type);
    tileTypes.push(type); // pairs
  }

  for (let i = tileTypes.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [tileTypes[i], tileTypes[j]] = [tileTypes[j]!, tileTypes[i]!];
  }

  const tiles: BoardState['tiles'] = {};
  const count = Math.min(tileTypes.length, availablePositions.length);

  for (let i = 0; i < count; i++) {
    const pos = availablePositions[i]!;
    const type = tileTypes[i]!;
    const id = nextTileId();

    const tile = { id, type, x: pos.x, y: pos.y, state: 'active' as const, special: false };
    tiles[id] = tile;

    board = setCell(board, pos.x, pos.y, {
      x: pos.x,
      y: pos.y,
      kind: 'tile',
      tileId: id,
    });
  }

  return { ...board, tiles };
}

export { getActiveTiles };
