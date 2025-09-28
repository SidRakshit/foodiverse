import BaseOffCampusBuilding from './BaseOffCampusBuilding';
import { SceneType } from '../types';

class TotsDownstairs extends BaseOffCampusBuilding {
  public type: SceneType = 'tots';

  protected getBuildingName(): string {
    return 'Tots - Outdoor Bar (Ground Floor)';
  }

  protected getBuildingType(): 'apartment' | 'mixed_use' | 'commercial' {
    return 'commercial';
  }

  protected generateBuilding(): any[][] {
    const interior: any[][] = [];
    
    for (let y = 0; y < this.buildingHeight; y++) {
      interior[y] = [];
      for (let x = 0; x < this.buildingWidth; x++) {
        // Create the layout for Tots restaurant
        
        // Outer walls
        if (x === 0 || x === this.buildingWidth - 1 || y === 0 || y === this.buildingHeight - 1) {
          interior[y][x] = { type: 'wall', solid: true };
        }
        // Exit door at bottom center
        else if (y === this.buildingHeight - 1 && x === Math.floor(this.buildingWidth / 2)) {
          interior[y][x] = { type: 'door', solid: false };
        }
        // Outdoor bar area (back left)
        else if (x >= 2 && x <= 6 && y >= 2 && y <= 3) {
          interior[y][x] = { type: 'furniture', solid: true, furniture: 'desk' };
        }
        // Bar stools
        else if (x >= 2 && x <= 6 && y === 4) {
          interior[y][x] = { type: 'furniture', solid: true, furniture: 'chair' };
        }
        // Stairs to upstairs (back right)
        else if (x >= 16 && x <= 18 && y >= 2 && y <= 5) {
          interior[y][x] = { type: 'stairs', solid: false };
        }
        // Dining tables
        else if ((x >= 4 && x <= 5 && y >= 8 && y <= 9) ||
                 (x >= 8 && x <= 9 && y >= 8 && y <= 9) ||
                 (x >= 12 && x <= 13 && y >= 8 && y <= 9) ||
                 (x >= 16 && x <= 17 && y >= 8 && y <= 9) ||
                 (x >= 4 && x <= 5 && y >= 11 && y <= 12) ||
                 (x >= 8 && x <= 9 && y >= 11 && y <= 12) ||
                 (x >= 12 && x <= 13 && y >= 11 && y <= 12)) {
          interior[y][x] = { type: 'furniture', solid: true, furniture: 'table' };
        }
        // Chairs around tables
        else if ((x === 3 && (y === 8 || y === 11)) ||
                 (x === 6 && (y === 8 || y === 11)) ||
                 (x === 7 && (y === 8 || y === 11)) ||
                 (x === 10 && (y === 8 || y === 11)) ||
                 (x === 11 && (y === 8 || y === 11)) ||
                 (x === 14 && (y === 8 || y === 11)) ||
                 (x === 15 && y === 8) ||
                 (x === 18 && y === 8) ||
                 (x === 3 && (y === 9 || y === 12)) ||
                 (x === 6 && (y === 9 || y === 12)) ||
                 (x === 7 && (y === 9 || y === 12)) ||
                 (x === 10 && (y === 9 || y === 12)) ||
                 (x === 11 && (y === 9 || y === 12)) ||
                 (x === 14 && (y === 9 || y === 12))) {
          interior[y][x] = { type: 'furniture', solid: true, furniture: 'chair' };
        }
        // Windows along front and side
        else if ((y === 0 && (x === 4 || x === 8 || x === 12 || x === 16)) ||
                 (x === 0 && (y === 6 || y === 10))) {
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
    // Tots outdoor bar specific elements
    
    // Bar name and branding
    ctx.fillStyle = '#FF6B35'; // Orange branding
    ctx.font = 'bold 18px serif';
    ctx.textAlign = 'center';
    ctx.fillText('TOTS', 400 - this.cameraX, 35 - this.cameraY);
    
    ctx.fillStyle = '#2E86AB';
    ctx.font = 'bold 12px serif';
    ctx.fillText('Outdoor Bar & Grill', 400 - this.cameraX, 55 - this.cameraY);
    
    // Outdoor bar back with bottles
    ctx.fillStyle = '#8B4513'; // Wood bar back
    ctx.fillRect(80 - this.cameraX, 60 - this.cameraY, 150, 40);
    
    // Beer taps
    ctx.fillStyle = '#C0C0C0'; // Silver taps
    ctx.fillRect(90 - this.cameraX, 50 - this.cameraY, 4, 15);
    ctx.fillRect(110 - this.cameraX, 50 - this.cameraY, 4, 15);
    ctx.fillRect(130 - this.cameraX, 50 - this.cameraY, 4, 15);
    ctx.fillRect(150 - this.cameraX, 50 - this.cameraY, 4, 15);
    
    // Tap handles
    ctx.fillStyle = '#FF6B35';
    ctx.fillRect(88 - this.cameraX, 45 - this.cameraY, 8, 6);
    ctx.fillRect(108 - this.cameraX, 45 - this.cameraY, 8, 6);
    ctx.fillRect(128 - this.cameraX, 45 - this.cameraY, 8, 6);
    ctx.fillRect(148 - this.cameraX, 45 - this.cameraY, 8, 6);
    
    // Outdoor umbrellas above tables
    ctx.fillStyle = '#FF6B35';
    ctx.beginPath();
    ctx.arc(140 - this.cameraX, 250 - this.cameraY, 25, 0, Math.PI);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(290 - this.cameraX, 250 - this.cameraY, 25, 0, Math.PI);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(440 - this.cameraX, 250 - this.cameraY, 25, 0, Math.PI);
    ctx.fill();
    
    // Umbrella poles
    ctx.fillStyle = '#8B4513';
    ctx.fillRect(138 - this.cameraX, 250 - this.cameraY, 4, 40);
    ctx.fillRect(288 - this.cameraX, 250 - this.cameraY, 4, 40);
    ctx.fillRect(438 - this.cameraX, 250 - this.cameraY, 4, 40);
    
    // Stairs visualization
    ctx.fillStyle = '#8B4513'; // Brown wood stairs
    ctx.fillRect(520 - this.cameraX, 80 - this.cameraY, 80, 120);
    
    // Individual stair steps
    for (let i = 0; i < 6; i++) {
      ctx.fillStyle = '#A0522D';
      ctx.fillRect(525 - this.cameraX, 85 + i * 18 - this.cameraY, 70 - i * 8, 15);
    }
    
    // Stair railing
    ctx.fillStyle = '#654321';
    ctx.fillRect(522 - this.cameraX, 80 - this.cameraY, 3, 120);
    ctx.fillRect(597 - this.cameraX, 80 - this.cameraY, 3, 60);
    
    // "UPSTAIRS" sign
    ctx.fillStyle = '#FF6B35';
    ctx.fillRect(530 - this.cameraX, 60 - this.cameraY, 60, 15);
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '10px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('UPSTAIRS', 560 - this.cameraX, 70 - this.cameraY);
    
    // Outdoor patio string lights
    ctx.strokeStyle = '#FFD700';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(50 - this.cameraX, 120 - this.cameraY);
    ctx.lineTo(750 - this.cameraX, 120 - this.cameraY);
    ctx.stroke();
    
    // Light bulbs on string
    ctx.fillStyle = '#FFD700';
    for (let x = 100; x < 700; x += 80) {
      ctx.beginPath();
      ctx.arc(x - this.cameraX, 120 - this.cameraY, 4, 0, 2 * Math.PI);
      ctx.fill();
    }
    
    // Outdoor heaters
    ctx.fillStyle = '#2F2F2F';
    ctx.fillRect(200 - this.cameraX, 350 - this.cameraY, 12, 40);
    ctx.fillRect(500 - this.cameraX, 350 - this.cameraY, 12, 40);
    
    // Heater tops
    ctx.fillStyle = '#FF4500';
    ctx.fillRect(195 - this.cameraX, 345 - this.cameraY, 22, 8);
    ctx.fillRect(495 - this.cameraX, 345 - this.cameraY, 22, 8);
    
    // Table numbers
    ctx.fillStyle = '#2E86AB';
    ctx.font = '10px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('1', 140 - this.cameraX, 270 - this.cameraY);
    ctx.fillText('2', 290 - this.cameraX, 270 - this.cameraY);
    ctx.fillText('3', 440 - this.cameraX, 270 - this.cameraY);
    ctx.fillText('4', 590 - this.cameraX, 270 - this.cameraY);
    ctx.fillText('5', 140 - this.cameraX, 370 - this.cameraY);
    ctx.fillText('6', 290 - this.cameraX, 370 - this.cameraY);
    ctx.fillText('7', 440 - this.cameraX, 370 - this.cameraY);
    
    // Outdoor wooden deck pattern
    ctx.fillStyle = '#D2B48C';
    ctx.globalAlpha = 0.3;
    for (let x = 0; x < 800; x += 40) {
      ctx.fillRect(x - this.cameraX, 0 - this.cameraY, 2, 600);
    }
    ctx.globalAlpha = 1.0;
    
    // Bar menu board
    ctx.fillStyle = '#2F2F2F';
    ctx.fillRect(250 - this.cameraX, 80 - this.cameraY, 120, 60);
    
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '12px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('BAR MENU', 310 - this.cameraX, 95 - this.cameraY);
    
    ctx.font = '9px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('• Craft Beer ....... $5', 260 - this.cameraX, 110 - this.cameraY);
    ctx.fillText('• Cocktails ........ $8', 260 - this.cameraX, 122 - this.cameraY);
    ctx.fillText('• Tot Nachos ..... $12', 260 - this.cameraX, 134 - this.cameraY);
  }
}

export default TotsDownstairs;
