import BaseOffCampusBuilding from './BaseOffCampusBuilding';
import { SceneType } from '../types';

class FoodLionInterior extends BaseOffCampusBuilding {
  public type: SceneType = 'foodlion';

  protected getBuildingName(): string {
    return 'Food Lion - Grocery Store';
  }

  protected getBuildingType(): 'apartment' | 'mixed_use' | 'commercial' {
    return 'commercial';
  }

  protected generateBuilding(): any[][] {
    const interior: any[][] = [];
    
    for (let y = 0; y < this.buildingHeight; y++) {
      interior[y] = [];
      for (let x = 0; x < this.buildingWidth; x++) {
        // Create the layout for Food Lion grocery store
        
        // Outer walls
        if (x === 0 || x === this.buildingWidth - 1 || y === 0 || y === this.buildingHeight - 1) {
          interior[y][x] = { type: 'wall', solid: true };
        }
        // Exit door at bottom center
        else if (y === this.buildingHeight - 1 && x === Math.floor(this.buildingWidth / 2)) {
          interior[y][x] = { type: 'door', solid: false };
        }
        // Checkout area (front of store)
        else if (x >= 2 && x <= 3 && y >= 11 && y <= 13) {
          interior[y][x] = { type: 'furniture', solid: true, furniture: 'desk' };
        }
        else if (x >= 5 && x <= 6 && y >= 11 && y <= 13) {
          interior[y][x] = { type: 'furniture', solid: true, furniture: 'desk' };
        }
        else if (x >= 8 && x <= 9 && y >= 11 && y <= 13) {
          interior[y][x] = { type: 'furniture', solid: true, furniture: 'desk' };
        }
        else if (x >= 11 && x <= 12 && y >= 11 && y <= 13) {
          interior[y][x] = { type: 'furniture', solid: true, furniture: 'desk' };
        }
        // Customer service desk
        else if (x >= 15 && x <= 17 && y >= 11 && y <= 12) {
          interior[y][x] = { type: 'furniture', solid: true, furniture: 'desk' };
        }
        // Shopping cart corral (near entrance)
        else if (x >= 14 && x <= 15 && y >= 13 && y <= 13) {
          interior[y][x] = { type: 'furniture', solid: true, furniture: 'chair' };
        }
        // Produce section (left side)
        else if (x >= 1 && x <= 4 && y >= 2 && y <= 5) {
          interior[y][x] = { type: 'furniture', solid: true, furniture: 'table' };
        }
        else if (x >= 1 && x <= 4 && y >= 7 && y <= 9) {
          interior[y][x] = { type: 'furniture', solid: true, furniture: 'table' };
        }
        // Deli/Bakery section (back left)
        else if (x >= 6 && x <= 9 && y >= 2 && y <= 3) {
          interior[y][x] = { type: 'furniture', solid: true, furniture: 'kitchen' };
        }
        // Meat section (back center)
        else if (x >= 11 && x <= 14 && y >= 2 && y <= 3) {
          interior[y][x] = { type: 'furniture', solid: true, furniture: 'kitchen' };
        }
        // Frozen foods (back right)
        else if (x >= 16 && x <= 18 && y >= 2 && y <= 5) {
          interior[y][x] = { type: 'furniture', solid: true, furniture: 'kitchen' };
        }
        // Grocery aisles (center of store)
        else if ((x >= 6 && x <= 7 && y >= 5 && y <= 9) ||
                 (x >= 9 && x <= 10 && y >= 5 && y <= 9) ||
                 (x >= 12 && x <= 13 && y >= 5 && y <= 9) ||
                 (x >= 15 && x <= 16 && y >= 5 && y <= 9)) {
          interior[y][x] = { type: 'furniture', solid: true, furniture: 'desk' };
        }
        // Windows along front
        else if (y === 0 && (x === 4 || x === 8 || x === 12 || x === 16)) {
          interior[y][x] = { type: 'window', solid: true };
        }
        // Floor - shopping areas
        else {
          interior[y][x] = { type: 'floor', solid: false };
        }
      }
    }
    
    return interior;
  }

  protected renderBuildingSpecificElements(ctx: CanvasRenderingContext2D): void {
    // Food Lion grocery store specific elements
    
    // Store name and branding
    ctx.fillStyle = '#FF6B35'; // Food Lion orange
    ctx.font = 'bold 20px serif';
    ctx.textAlign = 'center';
    ctx.fillText('FOOD LION', 400 - this.cameraX, 35 - this.cameraY);
    
    ctx.fillStyle = '#2E86AB';
    ctx.font = 'bold 12px serif';
    ctx.fillText('Fresh • Easy • Affordable', 400 - this.cameraX, 55 - this.cameraY);
    
    // Produce section with fruits and vegetables
    ctx.fillStyle = '#32CD32'; // Green for produce
    ctx.fillRect(50 - this.cameraX, 80 - this.cameraY, 120, 60);
    
    // Produce displays
    ctx.fillStyle = '#FF0000'; // Red apples
    ctx.beginPath();
    ctx.arc(70 - this.cameraX, 100 - this.cameraY, 8, 0, 2 * Math.PI);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(85 - this.cameraX, 105 - this.cameraY, 8, 0, 2 * Math.PI);
    ctx.fill();
    
    ctx.fillStyle = '#FFA500'; // Orange oranges
    ctx.beginPath();
    ctx.arc(110 - this.cameraX, 100 - this.cameraY, 8, 0, 2 * Math.PI);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(125 - this.cameraX, 105 - this.cameraY, 8, 0, 2 * Math.PI);
    ctx.fill();
    
    ctx.fillStyle = '#FFFF00'; // Yellow bananas
    ctx.fillRect(90 - this.cameraX, 115 - this.cameraY, 20, 6);
    ctx.fillRect(95 - this.cameraX, 122 - this.cameraY, 15, 6);
    
    // Lettuce/greens
    ctx.fillStyle = '#228B22';
    ctx.beginPath();
    ctx.arc(140 - this.cameraX, 110 - this.cameraY, 10, 0, 2 * Math.PI);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(155 - this.cameraX, 115 - this.cameraY, 10, 0, 2 * Math.PI);
    ctx.fill();
    
    // Produce section sign
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 12px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('🥬 PRODUCE 🍎', 110 - this.cameraX, 75 - this.cameraY);
    
    // Deli/Bakery section
    ctx.fillStyle = '#D2B48C'; // Tan for bakery
    ctx.fillRect(200 - this.cameraX, 60 - this.cameraY, 100, 40);
    
    // Bakery items
    ctx.fillStyle = '#8B4513'; // Brown bread
    ctx.fillRect(210 - this.cameraX, 70 - this.cameraY, 15, 8);
    ctx.fillRect(230 - this.cameraX, 70 - this.cameraY, 15, 8);
    
    ctx.fillStyle = '#F5DEB3'; // Wheat colored
    ctx.fillRect(250 - this.cameraX, 70 - this.cameraY, 15, 8);
    ctx.fillRect(270 - this.cameraX, 70 - this.cameraY, 15, 8);
    
    // Pastries
    ctx.fillStyle = '#FFD700'; // Golden pastries
    ctx.beginPath();
    ctx.arc(220 - this.cameraX, 85 - this.cameraY, 4, 0, 2 * Math.PI);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(235 - this.cameraX, 85 - this.cameraY, 4, 0, 2 * Math.PI);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(250 - this.cameraX, 85 - this.cameraY, 4, 0, 2 * Math.PI);
    ctx.fill();
    
    // Deli section sign
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 10px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('🥖 BAKERY & DELI 🧀', 250 - this.cameraX, 55 - this.cameraY);
    
    // Meat section
    ctx.fillStyle = '#8B0000'; // Dark red for meat section
    ctx.fillRect(360 - this.cameraX, 60 - this.cameraY, 100, 40);
    
    // Meat display cases
    ctx.fillStyle = '#DC143C'; // Red meat
    ctx.fillRect(370 - this.cameraX, 70 - this.cameraY, 12, 8);
    ctx.fillRect(385 - this.cameraX, 70 - this.cameraY, 12, 8);
    
    ctx.fillStyle = '#FFC0CB'; // Pink for chicken
    ctx.fillRect(405 - this.cameraX, 70 - this.cameraY, 12, 8);
    ctx.fillRect(420 - this.cameraX, 70 - this.cameraY, 12, 8);
    
    // Fish section
    ctx.fillStyle = '#C0C0C0'; // Silver for fish
    ctx.fillRect(435 - this.cameraX, 70 - this.cameraY, 15, 8);
    
    // Meat section sign
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 10px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('🥩 FRESH MEAT & SEAFOOD 🐟', 410 - this.cameraX, 55 - this.cameraY);
    
    // Frozen foods section
    ctx.fillStyle = '#87CEEB'; // Light blue for frozen
    ctx.fillRect(520 - this.cameraX, 60 - this.cameraY, 80, 120);
    
    // Freezer doors
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(525 - this.cameraX, 70 - this.cameraY, 25, 40);
    ctx.fillRect(555 - this.cameraX, 70 - this.cameraY, 25, 40);
    ctx.fillRect(525 - this.cameraX, 120 - this.cameraY, 25, 40);
    ctx.fillRect(555 - this.cameraX, 120 - this.cameraY, 25, 40);
    
    // Freezer handles
    ctx.fillStyle = '#C0C0C0';
    ctx.fillRect(548 - this.cameraX, 85 - this.cameraY, 2, 10);
    ctx.fillRect(578 - this.cameraX, 85 - this.cameraY, 2, 10);
    ctx.fillRect(548 - this.cameraX, 135 - this.cameraY, 2, 10);
    ctx.fillRect(578 - this.cameraX, 135 - this.cameraY, 2, 10);
    
    // Frozen section sign
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 10px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('🧊 FROZEN FOODS ❄️', 560 - this.cameraX, 55 - this.cameraY);
    
    // Grocery aisles with products
    ctx.fillStyle = '#8B4513'; // Brown shelving
    const aisles = [
      { x: 200, label: 'CEREALS & SNACKS' },
      { x: 300, label: 'CANNED GOODS' },
      { x: 400, label: 'BEVERAGES' },
      { x: 500, label: 'HOUSEHOLD' }
    ];
    
    aisles.forEach((aisle, index) => {
      // Shelf structure
      ctx.fillStyle = '#8B4513';
      ctx.fillRect(aisle.x - this.cameraX, 160 - this.cameraY, 60, 180);
      
      // Products on shelves
      const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7'];
      for (let shelf = 0; shelf < 4; shelf++) {
        for (let item = 0; item < 8; item++) {
          ctx.fillStyle = colors[(shelf + item) % colors.length];
          ctx.fillRect(aisle.x + 5 + item * 6 - this.cameraX, 170 + shelf * 40 - this.cameraY, 5, 15);
        }
      }
      
      // Aisle signs
      ctx.fillStyle = '#FF6B35';
      ctx.fillRect(aisle.x + 10 - this.cameraX, 140 - this.cameraY, 40, 15);
      ctx.fillStyle = '#FFFFFF';
      ctx.font = '8px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(`${index + 1}`, aisle.x + 30 - this.cameraX, 150 - this.cameraY);
      
      // Aisle labels
      ctx.fillStyle = '#2F2F2F';
      ctx.font = '8px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(aisle.label, aisle.x + 30 - this.cameraX, 355 - this.cameraY);
    });
    
    // Checkout lanes
    ctx.fillStyle = '#34495E'; // Dark gray for checkout
    const checkouts = [80, 180, 280, 380];
    
    checkouts.forEach((checkoutX, index) => {
      // Checkout counter
      ctx.fillStyle = '#34495E';
      ctx.fillRect(checkoutX - this.cameraX, 360 - this.cameraY, 60, 30);
      
      // Cash register
      ctx.fillStyle = '#2C3E50';
      ctx.fillRect(checkoutX + 20 - this.cameraX, 350 - this.cameraY, 20, 15);
      
      // Register screen
      ctx.fillStyle = '#3498DB';
      ctx.fillRect(checkoutX + 22 - this.cameraX, 352 - this.cameraY, 16, 8);
      
      // Conveyor belt
      ctx.fillStyle = '#7F8C8D';
      ctx.fillRect(checkoutX + 5 - this.cameraX, 395 - this.cameraY, 50, 8);
      
      // Lane number
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 12px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(`${index + 1}`, checkoutX + 30 - this.cameraX, 375 - this.cameraY);
    });
    
    // Customer service desk
    ctx.fillStyle = '#E74C3C'; // Red for customer service
    ctx.fillRect(500 - this.cameraX, 350 - this.cameraY, 80, 30);
    
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 10px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('CUSTOMER SERVICE', 540 - this.cameraX, 370 - this.cameraY);
    
    // Shopping carts
    ctx.fillStyle = '#C0C0C0'; // Silver carts
    ctx.fillRect(460 - this.cameraX, 410 - this.cameraY, 12, 16);
    ctx.fillRect(475 - this.cameraX, 410 - this.cameraY, 12, 16);
    ctx.fillRect(490 - this.cameraX, 410 - this.cameraY, 12, 16);
    
    // Cart wheels
    ctx.fillStyle = '#2F2F2F';
    for (let cart = 0; cart < 3; cart++) {
      const cartX = 460 + cart * 15;
      ctx.beginPath();
      ctx.arc(cartX + 2 - this.cameraX, 424 - this.cameraY, 2, 0, 2 * Math.PI);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(cartX + 10 - this.cameraX, 424 - this.cameraY, 2, 0, 2 * Math.PI);
      ctx.fill();
    }
    
    // Store hours sign
    ctx.fillStyle = '#2F2F2F';
    ctx.fillRect(620 - this.cameraX, 350 - this.cameraY, 100, 80);
    
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 12px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('STORE HOURS', 670 - this.cameraX, 365 - this.cameraY);
    
    ctx.font = '10px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('Mon-Sun: 6AM-11PM', 630 - this.cameraX, 385 - this.cameraY);
    ctx.fillText('Pharmacy:', 630 - this.cameraX, 400 - this.cameraY);
    ctx.fillText('Mon-Fri: 9AM-9PM', 630 - this.cameraX, 415 - this.cameraY);
    
    // Food Lion logo elements
    ctx.fillStyle = '#FF6B35';
    ctx.font = '16px serif';
    ctx.textAlign = 'center';
    ctx.fillText('🦁', 50 - this.cameraX, 450 - this.cameraY);
    
    // Sale/promotional signs
    ctx.fillStyle = '#E74C3C';
    ctx.fillRect(100 - this.cameraX, 200 - this.cameraY, 40, 20);
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 8px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('SALE!', 120 - this.cameraX, 212 - this.cameraY);
    
    ctx.fillStyle = '#27AE60';
    ctx.fillRect(350 - this.cameraX, 200 - this.cameraY, 50, 20);
    ctx.fillStyle = '#FFFFFF';
    ctx.fillText('FRESH!', 375 - this.cameraX, 212 - this.cameraY);
  }
}

export default FoodLionInterior;
