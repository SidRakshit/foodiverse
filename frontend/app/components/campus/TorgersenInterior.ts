import BaseBuildingInterior from './BaseBuildingInterior';
import { SceneType } from '../types';

class TorgersenInterior extends BaseBuildingInterior {
  public type: SceneType = 'torgersen';

  protected getBuildingName(): string {
    return 'Torgersen Hall - College of Engineering';
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
    // Torgersen Hall Gothic Revival Architecture and Engineering Elements
    
    // Gothic architectural details on walls
    this.renderGothicArchDetails(ctx);
    
    // Engineering lab equipment with more modern appearance
    ctx.fillStyle = '#4A4A4A'; // Gray metal
    ctx.fillRect(400 - this.cameraX, 250 - this.cameraY, 80, 40);
    ctx.fillRect(500 - this.cameraX, 250 - this.cameraY, 80, 40);
    
    // Modern LCD screens
    ctx.fillStyle = '#1E1E1E'; // Dark screen bezel
    ctx.fillRect(405 - this.cameraX, 255 - this.cameraY, 30, 20);
    ctx.fillRect(505 - this.cameraX, 255 - this.cameraY, 30, 20);
    ctx.fillStyle = '#0066FF'; // Blue LCD screen
    ctx.fillRect(407 - this.cameraX, 257 - this.cameraY, 26, 16);
    ctx.fillRect(507 - this.cameraX, 257 - this.cameraY, 26, 16);
    
    // Building name with Gothic-inspired font styling
    ctx.fillStyle = '#8B0000'; // VT Maroon
    ctx.font = 'bold 18px serif';
    ctx.textAlign = 'center';
    ctx.fillText('TORGERSEN HALL', 400 - this.cameraX, 30 - this.cameraY);
    ctx.fillStyle = '#FF8C00'; // VT Orange
    ctx.font = 'bold 14px serif';
    ctx.fillText('COLLEGE OF ENGINEERING', 400 - this.cameraX, 50 - this.cameraY);
    ctx.fillStyle = '#C8B99C';
    ctx.font = '10px serif';
    ctx.fillText('EST. 1872 • VIRGINIA TECH', 400 - this.cameraX, 65 - this.cameraY);
    
    // Elegant departmental signs with Gothic styling
    ctx.fillStyle = '#2F2F2F';
    ctx.font = '14px serif';
    ctx.textAlign = 'left';
    ctx.fillText('⚡ Electrical & Computer Engineering', 80 - this.cameraX, 100 - this.cameraY);
    ctx.fillText('🔧 Mechanical Engineering Lab', 400 - this.cameraX, 200 - this.cameraY);
    ctx.fillText('💻 Engineering Design Studio', 400 - this.cameraX, 320 - this.cameraY);
    
    // Gothic stone columns (decorative)
    this.renderGothicColumns(ctx);
    
    // Advanced engineering elements
    ctx.strokeStyle = '#4A4A4A';
    ctx.lineWidth = 1;
    ctx.beginPath();
    // CAD workstation diagrams
    ctx.moveTo(50 - this.cameraX, 140 - this.cameraY);
    ctx.lineTo(150 - this.cameraX, 140 - this.cameraY);
    ctx.lineTo(150 - this.cameraX, 180 - this.cameraY);
    ctx.lineTo(50 - this.cameraX, 180 - this.cameraY);
    ctx.closePath();
    ctx.stroke();
    
    // VT Engineering logo with Gothic styling
    ctx.fillStyle = '#8B0000';
    ctx.fillRect(350 - this.cameraX, 75 - this.cameraY, 120, 50);
    ctx.fillStyle = '#E8DCC6'; // Limestone color
    ctx.fillRect(352 - this.cameraX, 77 - this.cameraY, 116, 46);
    ctx.fillStyle = '#8B0000';
    ctx.font = 'bold 16px serif';
    ctx.textAlign = 'center';
    ctx.fillText('VT', 410 - this.cameraX, 95 - this.cameraY);
    ctx.font = 'bold 10px serif';
    ctx.fillText('ENGINEERING', 410 - this.cameraX, 110 - this.cameraY);
    ctx.fillText('EXCELLENCE', 410 - this.cameraX, 120 - this.cameraY);
    
    // Modern cable management with Gothic aesthetic
    ctx.fillStyle = '#2F2F2F';
    ctx.fillRect(0 - this.cameraX, 200 - this.cameraY, 800, 3);
    ctx.fillRect(0 - this.cameraX, 300 - this.cameraY, 800, 3);
    
    // Stone floor pattern details
    ctx.strokeStyle = '#C8B99C';
    ctx.lineWidth = 1;
    for (let x = 0; x < 800; x += 64) {
      ctx.beginPath();
      ctx.moveTo(x - this.cameraX, 0 - this.cameraY);
      ctx.lineTo(x - this.cameraX, 600 - this.cameraY);
      ctx.stroke();
    }
  }

  private renderGothicArchDetails(ctx: CanvasRenderingContext2D): void {
    // Gothic arch patterns on walls
    ctx.strokeStyle = '#C8B99C';
    ctx.lineWidth = 2;
    
    // Left wall arches
    for (let i = 0; i < 3; i++) {
      const x = 20 + i * 60;
      const y = 120;
      ctx.beginPath();
      ctx.arc(x - this.cameraX, y - this.cameraY, 25, Math.PI, 0);
      ctx.stroke();
    }
    
    // Right wall arches
    for (let i = 0; i < 3; i++) {
      const x = 600 + i * 60;
      const y = 120;
      ctx.beginPath();
      ctx.arc(x - this.cameraX, y - this.cameraY, 25, Math.PI, 0);
      ctx.stroke();
    }
  }

  private renderGothicColumns(ctx: CanvasRenderingContext2D): void {
    // Gothic stone columns
    ctx.fillStyle = '#E8DCC6'; // Limestone
    
    // Left columns
    ctx.fillRect(30 - this.cameraX, 50 - this.cameraY, 12, 400);
    ctx.fillRect(120 - this.cameraX, 50 - this.cameraY, 12, 400);
    
    // Right columns  
    ctx.fillRect(650 - this.cameraX, 50 - this.cameraY, 12, 400);
    ctx.fillRect(740 - this.cameraX, 50 - this.cameraY, 12, 400);
    
    // Column capitals (decorative tops)
    ctx.fillStyle = '#D4C4A8';
    ctx.fillRect(25 - this.cameraX, 45 - this.cameraY, 22, 10);
    ctx.fillRect(115 - this.cameraX, 45 - this.cameraY, 22, 10);
    ctx.fillRect(645 - this.cameraX, 45 - this.cameraY, 22, 10);
    ctx.fillRect(735 - this.cameraX, 45 - this.cameraY, 22, 10);
  }
}

export default TorgersenInterior;
