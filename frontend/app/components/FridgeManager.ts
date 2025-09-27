export interface FridgeItem {
  id: string;
  name: string;
  quantity: number;
  addedBy: string;
  dateAdded: Date;
  expirationDate?: Date;
  category: 'dairy' | 'meat' | 'vegetables' | 'fruits' | 'leftovers' | 'beverages' | 'condiments' | 'other';
}

export interface FridgeData {
  items: FridgeItem[];
  lastUpdated: Date;
  apartmentId: string;
  residents: string[];
}

class FridgeManager {
  private static instance: FridgeManager;
  private fridgeData: Map<string, FridgeData> = new Map();
  private uiState: {
    isOpen: boolean;
    currentFridge: string | null;
    selectedItemIndex: number;
  } = {
    isOpen: false,
    currentFridge: null,
    selectedItemIndex: 0
  };

  static getInstance(): FridgeManager {
    if (!FridgeManager.instance) {
      FridgeManager.instance = new FridgeManager();
    }
    return FridgeManager.instance;
  }

  constructor() {
    this.initializeDefaultFridges();
  }

  private initializeDefaultFridges(): void {
    // Initialize Edge apartment fridge
    this.fridgeData.set('edge', {
      apartmentId: 'edge-apartment-001',
      residents: ['player1', 'roommate1', 'roommate2', 'roommate3'],
      lastUpdated: new Date(),
      items: [
        {
          id: 'milk-001',
          name: 'Milk (2%)',
          quantity: 1,
          addedBy: 'system',
          dateAdded: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
          expirationDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
          category: 'dairy'
        },
        {
          id: 'leftover-001',
          name: 'Pizza (2 slices)',
          quantity: 2,
          addedBy: 'roommate1',
          dateAdded: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
          expirationDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
          category: 'leftovers'
        },
        {
          id: 'soda-001',
          name: 'Coke Cans',
          quantity: 6,
          addedBy: 'roommate2',
          dateAdded: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
          category: 'beverages'
        }
      ]
    });

    // Initialize Tech Terrace apartment fridge
    this.fridgeData.set('techterrace', {
      apartmentId: 'techterrace-apartment-001',
      residents: ['player1', 'roommate1', 'roommate2', 'roommate3'],
      lastUpdated: new Date(),
      items: [
        {
          id: 'energy-001',
          name: 'Energy Drinks',
          quantity: 4,
          addedBy: 'roommate1',
          dateAdded: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
          expirationDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
          category: 'beverages'
        },
        {
          id: 'leftover-002',
          name: 'Ramen Noodles',
          quantity: 3,
          addedBy: 'roommate2',
          dateAdded: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
          expirationDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
          category: 'leftovers'
        },
        {
          id: 'fruit-001',
          name: 'Oranges',
          quantity: 5,
          addedBy: 'system',
          dateAdded: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
          expirationDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          category: 'fruits'
        },
        {
          id: 'dairy-001',
          name: 'Greek Yogurt',
          quantity: 2,
          addedBy: 'roommate3',
          dateAdded: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
          expirationDate: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000),
          category: 'dairy'
        }
      ]
    });
  }

  // Public methods - everyone can view
  public getFridgeItems(fridgeId: string): FridgeItem[] {
    const fridge = this.fridgeData.get(fridgeId);
    return fridge ? [...fridge.items] : [];
  }

  public canPlayerModify(fridgeId: string, playerId: string): boolean {
    const fridge = this.fridgeData.get(fridgeId);
    return fridge ? fridge.residents.includes(playerId) : false;
  }

  // UI State Management
  public openFridgeUI(fridgeId: string): void {
    this.uiState.isOpen = true;
    this.uiState.currentFridge = fridgeId;
    this.uiState.selectedItemIndex = 0;
  }

  public closeFridgeUI(): void {
    this.uiState.isOpen = false;
    this.uiState.currentFridge = null;
    this.uiState.selectedItemIndex = 0;
  }

  public isFridgeUIOpen(): boolean {
    return this.uiState.isOpen;
  }

  public getCurrentFridge(): string | null {
    return this.uiState.currentFridge;
  }

  // Modification methods (only for residents)
  public addItem(fridgeId: string, item: Omit<FridgeItem, 'id' | 'dateAdded'>, playerId: string): boolean {
    if (!this.canPlayerModify(fridgeId, playerId)) {
      console.log(`Player ${playerId} cannot modify fridge ${fridgeId} - not a resident`);
      return false;
    }

    const fridge = this.fridgeData.get(fridgeId);
    if (!fridge) return false;

    const newItem: FridgeItem = {
      ...item,
      id: `${item.category}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      dateAdded: new Date(),
      addedBy: playerId
    };

    fridge.items.push(newItem);
    fridge.lastUpdated = new Date();
    
    console.log(`Added item: ${newItem.name} to fridge ${fridgeId} by ${playerId}`);
    return true;
  }

  public removeItem(fridgeId: string, itemId: string, playerId: string): boolean {
    if (!this.canPlayerModify(fridgeId, playerId)) {
      console.log(`Player ${playerId} cannot modify fridge ${fridgeId} - not a resident`);
      return false;
    }

    const fridge = this.fridgeData.get(fridgeId);
    if (!fridge) return false;

    const itemIndex = fridge.items.findIndex(item => item.id === itemId);
    if (itemIndex === -1) {
      console.log(`Item ${itemId} not found in fridge ${fridgeId}`);
      return false;
    }

    const removedItem = fridge.items.splice(itemIndex, 1)[0];
    fridge.lastUpdated = new Date();
    
    console.log(`Removed item: ${removedItem.name} from fridge ${fridgeId} by ${playerId}`);
    return true;
  }

  // UI Rendering
  public renderFridgeUI(ctx: CanvasRenderingContext2D, playerId: string): void {
    if (!this.uiState.isOpen || !this.uiState.currentFridge) return;

    const fridgeId = this.uiState.currentFridge;
    const items = this.getFridgeItems(fridgeId);
    const canModify = this.canPlayerModify(fridgeId, playerId);

    const uiWidth = 400;
    const uiHeight = 500;
    const uiX = (ctx.canvas.width - uiWidth) / 2;
    const uiY = (ctx.canvas.height - uiHeight) / 2;

    ctx.save();
    
    // Background overlay
    ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    
    // Fridge UI panel
    ctx.fillStyle = '#F8F9FA';
    ctx.fillRect(uiX, uiY, uiWidth, uiHeight);
    
    // Header
    ctx.fillStyle = '#2C3E50';
    ctx.fillRect(uiX, uiY, uiWidth, 40);
    
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 16px Arial';
    ctx.textAlign = 'center';
    const apartmentName = fridgeId === 'edge' ? 'Edge Apartment' : 'Tech Terrace';
    ctx.fillText(`🧊 ${apartmentName} Fridge`, uiX + uiWidth / 2, uiY + 25);
    
    // Close button
    ctx.fillStyle = '#E74C3C';
    ctx.fillRect(uiX + uiWidth - 35, uiY + 5, 30, 30);
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 16px Arial';
    ctx.fillText('×', uiX + uiWidth - 20, uiY + 25);
    
    // Permission indicator
    ctx.fillStyle = canModify ? '#27AE60' : '#F39C12';
    ctx.font = '12px Arial';
    ctx.textAlign = 'left';
    const permissionText = canModify ? '✓ Resident (can modify)' : '👁 Visitor (view only)';
    ctx.fillText(permissionText, uiX + 10, uiY + 60);
    
    // Items list
    this.renderItemsList(ctx, items, uiX + 10, uiY + 80, uiWidth - 20, uiHeight - 120);
    
    // Instructions
    ctx.fillStyle = '#7F8C8D';
    ctx.font = '10px Arial';
    ctx.textAlign = 'center';
    if (canModify) {
      ctx.fillText('Press A to add item, D to delete selected item, ↑↓ to navigate, ESC to close', uiX + uiWidth / 2, uiY + uiHeight - 10);
    } else {
      ctx.fillText('Press ESC to close', uiX + uiWidth / 2, uiY + uiHeight - 10);
    }
    
    ctx.restore();
  }

  private renderItemsList(ctx: CanvasRenderingContext2D, items: FridgeItem[], x: number, y: number, width: number, height: number): void {
    if (items.length === 0) {
      ctx.fillStyle = '#95A5A6';
      ctx.font = '14px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('Fridge is empty! 🏃‍♂️💨', x + width / 2, y + height / 2);
      return;
    }
    
    const itemHeight = 40;
    const maxVisibleItems = Math.floor(height / itemHeight);
    
    // Group items by category
    const categories: { [key: string]: FridgeItem[] } = {};
    items.forEach(item => {
      if (!categories[item.category]) {
        categories[item.category] = [];
      }
      categories[item.category].push(item);
    });
    
    let currentY = y;
    let itemIndex = 0;
    
    Object.entries(categories).forEach(([category, categoryItems]) => {
      // Category header
      ctx.fillStyle = '#34495E';
      ctx.font = 'bold 12px Arial';
      ctx.textAlign = 'left';
      ctx.fillText(`📁 ${category.toUpperCase()}`, x, currentY);
      currentY += 20;
      
      // Items in category
      categoryItems.forEach((item) => {
        const isSelected = itemIndex === this.uiState.selectedItemIndex;
        this.renderFridgeItem(ctx, item, x + 10, currentY, width - 20, itemHeight - 5, isSelected);
        currentY += itemHeight;
        itemIndex++;
      });
      
      currentY += 10; // Space between categories
    });
  }

  private renderFridgeItem(ctx: CanvasRenderingContext2D, item: FridgeItem, x: number, y: number, width: number, height: number, isSelected: boolean): void {
    const isExpiringSoon = item.expirationDate && 
      (item.expirationDate.getTime() - Date.now()) < (2 * 24 * 60 * 60 * 1000);
    
    // Item background
    if (isSelected) {
      ctx.fillStyle = '#3498DB'; // Blue selection
    } else if (isExpiringSoon) {
      ctx.fillStyle = '#FADBD8'; // Red for expiring
    } else {
      ctx.fillStyle = '#FFFFFF'; // White default
    }
    ctx.fillRect(x, y, width, height);
    
    // Border
    ctx.strokeStyle = isSelected ? '#2980B9' : (isExpiringSoon ? '#E74C3C' : '#BDC3C7');
    ctx.lineWidth = isSelected ? 2 : 1;
    ctx.strokeRect(x, y, width, height);
    
    // Item content
    const categoryEmojis = {
      dairy: '🥛', meat: '🥩', vegetables: '🥬', fruits: '🍎',
      leftovers: '🍕', beverages: '🥤', condiments: '🍯', other: '📦'
    };
    
    ctx.font = '16px Arial';
    ctx.fillStyle = isSelected ? '#FFFFFF' : '#2C3E50';
    ctx.fillText(categoryEmojis[item.category] || '📦', x + 5, y + 20);
    
    // Item name and quantity
    ctx.font = 'bold 12px Arial';
    ctx.textAlign = 'left';
    ctx.fillText(`${item.name} (${item.quantity})`, x + 30, y + 15);
    
    // Added by and date
    ctx.fillStyle = isSelected ? '#ECF0F1' : '#7F8C8D';
    ctx.font = '9px Arial';
    const addedText = `Added by ${item.addedBy} on ${item.dateAdded.toLocaleDateString()}`;
    ctx.fillText(addedText, x + 30, y + 28);
    
    // Expiration warning
    if (isExpiringSoon && item.expirationDate) {
      ctx.fillStyle = isSelected ? '#FFFFFF' : '#E74C3C';
      ctx.font = 'bold 9px Arial';
      const daysLeft = Math.ceil((item.expirationDate.getTime() - Date.now()) / (24 * 60 * 60 * 1000));
      ctx.fillText(`⚠️ Expires in ${daysLeft} days!`, x + width - 120, y + 28);
    }
  }

  // Navigation methods
  public selectNextItem(): void {
    if (!this.uiState.currentFridge) return;
    const items = this.getFridgeItems(this.uiState.currentFridge);
    if (items.length > 0) {
      this.uiState.selectedItemIndex = (this.uiState.selectedItemIndex + 1) % items.length;
    }
  }

  public selectPreviousItem(): void {
    if (!this.uiState.currentFridge) return;
    const items = this.getFridgeItems(this.uiState.currentFridge);
    if (items.length > 0) {
      this.uiState.selectedItemIndex = this.uiState.selectedItemIndex > 0 
        ? this.uiState.selectedItemIndex - 1 
        : items.length - 1;
    }
  }

  public deleteSelectedItem(playerId: string): boolean {
    if (!this.uiState.currentFridge) return false;
    const items = this.getFridgeItems(this.uiState.currentFridge);
    if (items.length > 0 && this.uiState.selectedItemIndex < items.length) {
      const item = items[this.uiState.selectedItemIndex];
      const success = this.removeItem(this.uiState.currentFridge, item.id, playerId);
      if (success && this.uiState.selectedItemIndex >= items.length - 1) {
        this.uiState.selectedItemIndex = Math.max(0, items.length - 2);
      }
      return success;
    }
    return false;
  }

  public addRandomItem(fridgeId: string, playerId: string): boolean {
    const sampleItems = [
      { name: 'Leftover Sandwich', category: 'leftovers' as const, quantity: 1 },
      { name: 'Energy Drink', category: 'beverages' as const, quantity: 1 },
      { name: 'Yogurt', category: 'dairy' as const, quantity: 2 },
      { name: 'Apple', category: 'fruits' as const, quantity: 3 },
      { name: 'Carrot Sticks', category: 'vegetables' as const, quantity: 1 },
      { name: 'Cheese Slices', category: 'dairy' as const, quantity: 8 },
      { name: 'Orange Juice', category: 'beverages' as const, quantity: 1 },
      { name: 'Leftover Rice', category: 'leftovers' as const, quantity: 1 },
      { name: 'Bananas', category: 'fruits' as const, quantity: 4 },
      { name: 'Hot Sauce', category: 'condiments' as const, quantity: 1 }
    ];
    
    const randomItem = sampleItems[Math.floor(Math.random() * sampleItems.length)];
    
    return this.addItem(fridgeId, {
      ...randomItem,
      addedBy: playerId,
      expirationDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    }, playerId);
  }
}

export default FridgeManager;
