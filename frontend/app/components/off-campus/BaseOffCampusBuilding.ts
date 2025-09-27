import Player from '../Player';
import { Scene, SceneType } from '../types';

interface ApartmentTile {
  type: 'floor' | 'wall' | 'door' | 'furniture' | 'window' | 'stairs' | 'elevator' | 'lobby' | 'mailroom';
  solid: boolean;
  furniture?: 'couch' | 'table' | 'chair' | 'desk' | 'bed' | 'kitchen' | 'mailbox' | 'vending' | 'laundry';
}

abstract class BaseOffCampusBuilding implements Scene {
  public abstract type: SceneType;
  protected tileSize: number = 32;
  protected buildingWidth: number = 20; // tiles
  protected buildingHeight: number = 15; // tiles
  protected tiles: ApartmentTile[][];
  public cameraX: number = 0;
  public cameraY: number = 0;
  protected exitX: number = 320; // Default exit position
  protected exitY: number = 450;

  constructor() {
    this.tiles = this.generateBuilding();
  }

  protected abstract generateBuilding(): ApartmentTile[][];
  protected abstract getBuildingName(): string;
  protected abstract getBuildingType(): 'apartment' | 'mixed_use' | 'commercial';

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
    if (tileX < 0 || tileX >= this.buildingWidth || tileY < 0 || tileY >= this.buildingHeight) {
      return true; // Treat out-of-bounds as solid
    }

    return this.tiles[tileY][tileX].solid;
  }

  public update(deltaTime: number): void {
    // Base update logic - can be overridden
  }

  public render(ctx: CanvasRenderingContext2D, player: Player): void {
    // Simple camera that centers on the building
    this.updateCamera(player);

    // Clear with indoor background
    ctx.fillStyle = '#F0F0F0'; // Light gray indoor background
    ctx.fillRect(0, 0, 800, 600);

    // Render visible tiles
    const startTileX = Math.max(0, Math.floor(this.cameraX / this.tileSize));
    const endTileX = Math.min(this.buildingWidth - 1, Math.floor((this.cameraX + 800) / this.tileSize));
    const startTileY = Math.max(0, Math.floor(this.cameraY / this.tileSize));
    const endTileY = Math.min(this.buildingHeight - 1, Math.floor((this.cameraY + 600) / this.tileSize));

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
    // Keep camera centered on building
    const targetCameraX = Math.max(0, Math.min(this.buildingWidth * this.tileSize - 800, 0));
    const targetCameraY = Math.max(0, Math.min(this.buildingHeight * this.tileSize - 600, 0));

    this.cameraX = targetCameraX;
    this.cameraY = targetCameraY;
  }

  private renderTile(ctx: CanvasRenderingContext2D, tile: ApartmentTile, x: number, y: number): void {
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
      case 'lobby':
        this.renderLobbyTile(ctx, x, y);
        break;
      case 'mailroom':
        this.renderMailroomTile(ctx, x, y);
        break;
      case 'elevator':
        this.renderElevatorTile(ctx, x, y);
        break;
      case 'stairs':
        this.renderStairsTile(ctx, x, y);
        break;
    }
  }

  protected renderFloorTile(ctx: CanvasRenderingContext2D, x: number, y: number): void {
    // Modern apartment flooring
    ctx.fillStyle = '#E8E8E8'; // Light gray
    ctx.fillRect(x, y, this.tileSize, this.tileSize);
    
    // Floor pattern
    ctx.fillStyle = '#DCDCDC';
    ctx.fillRect(x + 1, y + 1, this.tileSize - 2, this.tileSize - 2);
  }

  protected renderWallTile(ctx: CanvasRenderingContext2D, x: number, y: number): void {
    // Modern apartment walls
    ctx.fillStyle = '#FFFFFF'; // White walls
    ctx.fillRect(x, y, this.tileSize, this.tileSize);
    
    // Wall trim
    ctx.fillStyle = '#D3D3D3';
    ctx.fillRect(x, y, this.tileSize, 2);
    ctx.fillRect(x, y + this.tileSize - 2, this.tileSize, 2);
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

  protected renderFurnitureTile(ctx: CanvasRenderingContext2D, tile: ApartmentTile, x: number, y: number): void {
    // Floor base
    this.renderFloorTile(ctx, x, y);
    
    // Furniture based on type
    switch (tile.furniture) {
      case 'couch':
        ctx.fillStyle = '#8B4513'; // Brown
        ctx.fillRect(x + 2, y + 8, 28, 16);
        ctx.fillStyle = '#A0522D'; // Lighter brown for cushions
        ctx.fillRect(x + 4, y + 10, 6, 12);
        ctx.fillRect(x + 12, y + 10, 6, 12);
        ctx.fillRect(x + 20, y + 10, 6, 12);
        break;
      case 'bed':
        ctx.fillStyle = '#8B4513'; // Brown bed frame
        ctx.fillRect(x + 2, y + 4, 28, 24);
        ctx.fillStyle = '#FFFFFF'; // White sheets
        ctx.fillRect(x + 4, y + 6, 24, 20);
        ctx.fillStyle = '#FFB6C1'; // Pink pillow
        ctx.fillRect(x + 6, y + 8, 8, 6);
        break;
      case 'kitchen':
        ctx.fillStyle = '#2F4F4F'; // Dark slate gray
        ctx.fillRect(x + 2, y + 2, 28, 14);
        ctx.fillStyle = '#4169E1'; // Blue for appliances
        ctx.fillRect(x + 4, y + 4, 8, 10);
        ctx.fillStyle = '#C0C0C0'; // Silver for sink
        ctx.fillRect(x + 14, y + 4, 8, 10);
        break;
      case 'mailbox':
        ctx.fillStyle = '#4682B4'; // Steel blue
        ctx.fillRect(x + 8, y + 8, 16, 16);
        ctx.fillStyle = '#FFD700'; // Gold for handles
        ctx.fillRect(x + 12, y + 14, 8, 2);
        break;
      case 'vending':
        ctx.fillStyle = '#FF4500'; // Orange red
        ctx.fillRect(x + 4, y + 2, 24, 28);
        ctx.fillStyle = '#000000'; // Black for display
        ctx.fillRect(x + 6, y + 4, 20, 12);
        ctx.fillStyle = '#FFFFFF'; // White for buttons
        ctx.fillRect(x + 8, y + 18, 4, 4);
        ctx.fillRect(x + 14, y + 18, 4, 4);
        ctx.fillRect(x + 20, y + 18, 4, 4);
        break;
      case 'laundry':
        ctx.fillStyle = '#FFFFFF'; // White washers/dryers
        ctx.fillRect(x + 2, y + 4, 12, 24);
        ctx.fillRect(x + 18, y + 4, 12, 24);
        ctx.fillStyle = '#000000'; // Black for doors
        ctx.fillRect(x + 4, y + 6, 8, 8);
        ctx.fillRect(x + 20, y + 6, 8, 8);
        break;
      default:
        ctx.fillStyle = '#8B4513'; // Default brown furniture
        ctx.fillRect(x + 4, y + 4, 24, 24);
    }
  }

  protected renderWindowTile(ctx: CanvasRenderingContext2D, x: number, y: number): void {
    // Wall base
    this.renderWallTile(ctx, x, y);
    
    // Window
    ctx.fillStyle = '#87CEEB'; // Sky blue
    ctx.fillRect(x + 4, y + 4, 24, 24);
    
    // Window frame
    ctx.fillStyle = '#A0522D'; // Brown frame
    ctx.fillRect(x + 2, y + 2, 28, 4);
    ctx.fillRect(x + 2, y + 26, 28, 4);
    ctx.fillRect(x + 2, y + 2, 4, 28);
    ctx.fillRect(x + 26, y + 2, 4, 28);
    
    // Window cross
    ctx.fillRect(x + 14, y + 4, 4, 24);
    ctx.fillRect(x + 4, y + 14, 24, 4);
  }

  protected renderLobbyTile(ctx: CanvasRenderingContext2D, x: number, y: number): void {
    // Fancy lobby flooring
    ctx.fillStyle = '#F5F5DC'; // Beige
    ctx.fillRect(x, y, this.tileSize, this.tileSize);
    
    // Marble pattern
    ctx.fillStyle = '#DDBEA9';
    ctx.fillRect(x + 2, y + 2, this.tileSize - 4, this.tileSize - 4);
    
    // Decorative border
    ctx.fillStyle = '#CD853F';
    ctx.fillRect(x, y, this.tileSize, 2);
    ctx.fillRect(x, y + this.tileSize - 2, this.tileSize, 2);
    ctx.fillRect(x, y, 2, this.tileSize);
    ctx.fillRect(x + this.tileSize - 2, y, 2, this.tileSize);
  }

  protected renderMailroomTile(ctx: CanvasRenderingContext2D, x: number, y: number): void {
    // Floor base
    this.renderFloorTile(ctx, x, y);
    
    // Mailroom equipment
    ctx.fillStyle = '#4682B4'; // Steel blue
    ctx.fillRect(x + 4, y + 4, 24, 24);
    
    // Mail slots
    ctx.fillStyle = '#000000';
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        ctx.fillRect(x + 6 + j * 6, y + 6 + i * 6, 4, 4);
      }
    }
  }

  protected renderElevatorTile(ctx: CanvasRenderingContext2D, x: number, y: number): void {
    // Floor base
    this.renderFloorTile(ctx, x, y);
    
    // Elevator doors
    ctx.fillStyle = '#C0C0C0'; // Silver
    ctx.fillRect(x + 6, y + 4, 10, 24);
    ctx.fillRect(x + 16, y + 4, 10, 24);
    
    // Elevator buttons
    ctx.fillStyle = '#FFD700'; // Gold
    ctx.fillRect(x + 28, y + 12, 2, 2);
    ctx.fillRect(x + 28, y + 16, 2, 2);
  }

  protected renderStairsTile(ctx: CanvasRenderingContext2D, x: number, y: number): void {
    // Floor base
    this.renderFloorTile(ctx, x, y);
    
    // Stairs
    ctx.fillStyle = '#808080'; // Gray
    for (let i = 0; i < 4; i++) {
      ctx.fillRect(x + 2, y + 4 + i * 6, 28 - i * 6, 4);
    }
    
    // Handrail
    ctx.fillStyle = '#8B4513'; // Brown
    ctx.fillRect(x + 2, y + 4, 2, 24);
  }

  public getExitPosition(): { x: number, y: number, scene: SceneType } {
    return { x: this.exitX, y: this.exitY, scene: 'campus' };
  }

  public getEntrancePosition(): { x: number, y: number } {
    return { x: this.exitX, y: this.exitY - 50 }; // Enter slightly above exit
  }
}

export default BaseOffCampusBuilding;
