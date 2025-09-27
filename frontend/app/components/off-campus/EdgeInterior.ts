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
        // Create the layout for The Edge apartment complex
        
        // Outer walls
        if (x === 0 || x === this.buildingWidth - 1 || y === 0 || y === this.buildingHeight - 1) {
          interior[y][x] = { type: 'wall', solid: true };
        }
        // Exit door at bottom center
        else if (y === this.buildingHeight - 1 && x === Math.floor(this.buildingWidth / 2)) {
          interior[y][x] = { type: 'door', solid: false };
        }
        // Lobby area (center front)
        else if (x >= 8 && x <= 11 && y >= 11 && y <= 13) {
          interior[y][x] = { type: 'lobby', solid: false };
        }
        // Reception desk
        else if (x >= 9 && x <= 10 && y === 10) {
          interior[y][x] = { type: 'furniture', solid: true, furniture: 'desk' };
        }
        // Lobby seating
        else if ((x === 7 && y === 12) || (x === 12 && y === 12)) {
          interior[y][x] = { type: 'furniture', solid: true, furniture: 'couch' };
        }
        // Coffee table in lobby
        else if (x === 9 && y === 12) {
          interior[y][x] = { type: 'furniture', solid: true, furniture: 'table' };
        }
        // Elevators (left side)
        else if (x >= 2 && x <= 3 && y >= 6 && y <= 8) {
          interior[y][x] = { type: 'elevator', solid: false };
        }
        // Stairs (right side)
        else if (x >= 16 && x <= 18 && y >= 6 && y <= 9) {
          interior[y][x] = { type: 'stairs', solid: false };
        }
        // Mailroom (back left)
        else if (x >= 2 && x <= 4 && y >= 2 && y <= 4) {
          interior[y][x] = { type: 'mailroom', solid: false };
        }
        // Mailboxes
        else if (x >= 2 && x <= 4 && y === 1) {
          interior[y][x] = { type: 'furniture', solid: true, furniture: 'mailbox' };
        }
        // Laundry room (back center)
        else if (x >= 7 && x <= 12 && y >= 2 && y <= 4) {
          interior[y][x] = { type: 'furniture', solid: true, furniture: 'laundry' };
        }
        // Vending machines (back right)
        else if (x >= 15 && x <= 16 && y >= 2 && y <= 3) {
          interior[y][x] = { type: 'furniture', solid: true, furniture: 'vending' };
        }
        // Study lounge (left side)
        else if (x >= 2 && x <= 6 && y >= 10 && y <= 12) {
          // Study tables
          if ((x === 3 && y === 10) || (x === 5 && y === 11)) {
            interior[y][x] = { type: 'furniture', solid: true, furniture: 'desk' };
          }
          // Study chairs
          else if ((x === 2 && y === 10) || (x === 4 && y === 10) || 
                   (x === 4 && y === 11) || (x === 6 && y === 11)) {
            interior[y][x] = { type: 'furniture', solid: true, furniture: 'chair' };
          }
          else {
            interior[y][x] = { type: 'floor', solid: false };
          }
        }
        // Fitness area (right side)
        else if (x >= 13 && x <= 17 && y >= 10 && y <= 12) {
          // Exercise equipment (represented as furniture)
          if ((x === 14 && y === 10) || (x === 16 && y === 11)) {
            interior[y][x] = { type: 'furniture', solid: true, furniture: 'desk' };
          }
          else {
            interior[y][x] = { type: 'floor', solid: false };
          }
        }
        // Windows along front and sides
        else if ((y === 0 && (x === 4 || x === 7 || x === 12 || x === 15)) ||
                 (x === 0 && (y === 4 || y === 8 || y === 12)) ||
                 (x === this.buildingWidth - 1 && (y === 4 || y === 8 || y === 12))) {
          interior[y][x] = { type: 'window', solid: true };
        }
        // Hallway (center corridor)
        else if (x >= 7 && x <= 12 && y >= 5 && y <= 9) {
          interior[y][x] = { type: 'floor', solid: false };
        }
        // Floor for all other areas
        else {
          interior[y][x] = { type: 'floor', solid: false };
        }
      }
    }
    
    return interior;
  }

  protected renderBuildingSpecificElements(ctx: CanvasRenderingContext2D): void {
    // The Edge apartment complex specific elements
    
    // Building name and branding
    ctx.fillStyle = '#2C3E50'; // Dark blue-gray branding
    ctx.font = 'bold 22px serif';
    ctx.textAlign = 'center';
    ctx.fillText('THE EDGE', 400 - this.cameraX, 35 - this.cameraY);
    
    ctx.fillStyle = '#3498DB'; // Light blue accent
    ctx.font = 'bold 14px serif';
    ctx.fillText('Student Living Community', 400 - this.cameraX, 55 - this.cameraY);
    
    // Reception desk with modern styling
    ctx.fillStyle = '#34495E'; // Dark gray modern desk
    ctx.fillRect(300 - this.cameraX, 320 - this.cameraY, 64, 32);
    
    // Computer/monitor on reception desk
    ctx.fillStyle = '#000000';
    ctx.fillRect(315 - this.cameraX, 325 - this.cameraY, 16, 12);
    ctx.fillStyle = '#3498DB';
    ctx.fillRect(317 - this.cameraX, 327 - this.cameraY, 12, 8);
    
    // Modern lobby lighting fixtures
    ctx.fillStyle = '#F39C12'; // Warm light
    ctx.beginPath();
    ctx.arc(200 - this.cameraX, 120 - this.cameraY, 8, 0, 2 * Math.PI);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(400 - this.cameraX, 120 - this.cameraY, 8, 0, 2 * Math.PI);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(600 - this.cameraX, 120 - this.cameraY, 8, 0, 2 * Math.PI);
    ctx.fill();
    
    // Light beams from fixtures
    ctx.fillStyle = '#F1C40F';
    ctx.globalAlpha = 0.2;
    for (let lightX of [200, 400, 600]) {
      ctx.beginPath();
      ctx.arc(lightX - this.cameraX, 300 - this.cameraY, 40, 0, 2 * Math.PI);
      ctx.fill();
    }
    ctx.globalAlpha = 1.0;
    
    // Elevator indicators
    ctx.fillStyle = '#E74C3C'; // Red for elevator
    ctx.fillRect(85 - this.cameraX, 180 - this.cameraY, 20, 4);
    ctx.fillStyle = '#27AE60'; // Green for available
    ctx.fillRect(85 - this.cameraX, 190 - this.cameraY, 20, 4);
    
    // Floor indicator
    ctx.fillStyle = '#2C3E50';
    ctx.font = '12px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('1', 95 - this.cameraX, 175 - this.cameraY);
    
    // Elevator buttons
    ctx.fillStyle = '#BDC3C7';
    ctx.fillRect(92 - this.cameraX, 200 - this.cameraY, 6, 6);
    ctx.fillRect(92 - this.cameraX, 210 - this.cameraY, 6, 6);
    
    // Laundry room equipment details
    ctx.fillStyle = '#FFFFFF'; // White washers
    ctx.fillRect(240 - this.cameraX, 80 - this.cameraY, 30, 40);
    ctx.fillRect(280 - this.cameraX, 80 - this.cameraY, 30, 40);
    ctx.fillRect(320 - this.cameraX, 80 - this.cameraY, 30, 40);
    
    // Washer doors
    ctx.fillStyle = '#34495E';
    ctx.beginPath();
    ctx.arc(255 - this.cameraX, 100 - this.cameraY, 8, 0, 2 * Math.PI);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(295 - this.cameraX, 100 - this.cameraY, 8, 0, 2 * Math.PI);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(335 - this.cameraX, 100 - this.cameraY, 8, 0, 2 * Math.PI);
    ctx.fill();
    
    // Dryers (below washers)
    ctx.fillStyle = '#ECF0F1'; // Light gray dryers
    ctx.fillRect(240 - this.cameraX, 125 - this.cameraY, 30, 40);
    ctx.fillRect(280 - this.cameraX, 125 - this.cameraY, 30, 40);
    ctx.fillRect(320 - this.cameraX, 125 - this.cameraY, 30, 40);
    
    // Vending machines
    ctx.fillStyle = '#E74C3C'; // Red vending machine
    ctx.fillRect(490 - this.cameraX, 70 - this.cameraY, 40, 60);
    ctx.fillStyle = '#000000';
    ctx.fillRect(495 - this.cameraX, 75 - this.cameraY, 30, 20);
    
    // Vending machine buttons
    ctx.fillStyle = '#F39C12';
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 4; j++) {
        ctx.fillRect(498 + j * 6 - this.cameraX, 100 + i * 6 - this.cameraY, 4, 4);
      }
    }
    
    // Study area details
    ctx.fillStyle = '#8E44AD'; // Purple study area accent
    ctx.font = 'bold 12px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('📚 STUDY LOUNGE', 140 - this.cameraX, 280 - this.cameraY);
    
    // Study materials on desks
    ctx.fillStyle = '#F39C12';
    ctx.fillRect(95 - this.cameraX, 318 - this.cameraY, 6, 8); // Book
    ctx.fillRect(155 - this.cameraX, 348 - this.cameraY, 8, 6); // Laptop
    
    // Fitness area
    ctx.fillStyle = '#E67E22'; // Orange fitness accent
    ctx.font = 'bold 12px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('💪 FITNESS CENTER', 500 - this.cameraX, 280 - this.cameraY);
    
    // Exercise equipment representation
    ctx.fillStyle = '#95A5A6';
    ctx.fillRect(450 - this.cameraX, 320 - this.cameraY, 20, 16); // Treadmill
    ctx.fillRect(520 - this.cameraX, 350 - this.cameraY, 16, 20); // Weight machine
    
    // Mailroom signage
    ctx.fillStyle = '#16A085';
    ctx.font = 'bold 12px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('📬 MAIL ROOM', 100 - this.cameraX, 50 - this.cameraY);
    
    // Package lockers
    ctx.fillStyle = '#2C3E50';
    for (let i = 0; i < 4; i++) {
      for (let j = 0; j < 3; j++) {
        ctx.fillRect(85 + i * 12 - this.cameraX, 65 + j * 10 - this.cameraY, 10, 8);
      }
    }
    
    // Apartment directory board
    ctx.fillStyle = '#34495E';
    ctx.fillRect(600 - this.cameraX, 320 - this.cameraY, 80, 60);
    
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '10px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('DIRECTORY', 640 - this.cameraX, 335 - this.cameraY);
    ctx.font = '8px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('Floor 2: 201-210', 610 - this.cameraX, 350 - this.cameraY);
    ctx.fillText('Floor 3: 301-310', 610 - this.cameraX, 360 - this.cameraY);
    ctx.fillText('Floor 4: 401-410', 610 - this.cameraX, 370 - this.cameraY);
    
    // Modern apartment amenities list
    ctx.fillStyle = '#2C3E50';
    ctx.fillRect(50 - this.cameraX, 400 - this.cameraY, 200, 80);
    
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '12px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('AMENITIES', 150 - this.cameraX, 415 - this.cameraY);
    
    ctx.font = '9px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('• High-Speed WiFi', 60 - this.cameraX, 430 - this.cameraY);
    ctx.fillText('• Furnished Units', 60 - this.cameraX, 442 - this.cameraY);
    ctx.fillText('• Fitness Center', 60 - this.cameraX, 454 - this.cameraY);
    ctx.fillText('• Study Lounges', 60 - this.cameraX, 466 - this.cameraY);
    
    // VT-themed decorative elements
    ctx.fillStyle = '#8B0000'; // VT Maroon
    ctx.font = '16px serif';
    ctx.textAlign = 'center';
    ctx.fillText('🏠', 650 - this.cameraX, 200 - this.cameraY);
    
    ctx.fillStyle = '#FF8C00'; // VT Orange
    ctx.fillText('🎓', 100 - this.cameraX, 450 - this.cameraY);
    
    // Modern floor pattern in lobby
    ctx.strokeStyle = '#BDC3C7';
    ctx.lineWidth = 1;
    for (let x = 250; x < 550; x += 32) {
      ctx.beginPath();
      ctx.moveTo(x - this.cameraX, 350 - this.cameraY);
      ctx.lineTo(x - this.cameraX, 420 - this.cameraY);
      ctx.stroke();
    }
    
    // Emergency exit signs
    ctx.fillStyle = '#27AE60';
    ctx.fillRect(30 - this.cameraX, 200 - this.cameraY, 25, 12);
    ctx.fillRect(745 - this.cameraX, 200 - this.cameraY, 25, 12);
    
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '8px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('EXIT', 42 - this.cameraX, 209 - this.cameraY);
    ctx.fillText('EXIT', 757 - this.cameraX, 209 - this.cameraY);
  }
}

export default EdgeInterior;
