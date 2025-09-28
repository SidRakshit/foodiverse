import BaseBuildingInterior from './BaseBuildingInterior';
import { SceneType } from '../types';

class SquiresInterior extends BaseBuildingInterior {
  public type: SceneType = 'squires';

  protected getBuildingName(): string {
    return 'Squires Student Center';
  }

  protected generateInterior(): any[][] {
    const interior: any[][] = [];
    
    for (let y = 0; y < this.roomHeight; y++) {
      interior[y] = [];
      for (let x = 0; x < this.roomWidth; x++) {
        // Create the layout for Squires Student Center
        
        // Outer walls
        if (x === 0 || x === this.roomWidth - 1 || y === 0 || y === this.roomHeight - 1) {
          interior[y][x] = { type: 'wall', solid: true };
        }
        // Exit door at bottom center
        else if (y === this.roomHeight - 1 && x === Math.floor(this.roomWidth / 2)) {
          interior[y][x] = { type: 'door', solid: false };
        }
        // Food court tables (center area)
        else if ((x >= 6 && x <= 7 && y >= 5 && y <= 6) ||
                 (x >= 9 && x <= 10 && y >= 5 && y <= 6) ||
                 (x >= 12 && x <= 13 && y >= 5 && y <= 6) ||
                 (x >= 6 && x <= 7 && y >= 8 && y <= 9) ||
                 (x >= 9 && x <= 10 && y >= 8 && y <= 9) ||
                 (x >= 12 && x <= 13 && y >= 8 && y <= 9)) {
          interior[y][x] = { type: 'furniture', solid: true, furniture: 'table' };
        }
        // Chairs around tables
        else if ((x === 5 && (y === 5 || y === 8)) ||
                 (x === 8 && (y === 5 || y === 8)) ||
                 (x === 11 && (y === 5 || y === 8)) ||
                 (x === 14 && (y === 5 || y === 8)) ||
                 (x === 5 && (y === 6 || y === 9)) ||
                 (x === 8 && (y === 6 || y === 9)) ||
                 (x === 11 && (y === 6 || y === 9)) ||
                 (x === 14 && (y === 6 || y === 9))) {
          interior[y][x] = { type: 'furniture', solid: true, furniture: 'chair' };
        }
        // Student lounge area (left side)
        else if ((x >= 2 && x <= 4 && y >= 3 && y <= 4) ||
                 (x >= 2 && x <= 4 && y >= 10 && y <= 11)) {
          interior[y][x] = { type: 'furniture', solid: true, furniture: 'couch' };
        }
        // Information desk
        else if (x >= 15 && x <= 17 && y >= 2 && y <= 3) {
          interior[y][x] = { type: 'furniture', solid: true, furniture: 'desk' };
        }
        // Computer kiosks
        else if ((x === 3 && y === 7) || (x === 16 && y === 7)) {
          interior[y][x] = { type: 'furniture', solid: true, furniture: 'computer' };
        }
        // Windows
        else if (y === 0 && (x === 4 || x === 8 || x === 12 || x === 16)) {
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

  protected renderBuildingSpecificElements(ctx: CanvasRenderingContext2D): void {
    // Squires Student Center specific elements
    
    // Building name
    ctx.fillStyle = '#FF8C00';
    ctx.font = 'bold 16px serif';
    ctx.textAlign = 'center';
    ctx.fillText('SQUIRES STUDENT CENTER', 400 - this.cameraX, 30 - this.cameraY);
    
    // Food court area
    ctx.fillStyle = '#8B0000';
    ctx.font = '14px serif';
    ctx.textAlign = 'center';
    ctx.fillText('FOOD COURT', 400 - this.cameraX, 55 - this.cameraY);
    
    // Student services signs
    ctx.fillStyle = '#8B0000';
    ctx.font = '12px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('Student Services', 500 - this.cameraX, 100 - this.cameraY);
    ctx.fillText('Information Desk', 500 - this.cameraX, 120 - this.cameraY);
    ctx.fillText('Student Lounge', 100 - this.cameraX, 150 - this.cameraY);
    
    // VT spirit decorations
    ctx.fillStyle = '#8B0000';
    ctx.fillRect(50 - this.cameraX, 50 - this.cameraY, 60, 40);
    ctx.fillStyle = '#FF8C00';
    ctx.fillRect(55 - this.cameraX, 55 - this.cameraY, 50, 30);
    ctx.fillStyle = '#8B0000';
    ctx.font = 'bold 16px serif';
    ctx.textAlign = 'center';
    ctx.fillText('GO', 70 - this.cameraX, 75 - this.cameraY);
    ctx.fillText('HOKIES!', 85 - this.cameraX, 85 - this.cameraY);
    
    // Student announcements board
    ctx.fillStyle = '#4A4A4A';
    ctx.fillRect(600 - this.cameraX, 100 - this.cameraY, 120, 80);
    ctx.fillStyle = 'white';
    ctx.fillRect(610 - this.cameraX, 110 - this.cameraY, 100, 60);
    ctx.fillStyle = '#8B0000';
    ctx.font = '10px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('Student Events', 615 - this.cameraX, 125 - this.cameraY);
    ctx.fillText('• Basketball Game', 615 - this.cameraX, 140 - this.cameraY);
    ctx.fillText('• Club Fair', 615 - this.cameraX, 155 - this.cameraY);
    ctx.fillText('• Study Groups', 615 - this.cameraX, 170 - this.cameraY);
    
    // Stylized floor pattern for student center
    ctx.fillStyle = '#FF8C00';
    ctx.globalAlpha = 0.1;
    for (let x = 200; x < 600; x += 50) {
      for (let y = 200; y < 400; y += 50) {
        ctx.fillRect(x - this.cameraX, y - this.cameraY, 25, 25);
      }
    }
    ctx.globalAlpha = 1.0;
    
    // Student center amenities
    ctx.fillStyle = '#2F2F2F';
    ctx.fillRect(150 - this.cameraX, 320 - this.cameraY, 40, 20);
    ctx.fillStyle = 'white';
    ctx.font = '8px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('ATM', 170 - this.cameraX, 333 - this.cameraY);
    
    ctx.fillStyle = '#8B4513';
    ctx.fillRect(250 - this.cameraX, 320 - this.cameraY, 40, 20);
    ctx.fillStyle = 'white';
    ctx.fillText('MAIL', 270 - this.cameraX, 333 - this.cameraY);
  }
}

export default SquiresInterior;
