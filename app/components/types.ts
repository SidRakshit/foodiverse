import Player from './Player';

export type SceneType = 'campus' | 'burruss' | 'turner' | 'torgersen' | 'squires' | 'owens' | 'war_memorial' | 'cassell' | 'drillfield' | 'lane_stadium' | 'tots' | 'hokiehouse' | 'centros' | 'tots_upstairs' | 'edge' | 'foodlion' | 'techterrace';

export interface Scene {
  type: SceneType;
  render(ctx: CanvasRenderingContext2D, player: Player): void;
  update(deltaTime: number): void;
  canMoveTo(x: number, y: number, width: number, height: number): boolean;
  getExitPosition?(): { x: number, y: number, scene: SceneType } | null;
  getEntrancePosition?(): { x: number, y: number };
  cameraX?: number;
  cameraY?: number;
}
