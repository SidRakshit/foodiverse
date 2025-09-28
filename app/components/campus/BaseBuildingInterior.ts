import Player from '../Player';
import { Scene, SceneType } from '../types';

interface InteriorTile {
  type: 'floor' | 'wall' | 'door' | 'furniture' | 'window' | 'stairs' | 'elevator';
  solid: boolean;
  furniture?: 'desk' | 'chair' | 'bookshelf' | 'computer' | 'table' | 'couch' | 'plant';
}

abstract class BaseBuildingInterior implements Scene {
  public abstract type: SceneType;
  protected tileSize: number = 32;
  protected roomWidth: number = 20; // tiles
  protected roomHeight: number = 15; // tiles
  protected tiles: InteriorTile[][];
  public cameraX: number = 0;
  public cameraY: number = 0;
  protected exitX: number = 320; // Default exit position
  protected exitY: number = 450;

  constructor() {
    this.tiles = this.generateInterior();
  }

  protected abstract generateInterior(): InteriorTile[][];
  protected abstract getBuildingName(): string;

  public canMoveTo(x: number, y: number, width: number, height: number): boolean {
    // Convert pixel coordinates to tile coordinates
    const leftTile = Math.floor(x / this.tileSize);
    const rightTile = Math.floor((x + width - 1) / this.tileSize);
    const topTile = Math.floor(y / this.tileSize);
    const bottomTile = Math.floor((y + height - 1) / this.tileSize);

    // Check all tiles that the entity overlaps
    for (let tileY = topTile; tileY <= bottomTile; tileY++) {
      for (let tileX = leftTile; tileX <= rightTile; tileX++) {
        if (this.isTileSolid(tileX, tileY)) {
          return false;
        }
      }
    }

    return true;
  }

  private isTileSolid(tileX: number, tileY: number): boolean {
    // Check bounds
    if (tileX < 0 || tileX >= this.roomWidth || tileY < 0 || tileY >= this.roomHeight) {
      return true; // Treat out-of-bounds as solid
    }

    return this.tiles[tileY][tileX].solid;
  }

  public update(deltaTime: number): void {
    // Base update logic - can be overridden
  }

  public render(ctx: CanvasRenderingContext2D, player: Player): void {
    // Simple camera that centers on the room
    this.updateCamera(player);

    // Clear with indoor background
    ctx.fillStyle = '#F5F5DC'; // Beige indoor background
    ctx.fillRect(0, 0, 800, 600);

    // Render visible tiles
    const startTileX = Math.max(0, Math.floor(this.cameraX / this.tileSize));
    const endTileX = Math.min(this.roomWidth - 1, Math.floor((this.cameraX + 800) / this.tileSize));
    const startTileY = Math.max(0, Math.floor(this.cameraY / this.tileSize));
    const endTileY = Math.min(this.roomHeight - 1, Math.floor((this.cameraY + 600) / this.tileSize));

    for (let tileY = startTileY; tileY <= endTileY; tileY++) {
      for (let tileX = startTileX; tileX <= endTileX; tileX++) {
        const tile = this.tiles[tileY][tileX];
        const x = tileX * this.tileSize - this.cameraX;
        const y = tileY * this.tileSize - this.cameraY;

        this.renderTile(ctx, tile, x, y);
      }
    }

    // Render building-specific elements
    this.renderBuildingSpecificElements(ctx);
  }

  protected abstract renderBuildingSpecificElements(ctx: CanvasRenderingContext2D): void;

  private updateCamera(player: Player): void {
    // Keep camera centered on room, don't follow player too closely
    const targetCameraX = Math.max(0, Math.min(this.roomWidth * this.tileSize - 800, 0));
    const targetCameraY = Math.max(0, Math.min(this.roomHeight * this.tileSize - 600, 0));

    this.cameraX = targetCameraX;
    this.cameraY = targetCameraY;
  }

  private renderTile(ctx: CanvasRenderingContext2D, tile: InteriorTile, x: number, y: number): void {
    switch (tile.type) {
      case 'floor':
        this.renderFloorTile(ctx, x, y);
        break;
      case 'wall':
        this.renderWallTile(ctx, x, y);
        break;
      case 'door':
        this.renderDoorTile(ctx, x, y);
        break;
      case 'furniture':
        this.renderFurnitureTile(ctx, tile, x, y);
        break;
      case 'window':
        this.renderWindowTile(ctx, x, y);
        break;
    }
  }

  protected renderFloorTile(ctx: CanvasRenderingContext2D, x: number, y: number): void {
    // Polished interior floor
    ctx.fillStyle = '#DEB887'; // Burlywood
    ctx.fillRect(x, y, this.tileSize, this.tileSize);
    
    // Floor pattern
    ctx.fillStyle = '#D2B48C';
    ctx.fillRect(x + 1, y + 1, this.tileSize - 2, this.tileSize - 2);
    
    // Tile lines
    ctx.fillStyle = '#CD853F';
    ctx.fillRect(x, y + 15, this.tileSize, 1);
    ctx.fillRect(x + 15, y, 1, this.tileSize);
  }

  protected renderWallTile(ctx: CanvasRenderingContext2D, x: number, y: number): void {
    // Interior wall with VT colors
    ctx.fillStyle = '#F5F5DC'; // Beige base
    ctx.fillRect(x, y, this.tileSize, this.tileSize);
    
    // Wall trim
    ctx.fillStyle = '#8B0000'; // VT Maroon
    ctx.fillRect(x, y, this.tileSize, 4);
    ctx.fillRect(x, y + this.tileSize - 4, this.tileSize, 4);
    
    // Wall texture
    ctx.fillStyle = '#DDBEA9';
    ctx.fillRect(x + 2, y + 4, this.tileSize - 4, this.tileSize - 8);
  }

  protected renderDoorTile(ctx: CanvasRenderingContext2D, x: number, y: number): void {
    // Floor base
    this.renderFloorTile(ctx, x, y);
    
    // Exit indicator
    ctx.fillStyle = '#32CD32'; // Lime green
    ctx.fillRect(x + 8, y + 8, 16, 16);
    
    // Exit text
    ctx.fillStyle = 'white';
    ctx.font = '8px monospace';
    ctx.fillText('EXIT', x + 10, y + 18);
  }

  protected renderFurnitureTile(ctx: CanvasRenderingContext2D, tile: InteriorTile, x: number, y: number): void {
    // Floor base
    this.renderFloorTile(ctx, x, y);
    
    // Furniture based on type
    switch (tile.furniture) {
      case 'desk':
        ctx.fillStyle = '#8B4513'; // Brown wood
        ctx.fillRect(x + 4, y + 8, 24, 16);
        break;
      case 'chair':
        ctx.fillStyle = '#8B0000'; // VT Maroon
        ctx.fillRect(x + 8, y + 8, 16, 16);
        ctx.fillRect(x + 10, y + 6, 12, 4); // Back
        break;
      case 'bookshelf':
        ctx.fillStyle = '#8B4513'; // Brown wood
        ctx.fillRect(x + 2, y + 2, 28, 28);
        // Books
        ctx.fillStyle = '#FF8C00'; // VT Orange
        ctx.fillRect(x + 4, y + 6, 4, 20);
        ctx.fillStyle = '#8B0000'; // VT Maroon
        ctx.fillRect(x + 10, y + 6, 4, 20);
        ctx.fillStyle = '#FF8C00';
        ctx.fillRect(x + 16, y + 6, 4, 20);
        break;
      case 'computer':
        ctx.fillStyle = '#2F2F2F'; // Dark gray
        ctx.fillRect(x + 8, y + 12, 16, 12);
        ctx.fillStyle = '#4169E1'; // Blue screen
        ctx.fillRect(x + 10, y + 14, 12, 8);
        break;
      case 'table':
        ctx.fillStyle = '#8B4513'; // Brown wood
        ctx.fillRect(x + 2, y + 10, 28, 12);
        break;
    }
  }

  protected renderWindowTile(ctx: CanvasRenderingContext2D, x: number, y: number): void {
    // Wall base
    this.renderWallTile(ctx, x, y);
    
    // Window
    ctx.fillStyle = '#87CEEB'; // Sky blue
    ctx.fillRect(x + 4, y + 4, 24, 24);
    
    // Window frame
    ctx.fillStyle = '#8B4513'; // Brown
    ctx.fillRect(x + 2, y + 2, 28, 4);
    ctx.fillRect(x + 2, y + 26, 28, 4);
    ctx.fillRect(x + 2, y + 2, 4, 28);
    ctx.fillRect(x + 26, y + 2, 4, 28);
    
    // Cross pattern
    ctx.fillRect(x + 14, y + 4, 4, 24);
    ctx.fillRect(x + 4, y + 14, 24, 4);
  }

  public getExitPosition(): { x: number, y: number, scene: SceneType } {
    return { x: this.exitX, y: this.exitY, scene: 'campus' };
  }

  public getEntrancePosition(): { x: number, y: number } {
    return { x: this.exitX, y: this.exitY - 50 }; // Enter slightly above exit
  }
}

export default BaseBuildingInterior;
