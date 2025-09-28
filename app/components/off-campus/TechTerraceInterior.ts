import BaseOffCampusBuilding from './BaseOffCampusBuilding';
import { SceneType } from '../types';

class TechTerraceInterior extends BaseOffCampusBuilding {
  public type: SceneType = 'techterrace';

  protected getBuildingName(): string {
    return 'Tech Terrace - Student Apartment Complex';
  }

  protected getBuildingType(): 'apartment' | 'mixed_use' | 'commercial' {
    return 'apartment';
  }

  protected generateBuilding(): any[][] {
    const interior: any[][] = [];
    
    for (let y = 0; y < this.buildingHeight; y++) {
      interior[y] = [];
      for (let x = 0; x < this.buildingWidth; x++) {
        // Create the layout for a 4-bedroom apartment with kitchen, living room, and private bathrooms
        
        // Outer walls
        if (x === 0 || x === this.buildingWidth - 1 || y === 0 || y === this.buildingHeight - 1) {
          interior[y][x] = { type: 'wall', solid: true };
        }
        // Entry door at bottom center
        else if (y === this.buildingHeight - 1 && x === Math.floor(this.buildingWidth / 2)) {
          interior[y][x] = { type: 'door', solid: false };
        }
        
        // LIVING ROOM (center area)
        else if (x >= 7 && x <= 12 && y >= 10 && y <= 13) {
          // TV on wall
          if (x === 7 && y === 11) {
            interior[y][x] = { type: 'furniture', solid: true, furniture: 'tv' };
          }
          // Couch facing TV
          else if (x >= 9 && x <= 11 && y === 12) {
            interior[y][x] = { type: 'furniture', solid: true, furniture: 'couch' };
          }
          // Coffee table
          else if (x === 10 && y === 11) {
            interior[y][x] = { type: 'furniture', solid: true, furniture: 'table' };
          }
          else {
            interior[y][x] = { type: 'floor', solid: false };
          }
        }
        
        // KITCHEN (right side)
        else if (x >= 13 && x <= 17 && y >= 10 && y <= 13) {
          // Refrigerator
          if (x === 13 && y === 10) {
            interior[y][x] = { type: 'furniture', solid: true, furniture: 'refrigerator' };
          }
          // Kitchen counter/stove
          else if (x >= 14 && x <= 16 && y === 10) {
            interior[y][x] = { type: 'furniture', solid: true, furniture: 'counter' };
          }
          // Sink
          else if (x === 17 && y === 11) {
            interior[y][x] = { type: 'furniture', solid: true, furniture: 'sink' };
          }
          // Dining table
          else if (x >= 14 && x <= 15 && y === 12) {
            interior[y][x] = { type: 'furniture', solid: true, furniture: 'table' };
          }
          // Dining chairs
          else if ((x === 13 && y === 12) || (x === 16 && y === 12)) {
            interior[y][x] = { type: 'furniture', solid: true, furniture: 'chair' };
          }
          else {
            interior[y][x] = { type: 'floor', solid: false };
          }
        }
        
        // BEDROOM 1 (top left)
        else if (x >= 2 && x <= 6 && y >= 2 && y <= 6) {
          // Bedroom 1 walls
          if (x === 6 && y >= 2 && y <= 6) {
            interior[y][x] = { type: 'wall', solid: true };
          }
          else if (y === 6 && x >= 2 && x <= 5) {
            interior[y][x] = { type: 'wall', solid: true };
          }
          // Bedroom 1 door
          else if (x === 5 && y === 6) {
            interior[y][x] = { type: 'door', solid: false };
          }
          // Bed
          else if (x >= 3 && x <= 4 && y >= 3 && y <= 4) {
            interior[y][x] = { type: 'furniture', solid: true, furniture: 'bed' };
          }
          // Desk
          else if (x === 2 && y === 5) {
            interior[y][x] = { type: 'furniture', solid: true, furniture: 'desk' };
          }
          else {
            interior[y][x] = { type: 'floor', solid: false };
          }
        }
        
        // BEDROOM 2 (top right)
        else if (x >= 13 && x <= 17 && y >= 2 && y <= 6) {
          // Bedroom 2 walls
          if (x === 13 && y >= 2 && y <= 6) {
            interior[y][x] = { type: 'wall', solid: true };
          }
          else if (y === 6 && x >= 14 && x <= 17) {
            interior[y][x] = { type: 'wall', solid: true };
          }
          // Bedroom 2 door
          else if (x === 14 && y === 6) {
            interior[y][x] = { type: 'door', solid: false };
          }
          // Bed
          else if (x >= 15 && x <= 16 && y >= 3 && y <= 4) {
            interior[y][x] = { type: 'furniture', solid: true, furniture: 'bed' };
          }
          // Dresser
          else if (x === 17 && y === 5) {
            interior[y][x] = { type: 'furniture', solid: true, furniture: 'dresser' };
          }
          else {
            interior[y][x] = { type: 'floor', solid: false };
          }
        }
        
        // BEDROOM 3 (bottom left)
        else if (x >= 2 && x <= 6 && y >= 9 && y <= 13) {
          // Bedroom 3 walls
          if (x === 6 && y >= 9 && y <= 13) {
            interior[y][x] = { type: 'wall', solid: true };
          }
          else if (y === 9 && x >= 2 && x <= 5) {
            interior[y][x] = { type: 'wall', solid: true };
          }
          // Bedroom 3 door
          else if (x === 5 && y === 9) {
            interior[y][x] = { type: 'door', solid: false };
          }
          // Bed
          else if (x >= 3 && x <= 4 && y >= 10 && y <= 11) {
            interior[y][x] = { type: 'furniture', solid: true, furniture: 'bed' };
          }
          // Chair
          else if (x === 2 && y === 12) {
            interior[y][x] = { type: 'furniture', solid: true, furniture: 'chair' };
          }
          else {
            interior[y][x] = { type: 'floor', solid: false };
          }
        }
        
        // BEDROOM 4 (center back)
        else if (x >= 8 && x <= 12 && y >= 2 && y <= 6) {
          // Bedroom 4 walls
          if (y === 6 && x >= 8 && x <= 12) {
            interior[y][x] = { type: 'wall', solid: true };
          }
          // Bedroom 4 door
          else if (x === 10 && y === 6) {
            interior[y][x] = { type: 'door', solid: false };
          }
          // Bed
          else if (x >= 9 && x <= 10 && y >= 3 && y <= 4) {
            interior[y][x] = { type: 'furniture', solid: true, furniture: 'bed' };
          }
          // Dresser
          else if (x === 11 && y === 5) {
            interior[y][x] = { type: 'furniture', solid: true, furniture: 'dresser' };
          }
          else {
            interior[y][x] = { type: 'floor', solid: false };
          }
        }
        
        // Windows
        else if ((y === 0 && (x === 3 || x === 5 || x === 9 || x === 11 || x === 15 || x === 17)) ||
                 (x === 0 && (y === 3 || y === 5 || y === 10 || y === 12)) ||
                 (x === this.buildingWidth - 1 && (y === 3 || y === 5 || y === 10 || y === 12))) {
          interior[y][x] = { type: 'window', solid: true };
        }
        
        // Floor for hallways and other areas
        else {
          interior[y][x] = { type: 'floor', solid: false };
        }
      }
    }
    
    return interior;
  }

  protected renderBuildingSpecificElements(ctx: CanvasRenderingContext2D): void {
    // 4-Bedroom Apartment Interior Rendering with Tech Terrace theme
    
    // Apartment title
    ctx.fillStyle = '#8B4513'; // Brown color theme
    ctx.font = 'bold 20px serif';
    ctx.textAlign = 'center';
    ctx.fillText('TECH TERRACE - 4BR APARTMENT', 400 - this.cameraX, 35 - this.cameraY);
    
    // LIVING ROOM ELEMENTS
    // TV Screen (wall-mounted)
    ctx.fillStyle = '#000000'; // TV frame
    ctx.fillRect(224 - this.cameraX, 352 - this.cameraY, 48, 32);
    ctx.fillStyle = '#1E3A8A'; // TV screen
    ctx.fillRect(228 - this.cameraX, 356 - this.cameraY, 40, 24);
    
    // TV stand/mount
    ctx.fillStyle = '#4B5563';
    ctx.fillRect(240 - this.cameraX, 384 - this.cameraY, 16, 8);
    
    // Coffee table details
    ctx.fillStyle = '#8B4513'; // Brown wood - matching building theme
    ctx.fillRect(320 - this.cameraX, 352 - this.cameraY, 32, 32);
    // Items on coffee table
    ctx.fillStyle = '#FFD700';
    ctx.fillRect(325 - this.cameraX, 357 - this.cameraY, 6, 8); // Remote
    ctx.fillStyle = '#FF6B6B';
    ctx.fillRect(335 - this.cameraX, 362 - this.cameraY, 8, 4); // Magazine
    
    // Couch details - brown theme
    ctx.fillStyle = '#8B4513'; // Brown couch
    ctx.fillRect(288 - this.cameraX, 384 - this.cameraY, 96, 32);
    // Couch cushions
    ctx.fillStyle = '#A0522D';
    ctx.fillRect(292 - this.cameraX, 388 - this.cameraY, 20, 24);
    ctx.fillRect(316 - this.cameraX, 388 - this.cameraY, 20, 24);
    ctx.fillRect(340 - this.cameraX, 388 - this.cameraY, 20, 24);
    ctx.fillRect(364 - this.cameraX, 388 - this.cameraY, 20, 24);
    
    // KITCHEN ELEMENTS
    // Refrigerator details
    ctx.fillStyle = '#F8F9FA'; // White refrigerator
    ctx.fillRect(416 - this.cameraX, 320 - this.cameraY, 32, 64);
    ctx.fillStyle = '#6C757D'; // Handle
    ctx.fillRect(444 - this.cameraX, 342 - this.cameraY, 2, 20);
    ctx.fillStyle = '#000000'; // Door line
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(416 - this.cameraX, 352 - this.cameraY);
    ctx.lineTo(448 - this.cameraX, 352 - this.cameraY);
    ctx.stroke();
    // Add subtle glow effect to indicate it's interactive
    ctx.save();
    ctx.shadowColor = '#4ECDC4';
    ctx.shadowBlur = 4;
    ctx.strokeStyle = '#4ECDC4';
    ctx.lineWidth = 1;
    ctx.strokeRect(416 - this.cameraX, 320 - this.cameraY, 32, 64);
    ctx.restore();
    
    // Kitchen counter/stove
    ctx.fillStyle = '#8B4513'; // Brown counters to match theme
    ctx.fillRect(448 - this.cameraX, 320 - this.cameraY, 96, 32);
    // Stove burners
    ctx.fillStyle = '#374151';
    ctx.beginPath();
    ctx.arc(464 - this.cameraX, 336 - this.cameraY, 6, 0, 2 * Math.PI);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(488 - this.cameraX, 336 - this.cameraY, 6, 0, 2 * Math.PI);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(512 - this.cameraX, 336 - this.cameraY, 6, 0, 2 * Math.PI);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(528 - this.cameraX, 336 - this.cameraY, 6, 0, 2 * Math.PI);
    ctx.fill();
    
    // Kitchen sink
    ctx.fillStyle = '#9CA3AF'; // Sink color
    ctx.fillRect(544 - this.cameraX, 352 - this.cameraY, 32, 24);
    ctx.fillStyle = '#6B7280'; // Faucet
    ctx.fillRect(556 - this.cameraX, 347 - this.cameraY, 8, 12);
    
    // Dining table and chairs - brown theme
    ctx.fillStyle = '#8B4513'; // Brown wood table
    ctx.fillRect(448 - this.cameraX, 384 - this.cameraY, 64, 32);
    // Chairs
    ctx.fillStyle = '#A0522D';
    ctx.fillRect(416 - this.cameraX, 384 - this.cameraY, 24, 32); // Left chair
    ctx.fillRect(520 - this.cameraX, 384 - this.cameraY, 24, 32); // Right chair
    
    // BEDROOM DETAILS
    // Bedroom 1 (top left) - Orange theme
    ctx.fillStyle = '#FF8C00'; // Orange bed
    ctx.fillRect(96 - this.cameraX, 96 - this.cameraY, 64, 64);
    ctx.fillStyle = '#FFE4B5'; // Light orange pillow
    ctx.fillRect(100 - this.cameraX, 100 - this.cameraY, 24, 16);
    ctx.fillStyle = '#FFA500'; // Orange blanket
    ctx.fillRect(100 - this.cameraX, 120 - this.cameraY, 56, 36);
    
    // Desk in bedroom 1
    ctx.fillStyle = '#8B4513'; // Brown desk
    ctx.fillRect(64 - this.cameraX, 160 - this.cameraY, 32, 32);
    
    // Bedroom 2 (top right) - Maroon theme
    ctx.fillStyle = '#800000'; // Maroon bed
    ctx.fillRect(480 - this.cameraX, 96 - this.cameraY, 64, 64);
    ctx.fillStyle = '#FFB6C1'; // Light pink pillow
    ctx.fillRect(484 - this.cameraX, 100 - this.cameraY, 24, 16);
    ctx.fillStyle = '#DC143C'; // Crimson blanket
    ctx.fillRect(484 - this.cameraX, 120 - this.cameraY, 56, 36);
    
    // Dresser in bedroom 2
    ctx.fillStyle = '#8B4513';
    ctx.fillRect(544 - this.cameraX, 160 - this.cameraY, 32, 32);
    
    // Bedroom 3 (bottom left) - Hokies colors
    ctx.fillStyle = '#660000'; // Deep maroon bed
    ctx.fillRect(96 - this.cameraX, 320 - this.cameraY, 64, 64);
    ctx.fillStyle = '#FFF8DC'; // Cornsilk pillow
    ctx.fillRect(100 - this.cameraX, 324 - this.cameraY, 24, 16);
    ctx.fillStyle = '#FF8C00'; // Orange blanket
    ctx.fillRect(100 - this.cameraX, 344 - this.cameraY, 56, 36);
    
    // Chair in bedroom 3
    ctx.fillStyle = '#8B4513';
    ctx.fillRect(64 - this.cameraX, 384 - this.cameraY, 32, 32);
    
    // Bedroom 4 (center back) - Brown theme
    ctx.fillStyle = '#8B4513'; // Brown bed
    ctx.fillRect(288 - this.cameraX, 96 - this.cameraY, 64, 64);
    ctx.fillStyle = '#DEB887'; // Burlywood pillow
    ctx.fillRect(292 - this.cameraX, 100 - this.cameraY, 24, 16);
    ctx.fillStyle = '#D2691E'; // Chocolate blanket
    ctx.fillRect(292 - this.cameraX, 120 - this.cameraY, 56, 36);
    
    // Dresser in bedroom 4
    ctx.fillStyle = '#8B4513';
    ctx.fillRect(352 - this.cameraX, 160 - this.cameraY, 32, 32);
    
    // ROOM LABELS
    ctx.fillStyle = '#654321'; // Dark brown text
    ctx.font = 'bold 12px sans-serif';
    ctx.textAlign = 'center';
    
    // Living room label
    ctx.fillText('LIVING ROOM', 320 - this.cameraX, 372 - this.cameraY);
    
    // Kitchen label
    ctx.fillText('KITCHEN', 480 - this.cameraX, 372 - this.cameraY);
    
    // Bedroom labels
    ctx.font = '10px sans-serif';
    ctx.fillText('BR1', 128 - this.cameraX, 140 - this.cameraY);
    ctx.fillText('BR2', 512 - this.cameraX, 140 - this.cameraY);
    ctx.fillText('BR3', 128 - this.cameraX, 360 - this.cameraY);
    ctx.fillText('BR4', 320 - this.cameraX, 140 - this.cameraY);
    
    // Add apartment features text
    ctx.fillStyle = '#8B4513'; // Brown theme
    ctx.font = '10px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('• 4 Private Bedrooms', 20 - this.cameraX, 50 - this.cameraY);
    ctx.fillText('• Full Kitchen w/ Refrigerator', 20 - this.cameraX, 65 - this.cameraY);
    ctx.fillText('• Spacious Living Room w/ TV', 20 - this.cameraX, 80 - this.cameraY);
    ctx.fillText('• Tech Terrace - Brown Building Theme', 20 - this.cameraX, 95 - this.cameraY);
    
    // Floor pattern for common areas with brown theme
    ctx.strokeStyle = '#DEB887'; // Burlywood floor lines
    ctx.lineWidth = 1;
    for (let x = 224; x < 576; x += 16) {
      for (let y = 320; y < 416; y += 16) {
        if (x >= 224 && x <= 384 && y >= 320 && y <= 416) { // Living room area
          ctx.strokeRect(x - this.cameraX, y - this.cameraY, 16, 16);
        }
      }
    }
  }
}

export default TechTerraceInterior;
