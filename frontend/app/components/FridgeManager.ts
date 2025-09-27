import { apiService, BackendFridgeItem } from '../services/ApiService';

export interface FridgeItem {
  id: string;
  name: string;
  quantity: number;
  addedBy: string;
  dateAdded: Date;
  expirationDate?: Date;
  category: 'dairy' | 'meat' | 'vegetables' | 'fruits' | 'leftovers' | 'beverages' | 'condiments' | 'other';
  // Additional fields for database integration
  status?: 'available' | 'claimed' | 'completed';
  photo_url?: string;
  apartment_number?: string;
  building_number?: string;
  building_id?: string;
  user_id?: string;
  isLocalItem?: boolean; // Flag to distinguish local vs database items
}

export interface FridgeData {
  items: FridgeItem[];
  lastUpdated: Date;
  apartmentId: string;
  residents: string[];
  isOnline?: boolean; // Track if we're connected to the database
}

class FridgeManager {
  private static instance: FridgeManager;
  private fridgeData: Map<string, FridgeData> = new Map();
  private uiState: {
    isOpen: boolean;
    currentFridge: string | null;
    selectedItemIndex: number;
    isInputMode: boolean;
    inputText: string;
    inputPrompt: string;
  } = {
    isOpen: false,
    currentFridge: null,
    selectedItemIndex: 0,
    isInputMode: false,
    inputText: '',
    inputPrompt: ''
  };
  private isLoading: boolean = false;
  private lastRefresh: Map<string, number> = new Map(); // Track last refresh time per fridge
  private refreshInterval: number = 30000; // 30 seconds
  private currentUser: string = 'player1'; // This should be set based on actual authentication

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
  public async getFridgeItems(fridgeId: string): Promise<FridgeItem[]> {
    await this.refreshFridgeData(fridgeId);
    const fridge = this.fridgeData.get(fridgeId);
    return fridge ? [...fridge.items] : [];
  }

  // Synchronous version for immediate access to cached data
  public getFridgeItemsSync(fridgeId: string): FridgeItem[] {
    const fridge = this.fridgeData.get(fridgeId);
    return fridge ? [...fridge.items] : [];
  }

  public canPlayerModify(fridgeId: string, playerId: string): boolean {
    const fridge = this.fridgeData.get(fridgeId);
    return fridge ? fridge.residents.includes(playerId) : false;
  }

  // UI State Management
  public async openFridgeUI(fridgeId: string): Promise<void> {
    this.uiState.isOpen = true;
    this.uiState.currentFridge = fridgeId;
    this.uiState.selectedItemIndex = 0;
    
    // Refresh data when opening UI
    await this.refreshFridgeData(fridgeId);
  }

  public closeFridgeUI(): void {
    this.uiState.isOpen = false;
    this.uiState.currentFridge = null;
    this.uiState.selectedItemIndex = 0;
    this.uiState.isInputMode = false;
    this.uiState.inputText = '';
    this.uiState.inputPrompt = '';
  }

  public isFridgeUIOpen(): boolean {
    return this.uiState.isOpen;
  }

  public getCurrentFridge(): string | null {
    return this.uiState.currentFridge;
  }

  // Modification methods (only for residents)
  public async addItem(fridgeId: string, item: Omit<FridgeItem, 'id' | 'dateAdded'>, playerId: string): Promise<boolean> {
    if (!this.canPlayerModify(fridgeId, playerId)) {
      console.log(`Player ${playerId} cannot modify fridge ${fridgeId} - not a resident`);
      return false;
    }

    try {
      const fridge = this.fridgeData.get(fridgeId);
      if (!fridge) return false;

      // Try to add to database first
      const daysToExpiry = item.expirationDate ? 
        Math.ceil((item.expirationDate.getTime() - Date.now()) / (24 * 60 * 60 * 1000)) : 
        undefined;

      const response = await apiService.addFridgeItem({
        item_name: item.name,
        photo_url: item.photo_url,
        apartment_number: fridge.apartmentId,
        building_number: this.getBuildingNumber(fridgeId),
        days_to_expiry: daysToExpiry,
        quantity: item.quantity,
        category: item.category
      });

      if (response.error) {
        console.warn('Failed to add item to database, adding locally:', response.error);
        // Fall back to local storage
        const newItem: FridgeItem = {
          ...item,
          id: `local-${item.category}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          dateAdded: new Date(),
          addedBy: playerId,
          isLocalItem: true
        };
        fridge.items.push(newItem);
      } else if (response.data) {
        // Success - refresh data to show the new item
        await this.refreshFridgeData(fridgeId);
      }

      fridge.lastUpdated = new Date();
      console.log(`Added item: ${item.name} to fridge ${fridgeId} by ${playerId}`);
      return true;
    } catch (error) {
      console.error('Error adding item:', error);
      return false;
    }
  }

  public async removeItem(fridgeId: string, itemId: string, playerId: string): Promise<boolean> {
    if (!this.canPlayerModify(fridgeId, playerId)) {
      console.log(`Player ${playerId} cannot modify fridge ${fridgeId} - not a resident`);
      return false;
    }

    try {
      const fridge = this.fridgeData.get(fridgeId);
      if (!fridge) return false;

      const itemIndex = fridge.items.findIndex(item => item.id === itemId);
      if (itemIndex === -1) {
        console.log(`Item ${itemId} not found in fridge ${fridgeId}`);
        return false;
      }

      const item = fridge.items[itemIndex];

      // If it's a local item or database deletion fails, remove locally
      if (item.isLocalItem) {
        const removedItem = fridge.items.splice(itemIndex, 1)[0];
        fridge.lastUpdated = new Date();
        console.log(`Removed local item: ${removedItem.name} from fridge ${fridgeId} by ${playerId}`);
        return true;
      }

      // Try to delete from database
      const response = await apiService.deleteFridgeItem(itemId);
      
      if (response.error) {
        console.warn('Failed to delete from database, removing locally:', response.error);
        const removedItem = fridge.items.splice(itemIndex, 1)[0];
        fridge.lastUpdated = new Date();
        console.log(`Removed item locally: ${removedItem.name} from fridge ${fridgeId} by ${playerId}`);
        return true;
      }

      // Success - refresh data
      await this.refreshFridgeData(fridgeId);
      fridge.lastUpdated = new Date();
      console.log(`Removed item from database: ${item.name} from fridge ${fridgeId} by ${playerId}`);
      return true;
    } catch (error) {
      console.error('Error removing item:', error);
      return false;
    }
  }

  // UI Rendering
  public renderFridgeUI(ctx: CanvasRenderingContext2D, playerId: string): void {
    if (!this.uiState.isOpen || !this.uiState.currentFridge) return;

    const fridgeId = this.uiState.currentFridge;
    const items = this.getFridgeItemsSync(fridgeId);
    const canModify = this.canPlayerModify(fridgeId, playerId);
    const fridge = this.fridgeData.get(fridgeId);

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
    // Permission and connection status
    ctx.fillStyle = canModify ? '#27AE60' : '#F39C12';
    ctx.font = '12px Arial';
    ctx.textAlign = 'left';
    const permissionText = canModify ? '✓ Resident (can modify)' : '👁 Visitor (view only)';
    ctx.fillText(permissionText, uiX + 10, uiY + 60);
    
    // Connection status
    const isOnline = fridge?.isOnline !== false;
    ctx.fillStyle = isOnline ? '#27AE60' : '#E74C3C';
    ctx.font = '10px Arial';
    const statusText = isOnline ? '🌐 Online' : '📴 Offline';
    ctx.fillText(statusText, uiX + uiWidth - 80, uiY + 60);
    
    // Loading indicator
    if (this.isLoading) {
      ctx.fillStyle = '#3498DB';
      ctx.font = '10px Arial';
      ctx.fillText('🔄 Loading...', uiX + uiWidth - 80, uiY + 75);
    }
    
    // Items list or input field
    if (this.uiState.isInputMode) {
      this.renderInputField(ctx, uiX + 10, uiY + 80, uiWidth - 20, 40);
      // Show items list below input field
      this.renderItemsList(ctx, items, uiX + 10, uiY + 130, uiWidth - 20, uiHeight - 170);
    } else {
      this.renderItemsList(ctx, items, uiX + 10, uiY + 80, uiWidth - 20, uiHeight - 120);
    }
    
    // Instructions
    ctx.fillStyle = '#7F8C8D';
    ctx.font = '10px Arial';
    ctx.textAlign = 'center';
    // Input mode instructions or regular instructions
    if (this.uiState.isInputMode) {
      ctx.fillText('Type food item name, press ENTER to add, ESC to cancel', uiX + uiWidth / 2, uiY + uiHeight - 10);
    } else if (canModify) {
      const instructions = isOnline 
        ? 'Press A to add item, D to delete selected item, C to claim, X to complete, R to refresh, ↑↓ to navigate, ESC to close'
        : 'Press A to add local item, D to delete item, R to retry connection, ↑↓ to navigate, ESC to close';
      ctx.fillText(instructions, uiX + uiWidth / 2, uiY + uiHeight - 10);
    } else {
      const instructions = isOnline 
        ? 'Press C to claim items, X to complete, R to refresh, ESC to close'
        : 'Press R to retry connection, ESC to close';
      ctx.fillText(instructions, uiX + uiWidth / 2, uiY + uiHeight - 10);
    }
    
    ctx.restore();
  }

  private renderInputField(ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number): void {
    // Input field background
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(x, y, width, height);
    
    // Input field border
    ctx.strokeStyle = '#3498DB';
    ctx.lineWidth = 2;
    ctx.strokeRect(x, y, width, height);
    
    // Prompt text
    ctx.fillStyle = '#2C3E50';
    ctx.font = 'bold 14px Arial';
    ctx.textAlign = 'left';
    ctx.fillText(this.uiState.inputPrompt, x + 10, y - 5);
    
    // Input text
    ctx.fillStyle = '#2C3E50';
    ctx.font = '16px Arial';
    const displayText = this.uiState.inputText + '|'; // Add cursor
    ctx.fillText(displayText, x + 10, y + 25);
    
    // Character limit indicator
    ctx.fillStyle = '#7F8C8D';
    ctx.font = '10px Arial';
    ctx.textAlign = 'right';
    ctx.fillText(`${this.uiState.inputText.length}/50`, x + width - 10, y + height - 5);
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
    
    // Item background - color based on status and type
    if (isSelected) {
      ctx.fillStyle = '#3498DB'; // Blue selection
    } else if (item.status === 'claimed') {
      ctx.fillStyle = '#D5DBDB'; // Gray for claimed
    } else if (item.status === 'completed') {
      ctx.fillStyle = '#D5F4E6'; // Light green for completed
    } else if (item.isLocalItem) {
      ctx.fillStyle = '#FFF3CD'; // Light yellow for local items
    } else if (isExpiringSoon) {
      ctx.fillStyle = '#FADBD8'; // Red for expiring
    } else {
      ctx.fillStyle = '#E8F4FD'; // Light blue for database items
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
    
    // Added by, date, and status
    ctx.fillStyle = isSelected ? '#ECF0F1' : '#7F8C8D';
    ctx.font = '9px Arial';
    let statusText = '';
    if (item.status && item.status !== 'available') {
      statusText = ` [${item.status.toUpperCase()}]`;
    }
    if (item.isLocalItem) {
      statusText += ' [LOCAL]';
    } else if (!item.isLocalItem) {
      statusText += ' [DB]';
    }
    const addedText = `Added by ${item.addedBy} on ${item.dateAdded.toLocaleDateString()}${statusText}`;
    ctx.fillText(addedText, x + 30, y + 28);
    
    // Expiration warning or status indicator
    if (isExpiringSoon && item.expirationDate) {
      ctx.fillStyle = isSelected ? '#FFFFFF' : '#E74C3C';
      ctx.font = 'bold 9px Arial';
      const daysLeft = Math.ceil((item.expirationDate.getTime() - Date.now()) / (24 * 60 * 60 * 1000));
      ctx.fillText(`⚠️ Expires in ${daysLeft} days!`, x + width - 120, y + 28);
    } else if (item.status === 'claimed') {
      ctx.fillStyle = isSelected ? '#FFFFFF' : '#7F8C8D';
      ctx.font = 'bold 9px Arial';
      ctx.fillText('📋 CLAIMED', x + width - 80, y + 28);
    } else if (item.status === 'completed') {
      ctx.fillStyle = isSelected ? '#FFFFFF' : '#27AE60';
      ctx.font = 'bold 9px Arial';
      ctx.fillText('✅ COMPLETED', x + width - 90, y + 28);
    }
  }

  // Navigation methods
  public selectNextItem(): void {
    if (!this.uiState.currentFridge) return;
    const items = this.getFridgeItemsSync(this.uiState.currentFridge);
    if (items.length > 0) {
      this.uiState.selectedItemIndex = (this.uiState.selectedItemIndex + 1) % items.length;
    }
  }

  public selectPreviousItem(): void {
    if (!this.uiState.currentFridge) return;
    const items = this.getFridgeItemsSync(this.uiState.currentFridge);
    if (items.length > 0) {
      this.uiState.selectedItemIndex = this.uiState.selectedItemIndex > 0 
        ? this.uiState.selectedItemIndex - 1 
        : items.length - 1;
    }
  }

  public async deleteSelectedItem(playerId: string): Promise<boolean> {
    if (!this.uiState.currentFridge) return false;
    const items = this.getFridgeItemsSync(this.uiState.currentFridge);
    if (items.length > 0 && this.uiState.selectedItemIndex < items.length) {
      const item = items[this.uiState.selectedItemIndex];
      const success = await this.removeItem(this.uiState.currentFridge, item.id, playerId);
      if (success && this.uiState.selectedItemIndex >= items.length - 1) {
        this.uiState.selectedItemIndex = Math.max(0, items.length - 2);
      }
      return success;
    }
    return false;
  }

  public async addRandomItem(fridgeId: string, playerId: string): Promise<boolean> {
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
    
    return await this.addItem(fridgeId, {
      ...randomItem,
      addedBy: playerId,
      expirationDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    }, playerId);
  }

  // Add custom item with user input
  public async addCustomItem(fridgeId: string, itemName: string, playerId: string): Promise<boolean> {
    if (!itemName.trim()) {
      return false;
    }

    // Auto-categorize based on common food items
    const category = this.categorizeFood(itemName.trim());
    
    return await this.addItem(fridgeId, {
      name: itemName.trim(),
      category: category,
      quantity: 1,
      addedBy: playerId,
      expirationDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days default
    }, playerId);
  }

  // Simple food categorization
  private categorizeFood(itemName: string): 'dairy' | 'meat' | 'vegetables' | 'fruits' | 'leftovers' | 'beverages' | 'condiments' | 'other' {
    const name = itemName.toLowerCase();
    
    // Dairy
    if (name.includes('milk') || name.includes('cheese') || name.includes('yogurt') || 
        name.includes('butter') || name.includes('cream') || name.includes('eggs')) {
      return 'dairy';
    }
    
    // Meat
    if (name.includes('chicken') || name.includes('beef') || name.includes('pork') || 
        name.includes('fish') || name.includes('meat') || name.includes('bacon') ||
        name.includes('ham') || name.includes('turkey')) {
      return 'meat';
    }
    
    // Vegetables
    if (name.includes('carrot') || name.includes('lettuce') || name.includes('tomato') ||
        name.includes('onion') || name.includes('pepper') || name.includes('broccoli') ||
        name.includes('spinach') || name.includes('potato') || name.includes('celery')) {
      return 'vegetables';
    }
    
    // Fruits
    if (name.includes('apple') || name.includes('banana') || name.includes('orange') ||
        name.includes('grape') || name.includes('berry') || name.includes('fruit') ||
        name.includes('lemon') || name.includes('lime') || name.includes('peach')) {
      return 'fruits';
    }
    
    // Beverages
    if (name.includes('drink') || name.includes('juice') || name.includes('soda') ||
        name.includes('water') || name.includes('beer') || name.includes('wine') ||
        name.includes('coffee') || name.includes('tea')) {
      return 'beverages';
    }
    
    // Condiments
    if (name.includes('sauce') || name.includes('dressing') || name.includes('mayo') ||
        name.includes('ketchup') || name.includes('mustard') || name.includes('oil') ||
        name.includes('vinegar') || name.includes('salt') || name.includes('pepper')) {
      return 'condiments';
    }
    
    // Leftovers
    if (name.includes('leftover') || name.includes('pizza') || name.includes('pasta') ||
        name.includes('rice') || name.includes('soup') || name.includes('sandwich')) {
      return 'leftovers';
    }
    
    return 'other';
  }

  // Database integration methods
  private async refreshFridgeData(fridgeId: string, force: boolean = false): Promise<void> {
    const now = Date.now();
    const lastRefresh = this.lastRefresh.get(fridgeId) || 0;
    
    // Skip if recently refreshed (unless forced)
    if (!force && now - lastRefresh < this.refreshInterval) {
      return;
    }

    if (this.isLoading) return;
    this.isLoading = true;

    try {
      const fridge = this.fridgeData.get(fridgeId);
      if (!fridge) return;

      console.log(`🔄 Refreshing fridge data for ${fridgeId}...`);

      // Get data from database
      const response = await apiService.getFridgeItems(fridge.apartmentId, this.getBuildingId(fridgeId));
      
      if (response.error) {
        console.warn('🚨 Failed to fetch from database:', response.error);
        if (fridge) {
          fridge.isOnline = false;
        }
        
        // Show user-friendly message if this is the first time opening
        if (force || fridge.items.length === 0) {
          console.log('📴 Operating in offline mode - showing local items only');
          console.log('💡 To connect to database: Make sure backend server is running on http://localhost:5000');
        }
      } else if (response.data) {
        // Transform backend items to frontend format
        const databaseItems: FridgeItem[] = response.data.map(this.transformBackendItem);
        
        // Merge with local items (items that were added offline)
        const localItems = fridge.items.filter(item => item.isLocalItem);
        
        fridge.items = [...databaseItems, ...localItems];
        fridge.lastUpdated = new Date();
        fridge.isOnline = true;
        
        console.log(`✅ Refreshed fridge ${fridgeId} with ${databaseItems.length} database items and ${localItems.length} local items`);
      }
      
      this.lastRefresh.set(fridgeId, now);
    } catch (error) {
      console.error('💥 Error refreshing fridge data:', error);
      const fridge = this.fridgeData.get(fridgeId);
      if (fridge) {
        fridge.isOnline = false;
      }
    } finally {
      this.isLoading = false;
    }
  }

  private transformBackendItem(backendItem: BackendFridgeItem): FridgeItem {
    return {
      id: backendItem.id,
      name: backendItem.name,
      quantity: backendItem.quantity,
      addedBy: backendItem.addedBy,
      dateAdded: new Date(backendItem.dateAdded),
      expirationDate: backendItem.expirationDate ? new Date(backendItem.expirationDate) : undefined,
      category: backendItem.category,
      status: backendItem.status,
      photo_url: backendItem.photo_url,
      apartment_number: backendItem.apartment_number,
      building_number: backendItem.building_number,
      building_id: backendItem.building_id,
      user_id: backendItem.user_id,
      isLocalItem: false
    };
  }

  private getBuildingId(fridgeId: string): string {
    // Map fridge IDs to building IDs (as integers for database)
    const buildingMap: { [key: string]: string } = {
      'edge': '1',
      'techterrace': '2'
    };
    return buildingMap[fridgeId] || '1';
  }

  private getBuildingNumber(fridgeId: string): string {
    // Map fridge IDs to building numbers
    const buildingMap: { [key: string]: string } = {
      'edge': '1',
      'techterrace': '2'
    };
    return buildingMap[fridgeId] || '0';
  }

  // Additional database operations
  public async claimItem(itemId: string): Promise<boolean> {
    try {
      const response = await apiService.claimItem(itemId);
      if (response.error) {
        console.error('Failed to claim item:', response.error);
        return false;
      }
      
      // Refresh current fridge data
      if (this.uiState.currentFridge) {
        await this.refreshFridgeData(this.uiState.currentFridge);
      }
      
      return true;
    } catch (error) {
      console.error('Error claiming item:', error);
      return false;
    }
  }

  public async completeItem(itemId: string): Promise<boolean> {
    try {
      const response = await apiService.completeItem(itemId);
      if (response.error) {
        console.error('Failed to complete item:', response.error);
        return false;
      }
      
      // Refresh current fridge data
      if (this.uiState.currentFridge) {
        await this.refreshFridgeData(this.uiState.currentFridge);
      }
      
      return true;
    } catch (error) {
      console.error('Error completing item:', error);
      return false;
    }
  }

  // Check if backend is available
  public async isBackendAvailable(): Promise<boolean> {
    return await apiService.ping();
  }

  // Force refresh current fridge
  public async forceRefresh(): Promise<void> {
    if (this.uiState.currentFridge) {
      console.log('🔄 Force refreshing fridge data...');
      this.lastRefresh.delete(this.uiState.currentFridge);
      await this.refreshFridgeData(this.uiState.currentFridge, true);
    }
  }

  // Get selected item index for external access
  public getSelectedItemIndex(): number {
    return this.uiState.selectedItemIndex;
  }

  // Input mode management
  public startInputMode(prompt: string): void {
    this.uiState.isInputMode = true;
    this.uiState.inputText = '';
    this.uiState.inputPrompt = prompt;
  }

  public cancelInputMode(): void {
    this.uiState.isInputMode = false;
    this.uiState.inputText = '';
    this.uiState.inputPrompt = '';
  }

  public isInInputMode(): boolean {
    return this.uiState.isInputMode;
  }

  public handleInputCharacter(char: string): void {
    if (this.uiState.isInputMode) {
      if (char === 'Backspace') {
        this.uiState.inputText = this.uiState.inputText.slice(0, -1);
      } else if (char.length === 1) {
        this.uiState.inputText += char;
      }
    }
  }

  public getInputText(): string {
    return this.uiState.inputText;
  }

  public getInputPrompt(): string {
    return this.uiState.inputPrompt;
  }

  public async submitInput(playerId: string): Promise<boolean> {
    if (!this.uiState.isInputMode || !this.uiState.currentFridge) {
      return false;
    }

    const success = await this.addCustomItem(
      this.uiState.currentFridge, 
      this.uiState.inputText, 
      playerId
    );

    this.cancelInputMode();
    return success;
  }
}

export default FridgeManager;
