import Player from './Player';
import { Scene, SceneType } from './types';
import CampusArea from './campus/CampusArea';
import OffCampusArea from './off-campus/OffCampusArea';

class World implements Scene {
  public type: SceneType = 'campus';
  private tileSize: number = 32;
  private areaWidth: number = 25; // tiles (800px)
  private areaHeight: number = 19; // tiles (608px)
  private totalWorldHeight: number = 38; // 2 areas stacked (1216px total)
  
  private campusArea: CampusArea;
  private offCampusArea: OffCampusArea;
  public cameraX: number = 0;
  public cameraY: number = 0;

  constructor() {
    this.campusArea = new CampusArea();
    this.offCampusArea = new OffCampusArea();
  }

  public canMoveTo(x: number, y: number, width: number, height: number): boolean {
    // Calculate which area the player is in based on Y position
    const areaHeightPixels = this.areaHeight * this.tileSize; // 608px
    
    if (y < areaHeightPixels) {
      // Top area - off-campus
      return this.offCampusArea.canMoveTo(x, y, width, height);
    } else {
      // Bottom area - campus (adjust Y coordinate to be relative to campus area)
      const campusY = y - areaHeightPixels;
      return this.campusArea.canMoveTo(x, campusY, width, height);
    }
  }

  public update(deltaTime: number): void {
    this.campusArea.update(deltaTime);
    this.offCampusArea.update(deltaTime);
  }

  public render(ctx: CanvasRenderingContext2D, player: Player): void {
    // Update camera to follow player
    this.updateCamera(player);

    // Clear canvas
    ctx.fillStyle = '#2a4d3a';
    ctx.fillRect(0, 0, 800, 600);

    // Calculate which areas are visible based on camera position
    const areaHeightPixels = this.areaHeight * this.tileSize; // 608px
    const cameraTop = this.cameraY;
    const cameraBottom = this.cameraY + 600;

    // Render off-campus area (top) if visible
    if (cameraTop < areaHeightPixels) {
      ctx.save();
      // Translate to show off-campus area
      ctx.translate(-this.cameraX, -cameraTop);
      
      // Create a temporary player position for off-campus rendering
      const tempPlayer = { ...player };
      this.offCampusArea.render(ctx, tempPlayer);
      ctx.restore();
    }

    // Render campus area (bottom) if visible
    if (cameraBottom > areaHeightPixels) {
      ctx.save();
      // Translate to show campus area
      ctx.translate(-this.cameraX, areaHeightPixels - cameraTop);
      
      // Create a temporary player position for campus rendering (adjust Y)
      const tempPlayer = { ...player, y: player.y - areaHeightPixels };
      this.campusArea.render(ctx, tempPlayer);
      ctx.restore();
    }

    // Render boundary line between areas
    if (cameraTop < areaHeightPixels && cameraBottom > areaHeightPixels) {
      const boundaryY = areaHeightPixels - cameraTop;
      
      // Golden transition line
      ctx.fillStyle = '#FFD700';
      ctx.fillRect(0, boundaryY - 2, 800, 4);
      
      // Area labels
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 16px sans-serif';
      ctx.textAlign = 'center';
      ctx.shadowColor = 'rgba(0,0,0,0.8)';
      ctx.shadowOffsetX = 2;
      ctx.shadowOffsetY = 2;
      
      if (boundaryY > 30) {
        ctx.fillText('🏙️ DOWNTOWN BLACKSBURG', 400, boundaryY - 15);
      }
      if (boundaryY < 570) {
        ctx.fillText('🏛️ VIRGINIA TECH CAMPUS', 400, boundaryY + 25);
      }
      
      ctx.shadowColor = 'transparent';
    }
  }

  private updateCamera(player: Player): void {
    // Camera follows player through the entire world
    const targetCameraX = player.x - 400 + player.width / 2;
    const targetCameraY = player.y - 300 + player.height / 2;

    // World bounds
    const maxCameraX = this.areaWidth * this.tileSize - 800; // 800 - 800 = 0 (no horizontal scrolling for single screen width)
    const maxCameraY = (this.totalWorldHeight * this.tileSize) - 600; // Total world height minus screen height

    this.cameraX = Math.max(0, Math.min(maxCameraX, targetCameraX));
    this.cameraY = Math.max(0, Math.min(maxCameraY, targetCameraY));
  }

  // Method to get tile information for scene transitions
  public getTileAt(tileX: number, tileY: number): any | null {
    const areaHeightTiles = this.areaHeight; // 19 tiles
    
    if (tileY < areaHeightTiles) {
      // Off-campus area
      return this.offCampusArea.getTileAt(tileX, tileY);
    } else {
      // Campus area (adjust tile Y)
      const campusTileY = tileY - areaHeightTiles;
      return this.campusArea.getTileAt(tileX, campusTileY);
    }
  }

  public getEntrancePosition(): { x: number, y: number } {
    // Start in campus area (bottom half)
    const areaHeightPixels = this.areaHeight * this.tileSize;
    return { x: 400, y: areaHeightPixels + 300 }; // Middle of campus area
  }
}

export default World;