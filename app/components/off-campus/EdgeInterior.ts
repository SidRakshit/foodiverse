import BaseOffCampusBuilding from './BaseOffCampusBuilding';
import { SceneType } from '../types';

class EdgeInterior extends BaseOffCampusBuilding {
  public type: SceneType = 'edge';

  protected getBuildingName(): string {
    return 'The Edge - Student Apartment Complex';
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
        else if (x >= 7 && x <= 12 && y >= 9 && y <= 12) {
          // TV on wall
          if (x === 7 && y === 10) {
            interior[y][x] = { type: 'furniture', solid: true, furniture: 'tv' };
          }
          // Couch facing TV
          else if (x >= 9 && x <= 11 && y === 11) {
            interior[y][x] = { type: 'furniture', solid: true, furniture: 'couch' };
          }
          // Coffee table
          else if (x === 10 && y === 10) {
            interior[y][x] = { type: 'furniture', solid: true, furniture: 'table' };
          }
          else {
            interior[y][x] = { type: 'floor', solid: false };
          }
        }
        
        // KITCHEN (right side)
        else if (x >= 13 && x <= 17 && y >= 9 && y <= 12) {
          // Refrigerator
          if (x === 13 && y === 9) {
            interior[y][x] = { type: 'furniture', solid: true, furniture: 'refrigerator' };
          }
          // Kitchen counter/stove
          else if (x >= 14 && x <= 16 && y === 9) {
            interior[y][x] = { type: 'furniture', solid: true, furniture: 'counter' };
          }
          // Sink
          else if (x === 17 && y === 10) {
            interior[y][x] = { type: 'furniture', solid: true, furniture: 'sink' };
          }
          // Dining table
          else if (x >= 14 && x <= 15 && y === 11) {
          interior[y][x] = { type: 'furniture', solid: true, furniture: 'table' };
          }
          // Dining chairs
          else if ((x === 13 && y === 11) || (x === 16 && y === 11)) {
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
          // Dresser
          else if (x === 2 && y === 5) {
            interior[y][x] = { type: 'furniture', solid: true, furniture: 'dresser' };
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
          // Dresser
          else if (x === 2 && y === 12) {
            interior[y][x] = { type: 'furniture', solid: true, furniture: 'dresser' };
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
    // 4-Bedroom Apartment Interior Rendering
    
    // Apartment title
    ctx.fillStyle = '#2C3E50';
    ctx.font = 'bold 20px serif';
    ctx.textAlign = 'center';
    ctx.fillText('THE EDGE - 4BR APARTMENT', 400 - this.cameraX, 35 - this.cameraY);
    
    // LIVING ROOM ELEMENTS
    // TV Screen (wall-mounted)
    ctx.fillStyle = '#000000'; // TV frame
    ctx.fillRect(224 - this.cameraX, 320 - this.cameraY, 48, 32);
    ctx.fillStyle = '#1E3A8A'; // TV screen
    ctx.fillRect(228 - this.cameraX, 324 - this.cameraY, 40, 24);
    
    // TV stand/mount
    ctx.fillStyle = '#4B5563';
    ctx.fillRect(240 - this.cameraX, 352 - this.cameraY, 16, 8);
    
    // Coffee table details
    ctx.fillStyle = '#8B4513'; // Wood color
    ctx.fillRect(320 - this.cameraX, 320 - this.cameraY, 32, 32);
    // Items on coffee table
    ctx.fillStyle = '#FFD700';
    ctx.fillRect(325 - this.cameraX, 325 - this.cameraY, 6, 8); // Remote
    ctx.fillStyle = '#FF6B6B';
    ctx.fillRect(335 - this.cameraX, 330 - this.cameraY, 8, 4); // Magazine
    
    // Couch details
    ctx.fillStyle = '#6B7280'; // Couch color
    ctx.fillRect(288 - this.cameraX, 352 - this.cameraY, 96, 32);
    // Couch cushions
    ctx.fillStyle = '#9CA3AF';
    ctx.fillRect(292 - this.cameraX, 356 - this.cameraY, 20, 24);
    ctx.fillRect(316 - this.cameraX, 356 - this.cameraY, 20, 24);
    ctx.fillRect(340 - this.cameraX, 356 - this.cameraY, 20, 24);
    ctx.fillRect(364 - this.cameraX, 356 - this.cameraY, 20, 24);
    
    // KITCHEN ELEMENTS
    // Refrigerator details
    ctx.fillStyle = '#F8F9FA'; // White refrigerator
    ctx.fillRect(416 - this.cameraX, 288 - this.cameraY, 32, 64);
    ctx.fillStyle = '#6C757D'; // Handle
    ctx.fillRect(444 - this.cameraX, 310 - this.cameraY, 2, 20);
    ctx.fillStyle = '#000000'; // Door line
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(416 - this.cameraX, 320 - this.cameraY);
    ctx.lineTo(448 - this.cameraX, 320 - this.cameraY);
    ctx.stroke();
    
    // Kitchen counter/stove
    ctx.fillStyle = '#D1D5DB'; // Counter color
    ctx.fillRect(448 - this.cameraX, 288 - this.cameraY, 96, 32);
    // Stove burners
    ctx.fillStyle = '#374151';
    ctx.beginPath();
    ctx.arc(464 - this.cameraX, 304 - this.cameraY, 6, 0, 2 * Math.PI);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(488 - this.cameraX, 304 - this.cameraY, 6, 0, 2 * Math.PI);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(512 - this.cameraX, 304 - this.cameraY, 6, 0, 2 * Math.PI);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(528 - this.cameraX, 304 - this.cameraY, 6, 0, 2 * Math.PI);
    ctx.fill();
    
    // Kitchen sink
    ctx.fillStyle = '#9CA3AF'; // Sink color
    ctx.fillRect(544 - this.cameraX, 320 - this.cameraY, 32, 24);
    ctx.fillStyle = '#6B7280'; // Faucet
    ctx.fillRect(556 - this.cameraX, 315 - this.cameraY, 8, 12);
    
    // Dining table and chairs
    ctx.fillStyle = '#8B4513'; // Wood table
    ctx.fillRect(448 - this.cameraX, 352 - this.cameraY, 64, 32);
    // Chairs
    ctx.fillStyle = '#D4A574';
    ctx.fillRect(416 - this.cameraX, 352 - this.cameraY, 24, 32); // Left chair
    ctx.fillRect(520 - this.cameraX, 352 - this.cameraY, 24, 32); // Right chair
    
    // BEDROOM DETAILS
    // Bedroom 1 (top left)
    ctx.fillStyle = '#4F46E5'; // Bed color
    ctx.fillRect(96 - this.cameraX, 96 - this.cameraY, 64, 64);
    ctx.fillStyle = '#EDE9FE'; // Pillow
    ctx.fillRect(100 - this.cameraX, 100 - this.cameraY, 24, 16);
    ctx.fillStyle = '#8B5CF6'; // Blanket
    ctx.fillRect(100 - this.cameraX, 120 - this.cameraY, 56, 36);
    
    // Dresser in bedroom 1
    ctx.fillStyle = '#92400E';
    ctx.fillRect(64 - this.cameraX, 160 - this.cameraY, 32, 32);
    
    // Bedroom 2 (top right)
    ctx.fillStyle = '#059669'; // Different bed color
    ctx.fillRect(480 - this.cameraX, 96 - this.cameraY, 64, 64);
    ctx.fillStyle = '#D1FAE5'; // Pillow
    ctx.fillRect(484 - this.cameraX, 100 - this.cameraY, 24, 16);
    ctx.fillStyle = '#34D399'; // Blanket
    ctx.fillRect(484 - this.cameraX, 120 - this.cameraY, 56, 36);
    
    // Dresser in bedroom 2
    ctx.fillStyle = '#92400E';
    ctx.fillRect(544 - this.cameraX, 160 - this.cameraY, 32, 32);
    
    // Bedroom 3 (bottom left)
    ctx.fillStyle = '#DC2626'; // Different bed color
    ctx.fillRect(96 - this.cameraX, 320 - this.cameraY, 64, 64);
    ctx.fillStyle = '#FEE2E2'; // Pillow
    ctx.fillRect(100 - this.cameraX, 324 - this.cameraY, 24, 16);
    ctx.fillStyle = '#F87171'; // Blanket
    ctx.fillRect(100 - this.cameraX, 344 - this.cameraY, 56, 36);
    
    // Dresser in bedroom 3
    ctx.fillStyle = '#92400E';
    ctx.fillRect(64 - this.cameraX, 384 - this.cameraY, 32, 32);
    
    // Bedroom 4 (center back)
    ctx.fillStyle = '#7C2D12'; // Different bed color
    ctx.fillRect(288 - this.cameraX, 96 - this.cameraY, 64, 64);
    ctx.fillStyle = '#FED7AA'; // Pillow
    ctx.fillRect(292 - this.cameraX, 100 - this.cameraY, 24, 16);
    ctx.fillStyle = '#FB923C'; // Blanket
    ctx.fillRect(292 - this.cameraX, 120 - this.cameraY, 56, 36);
    
    // Dresser in bedroom 4
    ctx.fillStyle = '#92400E';
    ctx.fillRect(352 - this.cameraX, 160 - this.cameraY, 32, 32);
    
    
    // ROOM LABELS
    ctx.fillStyle = '#374151';
    ctx.font = 'bold 12px sans-serif';
    ctx.textAlign = 'center';
    
    // Living room label
    ctx.fillText('LIVING ROOM', 320 - this.cameraX, 340 - this.cameraY);
    
    // Kitchen label
    ctx.fillText('KITCHEN', 480 - this.cameraX, 340 - this.cameraY);
    
    // Refrigerator label
    ctx.font = '8px sans-serif';
    ctx.fillText('REFRIGERATOR', 432 - this.cameraX, 280 - this.cameraY);
    
    // Bedroom labels
    ctx.font = '10px sans-serif';
    ctx.fillText('BR1', 128 - this.cameraX, 140 - this.cameraY);
    ctx.fillText('BR2', 512 - this.cameraX, 140 - this.cameraY);
    ctx.fillText('BR3', 128 - this.cameraX, 360 - this.cameraY);
    ctx.fillText('BR4', 320 - this.cameraX, 140 - this.cameraY);
    
    
    // Add apartment features text
    ctx.fillStyle = '#6B7280';
    ctx.font = '10px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('• 4 Private Bedrooms', 20 - this.cameraX, 50 - this.cameraY);
    ctx.fillText('• Full Kitchen w/ Refrigerator', 20 - this.cameraX, 65 - this.cameraY);
    ctx.fillText('• Spacious Living Room w/ TV', 20 - this.cameraX, 80 - this.cameraY);
    
    // Floor pattern for common areas
    ctx.strokeStyle = '#E5E7EB';
    ctx.lineWidth = 1;
    for (let x = 224; x < 576; x += 16) {
      for (let y = 224; y < 416; y += 16) {
        if (x >= 224 && x <= 384 && y >= 288 && y <= 384) { // Living room area
          ctx.strokeRect(x - this.cameraX, y - this.cameraY, 16, 16);
        }
      }
    }
  }
}

export default EdgeInterior;
