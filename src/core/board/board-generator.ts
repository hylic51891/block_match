import type { BoardState, SpecialType } from '@/types/board';
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
    const normalTypes = config.tileTypes.filter((t) => !config.specialTypes.includes(t as SpecialType));
    const specialTypes = config.specialTypes;

    // Each special type appears as N pairs (2*N tiles), default N=1
    const specialPairs = config.specialPairsPerType ?? 1;
    const specialPerType = specialPairs * 2; // always even
    const specialCount = specialTypes.length * specialPerType;

    let normalSlots = totalSlots - specialCount;

    // Guarantee normalSlots is even: if odd, remove last obstacle to make it even
    // This ensures every slot can be filled with paired tiles
    if (normalSlots % 2 !== 0 && config.obstacles.length > 0) {
      // Remove the last obstacle to free one slot → normalSlots becomes even
      const lastObs = config.obstacles[config.obstacles.length - 1]!;
      board = setCell(board, lastObs.x, lastObs.y, {
        x: lastObs.x,
        y: lastObs.y,
        kind: 'empty',
      });
      // Recollect available positions
      availablePositions.length = 0;
      for (let y = 0; y < config.height; y++) {
        for (let x = 0; x < config.width; x++) {
          const cell = board.cells[y]![x]!;
          if (cell.kind === 'empty') {
            availablePositions.push({ x, y });
          }
        }
      }
      normalSlots = availablePositions.length - specialCount;
    }

    const normalTypesCount = normalTypes.length;

    // perNormalType must be even → each type count is a multiple of 2
    let perNormalType = Math.floor(normalSlots / normalTypesCount);
    if (perNormalType % 2 !== 0) perNormalType--; // round down to even

    // Recalculate remaining after placing even-count normal tiles
    let remaining = availablePositions.length - specialCount - perNormalType * normalTypesCount;

    const tileList: Array<{ type: string; specialType?: SpecialType }> = [];

    // Add special tiles (N pairs per type)
    for (const st of specialTypes) {
      for (let i = 0; i < specialPairs; i++) {
        tileList.push({ type: st, specialType: st });
        tileList.push({ type: st, specialType: st });
      }
    }

    // Add normal tiles (always even count per type)
    for (const nt of normalTypes) {
      for (let i = 0; i < perNormalType; i++) {
        tileList.push({ type: nt });
      }
    }

    // Distribute remaining slots in pairs (always add 2 of same type)
    let idx = 0;
    while (remaining >= 2) {
      const nt = normalTypes[idx % normalTypesCount]!;
      tileList.push({ type: nt });
      tileList.push({ type: nt });
      remaining -= 2;
      idx++;
    }

    // Fisher-Yates shuffle
    for (let i = tileList.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [tileList[i], tileList[j]] = [tileList[j]!, tileList[i]!];
    }

    // Place tiles — tileList.length should now equal availablePositions.length
    const tiles: BoardState['tiles'] = {};

    for (let i = 0; i < tileList.length; i++) {
      const pos = availablePositions[i]!;
      const entry = tileList[i]!;
      const id = nextTileId();

      const tile = {
        id,
        type: entry.type,
        x: pos.x,
        y: pos.y,
        state: 'active' as const,
        ...(entry.specialType ? { specialType: entry.specialType } : {}),
      };
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

  // Legacy: non-fill mode
  const tileTypes: string[] = [];
  for (const type of config.tileTypes) {
    tileTypes.push(type);
    tileTypes.push(type);
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

    const tile = { id, type, x: pos.x, y: pos.y, state: 'active' as const };
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

/** Validate that a generated board has all slots filled and every tile type has even count */
export function validateBoard(board: BoardState): {
  valid: boolean;
  filledRatio: number;
  typeCounts: Record<string, number>;
  errors: string[];
} {
  const errors: string[] = [];

  // Check all cells are either tile or obstacle (no empty cells)
  let emptyCount = 0;
  for (let y = 0; y < board.height; y++) {
    for (let x = 0; x < board.width; x++) {
      if (board.cells[y]![x]!.kind === 'empty') emptyCount++;
    }
  }

  const totalCells = board.width * board.height;
  const filledRatio = (totalCells - emptyCount) / totalCells;

  if (emptyCount > 0) {
    errors.push(`棋盘有 ${emptyCount} 个空位未填充`);
  }

  // Check every tile type has even count
  const typeCounts: Record<string, number> = {};
  for (const tile of Object.values(board.tiles)) {
    if (tile.state !== 'removed') {
      typeCounts[tile.type] = (typeCounts[tile.type] ?? 0) + 1;
    }
  }

  for (const [type, count] of Object.entries(typeCounts)) {
    if (count % 2 !== 0) {
      errors.push(`图块类型 ${type} 数量为 ${count}（奇数），无法全部配对`);
    }
  }

  // Check total tile count is even
  const totalTiles = Object.values(board.tiles).filter(t => t.state !== 'removed').length;
  if (totalTiles % 2 !== 0) {
    errors.push(`图块总数 ${totalTiles} 为奇数`);
  }

  return {
    valid: errors.length === 0,
    filledRatio,
    typeCounts,
    errors,
  };
}

export { getActiveTiles };
