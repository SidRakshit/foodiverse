import BaseBuildingInterior from './BaseBuildingInterior';
import { SceneType } from '../types';

class TurnerInterior extends BaseBuildingInterior {
  public type: SceneType = 'turner';

  protected getBuildingName(): string {
    return 'Turner Library';
  }

  protected generateInterior(): any[][] {
    const interior: any[][] = [];
    
    for (let y = 0; y < this.roomHeight; y++) {
      interior[y] = [];
      for (let x = 0; x < this.roomWidth; x++) {
        // Create the layout for Turner Library
        
        // Outer walls
        if (x === 0 || x === this.roomWidth - 1 || y === 0 || y === this.roomHeight - 1) {
          interior[y][x] = { type: 'wall', solid: true };
        }
        // Exit door at bottom center
        else if (y === this.roomHeight - 1 && x === Math.floor(this.roomWidth / 2)) {
          interior[y][x] = { type: 'door', solid: false };
        }
        // Bookshelves along walls
        else if ((x === 1 && y >= 2 && y <= 12) || 
                 (x === this.roomWidth - 2 && y >= 2 && y <= 12) ||
                 (y === 1 && x >= 3 && x <= 16 && x % 3 === 0)) {
          interior[y][x] = { type: 'furniture', solid: true, furniture: 'bookshelf' };
        }
        // Study tables in center
        else if ((x >= 6 && x <= 8 && y >= 5 && y <= 6) ||
                 (x >= 11 && x <= 13 && y >= 5 && y <= 6) ||
                 (x >= 6 && x <= 8 && y >= 9 && y <= 10) ||
                 (x >= 11 && x <= 13 && y >= 9 && y <= 10)) {
          interior[y][x] = { type: 'furniture', solid: true, furniture: 'table' };
        }
        // Chairs around tables
        else if ((x === 5 && (y === 5 || y === 9)) ||
                 (x === 9 && (y === 5 || y === 9)) ||
                 (x === 10 && (y === 5 || y === 9)) ||
                 (x === 14 && (y === 5 || y === 9))) {
          interior[y][x] = { type: 'furniture', solid: true, furniture: 'chair' };
        }
        // Computer stations
        else if ((x >= 3 && x <= 5 && y === 3) ||
                 (x >= 14 && x <= 16 && y === 3)) {
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
    // Turner Library specific elements
    
    // Library circulation desk
    ctx.fillStyle = '#8B4513'; // Brown wood
    ctx.fillRect(320 - this.cameraX, 100 - this.cameraY, 160, 40);
    
    // Information desk sign
    ctx.fillStyle = '#8B0000';
    ctx.fillRect(380 - this.cameraX, 80 - this.cameraY, 40, 20);
    ctx.fillStyle = 'white';
    ctx.font = '10px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('INFO', 400 - this.cameraX, 93 - this.cameraY);
    
    // Building name
    ctx.fillStyle = '#FF8C00';
    ctx.font = 'bold 16px serif';
    ctx.textAlign = 'center';
    ctx.fillText('TURNER LIBRARY', 400 - this.cameraX, 30 - this.cameraY);
    
    // Reading area signs
    ctx.fillStyle = '#8B0000';
    ctx.font = '12px serif';
    ctx.textAlign = 'left';
    ctx.fillText('Quiet Study', 100 - this.cameraX, 150 - this.cameraY);
    ctx.fillText('Computer Lab', 100 - this.cameraX, 110 - this.cameraY);
    ctx.fillText('Research Collection', 500 - this.cameraX, 150 - this.cameraY);
    
    // Library carpet pattern
    ctx.fillStyle = '#8B0000';
    ctx.globalAlpha = 0.1;
    for (let x = 0; x < 800; x += 40) {
      for (let y = 0; y < 600; y += 40) {
        ctx.fillRect(x - this.cameraX, y - this.cameraY, 20, 20);
      }
    }
    ctx.globalAlpha = 1.0;
    
    // Book return slot
    ctx.fillStyle = '#2F2F2F';
    ctx.fillRect(50 - this.cameraX, 200 - this.cameraY, 30, 20);
    ctx.fillStyle = 'white';
    ctx.font = '8px monospace';
    ctx.fillText('RETURNS', 55 - this.cameraX, 213 - this.cameraY);
  }
}

export default TurnerInterior;
