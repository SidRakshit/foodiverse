import BaseArea from '../BaseArea';
import { SceneType } from '../types';

interface OffCampusTile {
  type: 'grass' | 'road' | 'sidewalk' | 'building' | 'parking' | 'tree' | 'house' | 'apartment' | 'restaurant' | 'shop' | 'door' | 'floor' | 'wall' | 'furniture' | 'window' | 'stairs' | 'elevator';
  solid: boolean;
  buildingType?: 'apartment' | 'restaurant' | 'shop' | 'bank' | 'gas_station' | 'hotel' | 'downtown' | 'tots' | 'hokiehouse' | 'centros' | 'edge';
  furniture?: 'desk' | 'chair' | 'bookshelf' | 'computer' | 'table' | 'couch' | 'plant' | 'car' | 'bench';
}

class NameBuildings extends BaseArea {
  public type: SceneType = 'campus'; // Still part of the main campus scene but different area

  protected getAreaName(): string {
    return 'Downtown Blacksburg';
  }

  protected generateArea(): OffCampusTile[][] {
    const area: OffCampusTile[][] = [];
    
    // Initialize with grass
    for (let y = 0; y < this.areaHeight; y++) {
      area[y] = [];
      for (let x = 0; x < this.areaWidth; x++) {
        area[y][x] = { type: 'grass', solid: false };
      }
    }

    // Create off-campus layout - this represents the TOP HALF of the world
    this.generateDowntownArea(area);
    this.generateResidentialArea(area);
    this.generateCommercialStrip(area);

    return area;
  }

  private generateDowntownArea(world: OffCampusTile[][]): void {
    // Main Street (horizontal road through downtown)
    for (let x = 0; x < this.areaWidth; x++) {
      world[9][x] = { type: 'road', solid: false };
      // Sidewalks on both sides
      if (world[8]) world[8][x] = { type: 'sidewalk', solid: false };
      if (world[10]) world[10][x] = { type: 'sidewalk', solid: false };
    }

    // Downtown buildings along Main Street
    this.createCommercialBuilding(world, 2, 6, 3, 2, 'tots'); // Tots Restaurant
    this.createCommercialBuilding(world, 6, 6, 2, 2, 'shop'); // Shop
    this.createCommercialBuilding(world, 9, 6, 3, 2, 'hokiehouse'); // Hokie House
    this.createCommercialBuilding(world, 13, 6, 2, 2, 'shop'); // Another shop
    this.createCommercialBuilding(world, 16, 6, 4, 2, 'hotel'); // Hotel

    // Buildings on south side of Main Street
    this.createCommercialBuilding(world, 3, 11, 2, 2, 'gas_station'); // Gas station
    this.createCommercialBuilding(world, 7, 11, 3, 2, 'centros'); // Centros Restaurant
    this.createCommercialBuilding(world, 12, 11, 4, 2, 'shop'); // Large shop
    this.createCommercialBuilding(world, 17, 11, 3, 2, 'restaurant'); // Restaurant
  }

  private generateResidentialArea(world: OffCampusTile[][]): void {
    // Residential street
    for (let x = 5; x < 20; x++) {
      world[4][x] = { type: 'road', solid: false };
      world[3][x] = { type: 'sidewalk', solid: false };
      world[5][x] = { type: 'sidewalk', solid: false };
    }

    // Student apartment complexes
    this.createApartmentBuilding(world, 1, 1, 3, 2, 'edge'); // The Edge (top left)
    this.createApartmentBuilding(world, 5, 1, 4, 2); // Apartment complex 2
    this.createApartmentBuilding(world, 11, 1, 3, 2); // Apartment complex 3
    this.createApartmentBuilding(world, 16, 1, 4, 2); // Apartment complex 4
    this.createApartmentBuilding(world, 21, 1, 3, 2); // Apartment complex 5
  }

  private generateCommercialStrip(world: OffCampusTile[][]): void {
    // Add parking lots
    this.createParkingArea(world, 1, 14, 5, 3);
    this.createParkingArea(world, 15, 14, 6, 3);

    // Add some trees and landscaping
    this.addTrees(world, 8, 16, 3);
    this.addTrees(world, 18, 2, 2);
  }

  private createCommercialBuilding(world: OffCampusTile[][], x: number, y: number, width: number, height: number, buildingType: OffCampusTile['buildingType']): void {
    for (let by = y; by < y + height; by++) {
      for (let bx = x; bx < x + width; bx++) {
        if (bx < this.areaWidth && by < this.areaHeight) {
          // Create doors on the front of buildings (facing the street)
          if (by === y + height - 1 && bx === x + Math.floor(width / 2)) {
            world[by][bx] = { type: 'door', solid: false, buildingType };
          } else {
            world[by][bx] = { type: 'building', solid: true, buildingType };
          }
        }
      }
    }
  }

  private createApartmentBuilding(world: OffCampusTile[][], x: number, y: number, width: number, height: number, buildingType: OffCampusTile['buildingType'] = 'apartment'): void {
    for (let by = y; by < y + height; by++) {
      for (let bx = x; bx < x + width; bx++) {
        if (bx < this.areaWidth && by < this.areaHeight) {
          if (by === y + height - 1 && bx === x + Math.floor(width / 2)) {
            world[by][bx] = { type: 'door', solid: false, buildingType };
          } else {
            world[by][bx] = { type: 'building', solid: true, buildingType };
          }
        }
      }
    }
  }

  private createParkingArea(world: OffCampusTile[][], x: number, y: number, width: number, height: number): void {
    for (let py = y; py < y + height; py++) {
      for (let px = x; px < x + width; px++) {
        if (px < this.areaWidth && py < this.areaHeight) {
          world[py][px] = { type: 'parking', solid: false };
        }
      }
    }
  }

  private addTrees(world: OffCampusTile[][], centerX: number, centerY: number, count: number): void {
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

  protected renderBackground(ctx: CanvasRenderingContext2D): void {
    // Off-campus urban background
    ctx.fillStyle = '#4a5c6a'; // Urban bluish-gray background
    ctx.fillRect(0, 0, 800, 600);
  }

  protected renderAreaSpecificElements(ctx: CanvasRenderingContext2D): void {
    // Off-campus specific UI elements
    ctx.fillStyle = '#2F4F4F';
    ctx.font = 'bold 14px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('🏙️ DOWNTOWN BLACKSBURG', 10 - this.cameraX, 30 - this.cameraY);
    
    // Add downtown elements
    ctx.fillStyle = '#FF6B6B';
    ctx.font = '12px sans-serif';
    ctx.fillText('Shops • Restaurants • Apartments', 10 - this.cameraX, 50 - this.cameraY);
    
    // Building name signs
    this.renderBuildingSigns(ctx);
  }

  private renderBuildingSigns(ctx: CanvasRenderingContext2D): void {
    // The Edge sign (building at x: 1-3, y: 1-2)
    const edgeX = 2 * this.tileSize; // Center of 3-tile wide building
    const edgeY = 1 * this.tileSize - 15; // Above the building
    
    // Edge sign background
    ctx.fillStyle = '#2C3E50'; // Dark blue-gray background
    ctx.fillRect(edgeX - 25 - this.cameraX, edgeY - this.cameraY, 50, 12);
    
    // Edge text
    ctx.fillStyle = '#3498DB'; // Light blue text
    ctx.font = 'bold 9px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('THE EDGE', edgeX - this.cameraX, edgeY + 8 - this.cameraY);
    
    // Tots sign (building at x: 2-4, y: 6-7)
    const totsX = 3 * this.tileSize; // Center of 3-tile wide building
    const totsY = 6 * this.tileSize - 15; // Above the building
    
    // Tots sign background
    ctx.fillStyle = '#FF6B35'; // Orange background
    ctx.fillRect(totsX - 25 - this.cameraX, totsY - this.cameraY, 50, 12);
    
    // Tots text
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 10px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('TOTS', totsX - this.cameraX, totsY + 8 - this.cameraY);
    
    // HokieHouse sign (building at x: 9-11, y: 6-7)
    const hokieX = 10 * this.tileSize; // Center of 3-tile wide building
    const hokieY = 6 * this.tileSize - 15; // Above the building
    
    // HokieHouse sign background
    ctx.fillStyle = '#8B0000'; // VT Maroon background
    ctx.fillRect(hokieX - 35 - this.cameraX, hokieY - this.cameraY, 70, 12);
    
    // HokieHouse text
    ctx.fillStyle = '#FF8C00'; // VT Orange text
    ctx.font = 'bold 9px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('HOKIE HOUSE', hokieX - this.cameraX, hokieY + 8 - this.cameraY);
    
    // Centros sign (building at x: 7-9, y: 11-12)
    const centrosX = 8 * this.tileSize; // Center of 3-tile wide building
    const centrosY = 11 * this.tileSize - 15; // Above the building
    
    // Centros sign background
    ctx.fillStyle = '#FF1493'; // Hot pink background (neon club colors)
    ctx.fillRect(centrosX - 30 - this.cameraX, centrosY - this.cameraY, 60, 12);
    
    // Centros text
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 10px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('CENTROS', centrosX - this.cameraX, centrosY + 8 - this.cameraY);
    
    // Add neon glow effect for Centros (dance club)
    ctx.shadowColor = '#FF1493';
    ctx.shadowBlur = 8;
    ctx.fillStyle = '#00FFFF'; // Cyan neon text
    ctx.fillText('CENTROS', centrosX - this.cameraX, centrosY + 8 - this.cameraY);
    ctx.shadowBlur = 0; // Reset shadow
    
    // Add small decorative elements
    // The Edge: Apartment/Home icon
    ctx.fillStyle = '#3498DB';
    ctx.font = '12px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('🏠', edgeX - this.cameraX, edgeY - 5 - this.cameraY);
    
    // Tots: Food icon
    ctx.fillStyle = '#FF6B35';
    ctx.fillText('🍟', totsX - this.cameraX, totsY - 5 - this.cameraY);
    
    // HokieHouse: Turkey (Hokie bird)
    ctx.fillStyle = '#FF8C00';
    ctx.fillText('🦃', hokieX - this.cameraX, hokieY - 5 - this.cameraY);
    
    // Centros: Dancing figures
    ctx.fillStyle = '#FF1493';
    ctx.fillText('💃', centrosX - 15 - this.cameraX, centrosY - 5 - this.cameraY);
    ctx.fillText('🕺', centrosX + 15 - this.cameraX, centrosY - 5 - this.cameraY);
  }

  // Override tile rendering for off-campus styling
  protected renderBuildingTile(ctx: CanvasRenderingContext2D, tile: any, x: number, y: number): void {
    const buildingType = tile.buildingType;
    
    // Different styles for different building types
    let baseColor = '#8B7355'; // Default brown
    let accentColor = '#654321';
    
    switch (buildingType) {
      case 'apartment':
        baseColor = '#A0522D'; // Brick color for apartments
        accentColor = '#8B4513';
        break;
      case 'edge':
        baseColor = '#34495E'; // Modern dark gray for The Edge
        accentColor = '#3498DB'; // Blue accent
        break;
      case 'restaurant':
        baseColor = '#CD853F'; // Warm color for restaurants
        accentColor = '#FF6B6B';
        break;
      case 'shop':
        baseColor = '#D2B48C'; // Light color for shops
        accentColor = '#4ECDC4';
        break;
      case 'bank':
        baseColor = '#778899'; // Professional gray for bank
        accentColor = '#2F4F4F';
        break;
      case 'gas_station':
        baseColor = '#FFFF00'; // Bright for gas station
        accentColor = '#FF0000';
        break;
      case 'hotel':
        baseColor = '#DDA0DD'; // Purple for hotel
        accentColor = '#8B008B';
        break;
      default:
        baseColor = '#8B7355';
        accentColor = '#654321';
    }
    
    // Main building structure
    ctx.fillStyle = baseColor;
    ctx.fillRect(x, y, this.tileSize, this.tileSize);
    
    // Building details
    ctx.fillStyle = accentColor;
    ctx.fillRect(x + 1, y + 1, this.tileSize - 2, 3); // Top accent
    
    // Windows
    ctx.fillStyle = '#87CEEB';
    ctx.fillRect(x + 4, y + 6, 6, 8);
    ctx.fillRect(x + 12, y + 6, 6, 8);
  }

  protected renderRoadTile(ctx: CanvasRenderingContext2D, x: number, y: number): void {
    // Urban road with better markings
    ctx.fillStyle = '#2F2F2F';
    ctx.fillRect(x, y, this.tileSize, this.tileSize);
    
    // Road markings
    ctx.fillStyle = '#FFFF00';
    ctx.fillRect(x, y + 14, this.tileSize, 2);
    
    // Road texture
    ctx.fillStyle = '#3F3F3F';
    for (let i = 0; i < 3; i++) {
      const px = x + Math.floor(Math.random() * this.tileSize);
      const py = y + Math.floor(Math.random() * this.tileSize);
      ctx.fillRect(px, py, 1, 1);
    }
  }
}

export default NameBuildings;
