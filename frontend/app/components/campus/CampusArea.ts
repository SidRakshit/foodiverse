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
    
    // Turner Place
    this.createBuilding(world, 3, 2, 5, 4, 'turner');
    
    // Torgersen Hall (Computer Science) - Large Gothic Revival building with bridge
    this.createTorgersenHall(world, 16, 1, 8, 5);
    
    // Prichard Hall (Dining)
    this.createBuilding(world, 1, 13, 6, 4, 'owens');
    
    // Cassell Coliseum
    this.createBuilding(world, 18, 12, 6, 5, 'cassell');
    
    // Create the Drillfield (huge oval-shaped grass area in center of campus)
    this.createDrillfield(world, 7, 7, 11, 8);
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
            // Upper central building (shorter than towers) - no middle door
            if (by >= y + 1 && by <= y + height - 2) {
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
    // Create an oval/elliptical shape for the Drillfield
    const centerX = x + width / 2;
    const centerY = y + height / 2;
    const radiusX = (width / 2) - 0.2; // Slightly reduce horizontal radius to make left edge cleaner
    const radiusY = height / 2;
    
    for (let dy = y; dy < y + height && dy < this.areaHeight; dy++) {
      for (let dx = x; dx < x + width && dx < this.areaWidth; dx++) {
        // Calculate distance from center using ellipse formula
        const distanceFromCenterX = (dx - centerX) / radiusX;
        const distanceFromCenterY = (dy - centerY) / radiusY;
        const ellipseDistance = (distanceFromCenterX * distanceFromCenterX) + (distanceFromCenterY * distanceFromCenterY);
        
        // If point is within the ellipse (distance <= 1), make it drillfield
        if (ellipseDistance <= 1.0) {
          world[dy][dx] = { type: 'grass', solid: false, buildingType: 'drillfield' };
        }
      }
    }
  }

  private generateCampusPaths(world: any[][]): void {
    // Create road network connecting buildings: Turner → Burruss → Torgersen → Cassell → Prichard → Turner
    this.createCampusRoads(world);
  }

  private createCampusRoads(world: any[][]): void {
    // Road 1: Turner → Burruss (horizontal path north of drillfield)
    this.createRoad(world, 8, 6, 15, 6); // from Turner exit to Burruss entrance
    
    // Road 2: Burruss → Torgersen (horizontal path north of drillfield)  
    this.createRoad(world, 15, 6, 20, 6); // from Burruss to Torgersen
    
    // Road 3: Torgersen → Cassell (vertical path east of drillfield, then horizontal)
    this.createRoad(world, 20, 6, 20, 11); // vertical down from Torgersen
    this.createRoad(world, 20, 11, 21, 11); // horizontal to Cassell entrance
    
    // Road 4: Cassell → Prichard (horizontal path south of drillfield)
    this.createRoad(world, 17, 13, 7, 13); // from Cassell to Prichard area
    
    // Road 5: Prichard → Turner (vertical path west of drillfield)
    this.createRoad(world, 6, 13, 6, 6); // vertical up from Prichard to Turner level
    this.createRoad(world, 6, 6, 8, 6); // horizontal to connect back to Turner
  }

  private createRoad(world: any[][], startX: number, startY: number, endX: number, endY: number): void {
    // Create a straight line road between two points (1 pixel width)
    if (startX === endX) {
      // Vertical road
      const minY = Math.min(startY, endY);
      const maxY = Math.max(startY, endY);
      for (let y = minY; y <= maxY; y++) {
        if (startX >= 0 && startX < this.areaWidth && y >= 0 && y < this.areaHeight) {
          // Only place road if it's on grass and not on drillfield or buildings
          if (world[y][startX].type === 'grass' && world[y][startX].buildingType !== 'drillfield') {
            world[y][startX] = { type: 'road', solid: false };
          }
        }
      }
    } else {
      // Horizontal road
      const minX = Math.min(startX, endX);
      const maxX = Math.max(startX, endX);
      for (let x = minX; x <= maxX; x++) {
        if (x >= 0 && x < this.areaWidth && startY >= 0 && startY < this.areaHeight) {
          // Only place road if it's on grass and not on drillfield or buildings
          if (world[startY][x].type === 'grass' && world[startY][x].buildingType !== 'drillfield') {
            world[startY][x] = { type: 'road', solid: false };
          }
        }
      }
    }
  }

  private createPathToDoor(world: any[][], startX: number, startY: number, direction: 'horizontal' | 'vertical'): void {
    if (direction === 'horizontal') {
      for (let x = startX; x < startX + 3; x++) {
        if (x < this.areaWidth && world[startY][x].type === 'grass' && world[startY][x].buildingType !== 'drillfield') {
          world[startY][x] = { type: 'path', solid: false };
        }
      }
    } else {
      for (let y = startY; y < startY + 3; y++) {
        if (y < this.areaHeight && world[y][startX].type === 'grass' && world[y][startX].buildingType !== 'drillfield') {
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
    
    // Add campus fountain (avoid drillfield)
    if (world[11][10].type === 'grass' && world[11][10].buildingType !== 'drillfield') {
      world[11][10] = { type: 'fountain', solid: true };
    }
    
    // No parking area - keep campus clean
    
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
          world[tileY][tileX].type === 'grass' && world[tileY][tileX].buildingType !== 'drillfield') {
        world[tileY][tileX] = { type: 'tree', solid: true };
      }
    }
  }

  private addBench(world: any[][], x: number, y: number): void {
    if (x >= 0 && x < this.areaWidth && y >= 0 && y < this.areaHeight &&
        world[y][x].type === 'grass' && world[y][x].buildingType !== 'drillfield') {
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
    // Add flowers around the perimeter of buildings (avoid drillfield)
    for (let fx = x - 1; fx <= x + width; fx++) {
      for (let fy = y - 1; fy <= y + height; fy++) {
        if (fx >= 0 && fx < this.areaWidth && fy >= 0 && fy < this.areaHeight &&
            world[fy][fx].type === 'grass' && world[fy][fx].buildingType !== 'drillfield' && Math.random() < 0.3) {
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
    
    // Building name signs
    this.renderBuildingSigns(ctx);
  }

  // Override tile rendering for campus-specific styling
  protected renderTile(ctx: CanvasRenderingContext2D, tile: any, x: number, y: number): void {
    // Special rendering for drillfield
    if (tile.type === 'grass' && tile.buildingType === 'drillfield') {
      this.renderDrillfieldTile(ctx, x, y);
      return;
    }
    
    // Special rendering for campus roads
    if (tile.type === 'road') {
      this.renderCampusRoadTile(ctx, x, y);
      return;
    }
    
    // Default tile rendering
    super.renderTile(ctx, tile, x, y);
  }

  protected renderBuildingTile(ctx: CanvasRenderingContext2D, tile: any, x: number, y: number): void {
    // All campus buildings use uniform color
    const buildingType = tile.buildingType;
    
    // Uniform campus building color
    let baseColor = '#75787b';
    let accentColor = '#8B0000';
    
    // All building types use the same colors - no accent colors
    baseColor = '#75787b';
    accentColor = '#85888b'; // Use texture color instead of colored accents
    
    // Specialized rendering for different building types
    if (buildingType === 'torgersen') {
      this.renderTorgersenTile(ctx, x, y, baseColor, accentColor);
    } else if (buildingType === 'burruss') {
      this.renderBurrussTile(ctx, tile, x, y, baseColor, accentColor);
    } else {
      // Main building structure for other buildings
      ctx.fillStyle = baseColor;
      ctx.fillRect(x, y, this.tileSize, this.tileSize);
      
      // Stone texture pattern (like Torgersen)
      ctx.fillStyle = accentColor; // Use texture color instead of colored accent
      ctx.fillRect(x + 2, y + 2, this.tileSize - 4, this.tileSize - 4);
      
      // Stone texture lines
      ctx.fillStyle = '#65686b';
      ctx.fillRect(x, y + 8, this.tileSize, 2);
      ctx.fillRect(x + 8, y, 2, this.tileSize);
      
      // Add minimal windows to other buildings
      this.renderMinimalWindow(ctx, x, y);
    }
  }

  private renderTorgersenTile(ctx: CanvasRenderingContext2D, x: number, y: number, baseColor: string, accentColor: string): void {
    // Main limestone structure
    ctx.fillStyle = baseColor;
    ctx.fillRect(x, y, this.tileSize, this.tileSize);
    
    // Gothic stone block pattern
    ctx.fillStyle = '#85888b'; // Lighter version of base color
    ctx.fillRect(x + 2, y + 2, this.tileSize - 4, this.tileSize - 4);
    
    // Stone block outlines (creating the ashlar masonry pattern)
    ctx.strokeStyle = '#65686b'; // Consistent mortar lines
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
    
    // Add minimal windows to Torgersen
    this.renderMinimalWindow(ctx, x, y);
    
    // Stone weathering and texture details
    ctx.fillStyle = '#85888b';
    ctx.fillRect(x + 1, y + 1, 2, this.tileSize - 2);
    ctx.fillRect(x + this.tileSize - 3, y + 1, 2, this.tileSize - 2);
    
    // Subtle shadow to give depth
    ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
    ctx.fillRect(x + this.tileSize - 2, y, 2, this.tileSize);
    ctx.fillRect(x, y + this.tileSize - 2, this.tileSize, 2);
  }

  private renderBurrussTile(ctx: CanvasRenderingContext2D, tile: any, x: number, y: number, baseColor: string, accentColor: string): void {
    const part = tile.part || 'center';
    
    // Use uniform campus building color
    ctx.fillStyle = baseColor;
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
    ctx.fillStyle = '#75787b'; // Uniform campus color
    ctx.fillRect(x, y, this.tileSize, this.tileSize);
    
    // Stone block pattern
    ctx.fillStyle = '#85888b'; // Lighter version of base color
    ctx.fillRect(x + 2, y + 2, this.tileSize - 4, this.tileSize - 4);
    
    // Add minimal windows to Burruss towers
    this.renderMinimalWindow(ctx, x, y);
    
    // Stone courses (horizontal lines)
    ctx.strokeStyle = '#65686b';
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
    ctx.fillStyle = '#75787b';
    ctx.fillRect(x, y, this.tileSize, this.tileSize);
    
    // Crenellation pattern (merlons and crenels)
    ctx.fillStyle = '#85888b';
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
    ctx.strokeStyle = '#65686b';
    ctx.lineWidth = 1;
    ctx.strokeRect(x, y, this.tileSize, this.tileSize);
  }

  private renderBurrussCenter(ctx: CanvasRenderingContext2D, x: number, y: number): void {
    // Central building connecting towers
    ctx.fillStyle = '#75787b';
    ctx.fillRect(x, y, this.tileSize, this.tileSize);
    
    // Central Gothic arch detail
    ctx.fillStyle = '#85888b';
    ctx.fillRect(x + 2, y + 2, this.tileSize - 4, this.tileSize - 4);
    
    // No Gothic details - keep building clean and simple
    
    // Decorative stonework
    ctx.strokeStyle = '#65686b';
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
    ctx.fillStyle = '#75787b';
    ctx.fillRect(x, y, this.tileSize, this.tileSize);
    
    ctx.fillStyle = '#85888b';
    ctx.fillRect(x + 1, y + 1, this.tileSize - 2, this.tileSize - 2);
    
    // Stone texture
    ctx.strokeStyle = '#65686b';
    ctx.lineWidth = 1;
    ctx.strokeRect(x, y, this.tileSize, this.tileSize);
  }

  private renderMinimalWindow(ctx: CanvasRenderingContext2D, x: number, y: number): void {
    // Only add windows occasionally to keep them minimal
    const shouldAddWindow = (Math.floor(x / this.tileSize) + Math.floor(y / this.tileSize)) % 3 === 0;
    
    if (shouldAddWindow) {
      // Simple rectangular window
      const windowWidth = 6;
      const windowHeight = 8;
      const windowX = x + (this.tileSize - windowWidth) / 2;
      const windowY = y + (this.tileSize - windowHeight) / 2;
      
      // Window frame (dark)
      ctx.fillStyle = '#2F2F2F';
      ctx.fillRect(windowX - 1, windowY - 1, windowWidth + 2, windowHeight + 2);
      
      // Window glass (light blue with subtle reflection)
      ctx.fillStyle = '#87CEEB';
      ctx.fillRect(windowX, windowY, windowWidth, windowHeight);
      
      // Window cross divider (minimal)
      ctx.fillStyle = '#2F2F2F';
      ctx.fillRect(windowX + windowWidth/2 - 0.5, windowY, 1, windowHeight);
      ctx.fillRect(windowX, windowY + windowHeight/2 - 0.5, windowWidth, 1);
      
      // Subtle glass reflection
      ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
      ctx.fillRect(windowX + 1, windowY + 1, 2, windowHeight - 2);
    }
  }

  private renderBuildingSigns(ctx: CanvasRenderingContext2D): void {
    // Reset shadow effects
    ctx.shadowBlur = 0;
    
    // Burruss Hall sign (building at x: 9-14, y: 1-6)
    const burrussX = 12 * this.tileSize; // Center of 6-tile wide building
    const burrussY = 1 * this.tileSize - 15; // Above the building
    
    // Burruss sign background
    ctx.fillStyle = '#8B0000'; // VT Maroon background
    ctx.fillRect(burrussX - 45 - this.cameraX, burrussY - this.cameraY, 90, 12);
    
    // Burruss text
    ctx.fillStyle = '#FF8C00'; // VT Orange text
    ctx.font = 'bold 9px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('BURRUSS HALL', burrussX - this.cameraX, burrussY + 8 - this.cameraY);
    
    // Turner Place sign (building at x: 3-7, y: 2-5)
    const turnerX = 5.5 * this.tileSize; // Center of 5-tile wide building
    const turnerY = 2 * this.tileSize - 15; // Above the building
    
    // Turner sign background
    ctx.fillStyle = '#2E4057'; // Academic blue background
    ctx.fillRect(turnerX - 35 - this.cameraX, turnerY - this.cameraY, 70, 12);
    
    // Turner text
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 9px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('TURNER PLACE', turnerX - this.cameraX, turnerY + 8 - this.cameraY);
    
    // Torgersen Hall sign (building at x: 16-23, y: 1-5)
    const torgersenX = 20 * this.tileSize; // Center of 8-tile wide building
    const torgersenY = 1 * this.tileSize - 15; // Above the building
    
    // Torgersen sign background
    ctx.fillStyle = '#4A5568'; // Engineering gray background
    ctx.fillRect(torgersenX - 50 - this.cameraX, torgersenY - this.cameraY, 100, 12);
    
    // Torgersen text
    ctx.fillStyle = '#FFD700'; // Gold text
    ctx.font = 'bold 9px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('TORGERSEN HALL', torgersenX - this.cameraX, torgersenY + 8 - this.cameraY);
    
    // Prichard Hall sign (building at x: 1-6, y: 13-16)
    const prichardX = 4 * this.tileSize; // Center of 6-tile wide building
    const prichardY = 13 * this.tileSize - 15; // Above the building
    
    // Prichard sign background
    ctx.fillStyle = '#D69E2E'; // Dining hall orange background
    ctx.fillRect(prichardX - 40 - this.cameraX, prichardY - this.cameraY, 80, 12);
    
    // Prichard text
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 9px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('PRICHARD HALL', prichardX - this.cameraX, prichardY + 8 - this.cameraY);
    
    // Cassell Coliseum sign (building at x: 18-23, y: 12-16)
    const cassellX = 21 * this.tileSize; // Center of 6-tile wide building
    const cassellY = 12 * this.tileSize - 15; // Above the building
    
    // Cassell sign background
    ctx.fillStyle = '#8B0000'; // VT Maroon background
    ctx.fillRect(cassellX - 50 - this.cameraX, cassellY - this.cameraY, 100, 12);
    
    // Cassell text
    ctx.fillStyle = '#FF8C00'; // VT Orange text
    ctx.font = 'bold 9px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('CASSELL COLISEUM', cassellX - this.cameraX, cassellY + 8 - this.cameraY);
    
    // Add glow effect for special buildings
    ctx.shadowColor = '#FF8C00';
    ctx.shadowBlur = 6;
    
    // Re-render Burruss and Cassell text with glow (iconic VT buildings)
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 9px sans-serif';
    ctx.fillText('BURRUSS HALL', burrussX - this.cameraX, burrussY + 8 - this.cameraY);
    ctx.fillText('CASSELL COLISEUM', cassellX - this.cameraX, cassellY + 8 - this.cameraY);
    
    // Reset shadow
    ctx.shadowBlur = 0;
  }

  private renderCampusRoadTile(ctx: CanvasRenderingContext2D, x: number, y: number): void {
    // Light yellow road surface (1 pixel wide appearance)
    ctx.fillStyle = '#FFFFE0'; // Light yellow color
    ctx.fillRect(x, y, this.tileSize, this.tileSize);
    
    // Add subtle texture to make it look like concrete/asphalt
    ctx.fillStyle = '#FFFACD'; // Slightly lighter yellow for texture
    ctx.fillRect(x + 2, y + 2, this.tileSize - 4, this.tileSize - 4);
    
    // Very subtle edges to define the road
    ctx.fillStyle = '#F0E68C'; // Slightly darker yellow edge
    ctx.fillRect(x, y, this.tileSize, 1); // Top edge
    ctx.fillRect(x, y + this.tileSize - 1, this.tileSize, 1); // Bottom edge
    ctx.fillRect(x, y, 1, this.tileSize); // Left edge
    ctx.fillRect(x + this.tileSize - 1, y, 1, this.tileSize); // Right edge
  }

  private renderDrillfieldTile(ctx: CanvasRenderingContext2D, x: number, y: number): void {
    // Base drillfield green - bright vibrant green for open field
    ctx.fillStyle = '#58b438'; // Bright vibrant green for well-maintained field
    ctx.fillRect(x, y, this.tileSize, this.tileSize);
    
    // Add subtle texture pattern to show it's maintained grass
    ctx.fillStyle = '#6bc248'; // Slightly lighter green for texture
    const pattern = (x + y) % 8;
    if (pattern < 2) {
      ctx.fillRect(x + 2, y + 2, this.tileSize - 4, this.tileSize - 4);
    }
    
    // Add some subtle grass blade details
    ctx.fillStyle = '#7ed058';
    for (let i = 0; i < 3; i++) {
      const grassX = x + (i * 10) + 3;
      const grassY = y + ((x + y + i) % 8) + 8;
      ctx.fillRect(grassX, grassY, 1, 3);
    }
    
    // Very subtle grid pattern to show it's a formal field
    if ((Math.floor(x / this.tileSize) + Math.floor(y / this.tileSize)) % 4 === 0) {
      ctx.fillStyle = '#4a9c30';
      ctx.fillRect(x, y, this.tileSize, 1); // Horizontal line
      ctx.fillRect(x, y, 1, this.tileSize); // Vertical line
    }
  }
}

export default CampusArea;

