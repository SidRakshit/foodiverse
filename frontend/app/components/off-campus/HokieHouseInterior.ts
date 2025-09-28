import BaseOffCampusBuilding from './BaseOffCampusBuilding';
import { SceneType } from '../types';
import { BartenderNPC } from './BartenderNPC';

class HokieHouseInterior extends BaseOffCampusBuilding {
  public type: SceneType = 'hokiehouse';
  private bartender: BartenderNPC;

  protected getBuildingName(): string {
    return 'Hokie House - VT Sports Bar & Grill';
  }

  protected getBuildingType(): 'apartment' | 'mixed_use' | 'commercial' {
    return 'commercial';
  }

  constructor() {
    super();
    // Position bartender near the bottles and bar area (left side)
    this.bartender = new BartenderNPC(80, 170);
  }

  protected generateBuilding(): any[][] {
    const interior: any[][] = [];
    
    for (let y = 0; y < this.buildingHeight; y++) {
      interior[y] = [];
      for (let x = 0; x < this.buildingWidth; x++) {
        // Create the layout for Hokie House sports bar
        
        // Outer walls
        if (x === 0 || x === this.buildingWidth - 1 || y === 0 || y === this.buildingHeight - 1) {
          interior[y][x] = { type: 'wall', solid: true };
        }
        // Exit door at bottom center
        else if (y === this.buildingHeight - 1 && x === Math.floor(this.buildingWidth / 2)) {
          interior[y][x] = { type: 'door', solid: false };
        }
        // Bar area (left side)
        else if (x >= 2 && x <= 4 && y >= 3 && y <= 10) {
          interior[y][x] = { type: 'furniture', solid: true, furniture: 'desk' };
        }
        // Bar stools
        else if (x === 5 && y >= 3 && y <= 10 && y % 2 === 1) {
          interior[y][x] = { type: 'furniture', solid: true, furniture: 'chair' };
        }
        // Kitchen area (back right)
        else if (x >= 14 && x <= 17 && y >= 2 && y <= 6) {
          interior[y][x] = { type: 'furniture', solid: true, furniture: 'kitchen' };
        }
        // Dining booths (right side)
        else if ((x >= 12 && x <= 13 && y >= 8 && y <= 9) ||
                 (x >= 12 && x <= 13 && y >= 11 && y <= 12)) {
          interior[y][x] = { type: 'furniture', solid: true, furniture: 'couch' };
        }
        // Booth tables
        else if ((x === 14 && (y === 8 || y === 11))) {
          interior[y][x] = { type: 'furniture', solid: true, furniture: 'table' };
        }
        // High-top tables (center area)
        else if ((x >= 7 && x <= 8 && y >= 6 && y <= 7) ||
                 (x >= 7 && x <= 8 && y >= 9 && y <= 10) ||
                 (x >= 9 && x <= 10 && y >= 6 && y <= 7) ||
                 (x >= 9 && x <= 10 && y >= 9 && y <= 10)) {
          interior[y][x] = { type: 'furniture', solid: true, furniture: 'table' };
        }
        // High-top chairs
        else if ((x === 6 && (y === 6 || y === 9)) ||
                 (x === 11 && (y === 6 || y === 9))) {
          interior[y][x] = { type: 'furniture', solid: true, furniture: 'chair' };
        }
        // Windows along front
        else if (y === 0 && (x === 6 || x === 10 || x === 14)) {
          interior[y][x] = { type: 'window', solid: true };
        }
        // Floor
        else {
          interior[y][x] = { type: 'floor', solid: false };
        }
      }
    }
    
    return interior;
  }

  public update(deltaTime: number, player?: any): void {
    super.update(deltaTime);
    this.bartender.update(deltaTime);
    
    // Check if player is near Jake and update proximity
    if (player) {
      if (this.bartender.isNearPlayer(player.x, player.y)) {
        player.setNearbyJake(this.bartender);
      } else {
        player.setNearbyJake(null);
      }
    }
  }

  protected renderBuildingSpecificElements(ctx: CanvasRenderingContext2D): void {
    // Hokie House sports bar specific elements
    
    // Restaurant name and VT branding
    ctx.fillStyle = '#8B0000'; // VT Maroon
    ctx.font = 'bold 20px serif';
    ctx.textAlign = 'center';
    ctx.fillText('HOKIE HOUSE', 400 - this.cameraX, 35 - this.cameraY);
    
    ctx.fillStyle = '#FF8C00'; // VT Orange
    ctx.font = 'bold 14px serif';
    ctx.fillText('Sports Bar & Grill', 400 - this.cameraX, 55 - this.cameraY);
    
    // TV screens for sports viewing
    ctx.fillStyle = '#000000'; // Black TV frames
    ctx.fillRect(50 - this.cameraX, 100 - this.cameraY, 80, 60);
    ctx.fillRect(300 - this.cameraX, 80 - this.cameraY, 100, 75);
    ctx.fillRect(550 - this.cameraX, 100 - this.cameraY, 80, 60);
    
    // TV screens
    ctx.fillStyle = '#00FF00'; // Green for football field
    ctx.fillRect(55 - this.cameraX, 105 - this.cameraY, 70, 50);
    ctx.fillRect(305 - this.cameraX, 85 - this.cameraY, 90, 65);
    ctx.fillRect(555 - this.cameraX, 105 - this.cameraY, 70, 50);
    
    // VT on TV screens
    ctx.fillStyle = '#8B0000';
    ctx.font = 'bold 12px serif';
    ctx.textAlign = 'center';
    ctx.fillText('VT', 90 - this.cameraX, 135 - this.cameraY);
    ctx.fillText('HOKIES', 350 - this.cameraX, 125 - this.cameraY);
    ctx.fillText('VT', 590 - this.cameraX, 135 - this.cameraY);
    
    // Bar back with bottles
    ctx.fillStyle = '#8B4513'; // Brown bar back
    ctx.fillRect(50 - this.cameraX, 180 - this.cameraY, 80, 40);
    
    // Liquor bottles
    ctx.fillStyle = '#228B22'; // Green bottles
    ctx.fillRect(55 - this.cameraX, 185 - this.cameraY, 4, 15);
    ctx.fillRect(65 - this.cameraX, 185 - this.cameraY, 4, 15);
    ctx.fillRect(75 - this.cameraX, 185 - this.cameraY, 4, 15);
    
    ctx.fillStyle = '#8B4513'; // Brown bottles
    ctx.fillRect(85 - this.cameraX, 185 - this.cameraY, 4, 15);
    ctx.fillRect(95 - this.cameraX, 185 - this.cameraY, 4, 15);
    ctx.fillRect(105 - this.cameraX, 185 - this.cameraY, 4, 15);
    
    // VT memorabilia and decorations
    ctx.fillStyle = '#8B0000';
    ctx.fillRect(200 - this.cameraX, 120 - this.cameraY, 60, 40);
    ctx.fillStyle = '#FF8C00';
    ctx.fillRect(205 - this.cameraX, 125 - this.cameraY, 50, 30);
    ctx.fillStyle = '#8B0000';
    ctx.font = 'bold 16px serif';
    ctx.textAlign = 'center';
    ctx.fillText('VT', 230 - this.cameraX, 145 - this.cameraY);
    
    // VT pennant
    ctx.fillStyle = '#8B0000';
    ctx.beginPath();
    ctx.moveTo(500 - this.cameraX, 180 - this.cameraY);
    ctx.lineTo(580 - this.cameraX, 190 - this.cameraY);
    ctx.lineTo(500 - this.cameraX, 200 - this.cameraY);
    ctx.closePath();
    ctx.fill();
    
    ctx.fillStyle = '#FF8C00';
    ctx.font = 'bold 10px serif';
    ctx.textAlign = 'left';
    ctx.fillText('HOKIES', 510 - this.cameraX, 195 - this.cameraY);
    
    // Menu specials board
    ctx.fillStyle = '#2F2F2F';
    ctx.fillRect(450 - this.cameraX, 250 - this.cameraY, 120, 100);
    
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '12px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('GAME DAY SPECIALS', 510 - this.cameraX, 270 - this.cameraY);
    
    ctx.font = '10px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('• Trash Can ....... $10', 460 - this.cameraX, 290 - this.cameraY);
    ctx.fillText('• Corona ...... $5', 460 - this.cameraX, 305 - this.cameraY);
    ctx.fillText('• Blue motorcycle ..... $8', 460 - this.cameraX, 320 - this.cameraY);
    ctx.fillText('• tequila soda ..... $10', 460 - this.cameraX, 335 - this.cameraY);
  
    // Hokie Bird logo on floor
    ctx.fillStyle = '#8B0000';
    ctx.globalAlpha = 0.3;
    ctx.beginPath();
    ctx.arc(400 - this.cameraX, 350 - this.cameraY, 40, 0, 2 * Math.PI);
    ctx.fill();
    ctx.globalAlpha = 1.0;
    
    ctx.fillStyle = '#FF8C00';
    ctx.font = 'bold 20px serif';
    ctx.textAlign = 'center';
    ctx.fillText('🦃', 400 - this.cameraX, 360 - this.cameraY);
    
    // Beer taps
    ctx.fillStyle = '#C0C0C0'; // Silver taps
    ctx.fillRect(70 - this.cameraX, 160 - this.cameraY, 4, 15);
    ctx.fillRect(80 - this.cameraX, 160 - this.cameraY, 4, 15);
    ctx.fillRect(90 - this.cameraX, 160 - this.cameraY, 4, 15);
    ctx.fillRect(100 - this.cameraX, 160 - this.cameraY, 4, 15);
    
    // Tap handles
    ctx.fillStyle = '#8B0000';
    ctx.fillRect(68 - this.cameraX, 155 - this.cameraY, 8, 6);
    ctx.fillStyle = '#FF8C00';
    ctx.fillRect(78 - this.cameraX, 155 - this.cameraY, 8, 6);
    ctx.fillStyle = '#000000';
    ctx.fillRect(88 - this.cameraX, 155 - this.cameraY, 8, 6);
    ctx.fillRect(98 - this.cameraX, 155 - this.cameraY, 8, 6);

    // Render the bartender NPC
    this.bartender.render(ctx, this.cameraX, this.cameraY);
  }
}

export default HokieHouseInterior;
