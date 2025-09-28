import BaseOffCampusBuilding from './BaseOffCampusBuilding';
import { SceneType } from '../types';

class CentrosInterior extends BaseOffCampusBuilding {
  public type: SceneType = 'centros';

  protected getBuildingName(): string {
    return 'Centros - Dance Club';
  }

  protected getBuildingType(): 'apartment' | 'mixed_use' | 'commercial' {
    return 'commercial';
  }

  protected generateBuilding(): any[][] {
    const interior: any[][] = [];
    
    for (let y = 0; y < this.buildingHeight; y++) {
      interior[y] = [];
      for (let x = 0; x < this.buildingWidth; x++) {
        // Create the layout for Centros Dance Club
        
        // Outer walls
        if (x === 0 || x === this.buildingWidth - 1 || y === 0 || y === this.buildingHeight - 1) {
          interior[y][x] = { type: 'wall', solid: true };
        }
        // Exit door at bottom center
        else if (y === this.buildingHeight - 1 && x === Math.floor(this.buildingWidth / 2)) {
          interior[y][x] = { type: 'door', solid: false };
        }
        // DJ booth (back center)
        else if (x >= 8 && x <= 11 && y >= 2 && y <= 4) {
          interior[y][x] = { type: 'furniture', solid: true, furniture: 'desk' };
        }
        // Bar area (back left)
        else if (x >= 2 && x <= 6 && y >= 2 && y <= 3) {
          interior[y][x] = { type: 'furniture', solid: true, furniture: 'desk' };
        }
        // Bar stools
        else if (x >= 2 && x <= 6 && y === 4) {
          interior[y][x] = { type: 'furniture', solid: true, furniture: 'chair' };
        }
        // Coat check area
        else if (x === 1 && y >= 11 && y <= 12) {
          interior[y][x] = { type: 'furniture', solid: true, furniture: 'desk' };
        }
        // Standing cocktail tables around dance floor
        else if ((x === 4 && y === 10) ||
                 (x === 16 && y === 10) ||
                 (x === 4 && y === 7) ||
                 (x === 16 && y === 7)) {
          interior[y][x] = { type: 'furniture', solid: true, furniture: 'table' };
        }
        // Security/bouncer area near entrance
        else if (x >= 17 && x <= 18 && y >= 12 && y <= 13) {
          interior[y][x] = { type: 'furniture', solid: true, furniture: 'desk' };
        }
        // Windows (tinted for club atmosphere)
        else if (y === 0 && (x === 5 || x === 9 || x === 13 || x === 17)) {
          interior[y][x] = { type: 'window', solid: true };
        }
        // Dance floor (open space in center) - Floor
        else {
          interior[y][x] = { type: 'floor', solid: false };
        }
      }
    }
    
    return interior;
  }

  protected renderBuildingSpecificElements(ctx: CanvasRenderingContext2D): void {
    // Centros Dance Club specific elements
    
    // Club name with neon styling
    ctx.fillStyle = '#FF1493'; // Deep pink neon
    ctx.font = 'bold 24px serif';
    ctx.textAlign = 'center';
    ctx.fillText('CENTROS', 400 - this.cameraX, 35 - this.cameraY);
    
    ctx.fillStyle = '#00FFFF'; // Cyan neon
    ctx.font = 'bold 14px serif';
    ctx.fillText('DANCE CLUB', 400 - this.cameraX, 55 - this.cameraY);
    
    // DJ booth with equipment
    ctx.fillStyle = '#2F2F2F'; // Dark DJ booth
    ctx.fillRect(280 - this.cameraX, 75 - this.cameraY, 130, 80);
    
    // DJ turntables
    ctx.fillStyle = '#C0C0C0'; // Silver turntables
    ctx.beginPath();
    ctx.arc(310 - this.cameraX, 110 - this.cameraY, 15, 0, 2 * Math.PI);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(380 - this.cameraX, 110 - this.cameraY, 15, 0, 2 * Math.PI);
    ctx.fill();
    
    // DJ mixer
    ctx.fillStyle = '#000000';
    ctx.fillRect(330 - this.cameraX, 100 - this.cameraY, 40, 20);
    
    // DJ controls/sliders
    ctx.fillStyle = '#FF0000';
    ctx.fillRect(335 - this.cameraX, 105 - this.cameraY, 2, 10);
    ctx.fillRect(345 - this.cameraX, 105 - this.cameraY, 2, 10);
    ctx.fillRect(355 - this.cameraX, 105 - this.cameraY, 2, 10);
    ctx.fillRect(365 - this.cameraX, 105 - this.cameraY, 2, 10);
    
    // Speakers (large ones)
    ctx.fillStyle = '#000000';
    ctx.fillRect(50 - this.cameraX, 80 - this.cameraY, 30, 60);
    ctx.fillRect(720 - this.cameraX, 80 - this.cameraY, 30, 60);
    
    // Speaker cones
    ctx.fillStyle = '#444444';
    ctx.beginPath();
    ctx.arc(65 - this.cameraX, 100 - this.cameraY, 12, 0, 2 * Math.PI);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(65 - this.cameraX, 120 - this.cameraY, 8, 0, 2 * Math.PI);
    ctx.fill();
    
    ctx.beginPath();
    ctx.arc(735 - this.cameraX, 100 - this.cameraY, 12, 0, 2 * Math.PI);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(735 - this.cameraX, 120 - this.cameraY, 8, 0, 2 * Math.PI);
    ctx.fill();
    
    // Bar area with bottles
    ctx.fillStyle = '#8B4513'; // Wood bar
    ctx.fillRect(80 - this.cameraX, 80 - this.cameraY, 150, 30);
    
    // Liquor bottles on bar
    ctx.fillStyle = '#228B22'; // Green bottles
    ctx.fillRect(90 - this.cameraX, 70 - this.cameraY, 4, 15);
    ctx.fillRect(100 - this.cameraX, 70 - this.cameraY, 4, 15);
    ctx.fillRect(110 - this.cameraX, 70 - this.cameraY, 4, 15);
    
    ctx.fillStyle = '#8B4513'; // Brown bottles
    ctx.fillRect(120 - this.cameraX, 70 - this.cameraY, 4, 15);
    ctx.fillRect(130 - this.cameraX, 70 - this.cameraY, 4, 15);
    
    ctx.fillStyle = '#FF6347'; // Red bottles
    ctx.fillRect(140 - this.cameraX, 70 - this.cameraY, 4, 15);
    ctx.fillRect(150 - this.cameraX, 70 - this.cameraY, 4, 15);
    
    // Disco ball
    ctx.fillStyle = '#C0C0C0'; // Silver disco ball
    ctx.beginPath();
    ctx.arc(400 - this.cameraX, 180 - this.cameraY, 20, 0, 2 * Math.PI);
    ctx.fill();
    
    // Disco ball reflection squares
    ctx.fillStyle = '#FFFFFF';
    for (let i = 0; i < 8; i++) {
      const angle = (i * Math.PI) / 4;
      const x = 400 + Math.cos(angle) * 15 - this.cameraX;
      const y = 180 + Math.sin(angle) * 15 - this.cameraY;
      ctx.fillRect(x - 2, y - 2, 4, 4);
    }
    
    // Dance floor lighting effects
    const time = Date.now() * 0.003;
    const colors = ['#FF1493', '#00FFFF', '#FF4500', '#32CD32', '#9400D3', '#FFD700'];
    
    // Animated floor spots
    for (let i = 0; i < 6; i++) {
      const x = 200 + (i % 3) * 150;
      const y = 250 + Math.floor(i / 3) * 100;
      const colorIndex = Math.floor(time + i) % colors.length;
      
      ctx.fillStyle = colors[colorIndex];
      ctx.globalAlpha = 0.3 + 0.3 * Math.sin(time * 2 + i);
      ctx.beginPath();
      ctx.arc(x - this.cameraX, y - this.cameraY, 30, 0, 2 * Math.PI);
      ctx.fill();
    }
    ctx.globalAlpha = 1.0;
    
    // Strobe light effects
    ctx.fillStyle = '#FFFFFF';
    ctx.globalAlpha = 0.1 + 0.1 * Math.sin(time * 10);
    ctx.fillRect(0 - this.cameraX, 0 - this.cameraY, 800, 600);
    ctx.globalAlpha = 1.0;
    
    // Neon wall decorations
    ctx.strokeStyle = '#FF1493';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(100 - this.cameraX, 200 - this.cameraY);
    ctx.lineTo(200 - this.cameraX, 180 - this.cameraY);
    ctx.lineTo(300 - this.cameraX, 200 - this.cameraY);
    ctx.stroke();
    
    ctx.strokeStyle = '#00FFFF';
    ctx.beginPath();
    ctx.moveTo(500 - this.cameraX, 200 - this.cameraY);
    ctx.lineTo(600 - this.cameraX, 180 - this.cameraY);
    ctx.lineTo(700 - this.cameraX, 200 - this.cameraY);
    ctx.stroke();
    
    // Dance floor boundary/stage edge
    ctx.fillStyle = '#FFD700';
    ctx.fillRect(150 - this.cameraX, 240 - this.cameraY, 500, 4);
    
    // Sound equalizer visualization
    ctx.fillStyle = '#00FF00';
    for (let i = 0; i < 20; i++) {
      const height = 20 + 40 * Math.sin(time * 5 + i * 0.5);
      ctx.fillRect(300 + i * 10 - this.cameraX, 140 - height - this.cameraY, 8, height);
    }
    
    // Entry rope/queue area
    ctx.strokeStyle = '#8B0000';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(550 - this.cameraX, 380 - this.cameraY);
    ctx.lineTo(600 - this.cameraX, 400 - this.cameraY);
    ctx.lineTo(650 - this.cameraX, 380 - this.cameraY);
    ctx.stroke();
  }
}

export default CentrosInterior;
