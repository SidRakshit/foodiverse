import BaseArea from '../BaseArea';
import { SceneType } from '../types';

interface CampusTile {
  type: 'grass' | 'stone' | 'water' | 'tree' | 'sand' | 'flower' | 'building' | 'path' | 'bench' | 'fountain' | 'parking' | 'door';
  solid: boolean;
  sprite?: number[][];
  buildingType?: 'newman' | 'burruss' | 'owens' | 'squires' | 'torgersen' | 'war_memorial' | 'drillfield' | 'cassell' | 'lane_stadium';
}

class CampusArea extends BaseArea {
  public type: SceneType = 'campus';

  protected getAreaName(): string {
    return 'Virginia Tech Campus';
  }

  protected generateArea(): CampusTile[][] {
    const area: CampusTile[][] = [];
    
    // Initialize with grass
    for (let y = 0; y < this.areaHeight; y++) {
      area[y] = [];
      for (let x = 0; x < this.areaWidth; x++) {
        area[y][x] = { type: 'grass', solid: false };
      }
    }

    // Create campus layout - this represents the BOTTOM HALF of the world
    this.generateCampusBuildings(area);
    this.generateCampusPaths(area);
    this.generateCampusFeatures(area);

    return area;
  }

  private generateCampusBuildings(world: CampusTile[][]): void {
    // Burruss Hall (iconic admin building with clock tower)
    this.createBuilding(world, 10, 2, 5, 4, 'burruss');
    
    // Newman Library
    this.createBuilding(world, 3, 2, 5, 4, 'newman');
    
    // Torgersen Hall (Engineering)
    this.createBuilding(world, 16, 2, 6, 4, 'torgersen');
    
    // War Memorial Chapel
    this.createBuilding(world, 5, 8, 3, 3, 'war_memorial');
    
    // Squires Student Center
    this.createBuilding(world, 12, 8, 5, 4, 'squires');
    
    // Owens Hall (Dining)
    this.createBuilding(world, 1, 13, 6, 4, 'owens');
    
    // Cassell Coliseum
    this.createBuilding(world, 18, 12, 6, 5, 'cassell');
    
    // Create the Drillfield (large open grass area)
    this.createDrillfield(world, 8, 14, 8, 4);
  }

  private createBuilding(world: CampusTile[][], x: number, y: number, width: number, height: number, buildingType: CampusTile['buildingType']): void {
    for (let by = y; by < y + height; by++) {
      for (let bx = x; bx < x + width; bx++) {
        if (bx < this.areaWidth && by < this.areaHeight) {
          // Create doors on the front of buildings
          if (by === y + height - 1 && bx === x + Math.floor(width / 2)) {
            world[by][bx] = { type: 'door', solid: false, buildingType };
          } else {
            world[by][bx] = { type: 'building', solid: true, buildingType };
          }
        }
      }
    }
  }

  private createDrillfield(world: CampusTile[][], x: number, y: number, width: number, height: number): void {
    for (let dy = y; dy < y + height && dy < this.areaHeight; dy++) {
      for (let dx = x; dx < x + width && dx < this.areaWidth; dx++) {
        world[dy][dx] = { type: 'grass', solid: false, buildingType: 'drillfield' };
      }
    }
  }

  private generateCampusPaths(world: CampusTile[][]): void {
    // Main campus walkway (horizontal)
    for (let x = 0; x < this.areaWidth; x++) {
      if (world[9][x].type === 'grass') {
        world[9][x] = { type: 'path', solid: false };
      }
    }
    
    // Vertical paths connecting buildings
    for (let y = 0; y < this.areaHeight; y++) {
      // Path near library
      if (world[y][5] && world[y][5].type === 'grass') {
        world[y][5] = { type: 'path', solid: false };
      }
      // Path in center
      if (world[y][12] && world[y][12].type === 'grass') {
        world[y][12] = { type: 'path', solid: false };
      }
      // Path on right side
      if (world[y][19] && world[y][19].type === 'grass') {
        world[y][19] = { type: 'path', solid: false };
      }
    }

    // Connecting paths to buildings
    this.createPathToDoor(world, 5, 6, 'horizontal'); // To library
    this.createPathToDoor(world, 11, 5, 'horizontal'); // To admin
    this.createPathToDoor(world, 14, 9, 'vertical'); // To classroom
    this.createPathToDoor(world, 19, 9, 'vertical'); // To classroom
  }

  private createPathToDoor(world: CampusTile[][], startX: number, startY: number, direction: 'horizontal' | 'vertical'): void {
    if (direction === 'horizontal') {
      for (let x = startX; x < startX + 3; x++) {
        if (x < this.areaWidth && world[startY][x].type === 'grass') {
          world[startY][x] = { type: 'path', solid: false };
        }
      }
    } else {
      for (let y = startY; y < startY + 3; y++) {
        if (y < this.areaHeight && world[y][startX].type === 'grass') {
          world[y][startX] = { type: 'path', solid: false };
        }
      }
    }
  }

  private generateCampusFeatures(world: CampusTile[][]): void {
    // Add trees around campus
    this.addTrees(world, 10, 12, 2); // Near center
    this.addTrees(world, 1, 15, 3); // Near cafeteria
    this.addTrees(world, 22, 8, 2); // Right side
    
    // Add benches along paths
    this.addBench(world, 6, 9);
    this.addBench(world, 13, 9);
    this.addBench(world, 18, 9);
    
    // Add campus fountain
    if (world[11][10].type === 'grass') {
      world[11][10] = { type: 'fountain', solid: true };
    }
    
    // Add parking area
    this.createParkingLot(world, 1, 1, 3, 2);
    
    // Add flowers around buildings
    this.addFlowersAroundBuilding(world, 3, 2, 5, 4); // Around library
    this.addFlowersAroundBuilding(world, 9, 2, 4, 3); // Around admin
  }

  private addTrees(world: CampusTile[][], centerX: number, centerY: number, count: number): void {
    for (let i = 0; i < count; i++) {
      const x = centerX + (Math.random() - 0.5) * 4;
      const y = centerY + (Math.random() - 0.5) * 4;
      const tileX = Math.floor(x);
      const tileY = Math.floor(y);
      
      if (tileX >= 0 && tileX < this.areaWidth && tileY >= 0 && tileY < this.areaHeight &&
          world[tileY][tileX].type === 'grass') {
        world[tileY][tileX] = { type: 'tree', solid: true };
      }
    }
  }

  private addBench(world: CampusTile[][], x: number, y: number): void {
    if (x >= 0 && x < this.areaWidth && y >= 0 && y < this.areaHeight &&
        world[y][x].type === 'grass') {
      world[y][x] = { type: 'bench', solid: true };
    }
  }

  private createParkingLot(world: CampusTile[][], x: number, y: number, width: number, height: number): void {
    for (let py = y; py < y + height; py++) {
      for (let px = x; px < x + width; px++) {
        if (px < this.areaWidth && py < this.areaHeight && world[py][px].type === 'grass') {
          world[py][px] = { type: 'parking', solid: false };
        }
      }
    }
  }

  private addFlowersAroundBuilding(world: CampusTile[][], x: number, y: number, width: number, height: number): void {
    // Add flowers around the perimeter of buildings
    for (let fx = x - 1; fx <= x + width; fx++) {
      for (let fy = y - 1; fy <= y + height; fy++) {
        if (fx >= 0 && fx < this.areaWidth && fy >= 0 && fy < this.areaHeight &&
            world[fy][fx].type === 'grass' && Math.random() < 0.3) {
          world[fy][fx] = { type: 'flower', solid: false };
        }
      }
    }
  }

  protected renderBackground(ctx: CanvasRenderingContext2D): void {
    // Campus outdoor background
    ctx.fillStyle = '#2a4d3a'; // Dark green campus background
    ctx.fillRect(0, 0, 800, 600);
  }

  protected renderAreaSpecificElements(ctx: CanvasRenderingContext2D): void {
    // Campus-specific UI elements
    ctx.fillStyle = '#8B0000';
    ctx.font = 'bold 14px serif';
    ctx.textAlign = 'left';
    ctx.fillText('🏛️ VIRGINIA TECH CAMPUS', 10 - this.cameraX, 30 - this.cameraY);
    
    // Add VT spirit elements
    ctx.fillStyle = '#FF8C00';
    ctx.font = '12px serif';
    ctx.fillText('HOKIES!', 10 - this.cameraX, 50 - this.cameraY);
  }

  // Override tile rendering for campus-specific styling
  protected renderBuildingTile(ctx: CanvasRenderingContext2D, tile: any, x: number, y: number): void {
    // Virginia Tech's signature Hokie Stone buildings
    const buildingType = tile.buildingType;
    
    // Base Hokie Stone color
    let baseColor = '#C4A484';
    let accentColor = '#8B0000';
    
    // Different building types
    switch (buildingType) {
      case 'burruss':
        baseColor = '#D4B896';
        accentColor = '#8B0000';
        break;
      case 'newman':
        baseColor = '#C4A484';
        accentColor = '#FF8C00';
        break;
      case 'torgersen':
        baseColor = '#B8A082';
        accentColor = '#4A4A4A';
        break;
      default:
        baseColor = '#C4A484';
        accentColor = '#8B0000';
    }
    
    // Main building structure
    ctx.fillStyle = baseColor;
    ctx.fillRect(x, y, this.tileSize, this.tileSize);
    
    // Stone texture
    ctx.fillStyle = '#9A8870';
    ctx.fillRect(x, y + 8, this.tileSize, 2);
    ctx.fillRect(x + 8, y, 2, this.tileSize);
    
    // VT color accents
    ctx.fillStyle = accentColor;
    ctx.fillRect(x + 1, y + 1, this.tileSize - 2, 3);
  }
}

export default CampusArea;

