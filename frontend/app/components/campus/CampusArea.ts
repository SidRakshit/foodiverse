import BaseArea from '../BaseArea';
import { SceneType } from '../types';

class CampusArea extends BaseArea {
  public type: SceneType = 'campus';

  protected getAreaName(): string {
    return 'Virginia Tech Campus';
  }

  protected generateArea(): any[][] {
    const area: any[][] = [];
    
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

  private generateCampusBuildings(world: any[][]): void {
    // Burruss Hall (iconic admin building with twin towers)
    this.createBurrussHall(world, 9, 1, 6, 6);
    
    // Turner Library
    this.createBuilding(world, 3, 2, 5, 4, 'turner');
    
    // Torgersen Hall (Engineering) - Large Gothic Revival building with bridge
    this.createTorgersenHall(world, 16, 1, 8, 5);
    
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

  private createBuilding(world: any[][], x: number, y: number, width: number, height: number, buildingType: string): void {
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

  private createBurrussHall(world: any[][], x: number, y: number, width: number, height: number): void {
    // Create Burruss Hall with twin towers and Gothic Revival architecture
    
    for (let by = y; by < y + height; by++) {
      for (let bx = x; bx < x + width; bx++) {
        if (bx < this.areaWidth && by < this.areaHeight) {
          // Left tower (2 tiles wide, full height + 1 extra for tower top)
          if (bx >= x && bx <= x + 1) {
            if (by === y + height - 1 && bx === x) {
              // Side entrance to left tower
              world[by][bx] = { type: 'door', solid: false, buildingType: 'burruss' };
            } else {
              world[by][bx] = { type: 'building', solid: true, buildingType: 'burruss', part: 'left_tower' };
            }
          }
          // Right tower (2 tiles wide, full height + 1 extra for tower top)
          else if (bx >= x + width - 2 && bx <= x + width - 1) {
            if (by === y + height - 1 && bx === x + width - 1) {
              // Side entrance to right tower
              world[by][bx] = { type: 'door', solid: false, buildingType: 'burruss' };
            } else {
              world[by][bx] = { type: 'building', solid: true, buildingType: 'burruss', part: 'right_tower' };
            }
          }
          // Central building connecting the towers
          else if (bx >= x + 2 && bx <= x + width - 3) {
            // Main entrance in center of building
            if (by === y + height - 1 && bx === x + Math.floor(width / 2)) {
              world[by][bx] = { type: 'door', solid: false, buildingType: 'burruss' };
            }
            // Upper central building (shorter than towers)
            else if (by >= y + 1 && by <= y + height - 2) {
              world[by][bx] = { type: 'building', solid: true, buildingType: 'burruss', part: 'center' };
            }
            // Open courtyard area at ground level between towers
            else {
              world[by][bx] = { type: 'grass', solid: false };
            }
          }
        }
      }
    }

    // Add tower tops (crenellations) - extend towers one tile higher
    if (y > 0) {
      // Left tower top
      if (x < this.areaWidth && y - 1 < this.areaHeight) {
        world[y - 1][x] = { type: 'building', solid: true, buildingType: 'burruss', part: 'left_tower_top' };
      }
      if (x + 1 < this.areaWidth && y - 1 < this.areaHeight) {
        world[y - 1][x + 1] = { type: 'building', solid: true, buildingType: 'burruss', part: 'left_tower_top' };
      }
      
      // Right tower top
      if (x + width - 2 < this.areaWidth && y - 1 < this.areaHeight) {
        world[y - 1][x + width - 2] = { type: 'building', solid: true, buildingType: 'burruss', part: 'right_tower_top' };
      }
      if (x + width - 1 < this.areaWidth && y - 1 < this.areaHeight) {
        world[y - 1][x + width - 1] = { type: 'building', solid: true, buildingType: 'burruss', part: 'right_tower_top' };
      }
    }
  }

  private createTorgersenHall(world: any[][], x: number, y: number, width: number, height: number): void {
    // Create the main Gothic Revival structure with distinctive features
    // Left wing: 3 tiles wide, 5 tiles tall
    // Right wing: 3 tiles wide, 5 tiles tall
    // Bridge: connects the wings at the top
    
    for (let by = y; by < y + height; by++) {
      for (let bx = x; bx < x + width; bx++) {
        if (bx < this.areaWidth && by < this.areaHeight) {
          // Left wing of the building (3x5)
          if (bx >= x && bx <= x + 2 && by >= y && by <= y + height - 1) {
            if (by === y + height - 1 && bx === x + 1) {
              world[by][bx] = { type: 'door', solid: false, buildingType: 'torgersen' };
            } else {
              world[by][bx] = { type: 'building', solid: true, buildingType: 'torgersen' };
            }
          }
          // Right wing of the building (3x5)
          else if (bx >= x + width - 3 && bx <= x + width - 1 && by >= y && by <= y + height - 1) {
            if (by === y + height - 1 && bx === x + width - 2) {
              world[by][bx] = { type: 'door', solid: false, buildingType: 'torgersen' };
            } else {
              world[by][bx] = { type: 'building', solid: true, buildingType: 'torgersen' };
            }
          }
          // Bridge connection (arched walkway between wings) - 6 tiles wide, 2 tiles tall (twice as long)
          else if (by >= y + 1 && by <= y + 2 && bx >= x + 1 && bx <= x + 6) {
            world[by][bx] = { type: 'building', solid: true, buildingType: 'torgersen' };
          }
          // Central courtyard area under the bridge and open spaces
          else if (by >= y + 3 && by <= y + height - 1 && bx >= x + 3 && bx <= x + width - 4) {
            world[by][bx] = { type: 'grass', solid: false };
          }
          // Open area above bridge (1st row between wings)
          else if (by === y && bx >= x + 3 && bx <= x + width - 4) {
            world[by][bx] = { type: 'grass', solid: false };
          }
          // Main entrance under the bridge
          else if (by === y + height - 1 && bx === x + Math.floor(width / 2)) {
            world[by][bx] = { type: 'door', solid: false, buildingType: 'torgersen' };
          }
        }
      }
    }
  }

  private createDrillfield(world: any[][], x: number, y: number, width: number, height: number): void {
    for (let dy = y; dy < y + height && dy < this.areaHeight; dy++) {
      for (let dx = x; dx < x + width && dx < this.areaWidth; dx++) {
        world[dy][dx] = { type: 'grass', solid: false, buildingType: 'drillfield' };
      }
    }
  }

  private generateCampusPaths(world: any[][]): void {
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
    this.createPathToDoor(world, 11, 6, 'horizontal'); // To Burruss Hall
    this.createPathToDoor(world, 14, 9, 'vertical'); // To classroom
    this.createPathToDoor(world, 19, 9, 'vertical'); // To classroom
  }

  private createPathToDoor(world: any[][], startX: number, startY: number, direction: 'horizontal' | 'vertical'): void {
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

  private generateCampusFeatures(world: any[][]): void {
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
    this.addFlowersAroundBuilding(world, 9, 1, 6, 6); // Around Burruss Hall
  }

  private addTrees(world: any[][], centerX: number, centerY: number, count: number): void {
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

  private addBench(world: any[][], x: number, y: number): void {
    if (x >= 0 && x < this.areaWidth && y >= 0 && y < this.areaHeight &&
        world[y][x].type === 'grass') {
      world[y][x] = { type: 'bench', solid: true };
    }
  }

  private createParkingLot(world: any[][], x: number, y: number, width: number, height: number): void {
    for (let py = y; py < y + height; py++) {
      for (let px = x; px < x + width; px++) {
        if (px < this.areaWidth && py < this.areaHeight && world[py][px].type === 'grass') {
          world[py][px] = { type: 'parking', solid: false };
        }
      }
    }
  }

  private addFlowersAroundBuilding(world: any[][], x: number, y: number, width: number, height: number): void {
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
      case 'turner':
        baseColor = '#C4A484';
        accentColor = '#FF8C00';
        break;
      case 'torgersen':
        baseColor = '#E8DCC6'; // Light limestone color matching the image
        accentColor = '#D4C4A8';
        break;
      default:
        baseColor = '#C4A484';
        accentColor = '#8B0000';
    }
    
    // Specialized rendering for different building types
    if (buildingType === 'torgersen') {
      this.renderTorgersenTile(ctx, x, y, baseColor, accentColor);
    } else if (buildingType === 'burruss') {
      this.renderBurrussTile(ctx, tile, x, y, baseColor, accentColor);
    } else {
      // Main building structure for other buildings
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

  private renderTorgersenTile(ctx: CanvasRenderingContext2D, x: number, y: number, baseColor: string, accentColor: string): void {
    // Main limestone structure
    ctx.fillStyle = baseColor;
    ctx.fillRect(x, y, this.tileSize, this.tileSize);
    
    // Gothic stone block pattern
    ctx.fillStyle = '#F5F0E8'; // Lighter limestone highlight
    ctx.fillRect(x + 2, y + 2, this.tileSize - 4, this.tileSize - 4);
    
    // Stone block outlines (creating the ashlar masonry pattern)
    ctx.strokeStyle = '#C8B99C'; // Darker mortar lines
    ctx.lineWidth = 1;
    ctx.strokeRect(x, y, this.tileSize, this.tileSize);
    
    // Horizontal mortar lines to simulate stone courses
    ctx.beginPath();
    ctx.moveTo(x, y + this.tileSize / 2);
    ctx.lineTo(x + this.tileSize, y + this.tileSize / 2);
    ctx.stroke();
    
    // Vertical joints (offset pattern)
    const offset = Math.floor((x + y) / this.tileSize) % 2;
    ctx.beginPath();
    ctx.moveTo(x + this.tileSize / 2 + (offset * this.tileSize / 4), y);
    ctx.lineTo(x + this.tileSize / 2 + (offset * this.tileSize / 4), y + this.tileSize);
    ctx.stroke();
    
    // Gothic architectural details - arched window patterns for some tiles
    if ((x + y) % (this.tileSize * 3) === 0) {
      // Create Gothic arch pattern
      ctx.fillStyle = '#4A4A4A';
      ctx.beginPath();
      ctx.arc(x + this.tileSize / 2, y + this.tileSize - 4, 6, Math.PI, 0);
      ctx.fill();
      
      // Window glass
      ctx.fillStyle = '#87CEEB';
      ctx.beginPath();
      ctx.arc(x + this.tileSize / 2, y + this.tileSize - 4, 4, Math.PI, 0);
      ctx.fill();
    }
    
    // Stone weathering and texture details
    ctx.fillStyle = '#DDD4C0';
    ctx.fillRect(x + 1, y + 1, 2, this.tileSize - 2);
    ctx.fillRect(x + this.tileSize - 3, y + 1, 2, this.tileSize - 2);
    
    // Subtle shadow to give depth
    ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
    ctx.fillRect(x + this.tileSize - 2, y, 2, this.tileSize);
    ctx.fillRect(x, y + this.tileSize - 2, this.tileSize, 2);
  }

  private renderBurrussTile(ctx: CanvasRenderingContext2D, tile: any, x: number, y: number, baseColor: string, accentColor: string): void {
    const part = tile.part || 'center';
    
    // Base limestone color for Burruss Hall
    ctx.fillStyle = '#E8DCC6'; // Light limestone like in the image
    ctx.fillRect(x, y, this.tileSize, this.tileSize);
    
    // Different rendering based on building part
    switch (part) {
      case 'left_tower':
      case 'right_tower':
        this.renderBurrussTower(ctx, x, y, part);
        break;
      case 'left_tower_top':
      case 'right_tower_top':
        this.renderBurrussTowerTop(ctx, x, y, part);
        break;
      case 'center':
        this.renderBurrussCenter(ctx, x, y);
        break;
      default:
        // Default building tile
        this.renderBurrussDefault(ctx, x, y);
        break;
    }
  }

  private renderBurrussTower(ctx: CanvasRenderingContext2D, x: number, y: number, part: string): void {
    // Tower base
    ctx.fillStyle = '#E8DCC6'; // Light limestone
    ctx.fillRect(x, y, this.tileSize, this.tileSize);
    
    // Stone block pattern
    ctx.fillStyle = '#F5F0E8'; // Lighter highlight
    ctx.fillRect(x + 2, y + 2, this.tileSize - 4, this.tileSize - 4);
    
    // Gothic arched windows
    if ((y % (this.tileSize * 2)) === 0) {
      ctx.fillStyle = '#2F2F2F'; // Dark window frame
      ctx.fillRect(x + 4, y + 6, this.tileSize - 8, this.tileSize - 8);
      
      // Window glass with Gothic arch
      ctx.fillStyle = '#4A90E2'; // Blue glass
      ctx.beginPath();
      ctx.arc(x + this.tileSize / 2, y + this.tileSize - 4, 4, Math.PI, 0);
      ctx.fill();
    }
    
    // Stone courses (horizontal lines)
    ctx.strokeStyle = '#D4C4A8';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(x, y + this.tileSize / 3);
    ctx.lineTo(x + this.tileSize, y + this.tileSize / 3);
    ctx.moveTo(x, y + (2 * this.tileSize) / 3);
    ctx.lineTo(x + this.tileSize, y + (2 * this.tileSize) / 3);
    ctx.stroke();
    
    // Vertical stone joints
    ctx.beginPath();
    ctx.moveTo(x + this.tileSize / 2, y);
    ctx.lineTo(x + this.tileSize / 2, y + this.tileSize);
    ctx.stroke();
    
    // Tower shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.15)';
    ctx.fillRect(x + this.tileSize - 3, y, 3, this.tileSize);
  }

  private renderBurrussTowerTop(ctx: CanvasRenderingContext2D, x: number, y: number, part: string): void {
    // Crenellated tower top (castle battlements)
    ctx.fillStyle = '#E8DCC6';
    ctx.fillRect(x, y, this.tileSize, this.tileSize);
    
    // Crenellation pattern (merlons and crenels)
    ctx.fillStyle = '#F5F0E8';
    const crenelWidth = this.tileSize / 4;
    for (let i = 0; i < 4; i++) {
      if (i % 2 === 0) { // Merlons (raised parts)
        ctx.fillRect(x + i * crenelWidth, y, crenelWidth, this.tileSize * 0.7);
      }
    }
    
    // Flag pole on one tower
    if (part === 'left_tower_top') {
      ctx.fillStyle = '#8B4513'; // Brown pole
      ctx.fillRect(x + this.tileSize / 2 - 1, y, 2, this.tileSize);
      
      // Virginia Tech flag
      ctx.fillStyle = '#630031'; // Maroon
      ctx.fillRect(x + this.tileSize / 2 + 1, y + 2, 6, 4);
      ctx.fillStyle = '#FF8C00'; // Orange
      ctx.fillRect(x + this.tileSize / 2 + 1, y + 6, 6, 2);
    }
    
    // Stone detail
    ctx.strokeStyle = '#D4C4A8';
    ctx.lineWidth = 1;
    ctx.strokeRect(x, y, this.tileSize, this.tileSize);
  }

  private renderBurrussCenter(ctx: CanvasRenderingContext2D, x: number, y: number): void {
    // Central building connecting towers
    ctx.fillStyle = '#E8DCC6';
    ctx.fillRect(x, y, this.tileSize, this.tileSize);
    
    // Central Gothic arch detail
    ctx.fillStyle = '#F5F0E8';
    ctx.fillRect(x + 2, y + 2, this.tileSize - 4, this.tileSize - 4);
    
    // Gothic arched detail
    ctx.fillStyle = '#2F2F2F';
    ctx.beginPath();
    ctx.arc(x + this.tileSize / 2, y + this.tileSize - 2, 6, Math.PI, 0);
    ctx.fill();
    
    // Window glass
    ctx.fillStyle = '#4A90E2';
    ctx.beginPath();
    ctx.arc(x + this.tileSize / 2, y + this.tileSize - 2, 4, Math.PI, 0);
    ctx.fill();
    
    // Decorative stonework
    ctx.strokeStyle = '#D4C4A8';
    ctx.lineWidth = 1;
    ctx.strokeRect(x, y, this.tileSize, this.tileSize);
    
    // Horizontal course lines
    ctx.beginPath();
    ctx.moveTo(x, y + this.tileSize / 2);
    ctx.lineTo(x + this.tileSize, y + this.tileSize / 2);
    ctx.stroke();
  }

  private renderBurrussDefault(ctx: CanvasRenderingContext2D, x: number, y: number): void {
    // Default Burruss stone pattern
    ctx.fillStyle = '#E8DCC6';
    ctx.fillRect(x, y, this.tileSize, this.tileSize);
    
    ctx.fillStyle = '#F5F0E8';
    ctx.fillRect(x + 1, y + 1, this.tileSize - 2, this.tileSize - 2);
    
    // Stone texture
    ctx.strokeStyle = '#D4C4A8';
    ctx.lineWidth = 1;
    ctx.strokeRect(x, y, this.tileSize, this.tileSize);
  }
}

export default CampusArea;

