import BaseBuildingInterior from './BaseBuildingInterior';
import { SceneType } from '../types';

class TorgersenInterior extends BaseBuildingInterior {
  public type: SceneType = 'torgersen';

  protected getBuildingName(): string {
    return 'Torgersen Hall - Engineering';
  }

  protected generateInterior(): any[][] {
    const interior: any[][] = [];
    
    for (let y = 0; y < this.roomHeight; y++) {
      interior[y] = [];
      for (let x = 0; x < this.roomWidth; x++) {
        // Create the layout for Torgersen Engineering Hall
        
        // Outer walls
        if (x === 0 || x === this.roomWidth - 1 || y === 0 || y === this.roomHeight - 1) {
          interior[y][x] = { type: 'wall', solid: true };
        }
        // Exit door at bottom center
        else if (y === this.roomHeight - 1 && x === Math.floor(this.roomWidth / 2)) {
          interior[y][x] = { type: 'door', solid: false };
        }
        // Computer lab area (left side)
        else if (x >= 2 && x <= 7 && y >= 2 && y <= 8 && (x + y) % 2 === 0) {
          interior[y][x] = { type: 'furniture', solid: true, furniture: 'computer' };
        }
        // Engineering workbenches (right side)
        else if (x >= 12 && x <= 17 && y >= 3 && y <= 6) {
          interior[y][x] = { type: 'furniture', solid: true, furniture: 'desk' };
        }
        // Lab equipment area
        else if (x >= 12 && x <= 17 && y >= 8 && y <= 11) {
          interior[y][x] = { type: 'furniture', solid: true, furniture: 'table' };
        }
        // Chairs for workstations
        else if ((x >= 2 && x <= 7 && y >= 2 && y <= 8 && (x + y) % 2 === 1) ||
                 (x >= 11 && x <= 18 && (y === 2 || y === 7 || y === 12))) {
          interior[y][x] = { type: 'furniture', solid: true, furniture: 'chair' };
        }
        // Windows along top
        else if (y === 0 && (x === 3 || x === 7 || x === 13 || x === 17)) {
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
    // Torgersen Hall Engineering specific elements
    
    // Engineering lab equipment
    ctx.fillStyle = '#4A4A4A'; // Gray metal
    ctx.fillRect(400 - this.cameraX, 250 - this.cameraY, 80, 40);
    ctx.fillRect(500 - this.cameraX, 250 - this.cameraY, 80, 40);
    
    // Oscilloscope screens
    ctx.fillStyle = '#00FF00'; // Green screen
    ctx.fillRect(410 - this.cameraX, 260 - this.cameraY, 25, 20);
    ctx.fillRect(510 - this.cameraX, 260 - this.cameraY, 25, 20);
    
    // Building name and department
    ctx.fillStyle = '#4A4A4A';
    ctx.font = 'bold 16px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('TORGERSEN HALL', 400 - this.cameraX, 30 - this.cameraY);
    ctx.fillStyle = '#FF8C00';
    ctx.font = 'bold 12px monospace';
    ctx.fillText('COLLEGE OF ENGINEERING', 400 - this.cameraX, 50 - this.cameraY);
    
    // Lab signs
    ctx.fillStyle = '#4A4A4A';
    ctx.font = '12px monospace';
    ctx.textAlign = 'left';
    ctx.fillText('Computer Lab', 80 - this.cameraX, 100 - this.cameraY);
    ctx.fillText('Electronics Lab', 400 - this.cameraX, 200 - this.cameraY);
    ctx.fillText('Design Studio', 400 - this.cameraX, 300 - this.cameraY);
    
    // Circuit diagrams on walls (decorative)
    ctx.strokeStyle = '#4A4A4A';
    ctx.lineWidth = 2;
    ctx.beginPath();
    // Simple circuit diagram
    ctx.moveTo(50 - this.cameraX, 150 - this.cameraY);
    ctx.lineTo(150 - this.cameraX, 150 - this.cameraY);
    ctx.moveTo(100 - this.cameraX, 130 - this.cameraY);
    ctx.lineTo(100 - this.cameraX, 170 - this.cameraY);
    ctx.stroke();
    
    // Resistor symbol
    ctx.beginPath();
    ctx.rect(90 - this.cameraX, 145 - this.cameraY, 20, 10);
    ctx.stroke();
    
    // VT Engineering logo area
    ctx.fillStyle = '#8B0000';
    ctx.fillRect(350 - this.cameraX, 80 - this.cameraY, 100, 40);
    ctx.fillStyle = '#FF8C00';
    ctx.font = 'bold 14px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('VT', 380 - this.cameraX, 95 - this.cameraY);
    ctx.fillText('ENGINEERING', 400 - this.cameraX, 110 - this.cameraY);
    
    // Floor cable management (engineering building detail)
    ctx.fillStyle = '#2F2F2F';
    ctx.fillRect(0 - this.cameraX, 200 - this.cameraY, 800, 4);
    ctx.fillRect(0 - this.cameraX, 300 - this.cameraY, 800, 4);
  }
}

export default TorgersenInterior;
