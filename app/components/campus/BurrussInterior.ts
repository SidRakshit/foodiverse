import BaseBuildingInterior from './BaseBuildingInterior';
import { SceneType } from '../types';

class BurrussInterior extends BaseBuildingInterior {
  public type: SceneType = 'burruss';

  protected getBuildingName(): string {
    return 'Burruss Hall - Administration';
  }

  protected generateInterior(): any[][] {
    const interior: any[][] = [];
    
    for (let y = 0; y < this.roomHeight; y++) {
      interior[y] = [];
      for (let x = 0; x < this.roomWidth; x++) {
        // Create the layout for Burruss Hall administrative building
        
        // Outer walls
        if (x === 0 || x === this.roomWidth - 1 || y === 0 || y === this.roomHeight - 1) {
          interior[y][x] = { type: 'wall', solid: true };
        }
        // Exit door at bottom center
        else if (y === this.roomHeight - 1 && x === Math.floor(this.roomWidth / 2)) {
          interior[y][x] = { type: 'door', solid: false };
        }
        // Reception area (center)
        else if (x >= 8 && x <= 11 && y >= 6 && y <= 8) {
          interior[y][x] = { type: 'furniture', solid: true, furniture: 'desk' };
        }
        // Chairs in waiting area
        else if ((x === 6 || x === 13) && (y === 9 || y === 10)) {
          interior[y][x] = { type: 'furniture', solid: true, furniture: 'chair' };
        }
        // Administrative offices (sides)
        else if ((x >= 2 && x <= 4 && y >= 2 && y <= 4) || 
                 (x >= 15 && x <= 17 && y >= 2 && y <= 4) ||
                 (x >= 2 && x <= 4 && y >= 10 && y <= 12) ||
                 (x >= 15 && x <= 17 && y >= 10 && y <= 12)) {
          interior[y][x] = { type: 'furniture', solid: true, furniture: 'desk' };
        }
        // Windows along top wall
        else if (y === 0 && (x === 5 || x === 10 || x === 14)) {
          interior[y][x] = { type: 'window', solid: true };
        }
        // Computer stations
        else if ((x === 7 && y === 3) || (x === 12 && y === 3)) {
          interior[y][x] = { type: 'furniture', solid: true, furniture: 'computer' };
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
    // Burruss Hall specific elements
    
    // VT seal/logo in center
    const centerX = 400 - this.cameraX;
    const centerY = 200 - this.cameraY;
    
    ctx.fillStyle = '#8B0000'; // Maroon
    ctx.beginPath();
    ctx.arc(centerX, centerY, 30, 0, 2 * Math.PI);
    ctx.fill();
    
    ctx.fillStyle = '#FF8C00';
    ctx.beginPath();
    ctx.arc(centerX, centerY, 25, 0, 2 * Math.PI);
    ctx.fill();
    
    // VT text
    ctx.fillStyle = '#8B0000';
    ctx.font = 'bold 16px serif';
    ctx.textAlign = 'center';
    ctx.fillText('VT', centerX, centerY + 5);
    
    // Building name
    ctx.fillStyle = '#8B0000';
    ctx.font = 'bold 14px serif';
    ctx.textAlign = 'center';
    ctx.fillText('BURRUSS HALL', 400 - this.cameraX, 50 - this.cameraY);
    ctx.fillText('ADMINISTRATION', 400 - this.cameraX, 70 - this.cameraY);
    
    // Marble columns effect
    ctx.fillStyle = '#F5F5DC';
    ctx.fillRect(150 - this.cameraX, 0, 20, 200);
    ctx.fillRect(300 - this.cameraX, 0, 20, 200);
    ctx.fillRect(450 - this.cameraX, 0, 20, 200);
    ctx.fillRect(600 - this.cameraX, 0, 20, 200);
  }
}

export default BurrussInterior;
