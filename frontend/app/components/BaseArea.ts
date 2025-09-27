import Player from './Player';
import { Scene, SceneType } from './types';

interface AreaTile {
  type: 'floor' | 'wall' | 'door' | 'furniture' | 'window' | 'stairs' | 'elevator' | 'grass' | 'road' | 'sidewalk' | 'building' | 'parking' | 'tree' | 'house' | 'apartment' | 'restaurant' | 'shop';
  solid: boolean;
  furniture?: 'desk' | 'chair' | 'bookshelf' | 'computer' | 'table' | 'couch' | 'plant' | 'car' | 'bench';
  buildingType?: string;
}

abstract class BaseArea implements Scene {
  public abstract type: SceneType;
  protected tileSize: number = 32;
  protected areaWidth: number = 25; // tiles
  protected areaHeight: number = 19; // tiles
  protected tiles: AreaTile[][];
  public cameraX: number = 0;
  public cameraY: number = 0;
  protected exitX: number = 400; // Default exit position
  protected exitY: number = 450;

  constructor() {
    this.tiles = this.generateArea();
  }

  protected abstract generateArea(): AreaTile[][];
  protected abstract getAreaName(): string;

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
    if (tileX < 0 || tileX >= this.areaWidth || tileY < 0 || tileY >= this.areaHeight) {
      return true; // Treat out-of-bounds as solid
    }

    return this.tiles[tileY][tileX].solid;
  }

  public update(deltaTime: number): void {
    // Base update logic - can be overridden
  }

  public render(ctx: CanvasRenderingContext2D, player: Player): void {
    // Update camera
    this.updateCamera(player);

    // Clear with appropriate background
    this.renderBackground(ctx);

    // Render visible tiles
    const startTileX = Math.max(0, Math.floor(this.cameraX / this.tileSize));
    const endTileX = Math.min(this.areaWidth - 1, Math.floor((this.cameraX + 800) / this.tileSize));
    const startTileY = Math.max(0, Math.floor(this.cameraY / this.tileSize));
    const endTileY = Math.min(this.areaHeight - 1, Math.floor((this.cameraY + 600) / this.tileSize));

    for (let tileY = startTileY; tileY <= endTileY; tileY++) {
      for (let tileX = startTileX; tileX <= endTileX; tileX++) {
        const tile = this.tiles[tileY][tileX];
        const x = tileX * this.tileSize - this.cameraX;
        const y = tileY * this.tileSize - this.cameraY;

        this.renderTile(ctx, tile, x, y);
      }
    }

    // Render area-specific elements
    this.renderAreaSpecificElements(ctx);
  }

  protected abstract renderBackground(ctx: CanvasRenderingContext2D): void;
  protected abstract renderAreaSpecificElements(ctx: CanvasRenderingContext2D): void;

  protected updateCamera(player: Player): void {
    // Keep camera centered on player, but don't go outside area bounds
    const targetCameraX = player.x - 400 + player.width / 2;
    const targetCameraY = player.y - 300 + player.height / 2;

    const maxCameraX = this.areaWidth * this.tileSize - 800;
    const maxCameraY = this.areaHeight * this.tileSize - 600;

    this.cameraX = Math.max(0, Math.min(maxCameraX, targetCameraX));
    this.cameraY = Math.max(0, Math.min(maxCameraY, targetCameraY));
  }

  protected renderTile(ctx: CanvasRenderingContext2D, tile: AreaTile, x: number, y: number): void {
    switch (tile.type) {
      case 'grass':
        this.renderGrassTile(ctx, x, y);
        break;
      case 'road':
        this.renderRoadTile(ctx, x, y);
        break;
      case 'sidewalk':
        this.renderSidewalkTile(ctx, x, y);
        break;
      case 'building':
        this.renderBuildingTile(ctx, tile, x, y);
        break;
      case 'door':
        this.renderDoorTile(ctx, tile, x, y);
        break;
      case 'parking':
        this.renderParkingTile(ctx, x, y);
        break;
      case 'floor':
        this.renderFloorTile(ctx, x, y);
        break;
      case 'wall':
        this.renderWallTile(ctx, x, y);
        break;
      case 'furniture':
        this.renderFurnitureTile(ctx, tile, x, y);
        break;
    }
  }

  // Base tile rendering methods that can be overridden
  protected renderGrassTile(ctx: CanvasRenderingContext2D, x: number, y: number): void {
    ctx.fillStyle = '#4a7c59';
    ctx.fillRect(x, y, this.tileSize, this.tileSize);
    
    ctx.fillStyle = '#5a8c69';
    for (let i = 0; i < 8; i++) {
      const px = x + Math.floor(Math.random() * this.tileSize);
      const py = y + Math.floor(Math.random() * this.tileSize);
      ctx.fillRect(px, py, 2, 2);
    }
  }

  protected renderRoadTile(ctx: CanvasRenderingContext2D, x: number, y: number): void {
    ctx.fillStyle = '#2F2F2F';
    ctx.fillRect(x, y, this.tileSize, this.tileSize);
    
    // Road markings
    ctx.fillStyle = '#FFFF00';
    ctx.fillRect(x, y + 14, this.tileSize, 2);
  }

  protected renderSidewalkTile(ctx: CanvasRenderingContext2D, x: number, y: number): void {
    ctx.fillStyle = '#D3D3D3';
    ctx.fillRect(x, y, this.tileSize, this.tileSize);
    
    // Sidewalk pattern
    ctx.fillStyle = '#C0C0C0';
    ctx.fillRect(x + 2, y + 2, this.tileSize - 4, this.tileSize - 4);
  }

  protected renderBuildingTile(ctx: CanvasRenderingContext2D, tile: AreaTile, x: number, y: number): void {
    // Default building appearance
    ctx.fillStyle = '#8B4513';
    ctx.fillRect(x, y, this.tileSize, this.tileSize);
  }

  protected renderDoorTile(ctx: CanvasRenderingContext2D, tile: AreaTile, x: number, y: number): void {
    // Default door appearance
    ctx.fillStyle = '#654321';
    ctx.fillRect(x, y, this.tileSize, this.tileSize);
  }

  protected renderParkingTile(ctx: CanvasRenderingContext2D, x: number, y: number): void {
    ctx.fillStyle = '#2F2F2F';
    ctx.fillRect(x, y, this.tileSize, this.tileSize);
    
    ctx.fillStyle = '#FFFF00';
    ctx.fillRect(x, y + 14, this.tileSize, 2);
    ctx.fillRect(x + 14, y, 2, this.tileSize);
  }

  protected renderFloorTile(ctx: CanvasRenderingContext2D, x: number, y: number): void {
    ctx.fillStyle = '#DEB887';
    ctx.fillRect(x, y, this.tileSize, this.tileSize);
  }

  protected renderWallTile(ctx: CanvasRenderingContext2D, x: number, y: number): void {
    ctx.fillStyle = '#F5F5DC';
    ctx.fillRect(x, y, this.tileSize, this.tileSize);
  }

  protected renderFurnitureTile(ctx: CanvasRenderingContext2D, tile: AreaTile, x: number, y: number): void {
    // Base furniture rendering
    ctx.fillStyle = '#8B4513';
    ctx.fillRect(x + 4, y + 4, this.tileSize - 8, this.tileSize - 8);
  }

  public getEntrancePosition(): { x: number, y: number } {
    return { x: this.exitX, y: this.exitY };
  }

  // Method to get tile information for scene transitions
  public getTileAt(tileX: number, tileY: number): AreaTile | null {
    if (tileX < 0 || tileX >= this.areaWidth || tileY < 0 || tileY >= this.areaHeight) {
      return null;
    }
    return this.tiles[tileY][tileX];
  }
}

export default BaseArea;

