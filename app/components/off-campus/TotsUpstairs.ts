import BaseOffCampusBuilding from './BaseOffCampusBuilding';
import { SceneType } from '../types';

class TotsUpstairs extends BaseOffCampusBuilding {
  public type: SceneType = 'tots_upstairs';

  protected getBuildingName(): string {
    return 'Tots - Dance Floor & Photo Spot (Upstairs)';
  }

  protected getBuildingType(): 'apartment' | 'mixed_use' | 'commercial' {
    return 'commercial';
  }

  protected generateBuilding(): any[][] {
    const interior: any[][] = [];
    
    for (let y = 0; y < this.buildingHeight; y++) {
      interior[y] = [];
      for (let x = 0; x < this.buildingWidth; x++) {
        // Create the layout for Tots upstairs
        
        // Outer walls
        if (x === 0 || x === this.buildingWidth - 1 || y === 0 || y === this.buildingHeight - 1) {
          interior[y][x] = { type: 'wall', solid: true };
        }
        // Stairs down (back right)
        else if (x >= 16 && x <= 18 && y >= 2 && y <= 5) {
          interior[y][x] = { type: 'stairs', solid: false };
        }
        // VT photo spot area (left half) - mostly open space with some furniture for photo staging
        else if (x >= 2 && x <= 3 && y >= 6 && y <= 7) {
          interior[y][x] = { type: 'furniture', solid: true, furniture: 'couch' };
        }
        else if (x >= 2 && x <= 3 && y >= 10 && y <= 11) {
          interior[y][x] = { type: 'furniture', solid: true, furniture: 'couch' };
        }
        // Small cocktail tables for drinks in photo area
        else if ((x === 5 && y === 8) || (x === 5 && y === 12)) {
          interior[y][x] = { type: 'furniture', solid: true, furniture: 'table' };
        }
        // Dance floor area (right half) - mostly open space
        else if ((x === 12 && y === 8) || (x === 12 && y === 11)) {
          interior[y][x] = { type: 'furniture', solid: true, furniture: 'table' };
        }
        // DJ booth for dance floor
        else if (x >= 14 && x <= 15 && y >= 12 && y <= 13) {
          interior[y][x] = { type: 'furniture', solid: true, furniture: 'desk' };
        }
        // Windows along front
        else if (y === 0 && (x === 5 || x === 9 || x === 13)) {
          interior[y][x] = { type: 'window', solid: true };
        }
        // Floor - everything else is open dance floor and photo space
        else {
          interior[y][x] = { type: 'floor', solid: false };
        }
      }
    }
    
    return interior;
  }

  protected renderBuildingSpecificElements(ctx: CanvasRenderingContext2D): void {
    // Tots upstairs specific elements
    
    // Venue name
    ctx.fillStyle = '#FF6B35'; // Orange branding
    ctx.font = 'bold 18px serif';
    ctx.textAlign = 'center';
    ctx.fillText('TOTS UPSTAIRS', 400 - this.cameraX, 35 - this.cameraY);
    
    ctx.fillStyle = '#2E86AB';
    ctx.font = 'bold 12px serif';
    ctx.fillText('Dance Floor & VT Photo Spot', 400 - this.cameraX, 55 - this.cameraY);
    
    // Massive VT sign (photo spot area - left half)
    const vtSignX = 200;
    const vtSignY = 200;
    const signWidth = 180;
    const signHeight = 120;
    
    // VT sign background
    ctx.fillStyle = '#8B0000'; // VT Maroon background
    ctx.fillRect(vtSignX - this.cameraX, vtSignY - this.cameraY, signWidth, signHeight);
    
    // Orange neon border effect
    ctx.strokeStyle = '#FF8C00'; // VT Orange neon
    ctx.lineWidth = 8;
    ctx.strokeRect(vtSignX - 4 - this.cameraX, vtSignY - 4 - this.cameraY, signWidth + 8, signHeight + 8);
    
    // Inner orange glow
    ctx.strokeStyle = '#FFB347'; // Lighter orange
    ctx.lineWidth = 4;
    ctx.strokeRect(vtSignX - 2 - this.cameraX, vtSignY - 2 - this.cameraY, signWidth + 4, signHeight + 4);
    
    // VT Letters
    ctx.fillStyle = '#FF8C00'; // VT Orange
    ctx.font = 'bold 72px serif';
    ctx.textAlign = 'center';
    ctx.fillText('VT', vtSignX + signWidth/2 - this.cameraX, vtSignY + signHeight/2 + 25 - this.cameraY);
    
    // Orange neon glow effect around letters
    ctx.shadowColor = '#FF8C00';
    ctx.shadowBlur = 20;
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 72px serif';
    ctx.fillText('VT', vtSignX + signWidth/2 - this.cameraX, vtSignY + signHeight/2 + 25 - this.cameraY);
    ctx.shadowBlur = 0;
    
    // "PHOTO SPOT" text below VT sign
    ctx.fillStyle = '#FFD700'; // Gold
    ctx.font = 'bold 16px serif';
    ctx.textAlign = 'center';
    ctx.fillText('📸 PHOTO SPOT 📸', vtSignX + signWidth/2 - this.cameraX, vtSignY + signHeight + 25 - this.cameraY);
    
    // Photo area decorations
    ctx.fillStyle = '#8B0000';
    ctx.fillRect(50 - this.cameraX, 150 - this.cameraY, 30, 30);
    ctx.fillStyle = '#FF8C00';
    ctx.fillRect(55 - this.cameraX, 155 - this.cameraY, 20, 20);
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 12px serif';
    ctx.textAlign = 'center';
    ctx.fillText('VT', 65 - this.cameraX, 168 - this.cameraY);
    
    // Dance floor area (right half)
    ctx.fillStyle = '#2E86AB';
    ctx.font = 'bold 16px serif';
    ctx.textAlign = 'center';
    ctx.fillText('🕺 DANCE FLOOR 💃', 550 - this.cameraX, 150 - this.cameraY);
    
    // Dance floor lighting
    const time = Date.now() * 0.003;
    const danceColors = ['#FF6B35', '#2E86AB', '#FF8C00', '#8B0000'];
    
    // Animated dance floor spots
    for (let i = 0; i < 4; i++) {
      const x = 450 + (i % 2) * 80;
      const y = 200 + Math.floor(i / 2) * 80;
      const colorIndex = Math.floor(time + i) % danceColors.length;
      
      ctx.fillStyle = danceColors[colorIndex];
      ctx.globalAlpha = 0.4 + 0.3 * Math.sin(time * 3 + i);
      ctx.beginPath();
      ctx.arc(x - this.cameraX, y - this.cameraY, 35, 0, 2 * Math.PI);
      ctx.fill();
    }
    ctx.globalAlpha = 1.0;
    
    // DJ booth equipment
    ctx.fillStyle = '#2F2F2F';
    ctx.fillRect(460 - this.cameraX, 380 - this.cameraY, 80, 40);
    
    // DJ turntables
    ctx.fillStyle = '#C0C0C0';
    ctx.beginPath();
    ctx.arc(480 - this.cameraX, 400 - this.cameraY, 12, 0, 2 * Math.PI);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(520 - this.cameraX, 400 - this.cameraY, 12, 0, 2 * Math.PI);
    ctx.fill();
    
    // DJ mixer
    ctx.fillStyle = '#000000';
    ctx.fillRect(485 - this.cameraX, 395 - this.cameraY, 30, 10);
    
    // Stairs visualization (going down)
    ctx.fillStyle = '#8B4513'; // Brown wood stairs
    ctx.fillRect(520 - this.cameraX, 80 - this.cameraY, 80, 120);
    
    // Individual stair steps (going down)
    for (let i = 0; i < 6; i++) {
      ctx.fillStyle = '#A0522D';
      ctx.fillRect(525 - this.cameraX, 190 - i * 18 - this.cameraY, 70 - (5-i) * 8, 15);
    }
    
    // Stair railing
    ctx.fillStyle = '#654321';
    ctx.fillRect(522 - this.cameraX, 80 - this.cameraY, 3, 120);
    ctx.fillRect(597 - this.cameraX, 140 - this.cameraY, 3, 60);
    
    // "DOWNSTAIRS" sign
    ctx.fillStyle = '#FF6B35';
    ctx.fillRect(530 - this.cameraX, 210 - this.cameraY, 60, 15);
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '10px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('DOWNSTAIRS', 560 - this.cameraX, 220 - this.cameraY);
    
    // Overhead party lighting
    ctx.fillStyle = '#FFD700';
    for (let x = 100; x < 700; x += 100) {
      ctx.beginPath();
      ctx.arc(x - this.cameraX, 100 - this.cameraY, 6, 0, 2 * Math.PI);
      ctx.fill();
      
      // Light beams
      ctx.fillStyle = '#FFFF00';
      ctx.globalAlpha = 0.1;
      ctx.beginPath();
      ctx.moveTo(x - this.cameraX, 100 - this.cameraY);
      ctx.lineTo(x - 20 - this.cameraX, 300 - this.cameraY);
      ctx.lineTo(x + 20 - this.cameraX, 300 - this.cameraY);
      ctx.closePath();
      ctx.fill();
      ctx.globalAlpha = 1.0;
      ctx.fillStyle = '#FFD700';
    }
    
    // VT spirit decorations around the room
    ctx.fillStyle = '#8B0000';
    ctx.font = '20px serif';
    ctx.textAlign = 'left';
    ctx.fillText('🏈', 50 - this.cameraX, 400 - this.cameraY);
    ctx.fillText('🏈', 650 - this.cameraX, 350 - this.cameraY);
    
    ctx.fillStyle = '#FF8C00';
    ctx.fillText('🦃', 680 - this.cameraX, 200 - this.cameraY);
    ctx.fillText('🦃', 80 - this.cameraX, 350 - this.cameraY);
    
    // Floor boundary between photo area and dance floor
    ctx.strokeStyle = '#FFD700';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(400 - this.cameraX, 150 - this.cameraY);
    ctx.lineTo(400 - this.cameraX, 450 - this.cameraY);
    ctx.stroke();
    
    // "Go Hokies!" text
    ctx.fillStyle = '#8B0000';
    ctx.font = 'bold 14px serif';
    ctx.textAlign = 'center';
    ctx.fillText('GO HOKIES!', 600 - this.cameraX, 450 - this.cameraY);
  }

  // Override exit position to go back downstairs
  public getExitPosition(): { x: number, y: number, scene: SceneType } {
    return { x: this.exitX, y: this.exitY, scene: 'tots' };
  }
}

export default TotsUpstairs;
