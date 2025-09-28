module.exports = [
"[project]/app/services/ApiService.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "apiService",
    ()=>apiService,
    "default",
    ()=>__TURBOPACK__default__export__
]);
class ApiService {
    baseUrl;
    isOffline = false;
    constructor(){
        this.baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
        console.log('🔗 ApiService initialized with baseUrl:', this.baseUrl);
    }
    getHeaders() {
        const headers = {
            'Content-Type': 'application/json'
        };
        return headers;
    }
    async makeRequest(endpoint, options = {}) {
        const url = `${this.baseUrl}${endpoint}`;
        console.log(`📡 Making ${options.method || 'GET'} request to:`, url);
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(()=>controller.abort(), 10000); // 10 second timeout
            const response = await fetch(url, {
                ...options,
                signal: controller.signal,
                headers: {
                    ...this.getHeaders(),
                    ...options.headers
                }
            });
            clearTimeout(timeoutId);
            if (!response.ok) {
                console.warn(`❌ API request failed with status ${response.status}:`, url);
                const errorData = await response.json().catch(()=>({
                        error: 'Network error'
                    }));
                this.isOffline = response.status >= 500;
                return {
                    error: errorData.error || `HTTP ${response.status}: ${response.statusText}`
                };
            }
            const data = await response.json();
            console.log('✅ API request successful:', endpoint, data);
            this.isOffline = false;
            return {
                data
            };
        } catch (error) {
            this.isOffline = true;
            console.error('💥 API request failed:', {
                url,
                error: error.message,
                name: error.name,
                cause: error.cause
            });
            // Provide more specific error messages
            let errorMessage = 'Network error - backend may be offline';
            if (error.name === 'AbortError') {
                errorMessage = 'Request timeout - backend is taking too long to respond';
            } else if (error.message?.includes('fetch')) {
                errorMessage = 'Cannot connect to backend server. Please ensure the backend is running on ' + this.baseUrl;
            } else if (error.message?.includes('CORS')) {
                errorMessage = 'CORS error - backend may not allow requests from this origin';
            }
            return {
                error: errorMessage
            };
        }
    }
    // Get fridge items with optional filtering
    async getFridgeItems(apartmentId, buildingId) {
        const queryParams = new URLSearchParams();
        if (apartmentId) queryParams.append('apartment_id', apartmentId);
        if (buildingId) queryParams.append('building_id', buildingId);
        const endpoint = `/listings${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
        return this.makeRequest(endpoint);
    }
    // Add a new fridge item
    async addFridgeItem(item) {
        return this.makeRequest('/listings', {
            method: 'POST',
            body: JSON.stringify(item)
        });
    }
    // Update fridge items (single or bulk)
    async updateFridge(update) {
        return this.makeRequest('/listings', {
            method: 'PUT',
            body: JSON.stringify(update)
        });
    }
    // Delete a fridge item
    async deleteFridgeItem(itemId) {
        return this.makeRequest(`/listings/${itemId}`, {
            method: 'DELETE'
        });
    }
    // Legacy endpoints for compatibility
    async claimItem(itemId) {
        return this.makeRequest(`/listings/${itemId}/claim`, {
            method: 'PUT'
        });
    }
    // Health check
    async ping() {
        try {
            console.log('🏥 Checking backend health...');
            const controller = new AbortController();
            const timeoutId = setTimeout(()=>controller.abort(), 5000); // 5 second timeout for health check
            const response = await fetch(`${this.baseUrl}/listings/health`, {
                signal: controller.signal,
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            clearTimeout(timeoutId);
            const isHealthy = response.ok;
            if (isHealthy) {
                console.log('💚 Backend is healthy');
                this.isOffline = false;
            } else {
                console.warn('💛 Backend health check failed:', response.status);
                this.isOffline = true;
            }
            return isHealthy;
        } catch (error) {
            console.error('❤️‍🩹 Backend health check error:', error.message);
            this.isOffline = true;
            return false;
        }
    }
    // Get current offline status
    isOfflineMode() {
        return this.isOffline;
    }
    // Manual connection test
    async testConnection() {
        try {
            console.log('🔍 Testing connection to backend...');
            // Test basic connectivity
            const basicResponse = await fetch(this.baseUrl, {
                method: 'GET',
                signal: AbortSignal.timeout(5000)
            });
            if (!basicResponse.ok) {
                return {
                    success: false,
                    message: `Backend server responded with ${basicResponse.status}: ${basicResponse.statusText}`,
                    details: {
                        status: basicResponse.status,
                        url: this.baseUrl
                    }
                };
            }
            // Test health endpoint
            const healthCheck = await this.ping();
            if (!healthCheck) {
                return {
                    success: false,
                    message: 'Backend server is running but health check failed',
                    details: {
                        healthEndpoint: `${this.baseUrl}/listings/health`
                    }
                };
            }
            return {
                success: true,
                message: 'Backend connection successful',
                details: {
                    baseUrl: this.baseUrl
                }
            };
        } catch (error) {
            return {
                success: false,
                message: `Connection failed: ${error.message}`,
                details: {
                    error: error.name,
                    baseUrl: this.baseUrl,
                    suggestion: 'Make sure the backend server is running on ' + this.baseUrl
                }
            };
        }
    }
}
const apiService = new ApiService();
const __TURBOPACK__default__export__ = ApiService;
// Test connection on startup (only in development)
if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
;
}),
"[project]/app/components/FridgeManager.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>__TURBOPACK__default__export__
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$services$2f$ApiService$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/services/ApiService.ts [app-ssr] (ecmascript)");
;
class FridgeManager {
    static instance;
    fridgeData = new Map();
    uiState = {
        isOpen: false,
        currentFridge: null,
        selectedItemIndex: 0,
        isInputMode: false,
        inputText: '',
        inputPrompt: ''
    };
    isLoading = false;
    lastRefresh = new Map();
    refreshInterval = 30000;
    currentUser = 'player1';
    playerApartment = 'edge';
    static getInstance() {
        if (!FridgeManager.instance) {
            FridgeManager.instance = new FridgeManager();
        }
        return FridgeManager.instance;
    }
    constructor(){
        this.initializeDefaultFridges();
        this.determinePlayerApartment();
    }
    initializeDefaultFridges() {
        // Initialize Edge apartment fridge with empty items
        this.fridgeData.set('edge', {
            apartmentId: 'edge-apartment-001',
            residents: [
                'player1'
            ],
            lastUpdated: new Date(),
            items: [] // Start with empty items - will be populated from database
        });
        // Initialize Tech Terrace apartment fridge with empty items
        this.fridgeData.set('techterrace', {
            apartmentId: 'techterrace-apartment-001',
            residents: [
                'roommate1',
                'roommate2',
                'roommate3'
            ],
            lastUpdated: new Date(),
            items: [] // Start with empty items - will be populated from database
        });
    }
    // Public methods - everyone can view
    async getFridgeItems(fridgeId) {
        await this.refreshFridgeData(fridgeId);
        const fridge = this.fridgeData.get(fridgeId);
        return fridge ? [
            ...fridge.items
        ] : [];
    }
    // Synchronous version for immediate access to cached data
    getFridgeItemsSync(fridgeId) {
        const fridge = this.fridgeData.get(fridgeId);
        return fridge ? [
            ...fridge.items
        ] : [];
    }
    canPlayerModify(fridgeId, playerId) {
        const fridge = this.fridgeData.get(fridgeId);
        return fridge ? fridge.residents.includes(playerId) : false;
    }
    // Check if player owns this apartment (lives here)
    isPlayerApartment(fridgeId) {
        return fridgeId === this.playerApartment;
    }
    // Get permission level for display
    getPermissionLevel(fridgeId, playerId) {
        if (this.isPlayerApartment(fridgeId)) {
            return 'owner';
        }
        const fridge = this.fridgeData.get(fridgeId);
        if (fridge && fridge.residents.includes(playerId)) {
            return 'resident';
        }
        return 'visitor';
    }
    // Set which apartment the player lives in
    setPlayerApartment(apartmentId) {
        this.playerApartment = apartmentId;
        console.log(`🏠 Player apartment set to: ${apartmentId}`);
    }
    // Determine player's apartment based on game state or preferences
    determinePlayerApartment() {
        // For now, default to Edge apartment
        // In a full game, this could be determined by:
        // - Save game data
        // - Player selection
        // - Story progression
        // - etc.
        this.playerApartment = 'edge';
        console.log(`🏠 Player lives in: ${this.playerApartment} apartment`);
    }
    // UI State Management
    async openFridgeUI(fridgeId) {
        this.uiState.isOpen = true;
        this.uiState.currentFridge = fridgeId;
        this.uiState.selectedItemIndex = 0;
        // Refresh data when opening UI
        await this.refreshFridgeData(fridgeId);
    }
    closeFridgeUI() {
        this.uiState.isOpen = false;
        this.uiState.currentFridge = null;
        this.uiState.selectedItemIndex = 0;
        this.uiState.isInputMode = false;
        this.uiState.inputText = '';
        this.uiState.inputPrompt = '';
    }
    isFridgeUIOpen() {
        return this.uiState.isOpen;
    }
    getCurrentFridge() {
        return this.uiState.currentFridge;
    }
    // Modification methods (only for residents)
    async addItem(fridgeId, item, playerId) {
        if (!this.canPlayerModify(fridgeId, playerId)) {
            console.log(`Player ${playerId} cannot modify fridge ${fridgeId} - not a resident`);
            return false;
        }
        try {
            const fridge = this.fridgeData.get(fridgeId);
            if (!fridge) return false;
            // Try to add to database first
            const daysToExpiry = item.expirationDate ? Math.ceil((item.expirationDate.getTime() - Date.now()) / (24 * 60 * 60 * 1000)) : undefined;
            const response = await __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$services$2f$ApiService$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["apiService"].addFridgeItem({
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
                const newItem = {
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
    async removeItem(fridgeId, itemId, playerId) {
        if (!this.canPlayerModify(fridgeId, playerId)) {
            console.log(`Player ${playerId} cannot modify fridge ${fridgeId} - not a resident`);
            return false;
        }
        try {
            const fridge = this.fridgeData.get(fridgeId);
            if (!fridge) return false;
            const itemIndex = fridge.items.findIndex((item)=>item.id === itemId);
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
            const response = await __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$services$2f$ApiService$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["apiService"].deleteFridgeItem(itemId);
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
    renderFridgeUI(ctx, playerId) {
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
        const permissionLevel = this.getPermissionLevel(fridgeId, playerId);
        let permissionColor = '#F39C12'; // Default orange for visitor
        let permissionText = '👁 Visitor (view only)';
        if (permissionLevel === 'owner') {
            permissionColor = '#27AE60'; // Green for owner
            permissionText = '🏠 Your Apartment (full access)';
        } else if (permissionLevel === 'resident') {
            permissionColor = '#3498DB'; // Blue for resident
            permissionText = '🔑 Resident (can modify)';
        }
        ctx.fillStyle = permissionColor;
        ctx.font = '12px Arial';
        ctx.textAlign = 'left';
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
        } else {
            let instructions = '';
            if (permissionLevel === 'owner') {
                // Full access - can add, delete, claim
                instructions = isOnline ? 'Press A to add item, D to delete selected item, C to claim item, R to refresh, ↑↓ to navigate, ESC to close' : 'Press A to add local item, D to delete item, R to retry connection, ↑↓ to navigate, ESC to close';
            } else if (permissionLevel === 'resident') {
                // Can modify but not add items (not their apartment)
                instructions = isOnline ? 'Press D to delete selected item, C to claim item, R to refresh, ↑↓ to navigate, ESC to close' : 'Press D to delete item, R to retry connection, ↑↓ to navigate, ESC to close';
            } else {
                // Visitor - can only claim
                instructions = isOnline ? 'Press C to claim item, R to refresh, ↑↓ to navigate, ESC to close' : 'Press R to retry connection, ↑↓ to navigate, ESC to close';
            }
            ctx.fillText(instructions, uiX + uiWidth / 2, uiY + uiHeight - 10);
        }
        ctx.restore();
    }
    renderInputField(ctx, x, y, width, height) {
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
    renderItemsList(ctx, items, x, y, width, height) {
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
        const categories = {};
        items.forEach((item)=>{
            if (!categories[item.category]) {
                categories[item.category] = [];
            }
            categories[item.category].push(item);
        });
        let currentY = y;
        let itemIndex = 0;
        Object.entries(categories).forEach(([category, categoryItems])=>{
            // Category header
            ctx.fillStyle = '#34495E';
            ctx.font = 'bold 12px Arial';
            ctx.textAlign = 'left';
            ctx.fillText(`📁 ${category.toUpperCase()}`, x, currentY);
            currentY += 20;
            // Items in category
            categoryItems.forEach((item)=>{
                const isSelected = itemIndex === this.uiState.selectedItemIndex;
                this.renderFridgeItem(ctx, item, x + 10, currentY, width - 20, itemHeight - 5, isSelected);
                currentY += itemHeight;
                itemIndex++;
            });
            currentY += 10; // Space between categories
        });
    }
    renderFridgeItem(ctx, item, x, y, width, height, isSelected) {
        const isExpiringSoon = item.expirationDate && item.expirationDate.getTime() - Date.now() < 2 * 24 * 60 * 60 * 1000;
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
        ctx.strokeStyle = isSelected ? '#2980B9' : isExpiringSoon ? '#E74C3C' : '#BDC3C7';
        ctx.lineWidth = isSelected ? 2 : 1;
        ctx.strokeRect(x, y, width, height);
        // Item content
        const categoryEmojis = {
            dairy: '🥛',
            meat: '🥩',
            vegetables: '🥬',
            fruits: '🍎',
            leftovers: '🍕',
            beverages: '🥤',
            condiments: '🍯',
            other: '📦'
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
    selectNextItem() {
        if (!this.uiState.currentFridge) return;
        const items = this.getFridgeItemsSync(this.uiState.currentFridge);
        if (items.length > 0) {
            this.uiState.selectedItemIndex = (this.uiState.selectedItemIndex + 1) % items.length;
        }
    }
    selectPreviousItem() {
        if (!this.uiState.currentFridge) return;
        const items = this.getFridgeItemsSync(this.uiState.currentFridge);
        if (items.length > 0) {
            this.uiState.selectedItemIndex = this.uiState.selectedItemIndex > 0 ? this.uiState.selectedItemIndex - 1 : items.length - 1;
        }
    }
    async deleteSelectedItem(playerId) {
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
    async addRandomItem(fridgeId, playerId) {
        const sampleItems = [
            {
                name: 'Leftover Sandwich',
                category: 'leftovers',
                quantity: 1
            },
            {
                name: 'Energy Drink',
                category: 'beverages',
                quantity: 1
            },
            {
                name: 'Yogurt',
                category: 'dairy',
                quantity: 2
            },
            {
                name: 'Apple',
                category: 'fruits',
                quantity: 3
            },
            {
                name: 'Carrot Sticks',
                category: 'vegetables',
                quantity: 1
            },
            {
                name: 'Cheese Slices',
                category: 'dairy',
                quantity: 8
            },
            {
                name: 'Orange Juice',
                category: 'beverages',
                quantity: 1
            },
            {
                name: 'Leftover Rice',
                category: 'leftovers',
                quantity: 1
            },
            {
                name: 'Bananas',
                category: 'fruits',
                quantity: 4
            },
            {
                name: 'Hot Sauce',
                category: 'condiments',
                quantity: 1
            }
        ];
        const randomItem = sampleItems[Math.floor(Math.random() * sampleItems.length)];
        return await this.addItem(fridgeId, {
            ...randomItem,
            addedBy: playerId,
            expirationDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
        }, playerId);
    }
    // Add custom item with user input
    async addCustomItem(fridgeId, itemName, playerId) {
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
    categorizeFood(itemName) {
        const name = itemName.toLowerCase();
        // Dairy
        if (name.includes('milk') || name.includes('cheese') || name.includes('yogurt') || name.includes('butter') || name.includes('cream') || name.includes('eggs')) {
            return 'dairy';
        }
        // Meat
        if (name.includes('chicken') || name.includes('beef') || name.includes('pork') || name.includes('fish') || name.includes('meat') || name.includes('bacon') || name.includes('ham') || name.includes('turkey')) {
            return 'meat';
        }
        // Vegetables
        if (name.includes('carrot') || name.includes('lettuce') || name.includes('tomato') || name.includes('onion') || name.includes('pepper') || name.includes('broccoli') || name.includes('spinach') || name.includes('potato') || name.includes('celery')) {
            return 'vegetables';
        }
        // Fruits
        if (name.includes('apple') || name.includes('banana') || name.includes('orange') || name.includes('grape') || name.includes('berry') || name.includes('fruit') || name.includes('lemon') || name.includes('lime') || name.includes('peach')) {
            return 'fruits';
        }
        // Beverages
        if (name.includes('drink') || name.includes('juice') || name.includes('soda') || name.includes('water') || name.includes('beer') || name.includes('wine') || name.includes('coffee') || name.includes('tea')) {
            return 'beverages';
        }
        // Condiments
        if (name.includes('sauce') || name.includes('dressing') || name.includes('mayo') || name.includes('ketchup') || name.includes('mustard') || name.includes('oil') || name.includes('vinegar') || name.includes('salt') || name.includes('pepper')) {
            return 'condiments';
        }
        // Leftovers
        if (name.includes('leftover') || name.includes('pizza') || name.includes('pasta') || name.includes('rice') || name.includes('soup') || name.includes('sandwich')) {
            return 'leftovers';
        }
        return 'other';
    }
    // Database integration methods
    async refreshFridgeData(fridgeId, force = false) {
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
            const response = await __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$services$2f$ApiService$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["apiService"].getFridgeItems(fridge.apartmentId, this.getBuildingId(fridgeId));
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
                const databaseItems = response.data.map(this.transformBackendItem);
                // Merge with local items (items that were added offline)
                const localItems = fridge.items.filter((item)=>item.isLocalItem);
                fridge.items = [
                    ...databaseItems,
                    ...localItems
                ];
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
        } finally{
            this.isLoading = false;
        }
    }
    transformBackendItem(backendItem) {
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
    getBuildingId(fridgeId) {
        // Map fridge IDs to building IDs (as integers for database)
        const buildingMap = {
            'edge': '1',
            'techterrace': '2'
        };
        return buildingMap[fridgeId] || '1';
    }
    getBuildingNumber(fridgeId) {
        // Map fridge IDs to building numbers
        const buildingMap = {
            'edge': '1',
            'techterrace': '2'
        };
        return buildingMap[fridgeId] || '0';
    }
    // Additional database operations
    async claimAndDeleteItem(itemId) {
        try {
            // For database items, claim them (which now deletes them automatically)
            const response = await __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$services$2f$ApiService$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["apiService"].claimItem(itemId);
            if (response.error) {
                console.error('Failed to claim item:', response.error);
                return false;
            }
            // Refresh current fridge data to show the item is gone
            if (this.uiState.currentFridge) {
                await this.refreshFridgeData(this.uiState.currentFridge);
            }
            return true;
        } catch (error) {
            console.error('Error claiming item:', error);
            return false;
        }
    }
    // Check if backend is available
    async isBackendAvailable() {
        return await __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$services$2f$ApiService$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["apiService"].ping();
    }
    // Force refresh current fridge
    async forceRefresh() {
        if (this.uiState.currentFridge) {
            console.log('🔄 Force refreshing fridge data...');
            this.lastRefresh.delete(this.uiState.currentFridge);
            await this.refreshFridgeData(this.uiState.currentFridge, true);
        }
    }
    // Get selected item index for external access
    getSelectedItemIndex() {
        return this.uiState.selectedItemIndex;
    }
    // Input mode management
    startInputMode(prompt) {
        this.uiState.isInputMode = true;
        this.uiState.inputText = '';
        this.uiState.inputPrompt = prompt;
    }
    cancelInputMode() {
        this.uiState.isInputMode = false;
        this.uiState.inputText = '';
        this.uiState.inputPrompt = '';
    }
    isInInputMode() {
        return this.uiState.isInputMode;
    }
    handleInputCharacter(char) {
        if (this.uiState.isInputMode) {
            if (char === 'Backspace') {
                this.uiState.inputText = this.uiState.inputText.slice(0, -1);
            } else if (char.length === 1) {
                this.uiState.inputText += char;
            }
        }
    }
    getInputText() {
        return this.uiState.inputText;
    }
    getInputPrompt() {
        return this.uiState.inputPrompt;
    }
    async submitInput(playerId) {
        if (!this.uiState.isInputMode || !this.uiState.currentFridge) {
            return false;
        }
        const success = await this.addCustomItem(this.uiState.currentFridge, this.uiState.inputText, playerId);
        this.cancelInputMode();
        return success;
    }
}
const __TURBOPACK__default__export__ = FridgeManager;
}),
"[project]/app/utils/BackendChecker.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "BackendChecker",
    ()=>BackendChecker
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$services$2f$ApiService$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/services/ApiService.ts [app-ssr] (ecmascript)");
;
class BackendChecker {
    static hasShownWarning = false;
    static async checkBackendConnection() {
        if (this.hasShownWarning || "undefined" === 'undefined') return;
        //TURBOPACK unreachable
        ;
    }
    static showBackendWarning(message, details) {
        console.group('🚨 Backend Connection Issue');
        console.error('Message:', message);
        if (details) {
            console.error('Details:', details);
        }
        console.log('');
        console.log('🔧 How to fix:');
        console.log('1. Open a new terminal');
        console.log('2. Navigate to the backend directory: cd backend');
        console.log('3. Start the backend server: npm run dev');
        console.log('4. Make sure it says "Server started on port 8080"');
        console.log('5. Refresh this page');
        console.log('');
        console.log('💡 The fridge system will work in offline mode until the backend is connected.');
        console.log('🔓 Authentication has been disabled for easier testing.');
        console.groupEnd();
        // Also show a subtle notification to the user
        if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
        ;
    }
    static showUserNotification() {
        // Create a simple notification element
        const notification = document.createElement('div');
        notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: #FFF3CD;
      border: 1px solid #FFEAA7;
      border-radius: 8px;
      padding: 12px 16px;
      max-width: 300px;
      font-family: Arial, sans-serif;
      font-size: 12px;
      color: #856404;
      z-index: 10000;
      box-shadow: 0 4px 12px rgba(0,0,0,0.1);
    `;
        notification.innerHTML = `
      <div style="display: flex; align-items: start; gap: 8px;">
        <span style="font-size: 16px;">🔌</span>
        <div>
          <div style="font-weight: bold; margin-bottom: 4px;">Backend Offline</div>
          <div>Fridge data is in offline mode. Check console for setup instructions.</div>
        </div>
        <button onclick="this.parentElement.parentElement.remove()" style="
          background: none; 
          border: none; 
          font-size: 16px; 
          cursor: pointer; 
          color: #856404;
          margin-left: auto;
        ">×</button>
      </div>
    `;
        document.body.appendChild(notification);
        // Auto-remove after 10 seconds
        setTimeout(()=>{
            if (notification.parentElement) {
                notification.remove();
            }
        }, 10000);
    }
    static async retryConnection() {
        console.log('🔄 Retrying backend connection...');
        const result = await __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$services$2f$ApiService$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["apiService"].testConnection();
        if (result.success) {
            console.log('✅ Backend connection restored!');
            return true;
        } else {
            console.error('❌ Backend still unavailable:', result.message);
            return false;
        }
    }
}
// Auto-check on import in development
if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
;
}),
"[project]/app/components/Player.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>__TURBOPACK__default__export__
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$components$2f$FridgeManager$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/components/FridgeManager.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$utils$2f$BackendChecker$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/utils/BackendChecker.ts [app-ssr] (ecmascript)");
;
;
class Player {
    x;
    y;
    width = 16;
    height = 16;
    speed = 120;
    direction = 'down';
    animationFrame = 0;
    animationTimer = 0;
    animationSpeed = 200;
    isMoving = false;
    // Chat functionality
    isChatting = false;
    currentMessage = '';
    displayMessage = '';
    messageTimer = 0;
    messageDuration = 3000;
    // Interaction system
    nearbyFridge = null;
    playerId = 'player1';
    nearbyJake = null;
    // Character data
    playerCharacter;
    constructor(x, y, playerCharacter){
        this.x = x;
        this.y = y;
        this.playerCharacter = playerCharacter;
        this.setupChatEventListeners();
    }
    update(deltaTime, inputHandler, scene) {
        // Handle chat input first
        this.updateChat(deltaTime, inputHandler);
        // Handle fridge interactions
        this.updateFridgeInteraction(inputHandler, scene);
        // Only allow movement if not chatting and fridge UI is not open
        const fridgeManager = __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$components$2f$FridgeManager$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].getInstance();
        if (!this.isChatting && !fridgeManager.isFridgeUIOpen()) {
            let newX = this.x;
            let newY = this.y;
            this.isMoving = false;
            // Handle movement input
            if (inputHandler.isKeyPressed('ArrowUp') || inputHandler.isKeyPressed('KeyW')) {
                newY -= this.speed * deltaTime / 1000;
                this.direction = 'up';
                this.isMoving = true;
            }
            if (inputHandler.isKeyPressed('ArrowDown') || inputHandler.isKeyPressed('KeyS')) {
                newY += this.speed * deltaTime / 1000;
                this.direction = 'down';
                this.isMoving = true;
            }
            if (inputHandler.isKeyPressed('ArrowLeft') || inputHandler.isKeyPressed('KeyA')) {
                newX -= this.speed * deltaTime / 1000;
                this.direction = 'left';
                this.isMoving = true;
            }
            if (inputHandler.isKeyPressed('ArrowRight') || inputHandler.isKeyPressed('KeyD')) {
                newX += this.speed * deltaTime / 1000;
                this.direction = 'right';
                this.isMoving = true;
            }
            // Check collision with scene boundaries and obstacles
            if (this.canMoveTo(newX, newY, scene)) {
                this.x = newX;
                this.y = newY;
            }
            // Movement is blocked if canMoveTo returns false - don't update position
            // Update animation
            if (this.isMoving) {
                this.animationTimer += deltaTime;
                if (this.animationTimer >= this.animationSpeed) {
                    this.animationFrame = (this.animationFrame + 1) % 2; // 2 frame walk cycle
                    this.animationTimer = 0;
                }
            } else {
                this.animationFrame = 0; // Reset to idle frame
            }
        }
    }
    canMoveTo(x, y, scene) {
        // Check scene boundaries (world is now 800x1216 pixels - two full screens stacked)
        if (x < 0 || y < 0 || x + this.width > 800 || y + this.height > 1216) {
            console.log('Movement blocked by world boundaries:', {
                x,
                y,
                worldBounds: [
                    800,
                    1216
                ]
            });
            return false;
        }
        return true;
    // Temporarily disable scene collision to test
    // try {
    //   const canMove = scene.canMoveTo(x, y, this.width, this.height);
    //   if (!canMove) {
    //     console.log('Movement blocked by scene collision:', { x, y, sceneType: scene.type });
    //   }
    //   return canMove;
    // } catch (error) {
    //   console.error('Error in scene collision detection:', error);
    //   // If there's an error, allow movement to avoid getting stuck
    //   return true;
    // }
    }
    render(ctx, cameraX = 0, cameraY = 0) {
        // Create a simple pixel-art character
        const scale = 2; // Scale up for visibility
        // Calculate screen position relative to camera
        const screenX = this.x - cameraX;
        const screenY = this.y - cameraY;
        ctx.save();
        ctx.scale(scale, scale);
        const drawX = Math.floor(screenX / scale);
        const drawY = Math.floor(screenY / scale);
        // Draw character body (simple 8x8 sprite)
        this.drawPixelArtCharacter(ctx, drawX, drawY, this.direction, this.animationFrame);
        ctx.restore();
        // Draw player name above character
        this.renderPlayerName(ctx, screenX, screenY);
        // Draw chat bubble if there's a message or currently typing
        if (this.displayMessage || this.isChatting) {
            this.renderChatBubble(ctx, screenX, screenY);
        }
        // Render fridge interaction prompt
        if (this.nearbyFridge && !__TURBOPACK__imported__module__$5b$project$5d2f$app$2f$components$2f$FridgeManager$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].getInstance().isFridgeUIOpen()) {
            this.renderFridgePrompt(ctx, screenX, screenY);
        }
    }
    drawPixelArtCharacter(ctx, x, y, direction, frame) {
        const pixelSize = 1;
        const shadowColor = 'rgba(0,0,0,0.3)';
        // Draw shadow
        ctx.fillStyle = shadowColor;
        ctx.fillRect(x, y + 7, 8, 1);
        // Character sprite data (8x8 pixels)
        const spriteData = this.getCharacterSprite(direction, frame);
        // Draw the character pixel by pixel
        for(let row = 0; row < 8; row++){
            for(let col = 0; col < 8; col++){
                const pixel = spriteData[row][col];
                if (pixel !== 0) {
                    ctx.fillStyle = this.getPixelColor(pixel);
                    ctx.fillRect(x + col, y + row, pixelSize, pixelSize);
                }
            }
        }
    }
    getCharacterSprite(direction, frame) {
        // Simplified sprite data where:
        // 0 = transparent, 1 = hair, 2 = skin, 3 = shirt, 4 = pants
        const baseSprite = [
            [
                0,
                1,
                1,
                1,
                1,
                1,
                1,
                0
            ],
            [
                1,
                2,
                2,
                2,
                2,
                2,
                2,
                1
            ],
            [
                0,
                2,
                2,
                2,
                2,
                2,
                2,
                0
            ],
            [
                0,
                3,
                3,
                3,
                3,
                3,
                3,
                0
            ],
            [
                0,
                3,
                3,
                3,
                3,
                3,
                3,
                0
            ],
            [
                0,
                4,
                4,
                4,
                4,
                4,
                4,
                0
            ],
            [
                0,
                4,
                4,
                0,
                0,
                4,
                4,
                0
            ],
            [
                0,
                2,
                2,
                0,
                0,
                2,
                2,
                0
            ]
        ];
        // Add simple animation for walking
        if (frame === 1 && direction !== 'up') {
            // Slightly offset legs for walking animation
            baseSprite[6] = [
                0,
                4,
                0,
                4,
                4,
                0,
                4,
                0
            ];
            baseSprite[7] = [
                0,
                2,
                0,
                2,
                2,
                0,
                2,
                0
            ];
        }
        return baseSprite;
    }
    getPixelColor(pixelType) {
        const character = this.playerCharacter.selectedCharacter;
        switch(pixelType){
            case 1:
                return character.hairColor;
            case 2:
                return character.skinColor;
            case 3:
                return character.shirtColor;
            case 4:
                return character.pantsColor;
            default:
                return 'transparent';
        }
    }
    renderPlayerName(ctx, playerX, playerY) {
        const name = this.playerCharacter.playerName;
        if (!name) return;
        // Determine pronouns to display
        let pronounsText = '';
        if (this.playerCharacter.showPronouns && this.playerCharacter.selectedGender) {
            if (this.playerCharacter.selectedGender.id === 'custom' && this.playerCharacter.customPronouns) {
                pronounsText = this.playerCharacter.customPronouns;
            } else if (this.playerCharacter.selectedGender.pronouns) {
                pronounsText = this.playerCharacter.selectedGender.pronouns;
            }
        }
        // Name settings - position below player
        const nameY = playerY + this.height + 15; // Position below player
        const nameX = playerX + this.width / 2;
        ctx.save();
        ctx.font = '10px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        // Calculate dimensions for both name and pronouns
        const nameWidth = ctx.measureText(name).width;
        const pronounsWidth = pronounsText ? ctx.measureText(`(${pronounsText})`).width : 0;
        const maxWidth = Math.max(nameWidth, pronounsWidth);
        const padding = 4;
        const backgroundWidth = maxWidth + padding * 2;
        const backgroundHeight = pronounsText ? 22 : 12; // Taller if pronouns present
        // Draw background
        ctx.fillStyle = '#861F41';
        ctx.fillRect(nameX - backgroundWidth / 2, nameY - backgroundHeight / 2, backgroundWidth, backgroundHeight);
        // Draw border
        ctx.strokeStyle = '#E5751F';
        ctx.lineWidth = 1;
        ctx.strokeRect(nameX - backgroundWidth / 2, nameY - backgroundHeight / 2, backgroundWidth, backgroundHeight);
        // Draw name text
        ctx.fillStyle = '#FFFFFF';
        const nameYPos = pronounsText ? nameY - 5 : nameY; // Move up if pronouns present
        ctx.fillText(name, nameX, nameYPos);
        // Draw pronouns text below name if present
        if (pronounsText) {
            ctx.fillStyle = '#CCCCCC'; // Slightly dimmer color for pronouns
            ctx.fillText(`(${pronounsText})`, nameX, nameY + 5);
        }
        ctx.restore();
    }
    setupChatEventListeners() {
        if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
        ;
    }
    updateChat(deltaTime, inputHandler) {
        // Update message display timer
        if (this.displayMessage && this.messageTimer > 0) {
            this.messageTimer -= deltaTime;
            if (this.messageTimer <= 0) {
                this.displayMessage = '';
                this.messageTimer = 0;
            }
        }
    // Note: Enter key handling is now done in the global keyboard listener only
    // This prevents conflicts between the two input systems
    }
    startChatting() {
        this.isChatting = true;
        this.currentMessage = '';
        console.log('💬 Started chatting mode - bubble should appear');
    }
    cancelChatting() {
        this.isChatting = false;
        this.currentMessage = '';
        console.log('Cancelled chatting mode');
    }
    sendMessage() {
        if (this.currentMessage.trim()) {
            const messageToSend = this.currentMessage.trim();
            console.log('💬 Player said:', messageToSend);
            // Show the message in a bubble for a few seconds
            this.displayMessage = messageToSend;
            this.messageTimer = this.messageDuration; // 3 seconds
            // If near Jake, send message to him
            if (this.nearbyJake) {
                console.log('🍺 Sending message to Jake:', messageToSend);
                this.nearbyJake.respondToPlayer(messageToSend);
            }
        }
        // Clear chat input state (stop input mode)
        this.isChatting = false;
        this.currentMessage = '';
        console.log('💬 Message sent, showing in bubble for 3 seconds');
    }
    handleChatInput(event) {
        if (event.key === 'Backspace') {
            this.currentMessage = this.currentMessage.slice(0, -1);
            event.preventDefault();
        } else if (event.key.length === 1) {
            // Only add printable characters
            this.currentMessage += event.key;
            event.preventDefault();
        }
    }
    renderChatBubble(ctx, playerX, playerY) {
        const message = this.isChatting ? this.currentMessage + '|' : this.displayMessage;
        if (!message) return;
        // Bubble settings
        const padding = 8;
        const bubbleHeight = 30;
        const maxWidth = 200;
        const bubbleY = playerY - bubbleHeight - 10; // Position above player
        // Measure text
        ctx.font = '12px Arial';
        const textWidth = Math.min(ctx.measureText(message).width, maxWidth - padding * 2);
        const bubbleWidth = textWidth + padding * 2;
        const bubbleX = playerX + this.width - bubbleWidth / 2;
        // Draw bubble background
        ctx.save();
        ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
        ctx.strokeStyle = '#333';
        ctx.lineWidth = 2;
        // Rounded rectangle for bubble
        this.drawRoundedRect(ctx, bubbleX, bubbleY, bubbleWidth, bubbleHeight, 8);
        ctx.fill();
        ctx.stroke();
        // Draw bubble tail
        ctx.beginPath();
        ctx.moveTo(playerX + this.width / 2, bubbleY + bubbleHeight);
        ctx.lineTo(playerX + this.width / 2 - 5, bubbleY + bubbleHeight + 8);
        ctx.lineTo(playerX + this.width / 2 + 5, bubbleY + bubbleHeight + 8);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        // Draw text
        ctx.fillStyle = '#333';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(message, bubbleX + bubbleWidth / 2, bubbleY + bubbleHeight / 2, maxWidth - padding * 2);
        ctx.restore();
    }
    drawRoundedRect(ctx, x, y, width, height, radius) {
        ctx.beginPath();
        ctx.moveTo(x + radius, y);
        ctx.lineTo(x + width - radius, y);
        ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
        ctx.lineTo(x + width, y + height - radius);
        ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
        ctx.lineTo(x + radius, y + height);
        ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
        ctx.lineTo(x, y + radius);
        ctx.quadraticCurveTo(x, y, x + radius, y);
        ctx.closePath();
    }
    renderFridgePrompt(ctx, screenX, screenY) {
        const promptX = screenX + this.width / 2;
        const promptY = screenY - 30;
        ctx.save();
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(promptX - 35, promptY - 15, 70, 20);
        ctx.fillStyle = '#FFFFFF';
        ctx.font = '10px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Press E', promptX, promptY - 5);
        ctx.fillText('to open fridge', promptX, promptY + 5);
        ctx.restore();
    }
    updateFridgeInteraction(inputHandler, scene) {
        const fridgeManager = __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$components$2f$FridgeManager$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].getInstance();
        // Check if we're near a fridge in the Edge apartment
        if (scene.type === 'edge') {
            const fridgeX = 13 * 32; // Tile 13 * 32 pixels
            const fridgeY = 9 * 32; // Tile 9 * 32 pixels
            const distance = Math.sqrt(Math.pow(this.x + this.width / 2 - (fridgeX + 16), 2) + Math.pow(this.y + this.height / 2 - (fridgeY + 16), 2));
            if (distance <= 48) {
                this.nearbyFridge = 'edge';
                // Handle interaction input
                if (inputHandler.wasKeyJustPressed('KeyE')) {
                    console.log('🔑 E key pressed - opening Edge fridge UI!');
                    if (!fridgeManager.isFridgeUIOpen()) {
                        fridgeManager.openFridgeUI('edge').then(()=>{
                            console.log('📋 Edge fridge UI opened');
                        }).catch((error)=>{
                            console.error('Failed to open fridge UI:', error);
                            console.log('💡 Tip: The fridge will still work in offline mode');
                        });
                    }
                }
            } else {
                this.nearbyFridge = null;
            }
        } else if (scene.type === 'techterrace') {
            const fridgeX = 13 * 32; // Tile 13 * 32 pixels
            const fridgeY = 10 * 32; // Tile 10 * 32 pixels (TechTerrace fridge is at y=10)
            const distance = Math.sqrt(Math.pow(this.x + this.width / 2 - (fridgeX + 16), 2) + Math.pow(this.y + this.height / 2 - (fridgeY + 16), 2));
            if (distance <= 48) {
                this.nearbyFridge = 'techterrace';
                // Handle interaction input
                if (inputHandler.wasKeyJustPressed('KeyE')) {
                    console.log('🔑 E key pressed - opening Tech Terrace fridge UI!');
                    if (!fridgeManager.isFridgeUIOpen()) {
                        fridgeManager.openFridgeUI('techterrace').then(()=>{
                            console.log('📋 Tech Terrace fridge UI opened');
                        }).catch((error)=>{
                            console.error('Failed to open fridge UI:', error);
                            console.log('💡 Tip: The fridge will still work in offline mode');
                        });
                    }
                }
            } else {
                this.nearbyFridge = null;
            }
        } else {
            this.nearbyFridge = null;
        }
        // Handle UI input when fridge is open
        if (fridgeManager.isFridgeUIOpen()) {
            this.handleFridgeUIInput(inputHandler, fridgeManager);
        }
    }
    handleFridgeUIInput(inputHandler, fridgeManager) {
        // Check if we're in input mode
        if (fridgeManager.isInInputMode()) {
            // Input mode is handled by the global keyboard listener
            return;
        }
        // Close with ESC - this should have priority over scene transitions
        if (inputHandler.wasKeyJustPressed('Escape')) {
            console.log('🧊 ESC pressed - closing fridge UI');
            fridgeManager.closeFridgeUI();
            return;
        }
        const currentFridge = fridgeManager.getCurrentFridge();
        if (!currentFridge) return;
        const canModify = fridgeManager.canPlayerModify(currentFridge, this.playerId);
        // Navigation
        if (inputHandler.wasKeyJustPressed('ArrowUp') || inputHandler.wasKeyJustPressed('KeyW')) {
            fridgeManager.selectPreviousItem();
        }
        if (inputHandler.wasKeyJustPressed('ArrowDown') || inputHandler.wasKeyJustPressed('KeyS')) {
            fridgeManager.selectNextItem();
        }
        // Claim item with 'C' key (available to all users) - this now deletes the item
        if (inputHandler.wasKeyJustPressed('KeyC')) {
            const items = fridgeManager.getFridgeItemsSync(currentFridge);
            const selectedItem = items[fridgeManager.getSelectedItemIndex()];
            if (selectedItem && selectedItem.status === 'available' && !selectedItem.isLocalItem) {
                fridgeManager.claimAndDeleteItem(selectedItem.id).then((success)=>{
                    if (success) {
                        console.log('🎉 Item claimed and taken successfully!');
                    } else {
                        console.log('❌ Failed to claim item');
                    }
                });
            }
        }
        const permissionLevel = fridgeManager.getPermissionLevel(currentFridge, this.playerId);
        // Only allow adding items in player's own apartment
        if (permissionLevel === 'owner') {
            // Add item with 'A' key - now opens input mode
            if (inputHandler.wasKeyJustPressed('KeyA')) {
                console.log('📝 Starting input mode for adding custom item...');
                fridgeManager.startInputMode('Enter food item name:');
            }
        }
        if (canModify) {
            // Delete selected item with 'D' key
            if (inputHandler.wasKeyJustPressed('KeyD')) {
                fridgeManager.deleteSelectedItem(this.playerId).then((success)=>{
                    if (success) {
                        console.log('🗑️ Item deleted successfully');
                    } else {
                        console.log('❌ Failed to delete item');
                    }
                });
            }
            // Force refresh with 'R' key
            if (inputHandler.wasKeyJustPressed('KeyR')) {
                console.log('🔄 Refreshing fridge data...');
                // Try to reconnect to backend first
                __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$utils$2f$BackendChecker$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["BackendChecker"].retryConnection().then((connected)=>{
                    if (connected) {
                        console.log('🎉 Backend reconnected! Refreshing data...');
                    }
                    return fridgeManager.forceRefresh();
                }).then(()=>{
                    console.log('✅ Fridge data refreshed');
                }).catch((error)=>{
                    console.error('❌ Error during refresh:', error);
                });
            }
        }
    }
    handleFridgeInput(event, fridgeManager) {
        if (event.key === 'Enter') {
            // Submit the input
            console.log('🍎 Submitting food item:', fridgeManager.getInputText());
            fridgeManager.submitInput(this.playerId).then((success)=>{
                if (success) {
                    console.log('✅ Custom item added successfully:', fridgeManager.getInputText());
                } else {
                    console.log('❌ Failed to add custom item');
                }
            });
        } else if (event.key === 'Escape') {
            // Cancel input mode
            console.log('❌ Cancelled adding item');
            fridgeManager.cancelInputMode();
        } else {
            // Handle character input
            if (fridgeManager.getInputText().length < 50) {
                fridgeManager.handleInputCharacter(event.key);
            }
        }
    }
    // Jake interaction methods
    setNearbyJake(jake) {
        this.nearbyJake = jake;
        if (jake) {
            console.log('🍺 Player is now near Jake');
        } else {
            console.log('🍺 Player left Jake\'s area');
        }
    }
    isNearJake() {
        return this.nearbyJake !== null;
    }
    // Debug method to test Jake manually
    testJakeResponse() {
        if (this.nearbyJake) {
            console.log('🧪 Testing Jake response...');
            this.nearbyJake.respondToPlayer('Hello Jake, this is a test message!');
        } else {
            console.log('🧪 No Jake nearby to test');
        }
    }
    // Getter methods for collision detection
    getLeft() {
        return this.x;
    }
    getRight() {
        return this.x + this.width;
    }
    getTop() {
        return this.y;
    }
    getBottom() {
        return this.y + this.height;
    }
}
const __TURBOPACK__default__export__ = Player;
}),
"[project]/app/components/InputHandler.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>__TURBOPACK__default__export__
]);
class InputHandler {
    keys = new Set();
    keyPressed = new Set();
    keyReleased = new Set();
    constructor(){
        this.handleKeyDown = this.handleKeyDown.bind(this);
        this.handleKeyUp = this.handleKeyUp.bind(this);
        // Add event listeners
        if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
        ;
    }
    handleKeyDown(event) {
        const key = event.code;
        // Debug key presses
        if (key === 'Escape') {
            console.log('🔑 ESC key detected in InputHandler');
        }
        if (key === 'KeyE') {
            console.log('🔑 E key detected in InputHandler');
        }
        // Prevent default behavior for game keys
        if (this.isGameKey(key)) {
            event.preventDefault();
        }
        if (!this.keys.has(key)) {
            this.keys.add(key);
            this.keyPressed.add(key);
        }
    }
    handleKeyUp(event) {
        const key = event.code;
        if (this.keys.has(key)) {
            this.keys.delete(key);
            this.keyReleased.add(key);
        }
    }
    isGameKey(key) {
        const gameKeys = [
            'ArrowUp',
            'ArrowDown',
            'ArrowLeft',
            'ArrowRight',
            'KeyW',
            'KeyA',
            'KeyS',
            'KeyD',
            'Space',
            'Enter',
            'Escape',
            'KeyE'
        ];
        return gameKeys.includes(key);
    }
    isKeyPressed(key) {
        return this.keys.has(key);
    }
    wasKeyJustPressed(key) {
        return this.keyPressed.has(key);
    }
    wasKeyJustReleased(key) {
        return this.keyReleased.has(key);
    }
    update() {
        // Clear frame-specific key states
        this.keyPressed.clear();
        this.keyReleased.clear();
    }
    destroy() {
        if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
        ;
        this.keys.clear();
        this.keyPressed.clear();
        this.keyReleased.clear();
    }
}
const __TURBOPACK__default__export__ = InputHandler;
}),
"[project]/app/components/BaseArea.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>__TURBOPACK__default__export__
]);
class BaseArea {
    tileSize = 32;
    areaWidth = 25;
    areaHeight = 19;
    tiles;
    cameraX = 0;
    cameraY = 0;
    exitX = 400;
    exitY = 450;
    constructor(){
        this.tiles = this.generateArea();
    }
    canMoveTo(x, y, width, height) {
        // Convert pixel coordinates to tile coordinates
        const leftTile = Math.floor(x / this.tileSize);
        const rightTile = Math.floor((x + width - 1) / this.tileSize);
        const topTile = Math.floor(y / this.tileSize);
        const bottomTile = Math.floor((y + height - 1) / this.tileSize);
        // Check all tiles that the entity overlaps
        for(let tileY = topTile; tileY <= bottomTile; tileY++){
            for(let tileX = leftTile; tileX <= rightTile; tileX++){
                if (this.isTileSolid(tileX, tileY)) {
                    return false;
                }
            }
        }
        return true;
    }
    isTileSolid(tileX, tileY) {
        // Check bounds
        if (tileX < 0 || tileX >= this.areaWidth || tileY < 0 || tileY >= this.areaHeight) {
            return true; // Treat out-of-bounds as solid
        }
        return this.tiles[tileY][tileX].solid;
    }
    update(deltaTime) {
    // Base update logic - can be overridden
    }
    render(ctx, player) {
        // Update camera
        this.updateCamera(player);
        // Clear with appropriate background
        this.renderBackground(ctx);
        // Render visible tiles
        const startTileX = Math.max(0, Math.floor(this.cameraX / this.tileSize));
        const endTileX = Math.min(this.areaWidth - 1, Math.floor((this.cameraX + 800) / this.tileSize));
        const startTileY = Math.max(0, Math.floor(this.cameraY / this.tileSize));
        const endTileY = Math.min(this.areaHeight - 1, Math.floor((this.cameraY + 600) / this.tileSize));
        for(let tileY = startTileY; tileY <= endTileY; tileY++){
            for(let tileX = startTileX; tileX <= endTileX; tileX++){
                const tile = this.tiles[tileY][tileX];
                const x = tileX * this.tileSize - this.cameraX;
                const y = tileY * this.tileSize - this.cameraY;
                this.renderTile(ctx, tile, x, y);
            }
        }
        // Render area-specific elements
        this.renderAreaSpecificElements(ctx);
    }
    updateCamera(player) {
        // Keep camera centered on player, but don't go outside area bounds
        const targetCameraX = player.x - 400 + player.width / 2;
        const targetCameraY = player.y - 300 + player.height / 2;
        const maxCameraX = this.areaWidth * this.tileSize - 800;
        const maxCameraY = this.areaHeight * this.tileSize - 600;
        this.cameraX = Math.max(0, Math.min(maxCameraX, targetCameraX));
        this.cameraY = Math.max(0, Math.min(maxCameraY, targetCameraY));
    }
    renderTile(ctx, tile, x, y) {
        switch(tile.type){
            case 'grass':
                this.renderGrassTile(ctx, x, y);
                break;
            case 'road':
                this.renderRoadTile(ctx, x, y);
                break;
            case 'sidewalk':
                this.renderSidewalkTile(ctx, x, y);
                break;
            case 'building':
                this.renderBuildingTile(ctx, tile, x, y);
                break;
            case 'door':
                this.renderDoorTile(ctx, tile, x, y);
                break;
            case 'parking':
                this.renderParkingTile(ctx, x, y);
                break;
            case 'floor':
                this.renderFloorTile(ctx, x, y);
                break;
            case 'wall':
                this.renderWallTile(ctx, x, y);
                break;
            case 'furniture':
                this.renderFurnitureTile(ctx, tile, x, y);
                break;
            case 'tree':
                this.renderTreeTile(ctx, x, y);
                break;
            case 'path':
                this.renderPathTile(ctx, x, y);
                break;
            case 'bench':
                this.renderBenchTile(ctx, x, y);
                break;
            case 'fountain':
                this.renderFountainTile(ctx, x, y);
                break;
            case 'flower':
                this.renderFlowerTile(ctx, x, y);
                break;
            case 'stone':
                this.renderStoneTile(ctx, x, y);
                break;
            case 'water':
                this.renderWaterTile(ctx, x, y);
                break;
            case 'sand':
                this.renderSandTile(ctx, x, y);
                break;
            case 'house':
                this.renderHouseTile(ctx, tile, x, y);
                break;
            case 'apartment':
                this.renderApartmentTile(ctx, tile, x, y);
                break;
            case 'restaurant':
                this.renderRestaurantTile(ctx, tile, x, y);
                break;
            case 'shop':
                this.renderShopTile(ctx, tile, x, y);
                break;
        }
    }
    // Base tile rendering methods that can be overridden
    renderGrassTile(ctx, x, y) {
        ctx.fillStyle = '#4a7c59';
        ctx.fillRect(x, y, this.tileSize, this.tileSize);
        ctx.fillStyle = '#5a8c69';
        for(let i = 0; i < 8; i++){
            const px = x + Math.floor(Math.random() * this.tileSize);
            const py = y + Math.floor(Math.random() * this.tileSize);
            ctx.fillRect(px, py, 2, 2);
        }
    }
    renderRoadTile(ctx, x, y) {
        ctx.fillStyle = '#2F2F2F';
        ctx.fillRect(x, y, this.tileSize, this.tileSize);
        // Road markings
        ctx.fillStyle = '#FFFF00';
        ctx.fillRect(x, y + 14, this.tileSize, 2);
    }
    renderSidewalkTile(ctx, x, y) {
        ctx.fillStyle = '#D3D3D3';
        ctx.fillRect(x, y, this.tileSize, this.tileSize);
        // Sidewalk pattern
        ctx.fillStyle = '#C0C0C0';
        ctx.fillRect(x + 2, y + 2, this.tileSize - 4, this.tileSize - 4);
    }
    renderBuildingTile(ctx, tile, x, y) {
        // Default building appearance
        ctx.fillStyle = '#8B4513';
        ctx.fillRect(x, y, this.tileSize, this.tileSize);
    }
    renderDoorTile(ctx, tile, x, y) {
        // Default door appearance
        ctx.fillStyle = '#654321';
        ctx.fillRect(x, y, this.tileSize, this.tileSize);
    }
    renderParkingTile(ctx, x, y) {
        ctx.fillStyle = '#2F2F2F';
        ctx.fillRect(x, y, this.tileSize, this.tileSize);
        ctx.fillStyle = '#FFFF00';
        ctx.fillRect(x, y + 14, this.tileSize, 2);
        ctx.fillRect(x + 14, y, 2, this.tileSize);
    }
    renderFloorTile(ctx, x, y) {
        ctx.fillStyle = '#DEB887';
        ctx.fillRect(x, y, this.tileSize, this.tileSize);
    }
    renderWallTile(ctx, x, y) {
        ctx.fillStyle = '#F5F5DC';
        ctx.fillRect(x, y, this.tileSize, this.tileSize);
    }
    renderFurnitureTile(ctx, tile, x, y) {
        // Base furniture rendering
        ctx.fillStyle = '#8B4513';
        ctx.fillRect(x + 4, y + 4, this.tileSize - 8, this.tileSize - 8);
    }
    renderTreeTile(ctx, x, y) {
        // Tree trunk
        ctx.fillStyle = '#8B4513';
        ctx.fillRect(x + 12, y + 20, 8, 12);
        // Tree foliage
        ctx.fillStyle = '#228B22';
        ctx.beginPath();
        ctx.arc(x + 16, y + 16, 12, 0, 2 * Math.PI);
        ctx.fill();
    }
    renderPathTile(ctx, x, y) {
        ctx.fillStyle = '#D2B48C';
        ctx.fillRect(x, y, this.tileSize, this.tileSize);
        // Path texture
        ctx.fillStyle = '#DEB887';
        ctx.fillRect(x + 2, y + 2, this.tileSize - 4, this.tileSize - 4);
    }
    renderBenchTile(ctx, x, y) {
        // Bench base
        ctx.fillStyle = '#8B4513';
        ctx.fillRect(x + 4, y + 16, 24, 8);
        // Bench back
        ctx.fillRect(x + 4, y + 8, 4, 16);
        ctx.fillRect(x + 24, y + 8, 4, 16);
    }
    renderFountainTile(ctx, x, y) {
        // Fountain base
        ctx.fillStyle = '#D3D3D3';
        ctx.beginPath();
        ctx.arc(x + 16, y + 16, 14, 0, 2 * Math.PI);
        ctx.fill();
        // Water
        ctx.fillStyle = '#4169E1';
        ctx.beginPath();
        ctx.arc(x + 16, y + 16, 10, 0, 2 * Math.PI);
        ctx.fill();
    }
    renderFlowerTile(ctx, x, y) {
        // Grass base
        this.renderGrassTile(ctx, x, y);
        // Flowers
        ctx.fillStyle = '#FF69B4';
        ctx.beginPath();
        ctx.arc(x + 8, y + 8, 3, 0, 2 * Math.PI);
        ctx.fill();
        ctx.fillStyle = '#FFD700';
        ctx.beginPath();
        ctx.arc(x + 20, y + 20, 3, 0, 2 * Math.PI);
        ctx.fill();
    }
    renderStoneTile(ctx, x, y) {
        ctx.fillStyle = '#708090';
        ctx.fillRect(x, y, this.tileSize, this.tileSize);
        // Stone texture
        ctx.fillStyle = '#778899';
        ctx.fillRect(x + 2, y + 2, this.tileSize - 4, this.tileSize - 4);
    }
    renderWaterTile(ctx, x, y) {
        ctx.fillStyle = '#4169E1';
        ctx.fillRect(x, y, this.tileSize, this.tileSize);
        // Water ripples
        ctx.fillStyle = '#6495ED';
        ctx.fillRect(x + 4, y + 4, this.tileSize - 8, this.tileSize - 8);
    }
    renderSandTile(ctx, x, y) {
        ctx.fillStyle = '#F4A460';
        ctx.fillRect(x, y, this.tileSize, this.tileSize);
        // Sand texture
        ctx.fillStyle = '#DEB887';
        for(let i = 0; i < 6; i++){
            const px = x + Math.floor(Math.random() * this.tileSize);
            const py = y + Math.floor(Math.random() * this.tileSize);
            ctx.fillRect(px, py, 1, 1);
        }
    }
    renderHouseTile(ctx, tile, x, y) {
        // House building
        ctx.fillStyle = '#D2691E';
        ctx.fillRect(x, y, this.tileSize, this.tileSize);
        // Roof
        ctx.fillStyle = '#8B4513';
        ctx.fillRect(x, y, this.tileSize, 8);
    }
    renderApartmentTile(ctx, tile, x, y) {
        // Apartment building
        ctx.fillStyle = '#708090';
        ctx.fillRect(x, y, this.tileSize, this.tileSize);
        // Windows
        ctx.fillStyle = '#87CEEB';
        ctx.fillRect(x + 4, y + 4, 6, 6);
        ctx.fillRect(x + 22, y + 4, 6, 6);
        ctx.fillRect(x + 4, y + 22, 6, 6);
        ctx.fillRect(x + 22, y + 22, 6, 6);
    }
    renderRestaurantTile(ctx, tile, x, y) {
        // Restaurant building
        ctx.fillStyle = '#CD853F';
        ctx.fillRect(x, y, this.tileSize, this.tileSize);
        // Sign
        ctx.fillStyle = '#FF6347';
        ctx.fillRect(x + 8, y + 4, 16, 8);
    }
    renderShopTile(ctx, tile, x, y) {
        // Shop building
        ctx.fillStyle = '#DDA0DD';
        ctx.fillRect(x, y, this.tileSize, this.tileSize);
        // Store front
        ctx.fillStyle = '#FFD700';
        ctx.fillRect(x + 4, y + 16, 24, 12);
    }
    getEntrancePosition() {
        return {
            x: this.exitX,
            y: this.exitY
        };
    }
    // Method to get tile information for scene transitions
    getTileAt(tileX, tileY) {
        if (tileX < 0 || tileX >= this.areaWidth || tileY < 0 || tileY >= this.areaHeight) {
            return null;
        }
        return this.tiles[tileY][tileX];
    }
}
const __TURBOPACK__default__export__ = BaseArea;
}),
"[project]/app/components/campus/CampusArea.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>__TURBOPACK__default__export__
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$components$2f$BaseArea$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/components/BaseArea.ts [app-ssr] (ecmascript)");
;
class CampusArea extends __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$components$2f$BaseArea$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"] {
    type = 'campus';
    getAreaName() {
        return 'Virginia Tech Campus';
    }
    generateArea() {
        const area = [];
        // Initialize with grass
        for(let y = 0; y < this.areaHeight; y++){
            area[y] = [];
            for(let x = 0; x < this.areaWidth; x++){
                area[y][x] = {
                    type: 'grass',
                    solid: false
                };
            }
        }
        // Create campus layout - this represents the BOTTOM HALF of the world
        this.generateCampusBuildings(area);
        this.generateCampusPaths(area);
        this.generateCampusFeatures(area);
        return area;
    }
    generateCampusBuildings(world) {
        // Burruss Hall (iconic admin building with twin towers)
        this.createBurrussHall(world, 9, 1, 6, 6);
        // Turner Place
        this.createBuilding(world, 3, 2, 5, 4, 'turner');
        // Torgersen Hall (Computer Science) - Large Gothic Revival building with bridge
        this.createTorgersenHall(world, 16, 1, 8, 5);
        // Prichard Hall (Dining)
        this.createBuilding(world, 1, 13, 6, 4, 'owens');
        // Cassell Coliseum
        this.createBuilding(world, 18, 12, 6, 5, 'cassell');
        // Create the Drillfield (huge oval-shaped grass area in center of campus)
        this.createDrillfield(world, 7, 7, 11, 8);
    }
    createBuilding(world, x, y, width, height, buildingType) {
        for(let by = y; by < y + height; by++){
            for(let bx = x; bx < x + width; bx++){
                if (bx < this.areaWidth && by < this.areaHeight) {
                    // Create doors on the front of buildings
                    if (by === y + height - 1 && bx === x + Math.floor(width / 2)) {
                        world[by][bx] = {
                            type: 'door',
                            solid: false,
                            buildingType
                        };
                    } else {
                        world[by][bx] = {
                            type: 'building',
                            solid: true,
                            buildingType
                        };
                    }
                }
            }
        }
    }
    createBurrussHall(world, x, y, width, height) {
        // Create Burruss Hall with twin towers and Gothic Revival architecture
        for(let by = y; by < y + height; by++){
            for(let bx = x; bx < x + width; bx++){
                if (bx < this.areaWidth && by < this.areaHeight) {
                    // Left tower (2 tiles wide, full height + 1 extra for tower top)
                    if (bx >= x && bx <= x + 1) {
                        if (by === y + height - 1 && bx === x) {
                            // Side entrance to left tower
                            world[by][bx] = {
                                type: 'door',
                                solid: false,
                                buildingType: 'burruss'
                            };
                        } else {
                            world[by][bx] = {
                                type: 'building',
                                solid: true,
                                buildingType: 'burruss',
                                part: 'left_tower'
                            };
                        }
                    } else if (bx >= x + width - 2 && bx <= x + width - 1) {
                        if (by === y + height - 1 && bx === x + width - 1) {
                            // Side entrance to right tower
                            world[by][bx] = {
                                type: 'door',
                                solid: false,
                                buildingType: 'burruss'
                            };
                        } else {
                            world[by][bx] = {
                                type: 'building',
                                solid: true,
                                buildingType: 'burruss',
                                part: 'right_tower'
                            };
                        }
                    } else if (bx >= x + 2 && bx <= x + width - 3) {
                        // Upper central building (shorter than towers) - no middle door
                        if (by >= y + 1 && by <= y + height - 2) {
                            world[by][bx] = {
                                type: 'building',
                                solid: true,
                                buildingType: 'burruss',
                                part: 'center'
                            };
                        } else {
                            world[by][bx] = {
                                type: 'grass',
                                solid: false
                            };
                        }
                    }
                }
            }
        }
        // Add tower tops (crenellations) - extend towers one tile higher
        if (y > 0) {
            // Left tower top
            if (x < this.areaWidth && y - 1 < this.areaHeight) {
                world[y - 1][x] = {
                    type: 'building',
                    solid: true,
                    buildingType: 'burruss',
                    part: 'left_tower_top'
                };
            }
            if (x + 1 < this.areaWidth && y - 1 < this.areaHeight) {
                world[y - 1][x + 1] = {
                    type: 'building',
                    solid: true,
                    buildingType: 'burruss',
                    part: 'left_tower_top'
                };
            }
            // Right tower top
            if (x + width - 2 < this.areaWidth && y - 1 < this.areaHeight) {
                world[y - 1][x + width - 2] = {
                    type: 'building',
                    solid: true,
                    buildingType: 'burruss',
                    part: 'right_tower_top'
                };
            }
            if (x + width - 1 < this.areaWidth && y - 1 < this.areaHeight) {
                world[y - 1][x + width - 1] = {
                    type: 'building',
                    solid: true,
                    buildingType: 'burruss',
                    part: 'right_tower_top'
                };
            }
        }
    }
    createTorgersenHall(world, x, y, width, height) {
        // Create the main Gothic Revival structure with distinctive features
        // Left wing: 3 tiles wide, 5 tiles tall
        // Right wing: 3 tiles wide, 5 tiles tall
        // Bridge: connects the wings at the top
        for(let by = y; by < y + height; by++){
            for(let bx = x; bx < x + width; bx++){
                if (bx < this.areaWidth && by < this.areaHeight) {
                    // Left wing of the building (3x5)
                    if (bx >= x && bx <= x + 2 && by >= y && by <= y + height - 1) {
                        if (by === y + height - 1 && bx === x + 1) {
                            world[by][bx] = {
                                type: 'door',
                                solid: false,
                                buildingType: 'torgersen'
                            };
                        } else {
                            world[by][bx] = {
                                type: 'building',
                                solid: true,
                                buildingType: 'torgersen'
                            };
                        }
                    } else if (bx >= x + width - 3 && bx <= x + width - 1 && by >= y && by <= y + height - 1) {
                        if (by === y + height - 1 && bx === x + width - 2) {
                            world[by][bx] = {
                                type: 'door',
                                solid: false,
                                buildingType: 'torgersen'
                            };
                        } else {
                            world[by][bx] = {
                                type: 'building',
                                solid: true,
                                buildingType: 'torgersen'
                            };
                        }
                    } else if (by >= y + 1 && by <= y + 2 && bx >= x + 1 && bx <= x + 6) {
                        world[by][bx] = {
                            type: 'building',
                            solid: true,
                            buildingType: 'torgersen'
                        };
                    } else if (by >= y + 3 && by <= y + height - 1 && bx >= x + 3 && bx <= x + width - 4) {
                        world[by][bx] = {
                            type: 'grass',
                            solid: false
                        };
                    } else if (by === y && bx >= x + 3 && bx <= x + width - 4) {
                        world[by][bx] = {
                            type: 'grass',
                            solid: false
                        };
                    } else if (by === y + height - 1 && bx === x + Math.floor(width / 2)) {
                        world[by][bx] = {
                            type: 'door',
                            solid: false,
                            buildingType: 'torgersen'
                        };
                    }
                }
            }
        }
    }
    createDrillfield(world, x, y, width, height) {
        // Create an oval/elliptical shape for the Drillfield
        const centerX = x + width / 2;
        const centerY = y + height / 2;
        const radiusX = width / 2 - 0.2; // Slightly reduce horizontal radius to make left edge cleaner
        const radiusY = height / 2;
        for(let dy = y; dy < y + height && dy < this.areaHeight; dy++){
            for(let dx = x; dx < x + width && dx < this.areaWidth; dx++){
                // Calculate distance from center using ellipse formula
                const distanceFromCenterX = (dx - centerX) / radiusX;
                const distanceFromCenterY = (dy - centerY) / radiusY;
                const ellipseDistance = distanceFromCenterX * distanceFromCenterX + distanceFromCenterY * distanceFromCenterY;
                // If point is within the ellipse (distance <= 1), make it drillfield
                if (ellipseDistance <= 1.0) {
                    world[dy][dx] = {
                        type: 'grass',
                        solid: false,
                        buildingType: 'drillfield'
                    };
                }
            }
        }
    }
    generateCampusPaths(world) {
        // Create road network connecting buildings: Turner → Burruss → Torgersen → Cassell → Prichard → Turner
        this.createCampusRoads(world);
    }
    createCampusRoads(world) {
        // Road 1: Turner → Burruss (horizontal path north of drillfield)
        this.createRoad(world, 8, 6, 15, 6); // from Turner exit to Burruss entrance
        // Road 2: Burruss → Torgersen (horizontal path north of drillfield)  
        this.createRoad(world, 15, 6, 20, 6); // from Burruss to Torgersen
        // Road 3: Torgersen → Cassell (vertical path east of drillfield, then horizontal)
        this.createRoad(world, 20, 6, 20, 11); // vertical down from Torgersen
        this.createRoad(world, 20, 11, 21, 11); // horizontal to Cassell entrance
        // Road 4: Cassell → Prichard (horizontal path south of drillfield)
        this.createRoad(world, 17, 13, 7, 13); // from Cassell to Prichard area
        // Road 5: Prichard → Turner (vertical path west of drillfield)
        this.createRoad(world, 6, 13, 6, 6); // vertical up from Prichard to Turner level
        this.createRoad(world, 6, 6, 8, 6); // horizontal to connect back to Turner
    }
    createRoad(world, startX, startY, endX, endY) {
        // Create a straight line road between two points (1 pixel width)
        if (startX === endX) {
            // Vertical road
            const minY = Math.min(startY, endY);
            const maxY = Math.max(startY, endY);
            for(let y = minY; y <= maxY; y++){
                if (startX >= 0 && startX < this.areaWidth && y >= 0 && y < this.areaHeight) {
                    // Only place road if it's on grass and not on drillfield or buildings
                    if (world[y][startX].type === 'grass' && world[y][startX].buildingType !== 'drillfield') {
                        world[y][startX] = {
                            type: 'road',
                            solid: false
                        };
                    }
                }
            }
        } else {
            // Horizontal road
            const minX = Math.min(startX, endX);
            const maxX = Math.max(startX, endX);
            for(let x = minX; x <= maxX; x++){
                if (x >= 0 && x < this.areaWidth && startY >= 0 && startY < this.areaHeight) {
                    // Only place road if it's on grass and not on drillfield or buildings
                    if (world[startY][x].type === 'grass' && world[startY][x].buildingType !== 'drillfield') {
                        world[startY][x] = {
                            type: 'road',
                            solid: false
                        };
                    }
                }
            }
        }
    }
    createPathToDoor(world, startX, startY, direction) {
        if (direction === 'horizontal') {
            for(let x = startX; x < startX + 3; x++){
                if (x < this.areaWidth && world[startY][x].type === 'grass' && world[startY][x].buildingType !== 'drillfield') {
                    world[startY][x] = {
                        type: 'path',
                        solid: false
                    };
                }
            }
        } else {
            for(let y = startY; y < startY + 3; y++){
                if (y < this.areaHeight && world[y][startX].type === 'grass' && world[y][startX].buildingType !== 'drillfield') {
                    world[y][startX] = {
                        type: 'path',
                        solid: false
                    };
                }
            }
        }
    }
    generateCampusFeatures(world) {
        // Add trees around campus
        this.addTrees(world, 10, 12, 2); // Near center
        this.addTrees(world, 1, 15, 3); // Near cafeteria
        this.addTrees(world, 22, 8, 2); // Right side
        // Add benches along paths
        this.addBench(world, 6, 9);
        this.addBench(world, 13, 9);
        this.addBench(world, 18, 9);
        // Add campus fountain (avoid drillfield)
        if (world[11][10].type === 'grass' && world[11][10].buildingType !== 'drillfield') {
            world[11][10] = {
                type: 'fountain',
                solid: true
            };
        }
        // No parking area - keep campus clean
        // Add flowers around buildings
        this.addFlowersAroundBuilding(world, 3, 2, 5, 4); // Around library
        this.addFlowersAroundBuilding(world, 9, 1, 6, 6); // Around Burruss Hall
    }
    addTrees(world, centerX, centerY, count) {
        for(let i = 0; i < count; i++){
            const x = centerX + (Math.random() - 0.5) * 4;
            const y = centerY + (Math.random() - 0.5) * 4;
            const tileX = Math.floor(x);
            const tileY = Math.floor(y);
            if (tileX >= 0 && tileX < this.areaWidth && tileY >= 0 && tileY < this.areaHeight && world[tileY][tileX].type === 'grass' && world[tileY][tileX].buildingType !== 'drillfield') {
                world[tileY][tileX] = {
                    type: 'tree',
                    solid: true
                };
            }
        }
    }
    addBench(world, x, y) {
        if (x >= 0 && x < this.areaWidth && y >= 0 && y < this.areaHeight && world[y][x].type === 'grass' && world[y][x].buildingType !== 'drillfield') {
            world[y][x] = {
                type: 'bench',
                solid: true
            };
        }
    }
    createParkingLot(world, x, y, width, height) {
        for(let py = y; py < y + height; py++){
            for(let px = x; px < x + width; px++){
                if (px < this.areaWidth && py < this.areaHeight && world[py][px].type === 'grass') {
                    world[py][px] = {
                        type: 'parking',
                        solid: false
                    };
                }
            }
        }
    }
    addFlowersAroundBuilding(world, x, y, width, height) {
        // Add flowers around the perimeter of buildings (avoid drillfield)
        for(let fx = x - 1; fx <= x + width; fx++){
            for(let fy = y - 1; fy <= y + height; fy++){
                if (fx >= 0 && fx < this.areaWidth && fy >= 0 && fy < this.areaHeight && world[fy][fx].type === 'grass' && world[fy][fx].buildingType !== 'drillfield' && Math.random() < 0.3) {
                    world[fy][fx] = {
                        type: 'flower',
                        solid: false
                    };
                }
            }
        }
    }
    renderBackground(ctx) {
        // Campus outdoor background
        ctx.fillStyle = '#2a4d3a'; // Dark green campus background
        ctx.fillRect(0, 0, 800, 600);
    }
    renderAreaSpecificElements(ctx) {
        // Campus-specific UI elements
        ctx.fillStyle = '#8B0000';
        ctx.font = 'bold 14px serif';
        ctx.textAlign = 'left';
        ctx.fillText('🏛️ VIRGINIA TECH CAMPUS', 10 - this.cameraX, 30 - this.cameraY);
        // Add VT spirit elements
        ctx.fillStyle = '#FF8C00';
        ctx.font = '12px serif';
        ctx.fillText('HOKIES!', 10 - this.cameraX, 50 - this.cameraY);
        // Building name signs
        this.renderBuildingSigns(ctx);
    }
    // Override tile rendering for campus-specific styling
    renderTile(ctx, tile, x, y) {
        // Special rendering for drillfield
        if (tile.type === 'grass' && tile.buildingType === 'drillfield') {
            this.renderDrillfieldTile(ctx, x, y);
            return;
        }
        // Special rendering for campus roads
        if (tile.type === 'road') {
            this.renderCampusRoadTile(ctx, x, y);
            return;
        }
        // Default tile rendering
        super.renderTile(ctx, tile, x, y);
    }
    renderBuildingTile(ctx, tile, x, y) {
        // All campus buildings use uniform color
        const buildingType = tile.buildingType;
        // Uniform campus building color
        let baseColor = '#75787b';
        let accentColor = '#8B0000';
        // All building types use the same colors - no accent colors
        baseColor = '#75787b';
        accentColor = '#85888b'; // Use texture color instead of colored accents
        // Specialized rendering for different building types
        if (buildingType === 'torgersen') {
            this.renderTorgersenTile(ctx, x, y, baseColor, accentColor);
        } else if (buildingType === 'burruss') {
            this.renderBurrussTile(ctx, tile, x, y, baseColor, accentColor);
        } else {
            // Main building structure for other buildings
            ctx.fillStyle = baseColor;
            ctx.fillRect(x, y, this.tileSize, this.tileSize);
            // Stone texture pattern (like Torgersen)
            ctx.fillStyle = accentColor; // Use texture color instead of colored accent
            ctx.fillRect(x + 2, y + 2, this.tileSize - 4, this.tileSize - 4);
            // Stone texture lines
            ctx.fillStyle = '#65686b';
            ctx.fillRect(x, y + 8, this.tileSize, 2);
            ctx.fillRect(x + 8, y, 2, this.tileSize);
            // Add minimal windows to other buildings
            this.renderMinimalWindow(ctx, x, y);
        }
    }
    renderTorgersenTile(ctx, x, y, baseColor, accentColor) {
        // Main limestone structure
        ctx.fillStyle = baseColor;
        ctx.fillRect(x, y, this.tileSize, this.tileSize);
        // Gothic stone block pattern
        ctx.fillStyle = '#85888b'; // Lighter version of base color
        ctx.fillRect(x + 2, y + 2, this.tileSize - 4, this.tileSize - 4);
        // Stone block outlines (creating the ashlar masonry pattern)
        ctx.strokeStyle = '#65686b'; // Consistent mortar lines
        ctx.lineWidth = 1;
        ctx.strokeRect(x, y, this.tileSize, this.tileSize);
        // Horizontal mortar lines to simulate stone courses
        ctx.beginPath();
        ctx.moveTo(x, y + this.tileSize / 2);
        ctx.lineTo(x + this.tileSize, y + this.tileSize / 2);
        ctx.stroke();
        // Vertical joints (offset pattern)
        const offset = Math.floor((x + y) / this.tileSize) % 2;
        ctx.beginPath();
        ctx.moveTo(x + this.tileSize / 2 + offset * this.tileSize / 4, y);
        ctx.lineTo(x + this.tileSize / 2 + offset * this.tileSize / 4, y + this.tileSize);
        ctx.stroke();
        // Add minimal windows to Torgersen
        this.renderMinimalWindow(ctx, x, y);
        // Stone weathering and texture details
        ctx.fillStyle = '#85888b';
        ctx.fillRect(x + 1, y + 1, 2, this.tileSize - 2);
        ctx.fillRect(x + this.tileSize - 3, y + 1, 2, this.tileSize - 2);
        // Subtle shadow to give depth
        ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
        ctx.fillRect(x + this.tileSize - 2, y, 2, this.tileSize);
        ctx.fillRect(x, y + this.tileSize - 2, this.tileSize, 2);
    }
    renderBurrussTile(ctx, tile, x, y, baseColor, accentColor) {
        const part = tile.part || 'center';
        // Use uniform campus building color
        ctx.fillStyle = baseColor;
        ctx.fillRect(x, y, this.tileSize, this.tileSize);
        // Different rendering based on building part
        switch(part){
            case 'left_tower':
            case 'right_tower':
                this.renderBurrussTower(ctx, x, y, part);
                break;
            case 'left_tower_top':
            case 'right_tower_top':
                this.renderBurrussTowerTop(ctx, x, y, part);
                break;
            case 'center':
                this.renderBurrussCenter(ctx, x, y);
                break;
            default:
                // Default building tile
                this.renderBurrussDefault(ctx, x, y);
                break;
        }
    }
    renderBurrussTower(ctx, x, y, part) {
        // Tower base
        ctx.fillStyle = '#75787b'; // Uniform campus color
        ctx.fillRect(x, y, this.tileSize, this.tileSize);
        // Stone block pattern
        ctx.fillStyle = '#85888b'; // Lighter version of base color
        ctx.fillRect(x + 2, y + 2, this.tileSize - 4, this.tileSize - 4);
        // Add minimal windows to Burruss towers
        this.renderMinimalWindow(ctx, x, y);
        // Stone courses (horizontal lines)
        ctx.strokeStyle = '#65686b';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(x, y + this.tileSize / 3);
        ctx.lineTo(x + this.tileSize, y + this.tileSize / 3);
        ctx.moveTo(x, y + 2 * this.tileSize / 3);
        ctx.lineTo(x + this.tileSize, y + 2 * this.tileSize / 3);
        ctx.stroke();
        // Vertical stone joints
        ctx.beginPath();
        ctx.moveTo(x + this.tileSize / 2, y);
        ctx.lineTo(x + this.tileSize / 2, y + this.tileSize);
        ctx.stroke();
        // Tower shadow
        ctx.fillStyle = 'rgba(0, 0, 0, 0.15)';
        ctx.fillRect(x + this.tileSize - 3, y, 3, this.tileSize);
    }
    renderBurrussTowerTop(ctx, x, y, part) {
        // Crenellated tower top (castle battlements)
        ctx.fillStyle = '#75787b';
        ctx.fillRect(x, y, this.tileSize, this.tileSize);
        // Crenellation pattern (merlons and crenels)
        ctx.fillStyle = '#85888b';
        const crenelWidth = this.tileSize / 4;
        for(let i = 0; i < 4; i++){
            if (i % 2 === 0) {
                ctx.fillRect(x + i * crenelWidth, y, crenelWidth, this.tileSize * 0.7);
            }
        }
        // Flag pole on one tower
        if (part === 'left_tower_top') {
            ctx.fillStyle = '#8B4513'; // Brown pole
            ctx.fillRect(x + this.tileSize / 2 - 1, y, 2, this.tileSize);
            // Virginia Tech flag
            ctx.fillStyle = '#630031'; // Maroon
            ctx.fillRect(x + this.tileSize / 2 + 1, y + 2, 6, 4);
            ctx.fillStyle = '#FF8C00'; // Orange
            ctx.fillRect(x + this.tileSize / 2 + 1, y + 6, 6, 2);
        }
        // Stone detail
        ctx.strokeStyle = '#65686b';
        ctx.lineWidth = 1;
        ctx.strokeRect(x, y, this.tileSize, this.tileSize);
    }
    renderBurrussCenter(ctx, x, y) {
        // Central building connecting towers
        ctx.fillStyle = '#75787b';
        ctx.fillRect(x, y, this.tileSize, this.tileSize);
        // Central Gothic arch detail
        ctx.fillStyle = '#85888b';
        ctx.fillRect(x + 2, y + 2, this.tileSize - 4, this.tileSize - 4);
        // No Gothic details - keep building clean and simple
        // Decorative stonework
        ctx.strokeStyle = '#65686b';
        ctx.lineWidth = 1;
        ctx.strokeRect(x, y, this.tileSize, this.tileSize);
        // Horizontal course lines
        ctx.beginPath();
        ctx.moveTo(x, y + this.tileSize / 2);
        ctx.lineTo(x + this.tileSize, y + this.tileSize / 2);
        ctx.stroke();
    }
    renderBurrussDefault(ctx, x, y) {
        // Default Burruss stone pattern
        ctx.fillStyle = '#75787b';
        ctx.fillRect(x, y, this.tileSize, this.tileSize);
        ctx.fillStyle = '#85888b';
        ctx.fillRect(x + 1, y + 1, this.tileSize - 2, this.tileSize - 2);
        // Stone texture
        ctx.strokeStyle = '#65686b';
        ctx.lineWidth = 1;
        ctx.strokeRect(x, y, this.tileSize, this.tileSize);
    }
    renderMinimalWindow(ctx, x, y) {
        // Only add windows occasionally to keep them minimal
        const shouldAddWindow = (Math.floor(x / this.tileSize) + Math.floor(y / this.tileSize)) % 3 === 0;
        if (shouldAddWindow) {
            // Simple rectangular window
            const windowWidth = 6;
            const windowHeight = 8;
            const windowX = x + (this.tileSize - windowWidth) / 2;
            const windowY = y + (this.tileSize - windowHeight) / 2;
            // Window frame (dark)
            ctx.fillStyle = '#2F2F2F';
            ctx.fillRect(windowX - 1, windowY - 1, windowWidth + 2, windowHeight + 2);
            // Window glass (light blue with subtle reflection)
            ctx.fillStyle = '#87CEEB';
            ctx.fillRect(windowX, windowY, windowWidth, windowHeight);
            // Window cross divider (minimal)
            ctx.fillStyle = '#2F2F2F';
            ctx.fillRect(windowX + windowWidth / 2 - 0.5, windowY, 1, windowHeight);
            ctx.fillRect(windowX, windowY + windowHeight / 2 - 0.5, windowWidth, 1);
            // Subtle glass reflection
            ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
            ctx.fillRect(windowX + 1, windowY + 1, 2, windowHeight - 2);
        }
    }
    renderBuildingSigns(ctx) {
        // Reset shadow effects
        ctx.shadowBlur = 0;
        // Burruss Hall sign (building at x: 9-14, y: 1-6)
        const burrussX = 12 * this.tileSize; // Center of 6-tile wide building
        const burrussY = 1 * this.tileSize - 15; // Above the building
        // Burruss sign background
        ctx.fillStyle = '#8B0000'; // VT Maroon background
        ctx.fillRect(burrussX - 45 - this.cameraX, burrussY - this.cameraY, 90, 12);
        // Burruss text
        ctx.fillStyle = '#FF8C00'; // VT Orange text
        ctx.font = 'bold 9px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('BURRUSS HALL', burrussX - this.cameraX, burrussY + 8 - this.cameraY);
        // Turner Place sign (building at x: 3-7, y: 2-5)
        const turnerX = 5.5 * this.tileSize; // Center of 5-tile wide building
        const turnerY = 2 * this.tileSize - 15; // Above the building
        // Turner sign background
        ctx.fillStyle = '#2E4057'; // Academic blue background
        ctx.fillRect(turnerX - 35 - this.cameraX, turnerY - this.cameraY, 70, 12);
        // Turner text
        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 9px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('TURNER PLACE', turnerX - this.cameraX, turnerY + 8 - this.cameraY);
        // Torgersen Hall sign (building at x: 16-23, y: 1-5)
        const torgersenX = 20 * this.tileSize; // Center of 8-tile wide building
        const torgersenY = 1 * this.tileSize - 15; // Above the building
        // Torgersen sign background
        ctx.fillStyle = '#4A5568'; // Engineering gray background
        ctx.fillRect(torgersenX - 50 - this.cameraX, torgersenY - this.cameraY, 100, 12);
        // Torgersen text
        ctx.fillStyle = '#FFD700'; // Gold text
        ctx.font = 'bold 9px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('TORGERSEN HALL', torgersenX - this.cameraX, torgersenY + 8 - this.cameraY);
        // Prichard Hall sign (building at x: 1-6, y: 13-16)
        const prichardX = 4 * this.tileSize; // Center of 6-tile wide building
        const prichardY = 13 * this.tileSize - 15; // Above the building
        // Prichard sign background
        ctx.fillStyle = '#D69E2E'; // Dining hall orange background
        ctx.fillRect(prichardX - 40 - this.cameraX, prichardY - this.cameraY, 80, 12);
        // Prichard text
        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 9px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('PRICHARD HALL', prichardX - this.cameraX, prichardY + 8 - this.cameraY);
        // Cassell Coliseum sign (building at x: 18-23, y: 12-16)
        const cassellX = 21 * this.tileSize; // Center of 6-tile wide building
        const cassellY = 12 * this.tileSize - 15; // Above the building
        // Cassell sign background
        ctx.fillStyle = '#8B0000'; // VT Maroon background
        ctx.fillRect(cassellX - 50 - this.cameraX, cassellY - this.cameraY, 100, 12);
        // Cassell text
        ctx.fillStyle = '#FF8C00'; // VT Orange text
        ctx.font = 'bold 9px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('CASSELL COLISEUM', cassellX - this.cameraX, cassellY + 8 - this.cameraY);
        // Add glow effect for special buildings
        ctx.shadowColor = '#FF8C00';
        ctx.shadowBlur = 6;
        // Re-render Burruss and Cassell text with glow (iconic VT buildings)
        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 9px sans-serif';
        ctx.fillText('BURRUSS HALL', burrussX - this.cameraX, burrussY + 8 - this.cameraY);
        ctx.fillText('CASSELL COLISEUM', cassellX - this.cameraX, cassellY + 8 - this.cameraY);
        // Reset shadow
        ctx.shadowBlur = 0;
    }
    renderCampusRoadTile(ctx, x, y) {
        // Light yellow road surface (1 pixel wide appearance)
        ctx.fillStyle = '#FFFFE0'; // Light yellow color
        ctx.fillRect(x, y, this.tileSize, this.tileSize);
        // Add subtle texture to make it look like concrete/asphalt
        ctx.fillStyle = '#FFFACD'; // Slightly lighter yellow for texture
        ctx.fillRect(x + 2, y + 2, this.tileSize - 4, this.tileSize - 4);
        // Very subtle edges to define the road
        ctx.fillStyle = '#F0E68C'; // Slightly darker yellow edge
        ctx.fillRect(x, y, this.tileSize, 1); // Top edge
        ctx.fillRect(x, y + this.tileSize - 1, this.tileSize, 1); // Bottom edge
        ctx.fillRect(x, y, 1, this.tileSize); // Left edge
        ctx.fillRect(x + this.tileSize - 1, y, 1, this.tileSize); // Right edge
    }
    renderDrillfieldTile(ctx, x, y) {
        // Base drillfield green - bright vibrant green for open field
        ctx.fillStyle = '#58b438'; // Bright vibrant green for well-maintained field
        ctx.fillRect(x, y, this.tileSize, this.tileSize);
        // Add subtle texture pattern to show it's maintained grass
        ctx.fillStyle = '#6bc248'; // Slightly lighter green for texture
        const pattern = (x + y) % 8;
        if (pattern < 2) {
            ctx.fillRect(x + 2, y + 2, this.tileSize - 4, this.tileSize - 4);
        }
        // Add some subtle grass blade details
        ctx.fillStyle = '#7ed058';
        for(let i = 0; i < 3; i++){
            const grassX = x + i * 10 + 3;
            const grassY = y + (x + y + i) % 8 + 8;
            ctx.fillRect(grassX, grassY, 1, 3);
        }
        // Very subtle grid pattern to show it's a formal field
        if ((Math.floor(x / this.tileSize) + Math.floor(y / this.tileSize)) % 4 === 0) {
            ctx.fillStyle = '#4a9c30';
            ctx.fillRect(x, y, this.tileSize, 1); // Horizontal line
            ctx.fillRect(x, y, 1, this.tileSize); // Vertical line
        }
    }
}
const __TURBOPACK__default__export__ = CampusArea;
}),
"[project]/app/components/off-campus/NameBuildings.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>__TURBOPACK__default__export__
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$components$2f$BaseArea$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/components/BaseArea.ts [app-ssr] (ecmascript)");
;
class NameBuildings extends __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$components$2f$BaseArea$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"] {
    type = 'campus';
    getAreaName() {
        return 'Downtown Blacksburg';
    }
    generateArea() {
        const area = [];
        // Initialize with grass
        for(let y = 0; y < this.areaHeight; y++){
            area[y] = [];
            for(let x = 0; x < this.areaWidth; x++){
                area[y][x] = {
                    type: 'grass',
                    solid: false
                };
            }
        }
        // Create off-campus layout - this represents the TOP HALF of the world
        this.generateDowntownArea(area);
        this.generateResidentialArea(area);
        this.generateCommercialStrip(area);
        return area;
    }
    generateDowntownArea(world) {
        // Main Street (horizontal road through downtown)
        for(let x = 0; x < this.areaWidth; x++){
            world[9][x] = {
                type: 'road',
                solid: false
            };
            // Sidewalks on both sides
            if (world[8]) world[8][x] = {
                type: 'sidewalk',
                solid: false
            };
            if (world[10]) world[10][x] = {
                type: 'sidewalk',
                solid: false
            };
        }
        // Downtown buildings along Main Street
        this.createCommercialBuilding(world, 2, 6, 3, 2, 'tots'); // Tots Restaurant
        this.createCommercialBuilding(world, 6, 6, 2, 2, 'shop'); // Shop
        this.createCommercialBuilding(world, 9, 6, 3, 2, 'hokiehouse'); // Hokie House
        this.createCommercialBuilding(world, 13, 6, 2, 2, 'shop'); // Another shop
        this.createCommercialBuilding(world, 16, 6, 4, 2, 'foodlion'); // FoodLion grocery store
        // Buildings on south side of Main Street
        this.createCommercialBuilding(world, 3, 11, 2, 2, 'gas_station'); // Gas station
        this.createCommercialBuilding(world, 7, 11, 3, 2, 'centros'); // Centros Restaurant
        this.createCommercialBuilding(world, 12, 11, 4, 2, 'shop'); // Large shop
        this.createCommercialBuilding(world, 17, 11, 3, 2, 'restaurant'); // Restaurant
    }
    generateResidentialArea(world) {
        // Residential street
        for(let x = 5; x < 20; x++){
            world[4][x] = {
                type: 'road',
                solid: false
            };
            world[3][x] = {
                type: 'sidewalk',
                solid: false
            };
            world[5][x] = {
                type: 'sidewalk',
                solid: false
            };
        }
        // Student apartment complexes
        this.createApartmentBuilding(world, 1, 1, 3, 2, 'edge'); // The Edge (top left)
        this.createApartmentBuilding(world, 5, 1, 4, 2, 'techterrace'); // Tech Terrace (next to Edge)
        this.createApartmentBuilding(world, 11, 1, 3, 2); // Apartment complex 3
        this.createApartmentBuilding(world, 16, 1, 4, 2); // Apartment complex 4
        this.createApartmentBuilding(world, 21, 1, 3, 2); // Apartment complex 5
    }
    generateCommercialStrip(world) {
        // Add parking lots
        this.createParkingArea(world, 1, 14, 5, 3);
        this.createParkingArea(world, 15, 14, 6, 3);
        // Add some trees and landscaping
        this.addTrees(world, 8, 16, 3);
        this.addTrees(world, 18, 2, 2);
    }
    createCommercialBuilding(world, x, y, width, height, buildingType) {
        for(let by = y; by < y + height; by++){
            for(let bx = x; bx < x + width; bx++){
                if (bx < this.areaWidth && by < this.areaHeight) {
                    // Create doors on the front of buildings (facing the street)
                    if (by === y + height - 1 && bx === x + Math.floor(width / 2)) {
                        world[by][bx] = {
                            type: 'door',
                            solid: false,
                            buildingType
                        };
                    } else {
                        world[by][bx] = {
                            type: 'building',
                            solid: true,
                            buildingType
                        };
                    }
                }
            }
        }
    }
    createApartmentBuilding(world, x, y, width, height, buildingType = 'apartment') {
        for(let by = y; by < y + height; by++){
            for(let bx = x; bx < x + width; bx++){
                if (bx < this.areaWidth && by < this.areaHeight) {
                    if (by === y + height - 1 && bx === x + Math.floor(width / 2)) {
                        world[by][bx] = {
                            type: 'door',
                            solid: false,
                            buildingType
                        };
                    } else {
                        world[by][bx] = {
                            type: 'building',
                            solid: true,
                            buildingType
                        };
                    }
                }
            }
        }
    }
    createParkingArea(world, x, y, width, height) {
        for(let py = y; py < y + height; py++){
            for(let px = x; px < x + width; px++){
                if (px < this.areaWidth && py < this.areaHeight) {
                    world[py][px] = {
                        type: 'parking',
                        solid: false
                    };
                }
            }
        }
    }
    addTrees(world, centerX, centerY, count) {
        for(let i = 0; i < count; i++){
            const x = centerX + (Math.random() - 0.5) * 4;
            const y = centerY + (Math.random() - 0.5) * 4;
            const tileX = Math.floor(x);
            const tileY = Math.floor(y);
            if (tileX >= 0 && tileX < this.areaWidth && tileY >= 0 && tileY < this.areaHeight && world[tileY][tileX].type === 'grass') {
                world[tileY][tileX] = {
                    type: 'tree',
                    solid: true
                };
            }
        }
    }
    renderBackground(ctx) {
        // Off-campus urban background
        ctx.fillStyle = '#4a5c6a'; // Urban bluish-gray background
        ctx.fillRect(0, 0, 800, 600);
    }
    renderAreaSpecificElements(ctx) {
        // Off-campus specific UI elements
        ctx.fillStyle = '#2F4F4F';
        ctx.font = 'bold 14px sans-serif';
        ctx.textAlign = 'left';
        ctx.fillText('🏙️ DOWNTOWN BLACKSBURG', 300 - this.cameraX, 30 - this.cameraY);
        // Building name signs
        this.renderBuildingSigns(ctx);
    }
    renderBuildingSigns(ctx) {
        // The Edge sign (building at x: 1-3, y: 1-2)
        const edgeX = 2 * this.tileSize; // Center of 3-tile wide building
        const edgeY = 1 * this.tileSize - 15; // Above the building
        // Edge sign background
        ctx.fillStyle = '#2C3E50'; // Dark blue-gray background
        ctx.fillRect(edgeX - 25 - this.cameraX, edgeY - this.cameraY, 50, 12);
        // Edge text
        ctx.fillStyle = '#3498DB'; // Light blue text
        ctx.font = 'bold 9px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('THE EDGE', edgeX - this.cameraX, edgeY + 8 - this.cameraY);
        // Tots sign (building at x: 2-4, y: 6-7)
        const totsX = 3 * this.tileSize; // Center of 3-tile wide building
        const totsY = 6 * this.tileSize - 15; // Above the building
        // Tots sign background
        ctx.fillStyle = '#FF6B35'; // Orange background
        ctx.fillRect(totsX - 25 - this.cameraX, totsY - this.cameraY, 50, 12);
        // Tots text
        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 10px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('TOTS', totsX - this.cameraX, totsY + 8 - this.cameraY);
        // HokieHouse sign (building at x: 9-11, y: 6-7)
        const hokieX = 10 * this.tileSize; // Center of 3-tile wide building
        const hokieY = 6 * this.tileSize - 15; // Above the building
        // HokieHouse sign background
        ctx.fillStyle = '#8B0000'; // VT Maroon background
        ctx.fillRect(hokieX - 35 - this.cameraX, hokieY - this.cameraY, 70, 12);
        // HokieHouse text
        ctx.fillStyle = '#FF8C00'; // VT Orange text
        ctx.font = 'bold 9px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('HOKIE HOUSE', hokieX - this.cameraX, hokieY + 8 - this.cameraY);
        // Centros sign (building at x: 7-9, y: 11-12)
        const centrosX = 8 * this.tileSize; // Center of 3-tile wide building
        const centrosY = 11 * this.tileSize - 15; // Above the building
        // Centros sign background
        ctx.fillStyle = '#FF1493'; // Hot pink background (neon club colors)
        ctx.fillRect(centrosX - 30 - this.cameraX, centrosY - this.cameraY, 60, 12);
        // Centros text
        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 10px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('CENTROS', centrosX - this.cameraX, centrosY + 8 - this.cameraY);
        // Add neon glow effect for Centros (dance club)
        ctx.shadowColor = '#FF1493';
        ctx.shadowBlur = 8;
        ctx.fillStyle = '#00FFFF'; // Cyan neon text
        ctx.fillText('CENTROS', centrosX - this.cameraX, centrosY + 8 - this.cameraY);
        ctx.shadowBlur = 0; // Reset shadow
        // Tech Terrace sign (building at x: 5-8, y: 1-2)
        const techTerraceX = 7 * this.tileSize; // Center of 4-tile wide building
        const techTerraceY = 1 * this.tileSize - 15; // Above the building
        // Tech Terrace sign background
        ctx.fillStyle = '#8B4513'; // Brown background
        ctx.fillRect(techTerraceX - 35 - this.cameraX, techTerraceY - this.cameraY, 70, 12);
        // Tech Terrace text
        ctx.fillStyle = '#FFFFFF'; // White text
        ctx.font = 'bold 8px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('TECH TERRACE', techTerraceX - this.cameraX, techTerraceY + 8 - this.cameraY);
        // Add small decorative elements
        // The Edge: Apartment/Home icon
        ctx.fillStyle = '#3498DB';
        ctx.font = '12px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('🏠', edgeX - this.cameraX, edgeY - 5 - this.cameraY);
        // Tech Terrace: Building/Tech icon
        ctx.fillStyle = '#8B4513';
        ctx.fillText('🏢', techTerraceX - this.cameraX, techTerraceY - 5 - this.cameraY);
        // Tots: Food icon
        ctx.fillStyle = '#FF6B35';
        ctx.fillText('🍟', totsX - this.cameraX, totsY - 5 - this.cameraY);
        // HokieHouse: Turkey (Hokie bird)
        ctx.fillStyle = '#FF8C00';
        ctx.fillText('🦃', hokieX - this.cameraX, hokieY - 5 - this.cameraY);
        // Centros: Dancing figures
        ctx.fillStyle = '#FF1493';
        ctx.fillText('💃', centrosX - 15 - this.cameraX, centrosY - 5 - this.cameraY);
        ctx.fillText('🕺', centrosX + 15 - this.cameraX, centrosY - 5 - this.cameraY);
        // FoodLion sign (building at x: 16-19, y: 6-7)
        const foodlionX = 18 * this.tileSize; // Center of 4-tile wide building
        const foodlionY = 6 * this.tileSize - 15; // Above the building
        // FoodLion sign background
        ctx.fillStyle = '#2E86AB'; // FoodLion blue background
        ctx.fillRect(foodlionX - 40 - this.cameraX, foodlionY - this.cameraY, 80, 12);
        // FoodLion text
        ctx.fillStyle = '#FFFFFF'; // White text
        ctx.font = 'bold 9px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('🦁 FOOD LION', foodlionX - this.cameraX, foodlionY + 8 - this.cameraY);
    }
    // Override tile rendering for off-campus styling
    renderBuildingTile(ctx, tile, x, y) {
        const buildingType = tile.buildingType;
        // Different styles for different building types
        let baseColor = '#8B7355'; // Default brown
        let accentColor = '#654321';
        switch(buildingType){
            case 'apartment':
                baseColor = '#A0522D'; // Brick color for apartments
                accentColor = '#8B4513';
                break;
            case 'edge':
                baseColor = '#34495E'; // Modern dark gray for The Edge
                accentColor = '#3498DB'; // Blue accent
                break;
            case 'techterrace':
                baseColor = '#8B4513'; // Brown for Tech Terrace
                accentColor = '#654321'; // Darker brown accent
                break;
            case 'restaurant':
                baseColor = '#CD853F'; // Warm color for restaurants
                accentColor = '#FF6B6B';
                break;
            case 'shop':
                baseColor = '#D2B48C'; // Light color for shops
                accentColor = '#4ECDC4';
                break;
            case 'bank':
                baseColor = '#778899'; // Professional gray for bank
                accentColor = '#2F4F4F';
                break;
            case 'gas_station':
                baseColor = '#FFFF00'; // Bright for gas station
                accentColor = '#FF0000';
                break;
            case 'foodlion':
                baseColor = '#2E86AB'; // FoodLion blue
                accentColor = '#1F5F99'; // Darker blue accent
                break;
            default:
                baseColor = '#8B7355';
                accentColor = '#654321';
        }
        // Main building structure
        ctx.fillStyle = baseColor;
        ctx.fillRect(x, y, this.tileSize, this.tileSize);
        // Building details
        ctx.fillStyle = accentColor;
        ctx.fillRect(x + 1, y + 1, this.tileSize - 2, 3); // Top accent
        // Windows
        ctx.fillStyle = '#87CEEB';
        ctx.fillRect(x + 4, y + 6, 6, 8);
        ctx.fillRect(x + 12, y + 6, 6, 8);
    }
    renderRoadTile(ctx, x, y) {
        // Urban road with better markings
        ctx.fillStyle = '#2F2F2F';
        ctx.fillRect(x, y, this.tileSize, this.tileSize);
        // Road markings
        ctx.fillStyle = '#FFFF00';
        ctx.fillRect(x, y + 14, this.tileSize, 2);
        // Road texture
        ctx.fillStyle = '#3F3F3F';
        for(let i = 0; i < 3; i++){
            const px = x + Math.floor(Math.random() * this.tileSize);
            const py = y + Math.floor(Math.random() * this.tileSize);
            ctx.fillRect(px, py, 1, 1);
        }
    }
}
const __TURBOPACK__default__export__ = NameBuildings;
}),
"[project]/app/components/World.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>__TURBOPACK__default__export__
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$components$2f$campus$2f$CampusArea$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/components/campus/CampusArea.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$components$2f$off$2d$campus$2f$NameBuildings$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/components/off-campus/NameBuildings.ts [app-ssr] (ecmascript)");
;
;
class World {
    type = 'campus';
    tileSize = 32;
    areaWidth = 25;
    areaHeight = 19;
    totalWorldHeight = 38;
    campusArea;
    offCampusArea;
    cameraX = 0;
    cameraY = 0;
    constructor(){
        this.campusArea = new __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$components$2f$campus$2f$CampusArea$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"]();
        this.offCampusArea = new __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$components$2f$off$2d$campus$2f$NameBuildings$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"]();
    }
    canMoveTo(x, y, width, height) {
        // Calculate which area the player is in based on Y position
        const areaHeightPixels = this.areaHeight * this.tileSize; // 608px
        if (y < areaHeightPixels) {
            // Top area - off-campus
            return this.offCampusArea.canMoveTo(x, y, width, height);
        } else {
            // Bottom area - campus (adjust Y coordinate to be relative to campus area)
            const campusY = y - areaHeightPixels;
            return this.campusArea.canMoveTo(x, campusY, width, height);
        }
    }
    update(deltaTime) {
        this.campusArea.update(deltaTime);
        this.offCampusArea.update(deltaTime);
    }
    render(ctx, player) {
        // Update camera to follow player
        this.updateCamera(player);
        // Clear canvas
        ctx.fillStyle = '#2a4d3a';
        ctx.fillRect(0, 0, 800, 600);
        // Calculate which areas are visible based on camera position
        const areaHeightPixels = this.areaHeight * this.tileSize; // 608px
        const cameraTop = this.cameraY;
        const cameraBottom = this.cameraY + 600;
        // Render off-campus area (top) if visible
        if (cameraTop < areaHeightPixels) {
            ctx.save();
            // Translate to show off-campus area
            ctx.translate(-this.cameraX, -cameraTop);
            // Create a temporary player position for off-campus rendering
            const tempPlayer = {
                ...player
            };
            this.offCampusArea.render(ctx, tempPlayer);
            ctx.restore();
        }
        // Render campus area (bottom) if visible
        if (cameraBottom > areaHeightPixels) {
            ctx.save();
            // Translate to show campus area
            ctx.translate(-this.cameraX, areaHeightPixels - cameraTop);
            // Create a temporary player position for campus rendering (adjust Y)
            const tempPlayer = {
                ...player,
                y: player.y - areaHeightPixels
            };
            this.campusArea.render(ctx, tempPlayer);
            ctx.restore();
        }
        // Render boundary line between areas
        if (cameraTop < areaHeightPixels && cameraBottom > areaHeightPixels) {
            const boundaryY = areaHeightPixels - cameraTop;
            // Golden transition line
            ctx.fillStyle = '#FFD700';
            ctx.fillRect(0, boundaryY - 2, 800, 4);
        }
    }
    updateCamera(player) {
        // Camera follows player through the entire world
        const targetCameraX = player.x - 400 + player.width / 2;
        const targetCameraY = player.y - 300 + player.height / 2;
        // World bounds
        const maxCameraX = this.areaWidth * this.tileSize - 800; // 800 - 800 = 0 (no horizontal scrolling for single screen width)
        const maxCameraY = this.totalWorldHeight * this.tileSize - 600; // Total world height minus screen height
        this.cameraX = Math.max(0, Math.min(maxCameraX, targetCameraX));
        this.cameraY = Math.max(0, Math.min(maxCameraY, targetCameraY));
    }
    // Method to get tile information for scene transitions
    getTileAt(tileX, tileY) {
        const areaHeightTiles = this.areaHeight; // 19 tiles
        if (tileY < areaHeightTiles) {
            // Off-campus area
            return this.offCampusArea.getTileAt(tileX, tileY);
        } else {
            // Campus area (adjust tile Y)
            const campusTileY = tileY - areaHeightTiles;
            return this.campusArea.getTileAt(tileX, campusTileY);
        }
    }
    getEntrancePosition() {
        // Start in campus area (bottom half)
        const areaHeightPixels = this.areaHeight * this.tileSize;
        return {
            x: 400,
            y: areaHeightPixels + 300
        }; // Middle of campus area
    }
}
const __TURBOPACK__default__export__ = World;
}),
"[project]/app/components/campus/BaseBuildingInterior.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>__TURBOPACK__default__export__
]);
class BaseBuildingInterior {
    tileSize = 32;
    roomWidth = 20;
    roomHeight = 15;
    tiles;
    cameraX = 0;
    cameraY = 0;
    exitX = 320;
    exitY = 450;
    constructor(){
        this.tiles = this.generateInterior();
    }
    canMoveTo(x, y, width, height) {
        // Convert pixel coordinates to tile coordinates
        const leftTile = Math.floor(x / this.tileSize);
        const rightTile = Math.floor((x + width - 1) / this.tileSize);
        const topTile = Math.floor(y / this.tileSize);
        const bottomTile = Math.floor((y + height - 1) / this.tileSize);
        // Check all tiles that the entity overlaps
        for(let tileY = topTile; tileY <= bottomTile; tileY++){
            for(let tileX = leftTile; tileX <= rightTile; tileX++){
                if (this.isTileSolid(tileX, tileY)) {
                    return false;
                }
            }
        }
        return true;
    }
    isTileSolid(tileX, tileY) {
        // Check bounds
        if (tileX < 0 || tileX >= this.roomWidth || tileY < 0 || tileY >= this.roomHeight) {
            return true; // Treat out-of-bounds as solid
        }
        return this.tiles[tileY][tileX].solid;
    }
    update(deltaTime) {
    // Base update logic - can be overridden
    }
    render(ctx, player) {
        // Simple camera that centers on the room
        this.updateCamera(player);
        // Clear with indoor background
        ctx.fillStyle = '#F5F5DC'; // Beige indoor background
        ctx.fillRect(0, 0, 800, 600);
        // Render visible tiles
        const startTileX = Math.max(0, Math.floor(this.cameraX / this.tileSize));
        const endTileX = Math.min(this.roomWidth - 1, Math.floor((this.cameraX + 800) / this.tileSize));
        const startTileY = Math.max(0, Math.floor(this.cameraY / this.tileSize));
        const endTileY = Math.min(this.roomHeight - 1, Math.floor((this.cameraY + 600) / this.tileSize));
        for(let tileY = startTileY; tileY <= endTileY; tileY++){
            for(let tileX = startTileX; tileX <= endTileX; tileX++){
                const tile = this.tiles[tileY][tileX];
                const x = tileX * this.tileSize - this.cameraX;
                const y = tileY * this.tileSize - this.cameraY;
                this.renderTile(ctx, tile, x, y);
            }
        }
        // Render building-specific elements
        this.renderBuildingSpecificElements(ctx);
    }
    updateCamera(player) {
        // Keep camera centered on room, don't follow player too closely
        const targetCameraX = Math.max(0, Math.min(this.roomWidth * this.tileSize - 800, 0));
        const targetCameraY = Math.max(0, Math.min(this.roomHeight * this.tileSize - 600, 0));
        this.cameraX = targetCameraX;
        this.cameraY = targetCameraY;
    }
    renderTile(ctx, tile, x, y) {
        switch(tile.type){
            case 'floor':
                this.renderFloorTile(ctx, x, y);
                break;
            case 'wall':
                this.renderWallTile(ctx, x, y);
                break;
            case 'door':
                this.renderDoorTile(ctx, x, y);
                break;
            case 'furniture':
                this.renderFurnitureTile(ctx, tile, x, y);
                break;
            case 'window':
                this.renderWindowTile(ctx, x, y);
                break;
        }
    }
    renderFloorTile(ctx, x, y) {
        // Polished interior floor
        ctx.fillStyle = '#DEB887'; // Burlywood
        ctx.fillRect(x, y, this.tileSize, this.tileSize);
        // Floor pattern
        ctx.fillStyle = '#D2B48C';
        ctx.fillRect(x + 1, y + 1, this.tileSize - 2, this.tileSize - 2);
        // Tile lines
        ctx.fillStyle = '#CD853F';
        ctx.fillRect(x, y + 15, this.tileSize, 1);
        ctx.fillRect(x + 15, y, 1, this.tileSize);
    }
    renderWallTile(ctx, x, y) {
        // Interior wall with VT colors
        ctx.fillStyle = '#F5F5DC'; // Beige base
        ctx.fillRect(x, y, this.tileSize, this.tileSize);
        // Wall trim
        ctx.fillStyle = '#8B0000'; // VT Maroon
        ctx.fillRect(x, y, this.tileSize, 4);
        ctx.fillRect(x, y + this.tileSize - 4, this.tileSize, 4);
        // Wall texture
        ctx.fillStyle = '#DDBEA9';
        ctx.fillRect(x + 2, y + 4, this.tileSize - 4, this.tileSize - 8);
    }
    renderDoorTile(ctx, x, y) {
        // Floor base
        this.renderFloorTile(ctx, x, y);
        // Exit indicator
        ctx.fillStyle = '#32CD32'; // Lime green
        ctx.fillRect(x + 8, y + 8, 16, 16);
        // Exit text
        ctx.fillStyle = 'white';
        ctx.font = '8px monospace';
        ctx.fillText('EXIT', x + 10, y + 18);
    }
    renderFurnitureTile(ctx, tile, x, y) {
        // Floor base
        this.renderFloorTile(ctx, x, y);
        // Furniture based on type
        switch(tile.furniture){
            case 'desk':
                ctx.fillStyle = '#8B4513'; // Brown wood
                ctx.fillRect(x + 4, y + 8, 24, 16);
                break;
            case 'chair':
                ctx.fillStyle = '#8B0000'; // VT Maroon
                ctx.fillRect(x + 8, y + 8, 16, 16);
                ctx.fillRect(x + 10, y + 6, 12, 4); // Back
                break;
            case 'bookshelf':
                ctx.fillStyle = '#8B4513'; // Brown wood
                ctx.fillRect(x + 2, y + 2, 28, 28);
                // Books
                ctx.fillStyle = '#FF8C00'; // VT Orange
                ctx.fillRect(x + 4, y + 6, 4, 20);
                ctx.fillStyle = '#8B0000'; // VT Maroon
                ctx.fillRect(x + 10, y + 6, 4, 20);
                ctx.fillStyle = '#FF8C00';
                ctx.fillRect(x + 16, y + 6, 4, 20);
                break;
            case 'computer':
                ctx.fillStyle = '#2F2F2F'; // Dark gray
                ctx.fillRect(x + 8, y + 12, 16, 12);
                ctx.fillStyle = '#4169E1'; // Blue screen
                ctx.fillRect(x + 10, y + 14, 12, 8);
                break;
            case 'table':
                ctx.fillStyle = '#8B4513'; // Brown wood
                ctx.fillRect(x + 2, y + 10, 28, 12);
                break;
        }
    }
    renderWindowTile(ctx, x, y) {
        // Wall base
        this.renderWallTile(ctx, x, y);
        // Window
        ctx.fillStyle = '#87CEEB'; // Sky blue
        ctx.fillRect(x + 4, y + 4, 24, 24);
        // Window frame
        ctx.fillStyle = '#8B4513'; // Brown
        ctx.fillRect(x + 2, y + 2, 28, 4);
        ctx.fillRect(x + 2, y + 26, 28, 4);
        ctx.fillRect(x + 2, y + 2, 4, 28);
        ctx.fillRect(x + 26, y + 2, 4, 28);
        // Cross pattern
        ctx.fillRect(x + 14, y + 4, 4, 24);
        ctx.fillRect(x + 4, y + 14, 24, 4);
    }
    getExitPosition() {
        return {
            x: this.exitX,
            y: this.exitY,
            scene: 'campus'
        };
    }
    getEntrancePosition() {
        return {
            x: this.exitX,
            y: this.exitY - 50
        }; // Enter slightly above exit
    }
}
const __TURBOPACK__default__export__ = BaseBuildingInterior;
}),
"[project]/app/components/campus/BurrussInterior.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>__TURBOPACK__default__export__
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$components$2f$campus$2f$BaseBuildingInterior$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/components/campus/BaseBuildingInterior.ts [app-ssr] (ecmascript)");
;
class BurrussInterior extends __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$components$2f$campus$2f$BaseBuildingInterior$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"] {
    type = 'burruss';
    getBuildingName() {
        return 'Burruss Hall - Administration';
    }
    generateInterior() {
        const interior = [];
        for(let y = 0; y < this.roomHeight; y++){
            interior[y] = [];
            for(let x = 0; x < this.roomWidth; x++){
                // Create the layout for Burruss Hall administrative building
                // Outer walls
                if (x === 0 || x === this.roomWidth - 1 || y === 0 || y === this.roomHeight - 1) {
                    interior[y][x] = {
                        type: 'wall',
                        solid: true
                    };
                } else if (y === this.roomHeight - 1 && x === Math.floor(this.roomWidth / 2)) {
                    interior[y][x] = {
                        type: 'door',
                        solid: false
                    };
                } else if (x >= 8 && x <= 11 && y >= 6 && y <= 8) {
                    interior[y][x] = {
                        type: 'furniture',
                        solid: true,
                        furniture: 'desk'
                    };
                } else if ((x === 6 || x === 13) && (y === 9 || y === 10)) {
                    interior[y][x] = {
                        type: 'furniture',
                        solid: true,
                        furniture: 'chair'
                    };
                } else if (x >= 2 && x <= 4 && y >= 2 && y <= 4 || x >= 15 && x <= 17 && y >= 2 && y <= 4 || x >= 2 && x <= 4 && y >= 10 && y <= 12 || x >= 15 && x <= 17 && y >= 10 && y <= 12) {
                    interior[y][x] = {
                        type: 'furniture',
                        solid: true,
                        furniture: 'desk'
                    };
                } else if (y === 0 && (x === 5 || x === 10 || x === 14)) {
                    interior[y][x] = {
                        type: 'window',
                        solid: true
                    };
                } else if (x === 7 && y === 3 || x === 12 && y === 3) {
                    interior[y][x] = {
                        type: 'furniture',
                        solid: true,
                        furniture: 'computer'
                    };
                } else {
                    interior[y][x] = {
                        type: 'floor',
                        solid: false
                    };
                }
            }
        }
        return interior;
    }
    renderBuildingSpecificElements(ctx) {
        // Burruss Hall specific elements
        // VT seal/logo in center
        ctx.fillStyle = '#8B0000'; // Maroon
        ctx.fillCircle = function(x, y, radius) {
            this.beginPath();
            this.arc(x, y, radius, 0, 2 * Math.PI);
            this.fill();
        };
        const centerX = 400 - this.cameraX;
        const centerY = 200 - this.cameraY;
        ctx.fillStyle = '#8B0000';
        ctx.beginPath();
        ctx.arc(centerX, centerY, 30, 0, 2 * Math.PI);
        ctx.fill();
        ctx.fillStyle = '#FF8C00';
        ctx.beginPath();
        ctx.arc(centerX, centerY, 25, 0, 2 * Math.PI);
        ctx.fill();
        // VT text
        ctx.fillStyle = '#8B0000';
        ctx.font = 'bold 16px serif';
        ctx.textAlign = 'center';
        ctx.fillText('VT', centerX, centerY + 5);
        // Building name
        ctx.fillStyle = '#8B0000';
        ctx.font = 'bold 14px serif';
        ctx.textAlign = 'center';
        ctx.fillText('BURRUSS HALL', 400 - this.cameraX, 50 - this.cameraY);
        ctx.fillText('ADMINISTRATION', 400 - this.cameraX, 70 - this.cameraY);
        // Marble columns effect
        ctx.fillStyle = '#F5F5DC';
        ctx.fillRect(150 - this.cameraX, 0, 20, 200);
        ctx.fillRect(300 - this.cameraX, 0, 20, 200);
        ctx.fillRect(450 - this.cameraX, 0, 20, 200);
        ctx.fillRect(600 - this.cameraX, 0, 20, 200);
    }
}
const __TURBOPACK__default__export__ = BurrussInterior;
}),
"[project]/app/components/campus/TurnerInterior.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>__TURBOPACK__default__export__
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$components$2f$campus$2f$BaseBuildingInterior$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/components/campus/BaseBuildingInterior.ts [app-ssr] (ecmascript)");
;
class TurnerInterior extends __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$components$2f$campus$2f$BaseBuildingInterior$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"] {
    type = 'turner';
    getBuildingName() {
        return 'Turner Library';
    }
    generateInterior() {
        const interior = [];
        for(let y = 0; y < this.roomHeight; y++){
            interior[y] = [];
            for(let x = 0; x < this.roomWidth; x++){
                // Create the layout for Turner Library
                // Outer walls
                if (x === 0 || x === this.roomWidth - 1 || y === 0 || y === this.roomHeight - 1) {
                    interior[y][x] = {
                        type: 'wall',
                        solid: true
                    };
                } else if (y === this.roomHeight - 1 && x === Math.floor(this.roomWidth / 2)) {
                    interior[y][x] = {
                        type: 'door',
                        solid: false
                    };
                } else if (x === 1 && y >= 2 && y <= 12 || x === this.roomWidth - 2 && y >= 2 && y <= 12 || y === 1 && x >= 3 && x <= 16 && x % 3 === 0) {
                    interior[y][x] = {
                        type: 'furniture',
                        solid: true,
                        furniture: 'bookshelf'
                    };
                } else if (x >= 6 && x <= 8 && y >= 5 && y <= 6 || x >= 11 && x <= 13 && y >= 5 && y <= 6 || x >= 6 && x <= 8 && y >= 9 && y <= 10 || x >= 11 && x <= 13 && y >= 9 && y <= 10) {
                    interior[y][x] = {
                        type: 'furniture',
                        solid: true,
                        furniture: 'table'
                    };
                } else if (x === 5 && (y === 5 || y === 9) || x === 9 && (y === 5 || y === 9) || x === 10 && (y === 5 || y === 9) || x === 14 && (y === 5 || y === 9)) {
                    interior[y][x] = {
                        type: 'furniture',
                        solid: true,
                        furniture: 'chair'
                    };
                } else if (x >= 3 && x <= 5 && y === 3 || x >= 14 && x <= 16 && y === 3) {
                    interior[y][x] = {
                        type: 'furniture',
                        solid: true,
                        furniture: 'computer'
                    };
                } else if (y === 0 && (x === 4 || x === 8 || x === 12 || x === 16)) {
                    interior[y][x] = {
                        type: 'window',
                        solid: true
                    };
                } else {
                    interior[y][x] = {
                        type: 'floor',
                        solid: false
                    };
                }
            }
        }
        return interior;
    }
    renderBuildingSpecificElements(ctx) {
        // Turner Library specific elements
        // Library circulation desk
        ctx.fillStyle = '#8B4513'; // Brown wood
        ctx.fillRect(320 - this.cameraX, 100 - this.cameraY, 160, 40);
        // Information desk sign
        ctx.fillStyle = '#8B0000';
        ctx.fillRect(380 - this.cameraX, 80 - this.cameraY, 40, 20);
        ctx.fillStyle = 'white';
        ctx.font = '10px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('INFO', 400 - this.cameraX, 93 - this.cameraY);
        // Building name
        ctx.fillStyle = '#FF8C00';
        ctx.font = 'bold 16px serif';
        ctx.textAlign = 'center';
        ctx.fillText('TURNER LIBRARY', 400 - this.cameraX, 30 - this.cameraY);
        // Reading area signs
        ctx.fillStyle = '#8B0000';
        ctx.font = '12px serif';
        ctx.textAlign = 'left';
        ctx.fillText('Quiet Study', 100 - this.cameraX, 150 - this.cameraY);
        ctx.fillText('Computer Lab', 100 - this.cameraX, 110 - this.cameraY);
        ctx.fillText('Research Collection', 500 - this.cameraX, 150 - this.cameraY);
        // Library carpet pattern
        ctx.fillStyle = '#8B0000';
        ctx.globalAlpha = 0.1;
        for(let x = 0; x < 800; x += 40){
            for(let y = 0; y < 600; y += 40){
                ctx.fillRect(x - this.cameraX, y - this.cameraY, 20, 20);
            }
        }
        ctx.globalAlpha = 1.0;
        // Book return slot
        ctx.fillStyle = '#2F2F2F';
        ctx.fillRect(50 - this.cameraX, 200 - this.cameraY, 30, 20);
        ctx.fillStyle = 'white';
        ctx.font = '8px monospace';
        ctx.fillText('RETURNS', 55 - this.cameraX, 213 - this.cameraY);
    }
}
const __TURBOPACK__default__export__ = TurnerInterior;
}),
"[project]/app/components/campus/TorgersenInterior.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>__TURBOPACK__default__export__
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$components$2f$campus$2f$BaseBuildingInterior$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/components/campus/BaseBuildingInterior.ts [app-ssr] (ecmascript)");
;
class TorgersenInterior extends __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$components$2f$campus$2f$BaseBuildingInterior$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"] {
    type = 'torgersen';
    getBuildingName() {
        return 'Torgersen Hall - Computer Science Department';
    }
    generateInterior() {
        const interior = [];
        for(let y = 0; y < this.roomHeight; y++){
            interior[y] = [];
            for(let x = 0; x < this.roomWidth; x++){
                // Create the layout for Torgersen Computer Science Hall
                // Outer walls
                if (x === 0 || x === this.roomWidth - 1 || y === 0 || y === this.roomHeight - 1) {
                    interior[y][x] = {
                        type: 'wall',
                        solid: true
                    };
                } else if (y === this.roomHeight - 1 && x === Math.floor(this.roomWidth / 2)) {
                    interior[y][x] = {
                        type: 'door',
                        solid: false
                    };
                } else if (x >= 2 && x <= 7 && y >= 2 && y <= 8 && (x + y) % 2 === 0) {
                    interior[y][x] = {
                        type: 'furniture',
                        solid: true,
                        furniture: 'computer'
                    };
                } else if (x >= 12 && x <= 17 && y >= 3 && y <= 6) {
                    interior[y][x] = {
                        type: 'furniture',
                        solid: true,
                        furniture: 'computer'
                    };
                } else if (x >= 12 && x <= 17 && y >= 8 && y <= 11) {
                    interior[y][x] = {
                        type: 'furniture',
                        solid: true,
                        furniture: 'computer'
                    };
                } else if (x >= 2 && x <= 7 && y >= 2 && y <= 8 && (x + y) % 2 === 1 || x >= 11 && x <= 18 && (y === 2 || y === 7 || y === 12)) {
                    interior[y][x] = {
                        type: 'furniture',
                        solid: true,
                        furniture: 'chair'
                    };
                } else if (y === 0 && (x === 3 || x === 7 || x === 13 || x === 17)) {
                    interior[y][x] = {
                        type: 'window',
                        solid: true
                    };
                } else {
                    interior[y][x] = {
                        type: 'floor',
                        solid: false
                    };
                }
            }
        }
        return interior;
    }
    renderBuildingSpecificElements(ctx) {
        // Torgersen Hall Gothic Revival Architecture and Computer Science Elements
        // Gothic architectural details on walls
        this.renderGothicArchDetails(ctx);
        // Computer science servers and workstations
        ctx.fillStyle = '#1A1A1A'; // Dark server racks
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
        ctx.fillText('COMPUTER SCIENCE DEPARTMENT', 400 - this.cameraX, 50 - this.cameraY);
        ctx.fillStyle = '#C8B99C';
        ctx.font = '10px serif';
        ctx.fillText('EST. 1872 • VIRGINIA TECH', 400 - this.cameraX, 65 - this.cameraY);
        // Computer Science departmental signs with Gothic styling
        ctx.fillStyle = '#2F2F2F';
        ctx.font = '14px serif';
        ctx.textAlign = 'left';
        ctx.fillText('💻 Computer Science Lab', 80 - this.cameraX, 100 - this.cameraY);
        ctx.fillText('🖥️ Software Engineering Studio', 400 - this.cameraX, 200 - this.cameraY);
        ctx.fillText('⚡ Data Science & AI Research', 400 - this.cameraX, 320 - this.cameraY);
        // Gothic stone columns (decorative)
        this.renderGothicColumns(ctx);
        // Computer science code display
        ctx.strokeStyle = '#4A4A4A';
        ctx.lineWidth = 1;
        ctx.beginPath();
        // Programming workstation display
        ctx.moveTo(50 - this.cameraX, 140 - this.cameraY);
        ctx.lineTo(150 - this.cameraX, 140 - this.cameraY);
        ctx.lineTo(150 - this.cameraX, 180 - this.cameraY);
        ctx.lineTo(50 - this.cameraX, 180 - this.cameraY);
        ctx.closePath();
        ctx.stroke();
        // Add code snippet display
        ctx.fillStyle = '#00FF00';
        ctx.font = '8px monospace';
        ctx.textAlign = 'left';
        ctx.fillText('def algorithm():', 55 - this.cameraX, 155 - this.cameraY);
        ctx.fillText('    return result', 55 - this.cameraX, 165 - this.cameraY);
        ctx.fillText('print("Hello CS!")', 55 - this.cameraX, 175 - this.cameraY);
        // VT Computer Science logo with Gothic styling
        ctx.fillStyle = '#8B0000';
        ctx.fillRect(350 - this.cameraX, 75 - this.cameraY, 120, 50);
        ctx.fillStyle = '#E8DCC6'; // Limestone color
        ctx.fillRect(352 - this.cameraX, 77 - this.cameraY, 116, 46);
        ctx.fillStyle = '#8B0000';
        ctx.font = 'bold 16px serif';
        ctx.textAlign = 'center';
        ctx.fillText('VT', 410 - this.cameraX, 95 - this.cameraY);
        ctx.font = 'bold 10px serif';
        ctx.fillText('COMPUTER SCI', 410 - this.cameraX, 110 - this.cameraY);
        ctx.fillText('INNOVATION', 410 - this.cameraX, 120 - this.cameraY);
        // Modern cable management with Gothic aesthetic
        ctx.fillStyle = '#2F2F2F';
        ctx.fillRect(0 - this.cameraX, 200 - this.cameraY, 800, 3);
        ctx.fillRect(0 - this.cameraX, 300 - this.cameraY, 800, 3);
        // Stone floor pattern details
        ctx.strokeStyle = '#C8B99C';
        ctx.lineWidth = 1;
        for(let x = 0; x < 800; x += 64){
            ctx.beginPath();
            ctx.moveTo(x - this.cameraX, 0 - this.cameraY);
            ctx.lineTo(x - this.cameraX, 600 - this.cameraY);
            ctx.stroke();
        }
    }
    renderGothicArchDetails(ctx) {
        // Gothic arch patterns on walls
        ctx.strokeStyle = '#C8B99C';
        ctx.lineWidth = 2;
        // Left wall arches
        for(let i = 0; i < 3; i++){
            const x = 20 + i * 60;
            const y = 120;
            ctx.beginPath();
            ctx.arc(x - this.cameraX, y - this.cameraY, 25, Math.PI, 0);
            ctx.stroke();
        }
        // Right wall arches
        for(let i = 0; i < 3; i++){
            const x = 600 + i * 60;
            const y = 120;
            ctx.beginPath();
            ctx.arc(x - this.cameraX, y - this.cameraY, 25, Math.PI, 0);
            ctx.stroke();
        }
    }
    renderGothicColumns(ctx) {
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
const __TURBOPACK__default__export__ = TorgersenInterior;
}),
"[project]/app/components/campus/SquiresInterior.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>__TURBOPACK__default__export__
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$components$2f$campus$2f$BaseBuildingInterior$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/components/campus/BaseBuildingInterior.ts [app-ssr] (ecmascript)");
;
class SquiresInterior extends __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$components$2f$campus$2f$BaseBuildingInterior$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"] {
    type = 'squires';
    getBuildingName() {
        return 'Squires Student Center';
    }
    generateInterior() {
        const interior = [];
        for(let y = 0; y < this.roomHeight; y++){
            interior[y] = [];
            for(let x = 0; x < this.roomWidth; x++){
                // Create the layout for Squires Student Center
                // Outer walls
                if (x === 0 || x === this.roomWidth - 1 || y === 0 || y === this.roomHeight - 1) {
                    interior[y][x] = {
                        type: 'wall',
                        solid: true
                    };
                } else if (y === this.roomHeight - 1 && x === Math.floor(this.roomWidth / 2)) {
                    interior[y][x] = {
                        type: 'door',
                        solid: false
                    };
                } else if (x >= 6 && x <= 7 && y >= 5 && y <= 6 || x >= 9 && x <= 10 && y >= 5 && y <= 6 || x >= 12 && x <= 13 && y >= 5 && y <= 6 || x >= 6 && x <= 7 && y >= 8 && y <= 9 || x >= 9 && x <= 10 && y >= 8 && y <= 9 || x >= 12 && x <= 13 && y >= 8 && y <= 9) {
                    interior[y][x] = {
                        type: 'furniture',
                        solid: true,
                        furniture: 'table'
                    };
                } else if (x === 5 && (y === 5 || y === 8) || x === 8 && (y === 5 || y === 8) || x === 11 && (y === 5 || y === 8) || x === 14 && (y === 5 || y === 8) || x === 5 && (y === 6 || y === 9) || x === 8 && (y === 6 || y === 9) || x === 11 && (y === 6 || y === 9) || x === 14 && (y === 6 || y === 9)) {
                    interior[y][x] = {
                        type: 'furniture',
                        solid: true,
                        furniture: 'chair'
                    };
                } else if (x >= 2 && x <= 4 && y >= 3 && y <= 4 || x >= 2 && x <= 4 && y >= 10 && y <= 11) {
                    interior[y][x] = {
                        type: 'furniture',
                        solid: true,
                        furniture: 'couch'
                    };
                } else if (x >= 15 && x <= 17 && y >= 2 && y <= 3) {
                    interior[y][x] = {
                        type: 'furniture',
                        solid: true,
                        furniture: 'desk'
                    };
                } else if (x === 3 && y === 7 || x === 16 && y === 7) {
                    interior[y][x] = {
                        type: 'furniture',
                        solid: true,
                        furniture: 'computer'
                    };
                } else if (y === 0 && (x === 4 || x === 8 || x === 12 || x === 16)) {
                    interior[y][x] = {
                        type: 'window',
                        solid: true
                    };
                } else {
                    interior[y][x] = {
                        type: 'floor',
                        solid: false
                    };
                }
            }
        }
        return interior;
    }
    renderBuildingSpecificElements(ctx) {
        // Squires Student Center specific elements
        // Building name
        ctx.fillStyle = '#FF8C00';
        ctx.font = 'bold 16px serif';
        ctx.textAlign = 'center';
        ctx.fillText('SQUIRES STUDENT CENTER', 400 - this.cameraX, 30 - this.cameraY);
        // Food court area
        ctx.fillStyle = '#8B0000';
        ctx.font = '14px serif';
        ctx.textAlign = 'center';
        ctx.fillText('FOOD COURT', 400 - this.cameraX, 55 - this.cameraY);
        // Student services signs
        ctx.fillStyle = '#8B0000';
        ctx.font = '12px sans-serif';
        ctx.textAlign = 'left';
        ctx.fillText('Student Services', 500 - this.cameraX, 100 - this.cameraY);
        ctx.fillText('Information Desk', 500 - this.cameraX, 120 - this.cameraY);
        ctx.fillText('Student Lounge', 100 - this.cameraX, 150 - this.cameraY);
        // VT spirit decorations
        ctx.fillStyle = '#8B0000';
        ctx.fillRect(50 - this.cameraX, 50 - this.cameraY, 60, 40);
        ctx.fillStyle = '#FF8C00';
        ctx.fillRect(55 - this.cameraX, 55 - this.cameraY, 50, 30);
        ctx.fillStyle = '#8B0000';
        ctx.font = 'bold 16px serif';
        ctx.textAlign = 'center';
        ctx.fillText('GO', 70 - this.cameraX, 75 - this.cameraY);
        ctx.fillText('HOKIES!', 85 - this.cameraX, 85 - this.cameraY);
        // Student announcements board
        ctx.fillStyle = '#4A4A4A';
        ctx.fillRect(600 - this.cameraX, 100 - this.cameraY, 120, 80);
        ctx.fillStyle = 'white';
        ctx.fillRect(610 - this.cameraX, 110 - this.cameraY, 100, 60);
        ctx.fillStyle = '#8B0000';
        ctx.font = '10px sans-serif';
        ctx.textAlign = 'left';
        ctx.fillText('Student Events', 615 - this.cameraX, 125 - this.cameraY);
        ctx.fillText('• Basketball Game', 615 - this.cameraX, 140 - this.cameraY);
        ctx.fillText('• Club Fair', 615 - this.cameraX, 155 - this.cameraY);
        ctx.fillText('• Study Groups', 615 - this.cameraX, 170 - this.cameraY);
        // Stylized floor pattern for student center
        ctx.fillStyle = '#FF8C00';
        ctx.globalAlpha = 0.1;
        for(let x = 200; x < 600; x += 50){
            for(let y = 200; y < 400; y += 50){
                ctx.fillRect(x - this.cameraX, y - this.cameraY, 25, 25);
            }
        }
        ctx.globalAlpha = 1.0;
        // Student center amenities
        ctx.fillStyle = '#2F2F2F';
        ctx.fillRect(150 - this.cameraX, 320 - this.cameraY, 40, 20);
        ctx.fillStyle = 'white';
        ctx.font = '8px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('ATM', 170 - this.cameraX, 333 - this.cameraY);
        ctx.fillStyle = '#8B4513';
        ctx.fillRect(250 - this.cameraX, 320 - this.cameraY, 40, 20);
        ctx.fillStyle = 'white';
        ctx.fillText('MAIL', 270 - this.cameraX, 333 - this.cameraY);
    }
}
const __TURBOPACK__default__export__ = SquiresInterior;
}),
"[project]/app/components/off-campus/BaseOffCampusBuilding.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>__TURBOPACK__default__export__
]);
class BaseOffCampusBuilding {
    tileSize = 32;
    buildingWidth = 20;
    buildingHeight = 15;
    tiles;
    cameraX = 0;
    cameraY = 0;
    exitX = 320;
    exitY = 450;
    constructor(){
        this.tiles = this.generateBuilding();
    }
    canMoveTo(x, y, width, height) {
        // Convert pixel coordinates to tile coordinates
        const leftTile = Math.floor(x / this.tileSize);
        const rightTile = Math.floor((x + width - 1) / this.tileSize);
        const topTile = Math.floor(y / this.tileSize);
        const bottomTile = Math.floor((y + height - 1) / this.tileSize);
        // Check all tiles that the entity overlaps
        for(let tileY = topTile; tileY <= bottomTile; tileY++){
            for(let tileX = leftTile; tileX <= rightTile; tileX++){
                if (this.isTileSolid(tileX, tileY)) {
                    return false;
                }
            }
        }
        return true;
    }
    isTileSolid(tileX, tileY) {
        // Check bounds
        if (tileX < 0 || tileX >= this.buildingWidth || tileY < 0 || tileY >= this.buildingHeight) {
            return true; // Treat out-of-bounds as solid
        }
        return this.tiles[tileY][tileX].solid;
    }
    update(deltaTime) {
    // Base update logic - can be overridden
    }
    render(ctx, player) {
        // Simple camera that centers on the building
        this.updateCamera(player);
        // Clear with indoor background
        ctx.fillStyle = '#F0F0F0'; // Light gray indoor background
        ctx.fillRect(0, 0, 800, 600);
        // Render visible tiles
        const startTileX = Math.max(0, Math.floor(this.cameraX / this.tileSize));
        const endTileX = Math.min(this.buildingWidth - 1, Math.floor((this.cameraX + 800) / this.tileSize));
        const startTileY = Math.max(0, Math.floor(this.cameraY / this.tileSize));
        const endTileY = Math.min(this.buildingHeight - 1, Math.floor((this.cameraY + 600) / this.tileSize));
        for(let tileY = startTileY; tileY <= endTileY; tileY++){
            for(let tileX = startTileX; tileX <= endTileX; tileX++){
                const tile = this.tiles[tileY][tileX];
                const x = tileX * this.tileSize - this.cameraX;
                const y = tileY * this.tileSize - this.cameraY;
                this.renderTile(ctx, tile, x, y);
            }
        }
        // Render building-specific elements
        this.renderBuildingSpecificElements(ctx);
    }
    updateCamera(player) {
        // Keep camera centered on building
        const targetCameraX = Math.max(0, Math.min(this.buildingWidth * this.tileSize - 800, 0));
        const targetCameraY = Math.max(0, Math.min(this.buildingHeight * this.tileSize - 600, 0));
        this.cameraX = targetCameraX;
        this.cameraY = targetCameraY;
    }
    renderTile(ctx, tile, x, y) {
        switch(tile.type){
            case 'floor':
                this.renderFloorTile(ctx, x, y);
                break;
            case 'wall':
                this.renderWallTile(ctx, x, y);
                break;
            case 'door':
                this.renderDoorTile(ctx, x, y);
                break;
            case 'furniture':
                this.renderFurnitureTile(ctx, tile, x, y);
                break;
            case 'window':
                this.renderWindowTile(ctx, x, y);
                break;
            case 'lobby':
                this.renderLobbyTile(ctx, x, y);
                break;
            case 'mailroom':
                this.renderMailroomTile(ctx, x, y);
                break;
            case 'elevator':
                this.renderElevatorTile(ctx, x, y);
                break;
            case 'stairs':
                this.renderStairsTile(ctx, x, y);
                break;
        }
    }
    renderFloorTile(ctx, x, y) {
        // Modern apartment flooring
        ctx.fillStyle = '#E8E8E8'; // Light gray
        ctx.fillRect(x, y, this.tileSize, this.tileSize);
        // Floor pattern
        ctx.fillStyle = '#DCDCDC';
        ctx.fillRect(x + 1, y + 1, this.tileSize - 2, this.tileSize - 2);
    }
    renderWallTile(ctx, x, y) {
        // Modern apartment walls
        ctx.fillStyle = '#FFFFFF'; // White walls
        ctx.fillRect(x, y, this.tileSize, this.tileSize);
        // Wall trim
        ctx.fillStyle = '#D3D3D3';
        ctx.fillRect(x, y, this.tileSize, 2);
        ctx.fillRect(x, y + this.tileSize - 2, this.tileSize, 2);
    }
    renderDoorTile(ctx, x, y) {
        // Floor base
        this.renderFloorTile(ctx, x, y);
        // Exit indicator
        ctx.fillStyle = '#32CD32'; // Lime green
        ctx.fillRect(x + 8, y + 8, 16, 16);
        // Exit text
        ctx.fillStyle = 'white';
        ctx.font = '8px monospace';
        ctx.fillText('EXIT', x + 10, y + 18);
    }
    renderFurnitureTile(ctx, tile, x, y) {
        // Floor base
        this.renderFloorTile(ctx, x, y);
        // Furniture based on type
        switch(tile.furniture){
            case 'couch':
                ctx.fillStyle = '#8B4513'; // Brown
                ctx.fillRect(x + 2, y + 8, 28, 16);
                ctx.fillStyle = '#A0522D'; // Lighter brown for cushions
                ctx.fillRect(x + 4, y + 10, 6, 12);
                ctx.fillRect(x + 12, y + 10, 6, 12);
                ctx.fillRect(x + 20, y + 10, 6, 12);
                break;
            case 'bed':
                ctx.fillStyle = '#8B4513'; // Brown bed frame
                ctx.fillRect(x + 2, y + 4, 28, 24);
                ctx.fillStyle = '#FFFFFF'; // White sheets
                ctx.fillRect(x + 4, y + 6, 24, 20);
                ctx.fillStyle = '#FFB6C1'; // Pink pillow
                ctx.fillRect(x + 6, y + 8, 8, 6);
                break;
            case 'kitchen':
                ctx.fillStyle = '#2F4F4F'; // Dark slate gray
                ctx.fillRect(x + 2, y + 2, 28, 14);
                ctx.fillStyle = '#4169E1'; // Blue for appliances
                ctx.fillRect(x + 4, y + 4, 8, 10);
                ctx.fillStyle = '#C0C0C0'; // Silver for sink
                ctx.fillRect(x + 14, y + 4, 8, 10);
                break;
            case 'mailbox':
                ctx.fillStyle = '#4682B4'; // Steel blue
                ctx.fillRect(x + 8, y + 8, 16, 16);
                ctx.fillStyle = '#FFD700'; // Gold for handles
                ctx.fillRect(x + 12, y + 14, 8, 2);
                break;
            case 'vending':
                ctx.fillStyle = '#FF4500'; // Orange red
                ctx.fillRect(x + 4, y + 2, 24, 28);
                ctx.fillStyle = '#000000'; // Black for display
                ctx.fillRect(x + 6, y + 4, 20, 12);
                ctx.fillStyle = '#FFFFFF'; // White for buttons
                ctx.fillRect(x + 8, y + 18, 4, 4);
                ctx.fillRect(x + 14, y + 18, 4, 4);
                ctx.fillRect(x + 20, y + 18, 4, 4);
                break;
            case 'laundry':
                ctx.fillStyle = '#FFFFFF'; // White washers/dryers
                ctx.fillRect(x + 2, y + 4, 12, 24);
                ctx.fillRect(x + 18, y + 4, 12, 24);
                ctx.fillStyle = '#000000'; // Black for doors
                ctx.fillRect(x + 4, y + 6, 8, 8);
                ctx.fillRect(x + 20, y + 6, 8, 8);
                break;
            case 'refrigerator':
                ctx.fillStyle = '#F8F9FA'; // White refrigerator
                ctx.fillRect(x + 2, y + 2, 28, 28);
                ctx.fillStyle = '#6C757D'; // Handle
                ctx.fillRect(x + 26, y + 10, 2, 8);
                ctx.fillStyle = '#000000'; // Door line
                ctx.strokeStyle = '#000000';
                ctx.lineWidth = 1;
                ctx.beginPath();
                ctx.moveTo(x + 2, y + 16);
                ctx.lineTo(x + 30, y + 16);
                ctx.stroke();
                // Add subtle glow effect to indicate it's interactive
                ctx.save();
                ctx.shadowColor = '#4ECDC4';
                ctx.shadowBlur = 4;
                ctx.strokeStyle = '#4ECDC4';
                ctx.lineWidth = 1;
                ctx.strokeRect(x + 2, y + 2, 28, 28);
                ctx.restore();
                break;
            case 'dresser':
                ctx.fillStyle = '#8B4513'; // Brown wood
                ctx.fillRect(x + 2, y + 8, 28, 16);
                ctx.fillStyle = '#654321'; // Darker brown for drawers
                ctx.fillRect(x + 4, y + 10, 10, 4);
                ctx.fillRect(x + 16, y + 10, 10, 4);
                ctx.fillRect(x + 4, y + 16, 10, 4);
                ctx.fillRect(x + 16, y + 16, 10, 4);
                break;
            case 'tv':
                ctx.fillStyle = '#000000'; // TV frame
                ctx.fillRect(x + 4, y + 8, 24, 16);
                ctx.fillStyle = '#1E3A8A'; // TV screen
                ctx.fillRect(x + 6, y + 10, 20, 12);
                break;
            case 'counter':
                ctx.fillStyle = '#D1D5DB'; // Counter color
                ctx.fillRect(x + 2, y + 8, 28, 16);
                // Stove burners
                ctx.fillStyle = '#374151';
                ctx.beginPath();
                ctx.arc(x + 8, y + 16, 3, 0, 2 * Math.PI);
                ctx.fill();
                ctx.beginPath();
                ctx.arc(x + 16, y + 16, 3, 0, 2 * Math.PI);
                ctx.fill();
                ctx.beginPath();
                ctx.arc(x + 24, y + 16, 3, 0, 2 * Math.PI);
                ctx.fill();
                break;
            case 'sink':
                ctx.fillStyle = '#9CA3AF'; // Sink color
                ctx.fillRect(x + 4, y + 8, 24, 16);
                ctx.fillStyle = '#6B7280'; // Faucet
                ctx.fillRect(x + 14, y + 6, 4, 8);
                break;
            default:
                ctx.fillStyle = '#8B4513'; // Default brown furniture
                ctx.fillRect(x + 4, y + 4, 24, 24);
        }
    }
    renderWindowTile(ctx, x, y) {
        // Wall base
        this.renderWallTile(ctx, x, y);
        // Window
        ctx.fillStyle = '#87CEEB'; // Sky blue
        ctx.fillRect(x + 4, y + 4, 24, 24);
        // Window frame
        ctx.fillStyle = '#A0522D'; // Brown frame
        ctx.fillRect(x + 2, y + 2, 28, 4);
        ctx.fillRect(x + 2, y + 26, 28, 4);
        ctx.fillRect(x + 2, y + 2, 4, 28);
        ctx.fillRect(x + 26, y + 2, 4, 28);
        // Window cross
        ctx.fillRect(x + 14, y + 4, 4, 24);
        ctx.fillRect(x + 4, y + 14, 24, 4);
    }
    renderLobbyTile(ctx, x, y) {
        // Fancy lobby flooring
        ctx.fillStyle = '#F5F5DC'; // Beige
        ctx.fillRect(x, y, this.tileSize, this.tileSize);
        // Marble pattern
        ctx.fillStyle = '#DDBEA9';
        ctx.fillRect(x + 2, y + 2, this.tileSize - 4, this.tileSize - 4);
        // Decorative border
        ctx.fillStyle = '#CD853F';
        ctx.fillRect(x, y, this.tileSize, 2);
        ctx.fillRect(x, y + this.tileSize - 2, this.tileSize, 2);
        ctx.fillRect(x, y, 2, this.tileSize);
        ctx.fillRect(x + this.tileSize - 2, y, 2, this.tileSize);
    }
    renderMailroomTile(ctx, x, y) {
        // Floor base
        this.renderFloorTile(ctx, x, y);
        // Mailroom equipment
        ctx.fillStyle = '#4682B4'; // Steel blue
        ctx.fillRect(x + 4, y + 4, 24, 24);
        // Mail slots
        ctx.fillStyle = '#000000';
        for(let i = 0; i < 3; i++){
            for(let j = 0; j < 3; j++){
                ctx.fillRect(x + 6 + j * 6, y + 6 + i * 6, 4, 4);
            }
        }
    }
    renderElevatorTile(ctx, x, y) {
        // Floor base
        this.renderFloorTile(ctx, x, y);
        // Elevator doors
        ctx.fillStyle = '#C0C0C0'; // Silver
        ctx.fillRect(x + 6, y + 4, 10, 24);
        ctx.fillRect(x + 16, y + 4, 10, 24);
        // Elevator buttons
        ctx.fillStyle = '#FFD700'; // Gold
        ctx.fillRect(x + 28, y + 12, 2, 2);
        ctx.fillRect(x + 28, y + 16, 2, 2);
    }
    renderStairsTile(ctx, x, y) {
        // Floor base
        this.renderFloorTile(ctx, x, y);
        // Stairs
        ctx.fillStyle = '#808080'; // Gray
        for(let i = 0; i < 4; i++){
            ctx.fillRect(x + 2, y + 4 + i * 6, 28 - i * 6, 4);
        }
        // Handrail
        ctx.fillStyle = '#8B4513'; // Brown
        ctx.fillRect(x + 2, y + 4, 2, 24);
    }
    getExitPosition() {
        return {
            x: this.exitX,
            y: this.exitY,
            scene: 'campus'
        };
    }
    getEntrancePosition() {
        return {
            x: this.exitX,
            y: this.exitY - 50
        }; // Enter slightly above exit
    }
}
const __TURBOPACK__default__export__ = BaseOffCampusBuilding;
}),
"[project]/app/components/off-campus/TotsDownstairs.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>__TURBOPACK__default__export__
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$components$2f$off$2d$campus$2f$BaseOffCampusBuilding$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/components/off-campus/BaseOffCampusBuilding.ts [app-ssr] (ecmascript)");
;
class TotsDownstairs extends __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$components$2f$off$2d$campus$2f$BaseOffCampusBuilding$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"] {
    type = 'tots';
    getBuildingName() {
        return 'Tots - Outdoor Bar (Ground Floor)';
    }
    getBuildingType() {
        return 'commercial';
    }
    generateBuilding() {
        const interior = [];
        for(let y = 0; y < this.buildingHeight; y++){
            interior[y] = [];
            for(let x = 0; x < this.buildingWidth; x++){
                // Create the layout for Tots restaurant
                // Outer walls
                if (x === 0 || x === this.buildingWidth - 1 || y === 0 || y === this.buildingHeight - 1) {
                    interior[y][x] = {
                        type: 'wall',
                        solid: true
                    };
                } else if (y === this.buildingHeight - 1 && x === Math.floor(this.buildingWidth / 2)) {
                    interior[y][x] = {
                        type: 'door',
                        solid: false
                    };
                } else if (x >= 2 && x <= 6 && y >= 2 && y <= 3) {
                    interior[y][x] = {
                        type: 'furniture',
                        solid: true,
                        furniture: 'desk'
                    };
                } else if (x >= 2 && x <= 6 && y === 4) {
                    interior[y][x] = {
                        type: 'furniture',
                        solid: true,
                        furniture: 'chair'
                    };
                } else if (x >= 16 && x <= 18 && y >= 2 && y <= 5) {
                    interior[y][x] = {
                        type: 'stairs',
                        solid: false
                    };
                } else if (x >= 4 && x <= 5 && y >= 8 && y <= 9 || x >= 8 && x <= 9 && y >= 8 && y <= 9 || x >= 12 && x <= 13 && y >= 8 && y <= 9 || x >= 16 && x <= 17 && y >= 8 && y <= 9 || x >= 4 && x <= 5 && y >= 11 && y <= 12 || x >= 8 && x <= 9 && y >= 11 && y <= 12 || x >= 12 && x <= 13 && y >= 11 && y <= 12) {
                    interior[y][x] = {
                        type: 'furniture',
                        solid: true,
                        furniture: 'table'
                    };
                } else if (x === 3 && (y === 8 || y === 11) || x === 6 && (y === 8 || y === 11) || x === 7 && (y === 8 || y === 11) || x === 10 && (y === 8 || y === 11) || x === 11 && (y === 8 || y === 11) || x === 14 && (y === 8 || y === 11) || x === 15 && y === 8 || x === 18 && y === 8 || x === 3 && (y === 9 || y === 12) || x === 6 && (y === 9 || y === 12) || x === 7 && (y === 9 || y === 12) || x === 10 && (y === 9 || y === 12) || x === 11 && (y === 9 || y === 12) || x === 14 && (y === 9 || y === 12)) {
                    interior[y][x] = {
                        type: 'furniture',
                        solid: true,
                        furniture: 'chair'
                    };
                } else if (y === 0 && (x === 4 || x === 8 || x === 12 || x === 16) || x === 0 && (y === 6 || y === 10)) {
                    interior[y][x] = {
                        type: 'window',
                        solid: true
                    };
                } else {
                    interior[y][x] = {
                        type: 'floor',
                        solid: false
                    };
                }
            }
        }
        return interior;
    }
    renderBuildingSpecificElements(ctx) {
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
        for(let i = 0; i < 6; i++){
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
        for(let x = 100; x < 700; x += 80){
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
        for(let x = 0; x < 800; x += 40){
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
const __TURBOPACK__default__export__ = TotsDownstairs;
}),
"[project]/app/components/off-campus/TotsUpstairs.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>__TURBOPACK__default__export__
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$components$2f$off$2d$campus$2f$BaseOffCampusBuilding$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/components/off-campus/BaseOffCampusBuilding.ts [app-ssr] (ecmascript)");
;
class TotsUpstairs extends __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$components$2f$off$2d$campus$2f$BaseOffCampusBuilding$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"] {
    type = 'tots_upstairs';
    getBuildingName() {
        return 'Tots - Dance Floor & Photo Spot (Upstairs)';
    }
    getBuildingType() {
        return 'commercial';
    }
    generateBuilding() {
        const interior = [];
        for(let y = 0; y < this.buildingHeight; y++){
            interior[y] = [];
            for(let x = 0; x < this.buildingWidth; x++){
                // Create the layout for Tots upstairs
                // Outer walls
                if (x === 0 || x === this.buildingWidth - 1 || y === 0 || y === this.buildingHeight - 1) {
                    interior[y][x] = {
                        type: 'wall',
                        solid: true
                    };
                } else if (x >= 16 && x <= 18 && y >= 2 && y <= 5) {
                    interior[y][x] = {
                        type: 'stairs',
                        solid: false
                    };
                } else if (x >= 2 && x <= 3 && y >= 6 && y <= 7) {
                    interior[y][x] = {
                        type: 'furniture',
                        solid: true,
                        furniture: 'couch'
                    };
                } else if (x >= 2 && x <= 3 && y >= 10 && y <= 11) {
                    interior[y][x] = {
                        type: 'furniture',
                        solid: true,
                        furniture: 'couch'
                    };
                } else if (x === 5 && y === 8 || x === 5 && y === 12) {
                    interior[y][x] = {
                        type: 'furniture',
                        solid: true,
                        furniture: 'table'
                    };
                } else if (x === 12 && y === 8 || x === 12 && y === 11) {
                    interior[y][x] = {
                        type: 'furniture',
                        solid: true,
                        furniture: 'table'
                    };
                } else if (x >= 14 && x <= 15 && y >= 12 && y <= 13) {
                    interior[y][x] = {
                        type: 'furniture',
                        solid: true,
                        furniture: 'desk'
                    };
                } else if (y === 0 && (x === 5 || x === 9 || x === 13)) {
                    interior[y][x] = {
                        type: 'window',
                        solid: true
                    };
                } else {
                    interior[y][x] = {
                        type: 'floor',
                        solid: false
                    };
                }
            }
        }
        return interior;
    }
    renderBuildingSpecificElements(ctx) {
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
        ctx.fillText('VT', vtSignX + signWidth / 2 - this.cameraX, vtSignY + signHeight / 2 + 25 - this.cameraY);
        // Orange neon glow effect around letters
        ctx.shadowColor = '#FF8C00';
        ctx.shadowBlur = 20;
        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 72px serif';
        ctx.fillText('VT', vtSignX + signWidth / 2 - this.cameraX, vtSignY + signHeight / 2 + 25 - this.cameraY);
        ctx.shadowBlur = 0;
        // "PHOTO SPOT" text below VT sign
        ctx.fillStyle = '#FFD700'; // Gold
        ctx.font = 'bold 16px serif';
        ctx.textAlign = 'center';
        ctx.fillText('📸 PHOTO SPOT 📸', vtSignX + signWidth / 2 - this.cameraX, vtSignY + signHeight + 25 - this.cameraY);
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
        const danceColors = [
            '#FF6B35',
            '#2E86AB',
            '#FF8C00',
            '#8B0000'
        ];
        // Animated dance floor spots
        for(let i = 0; i < 4; i++){
            const x = 450 + i % 2 * 80;
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
        for(let i = 0; i < 6; i++){
            ctx.fillStyle = '#A0522D';
            ctx.fillRect(525 - this.cameraX, 190 - i * 18 - this.cameraY, 70 - (5 - i) * 8, 15);
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
        for(let x = 100; x < 700; x += 100){
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
    getExitPosition() {
        return {
            x: this.exitX,
            y: this.exitY,
            scene: 'tots'
        };
    }
}
const __TURBOPACK__default__export__ = TotsUpstairs;
}),
"[project]/app/components/NPC.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "BaseNPC",
    ()=>BaseNPC
]);
class BaseNPC {
    x;
    y;
    width;
    height;
    name;
    type;
    dialogues;
    currentDialogue = 0;
    color;
    clothingColor;
    constructor(config){
        this.x = config.x;
        this.y = config.y;
        this.width = config.width;
        this.height = config.height;
        this.name = config.name;
        this.type = config.type;
        this.dialogues = config.dialogues || [];
        this.color = config.color || '#FFDBAC'; // Default skin color
        this.clothingColor = config.clothingColor || '#4169E1'; // Default blue clothing
    }
    render(ctx, cameraX, cameraY) {
        const screenX = this.x - cameraX;
        const screenY = this.y - cameraY;
        // Draw NPC body
        this.renderBody(ctx, screenX, screenY);
        // Draw name tag (optional)
        this.renderNameTag(ctx, screenX, screenY);
    }
    renderNameTag(ctx, x, y) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(x - 10, y - 25, this.name.length * 6 + 4, 14);
        ctx.fillStyle = '#FFFFFF';
        ctx.font = '10px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(this.name, x + this.width / 2, y - 15);
    }
    interact() {
        if (this.dialogues.length === 0) return `Hello, I'm ${this.name}`;
        const dialogue = this.dialogues[this.currentDialogue];
        this.currentDialogue = (this.currentDialogue + 1) % this.dialogues.length;
        return dialogue;
    }
    getBounds() {
        return {
            x: this.x,
            y: this.y,
            width: this.width,
            height: this.height
        };
    }
    update(deltaTime) {
    // Base update logic - can be overridden for animations
    }
}
}),
"[project]/app/services/JakeService.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>__TURBOPACK__default__export__,
    "jakeService",
    ()=>jakeService
]);
class JakeService {
    baseUrl;
    conversationHistory = [];
    constructor(){
        this.baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
    }
    async chatWithJake(playerMessage) {
        try {
            console.log(`🗣️ JakeService: Sending message to Jake: "${playerMessage}"`);
            console.log(`🗣️ JakeService: Using baseUrl: ${this.baseUrl}`);
            // Add player message to history
            this.conversationHistory.push({
                message: playerMessage,
                sender: 'Player',
                timestamp: new Date().toISOString()
            });
            console.log(`🗣️ JakeService: Making fetch request to ${this.baseUrl}/jake/chat`);
            const response = await fetch(`${this.baseUrl}/jake/chat`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    message: playerMessage,
                    conversationHistory: this.conversationHistory
                })
            });
            console.log(`🗣️ JakeService: Got response status: ${response.status}`);
            if (!response.ok) {
                console.error(`🚨 JakeService: HTTP error ${response.status}`);
                throw new Error(`HTTP ${response.status}`);
            }
            const jakeResponse = await response.json();
            console.log(`🗣️ JakeService: Parsed response:`, jakeResponse);
            // Add Jake's response to history
            this.conversationHistory.push({
                message: jakeResponse.message,
                sender: 'Jake',
                timestamp: jakeResponse.timestamp
            });
            // Keep only last 10 messages to prevent memory issues
            if (this.conversationHistory.length > 10) {
                this.conversationHistory = this.conversationHistory.slice(-10);
            }
            console.log(`🍺 JakeService: Returning Jake's response: "${jakeResponse.message}"`);
            if (jakeResponse.fallback) {
                console.warn('⚠️ Jake used fallback response (Gemini may be unavailable)');
            }
            return jakeResponse.message;
        } catch (error) {
            console.error('Error chatting with Jake:', error);
            // Local fallback if backend is completely unavailable
            const localFallbacks = [
                "Hey there! Sorry, I'm having trouble hearing you over the crowd.",
                "Welcome to the bar! What can I get you, Hokie?",
                "Go Hokies! Sorry, what did you say?",
                "Hey! Good to see you. Mind saying that again?",
                "Sorry about that - the music's pretty loud in here!"
            ];
            return localFallbacks[Math.floor(Math.random() * localFallbacks.length)];
        }
    }
    // Clear conversation history (useful for testing)
    clearHistory() {
        this.conversationHistory = [];
        console.log('🧹 Cleared Jake conversation history');
    }
    // Get conversation history (useful for debugging)
    getHistory() {
        return [
            ...this.conversationHistory
        ];
    }
    // Check if Jake service is available
    async isAvailable() {
        try {
            const response = await fetch(`${this.baseUrl}/jake/status`);
            return response.ok;
        } catch  {
            return false;
        }
    }
}
const jakeService = new JakeService();
const __TURBOPACK__default__export__ = JakeService;
}),
"[project]/app/components/off-campus/BartenderNPC.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "BartenderNPC",
    ()=>BartenderNPC
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$components$2f$NPC$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/components/NPC.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$services$2f$JakeService$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/services/JakeService.ts [app-ssr] (ecmascript)");
;
;
class BartenderNPC extends __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$components$2f$NPC$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["BaseNPC"] {
    isThinking = false;
    currentResponse = '';
    responseTimer = 0;
    responseDuration = 4000;
    thinkingTimer = 0;
    thinkingDuration = 2000;
    constructor(x, y){
        const config = {
            x,
            y,
            width: 16,
            height: 24,
            name: 'Jake',
            type: 'bartender',
            dialogues: [
                "Welcome to Hokie House! What can I get you?",
                "Try our famous Trash Can - it's a VT favorite!",
                "Go Hokies! We've got the game on all our screens.",
                "Our beer selection is the best in Blacksburg!",
                "Want to hear about our game day specials?"
            ],
            color: '#FFDBAC',
            clothingColor: '#8B0000' // VT Maroon apron/shirt
        };
        super(config);
    }
    update(deltaTime) {
        // Update thinking timer
        if (this.isThinking && this.thinkingTimer > 0) {
            this.thinkingTimer -= deltaTime;
            if (this.thinkingTimer <= 0) {
                this.isThinking = false;
            }
        }
        // Update response display timer
        if (this.currentResponse && this.responseTimer > 0) {
            this.responseTimer -= deltaTime;
            if (this.responseTimer <= 0) {
                this.currentResponse = '';
                this.responseTimer = 0;
            }
        }
    }
    async respondToPlayer(playerMessage) {
        if (this.isThinking) {
            console.log('🍺 Jake is already thinking, ignoring new message');
            return; // Already processing a message
        }
        console.log(`🍺 Jake received message from player: "${playerMessage}"`);
        console.log('🍺 About to call jakeService.chatWithJake...');
        // Start thinking
        this.isThinking = true;
        this.thinkingTimer = this.thinkingDuration;
        this.currentResponse = ''; // Clear any previous response
        console.log('🍺 Jake started thinking...');
        try {
            // Get response from Gemini
            console.log('🍺 Calling jakeService.chatWithJake now...');
            const response = await __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$services$2f$JakeService$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jakeService"].chatWithJake(playerMessage);
            console.log('🍺 Got response from jakeService:', response);
            // Show response
            this.currentResponse = response;
            this.responseTimer = this.responseDuration;
            this.isThinking = false;
            this.thinkingTimer = 0;
            console.log(`🍺 Jake will display response: "${response}"`);
        } catch (error) {
            console.error('🚨 Error getting Jake response:', error);
            this.currentResponse = "Sorry, I'm a bit distracted right now. What can I get you?";
            this.responseTimer = this.responseDuration;
            this.isThinking = false;
            this.thinkingTimer = 0;
            console.log('🍺 Using fallback response due to error');
        }
    }
    isNearPlayer(playerX, playerY) {
        const distance = Math.sqrt(Math.pow(playerX - (this.x + this.width / 2), 2) + Math.pow(playerY - (this.y + this.height / 2), 2));
        return distance <= 80; // Within 80 pixels (increased for easier interaction)
    }
    render(ctx, cameraX, cameraY) {
        const screenX = this.x - cameraX;
        const screenY = this.y - cameraY;
        // Draw NPC body
        this.renderBody(ctx, screenX, screenY);
        // Draw name tag
        this.renderNameTag(ctx, screenX, screenY);
        // Draw chat bubble if thinking or responding
        if (this.isThinking || this.currentResponse) {
            this.renderChatBubble(ctx, screenX, screenY);
        }
    }
    renderChatBubble(ctx, npcX, npcY) {
        let message = '';
        if (this.isThinking) {
            message = '...';
        } else if (this.currentResponse) {
            message = this.currentResponse;
        }
        if (!message) return;
        // Bubble settings - much larger for better readability
        const padding = 12;
        const maxWidth = 320; // Increased from 200
        const lineHeight = 16;
        const bubbleY = npcY - 80; // Position higher above NPC
        // Measure text and wrap lines
        ctx.save();
        ctx.font = '14px Arial'; // Slightly larger font
        // Split text into lines that fit within maxWidth
        const words = message.split(' ');
        const lines = [];
        let currentLine = '';
        for (const word of words){
            const testLine = currentLine + (currentLine ? ' ' : '') + word;
            const testWidth = ctx.measureText(testLine).width;
            if (testWidth > maxWidth - padding * 2 && currentLine) {
                lines.push(currentLine);
                currentLine = word;
            } else {
                currentLine = testLine;
            }
        }
        if (currentLine) lines.push(currentLine);
        // Calculate bubble dimensions
        const bubbleWidth = Math.min(maxWidth, Math.max(...lines.map((line)=>ctx.measureText(line).width)) + padding * 2);
        const bubbleHeight = lines.length * lineHeight + padding * 2;
        // Calculate bubble X position with boundary checking
        let bubbleX = npcX + this.width / 2 - bubbleWidth / 2;
        // Get canvas dimensions for boundary checking
        const canvasWidth = ctx.canvas.width;
        const canvasHeight = ctx.canvas.height;
        // Keep bubble within screen boundaries
        if (bubbleX < 10) {
            bubbleX = 10; // Left boundary
        } else if (bubbleX + bubbleWidth > canvasWidth - 10) {
            bubbleX = canvasWidth - bubbleWidth - 10; // Right boundary
        }
        // Adjust Y position if bubble goes off top of screen
        let adjustedBubbleY = bubbleY;
        if (bubbleY < 10) {
            adjustedBubbleY = npcY + this.height + 10; // Show below NPC instead
        }
        // Draw bubble background (different color for Jake)
        ctx.fillStyle = this.isThinking ? 'rgba(255, 255, 200, 0.9)' : 'rgba(200, 255, 200, 0.9)';
        ctx.strokeStyle = '#8B0000'; // VT Maroon border
        ctx.lineWidth = 2;
        // Rounded rectangle for bubble
        this.drawRoundedRect(ctx, bubbleX, adjustedBubbleY, bubbleWidth, bubbleHeight, 8);
        ctx.fill();
        ctx.stroke();
        // Draw bubble tail pointing to Jake (adjust based on bubble position)
        const tailX = Math.max(bubbleX + 15, Math.min(npcX + this.width / 2, bubbleX + bubbleWidth - 15));
        ctx.beginPath();
        if (adjustedBubbleY > npcY) {
            // Bubble is below NPC, tail points up
            ctx.moveTo(tailX, adjustedBubbleY);
            ctx.lineTo(tailX - 5, adjustedBubbleY - 8);
            ctx.lineTo(tailX + 5, adjustedBubbleY - 8);
        } else {
            // Bubble is above NPC, tail points down
            ctx.moveTo(tailX, adjustedBubbleY + bubbleHeight);
            ctx.lineTo(tailX - 5, adjustedBubbleY + bubbleHeight + 8);
            ctx.lineTo(tailX + 5, adjustedBubbleY + bubbleHeight + 8);
        }
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        // Draw text
        ctx.fillStyle = '#2C3E50';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        if (this.isThinking) {
            // Animate thinking dots
            const dots = Math.floor(Date.now() / 500) % 4;
            const thinkingText = '.'.repeat(dots + 1);
            ctx.font = 'bold 16px Arial';
            ctx.fillText(thinkingText, bubbleX + bubbleWidth / 2, adjustedBubbleY + bubbleHeight / 2);
        } else {
            // Draw multiple lines of text
            const startY = adjustedBubbleY + padding + lineHeight / 2;
            lines.forEach((line, index)=>{
                ctx.fillText(line, bubbleX + bubbleWidth / 2, startY + index * lineHeight);
            });
        }
        ctx.restore();
    }
    drawRoundedRect(ctx, x, y, width, height, radius) {
        ctx.beginPath();
        ctx.moveTo(x + radius, y);
        ctx.lineTo(x + width - radius, y);
        ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
        ctx.lineTo(x + width, y + height - radius);
        ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
        ctx.lineTo(x + radius, y + height);
        ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
        ctx.lineTo(x, y + radius);
        ctx.quadraticCurveTo(x, y, x + radius, y);
        ctx.closePath();
    }
    renderBody(ctx, x, y) {
        // Head
        ctx.fillStyle = this.color;
        ctx.fillRect(x + 4, y, 8, 8);
        // Body/Torso
        ctx.fillStyle = '#FFFFFF'; // White shirt
        ctx.fillRect(x + 2, y + 8, 12, 12);
        // Apron (VT Maroon)
        ctx.fillStyle = this.clothingColor;
        ctx.fillRect(x + 3, y + 10, 10, 10);
        // Arms
        ctx.fillStyle = this.color;
        ctx.fillRect(x, y + 9, 3, 8); // Left arm
        ctx.fillRect(x + 13, y + 9, 3, 8); // Right arm
        // Legs
        ctx.fillStyle = '#000080'; // Dark blue pants
        ctx.fillRect(x + 4, y + 20, 3, 4); // Left leg
        ctx.fillRect(x + 9, y + 20, 3, 4); // Right leg
        // Hair
        ctx.fillStyle = '#8B4513'; // Brown hair
        ctx.fillRect(x + 4, y - 2, 8, 4);
        // Eyes
        ctx.fillStyle = '#000000';
        ctx.fillRect(x + 5, y + 2, 1, 1); // Left eye
        ctx.fillRect(x + 8, y + 2, 1, 1); // Right eye
    }
}
}),
"[project]/app/components/off-campus/HokieHouseInterior.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>__TURBOPACK__default__export__
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$components$2f$off$2d$campus$2f$BaseOffCampusBuilding$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/components/off-campus/BaseOffCampusBuilding.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$components$2f$off$2d$campus$2f$BartenderNPC$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/components/off-campus/BartenderNPC.ts [app-ssr] (ecmascript)");
;
;
class HokieHouseInterior extends __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$components$2f$off$2d$campus$2f$BaseOffCampusBuilding$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"] {
    type = 'hokiehouse';
    bartender;
    getBuildingName() {
        return 'Hokie House - VT Sports Bar & Grill';
    }
    getBuildingType() {
        return 'commercial';
    }
    constructor(){
        super();
        // Position bartender near the bottles and bar area (left side)
        this.bartender = new __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$components$2f$off$2d$campus$2f$BartenderNPC$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["BartenderNPC"](80, 170);
    }
    generateBuilding() {
        const interior = [];
        for(let y = 0; y < this.buildingHeight; y++){
            interior[y] = [];
            for(let x = 0; x < this.buildingWidth; x++){
                // Create the layout for Hokie House sports bar
                // Outer walls
                if (x === 0 || x === this.buildingWidth - 1 || y === 0 || y === this.buildingHeight - 1) {
                    interior[y][x] = {
                        type: 'wall',
                        solid: true
                    };
                } else if (y === this.buildingHeight - 1 && x === Math.floor(this.buildingWidth / 2)) {
                    interior[y][x] = {
                        type: 'door',
                        solid: false
                    };
                } else if (x >= 2 && x <= 4 && y >= 3 && y <= 10) {
                    interior[y][x] = {
                        type: 'furniture',
                        solid: true,
                        furniture: 'desk'
                    };
                } else if (x === 5 && y >= 3 && y <= 10 && y % 2 === 1) {
                    interior[y][x] = {
                        type: 'furniture',
                        solid: true,
                        furniture: 'chair'
                    };
                } else if (x >= 14 && x <= 17 && y >= 2 && y <= 6) {
                    interior[y][x] = {
                        type: 'furniture',
                        solid: true,
                        furniture: 'kitchen'
                    };
                } else if (x >= 12 && x <= 13 && y >= 8 && y <= 9 || x >= 12 && x <= 13 && y >= 11 && y <= 12) {
                    interior[y][x] = {
                        type: 'furniture',
                        solid: true,
                        furniture: 'couch'
                    };
                } else if (x === 14 && (y === 8 || y === 11)) {
                    interior[y][x] = {
                        type: 'furniture',
                        solid: true,
                        furniture: 'table'
                    };
                } else if (x >= 7 && x <= 8 && y >= 6 && y <= 7 || x >= 7 && x <= 8 && y >= 9 && y <= 10 || x >= 9 && x <= 10 && y >= 6 && y <= 7 || x >= 9 && x <= 10 && y >= 9 && y <= 10) {
                    interior[y][x] = {
                        type: 'furniture',
                        solid: true,
                        furniture: 'table'
                    };
                } else if (x === 6 && (y === 6 || y === 9) || x === 11 && (y === 6 || y === 9)) {
                    interior[y][x] = {
                        type: 'furniture',
                        solid: true,
                        furniture: 'chair'
                    };
                } else if (y === 0 && (x === 6 || x === 10 || x === 14)) {
                    interior[y][x] = {
                        type: 'window',
                        solid: true
                    };
                } else {
                    interior[y][x] = {
                        type: 'floor',
                        solid: false
                    };
                }
            }
        }
        return interior;
    }
    update(deltaTime, player) {
        super.update(deltaTime);
        this.bartender.update(deltaTime);
        // Check if player is near Jake and update proximity
        if (player) {
            if (this.bartender.isNearPlayer(player.x, player.y)) {
                player.setNearbyJake(this.bartender);
            } else {
                player.setNearbyJake(null);
            }
        }
    }
    renderBuildingSpecificElements(ctx) {
        // Hokie House sports bar specific elements
        // Restaurant name and VT branding
        ctx.fillStyle = '#8B0000'; // VT Maroon
        ctx.font = 'bold 20px serif';
        ctx.textAlign = 'center';
        ctx.fillText('HOKIE HOUSE', 400 - this.cameraX, 35 - this.cameraY);
        ctx.fillStyle = '#FF8C00'; // VT Orange
        ctx.font = 'bold 14px serif';
        ctx.fillText('Sports Bar & Grill', 400 - this.cameraX, 55 - this.cameraY);
        // TV screens for sports viewing
        ctx.fillStyle = '#000000'; // Black TV frames
        ctx.fillRect(50 - this.cameraX, 100 - this.cameraY, 80, 60);
        ctx.fillRect(300 - this.cameraX, 80 - this.cameraY, 100, 75);
        ctx.fillRect(550 - this.cameraX, 100 - this.cameraY, 80, 60);
        // TV screens
        ctx.fillStyle = '#00FF00'; // Green for football field
        ctx.fillRect(55 - this.cameraX, 105 - this.cameraY, 70, 50);
        ctx.fillRect(305 - this.cameraX, 85 - this.cameraY, 90, 65);
        ctx.fillRect(555 - this.cameraX, 105 - this.cameraY, 70, 50);
        // VT on TV screens
        ctx.fillStyle = '#8B0000';
        ctx.font = 'bold 12px serif';
        ctx.textAlign = 'center';
        ctx.fillText('VT', 90 - this.cameraX, 135 - this.cameraY);
        ctx.fillText('HOKIES', 350 - this.cameraX, 125 - this.cameraY);
        ctx.fillText('VT', 590 - this.cameraX, 135 - this.cameraY);
        // Bar back with bottles
        ctx.fillStyle = '#8B4513'; // Brown bar back
        ctx.fillRect(50 - this.cameraX, 180 - this.cameraY, 80, 40);
        // Liquor bottles
        ctx.fillStyle = '#228B22'; // Green bottles
        ctx.fillRect(55 - this.cameraX, 185 - this.cameraY, 4, 15);
        ctx.fillRect(65 - this.cameraX, 185 - this.cameraY, 4, 15);
        ctx.fillRect(75 - this.cameraX, 185 - this.cameraY, 4, 15);
        ctx.fillStyle = '#8B4513'; // Brown bottles
        ctx.fillRect(85 - this.cameraX, 185 - this.cameraY, 4, 15);
        ctx.fillRect(95 - this.cameraX, 185 - this.cameraY, 4, 15);
        ctx.fillRect(105 - this.cameraX, 185 - this.cameraY, 4, 15);
        // VT memorabilia and decorations
        ctx.fillStyle = '#8B0000';
        ctx.fillRect(200 - this.cameraX, 120 - this.cameraY, 60, 40);
        ctx.fillStyle = '#FF8C00';
        ctx.fillRect(205 - this.cameraX, 125 - this.cameraY, 50, 30);
        ctx.fillStyle = '#8B0000';
        ctx.font = 'bold 16px serif';
        ctx.textAlign = 'center';
        ctx.fillText('VT', 230 - this.cameraX, 145 - this.cameraY);
        // VT pennant
        ctx.fillStyle = '#8B0000';
        ctx.beginPath();
        ctx.moveTo(500 - this.cameraX, 180 - this.cameraY);
        ctx.lineTo(580 - this.cameraX, 190 - this.cameraY);
        ctx.lineTo(500 - this.cameraX, 200 - this.cameraY);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = '#FF8C00';
        ctx.font = 'bold 10px serif';
        ctx.textAlign = 'left';
        ctx.fillText('HOKIES', 510 - this.cameraX, 195 - this.cameraY);
        // Menu specials board
        ctx.fillStyle = '#2F2F2F';
        ctx.fillRect(450 - this.cameraX, 250 - this.cameraY, 120, 100);
        ctx.fillStyle = '#FFFFFF';
        ctx.font = '12px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('GAME DAY SPECIALS', 510 - this.cameraX, 270 - this.cameraY);
        ctx.font = '10px sans-serif';
        ctx.textAlign = 'left';
        ctx.fillText('• Trash Can ....... $10', 460 - this.cameraX, 290 - this.cameraY);
        ctx.fillText('• Corona ...... $5', 460 - this.cameraX, 305 - this.cameraY);
        ctx.fillText('• Blue motorcycle ..... $8', 460 - this.cameraX, 320 - this.cameraY);
        ctx.fillText('• tequila soda ..... $10', 460 - this.cameraX, 335 - this.cameraY);
        // Hokie Bird logo on floor
        ctx.fillStyle = '#8B0000';
        ctx.globalAlpha = 0.3;
        ctx.beginPath();
        ctx.arc(400 - this.cameraX, 350 - this.cameraY, 40, 0, 2 * Math.PI);
        ctx.fill();
        ctx.globalAlpha = 1.0;
        ctx.fillStyle = '#FF8C00';
        ctx.font = 'bold 20px serif';
        ctx.textAlign = 'center';
        ctx.fillText('🦃', 400 - this.cameraX, 360 - this.cameraY);
        // Beer taps
        ctx.fillStyle = '#C0C0C0'; // Silver taps
        ctx.fillRect(70 - this.cameraX, 160 - this.cameraY, 4, 15);
        ctx.fillRect(80 - this.cameraX, 160 - this.cameraY, 4, 15);
        ctx.fillRect(90 - this.cameraX, 160 - this.cameraY, 4, 15);
        ctx.fillRect(100 - this.cameraX, 160 - this.cameraY, 4, 15);
        // Tap handles
        ctx.fillStyle = '#8B0000';
        ctx.fillRect(68 - this.cameraX, 155 - this.cameraY, 8, 6);
        ctx.fillStyle = '#FF8C00';
        ctx.fillRect(78 - this.cameraX, 155 - this.cameraY, 8, 6);
        ctx.fillStyle = '#000000';
        ctx.fillRect(88 - this.cameraX, 155 - this.cameraY, 8, 6);
        ctx.fillRect(98 - this.cameraX, 155 - this.cameraY, 8, 6);
        // Render the bartender NPC
        this.bartender.render(ctx, this.cameraX, this.cameraY);
    }
}
const __TURBOPACK__default__export__ = HokieHouseInterior;
}),
"[project]/app/components/off-campus/CentrosInterior.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>__TURBOPACK__default__export__
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$components$2f$off$2d$campus$2f$BaseOffCampusBuilding$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/components/off-campus/BaseOffCampusBuilding.ts [app-ssr] (ecmascript)");
;
class CentrosInterior extends __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$components$2f$off$2d$campus$2f$BaseOffCampusBuilding$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"] {
    type = 'centros';
    getBuildingName() {
        return 'Centros - Dance Club';
    }
    getBuildingType() {
        return 'commercial';
    }
    generateBuilding() {
        const interior = [];
        for(let y = 0; y < this.buildingHeight; y++){
            interior[y] = [];
            for(let x = 0; x < this.buildingWidth; x++){
                // Create the layout for Centros Dance Club
                // Outer walls
                if (x === 0 || x === this.buildingWidth - 1 || y === 0 || y === this.buildingHeight - 1) {
                    interior[y][x] = {
                        type: 'wall',
                        solid: true
                    };
                } else if (y === this.buildingHeight - 1 && x === Math.floor(this.buildingWidth / 2)) {
                    interior[y][x] = {
                        type: 'door',
                        solid: false
                    };
                } else if (x >= 8 && x <= 11 && y >= 2 && y <= 4) {
                    interior[y][x] = {
                        type: 'furniture',
                        solid: true,
                        furniture: 'desk'
                    };
                } else if (x >= 2 && x <= 6 && y >= 2 && y <= 3) {
                    interior[y][x] = {
                        type: 'furniture',
                        solid: true,
                        furniture: 'desk'
                    };
                } else if (x >= 2 && x <= 6 && y === 4) {
                    interior[y][x] = {
                        type: 'furniture',
                        solid: true,
                        furniture: 'chair'
                    };
                } else if (x === 1 && y >= 11 && y <= 12) {
                    interior[y][x] = {
                        type: 'furniture',
                        solid: true,
                        furniture: 'desk'
                    };
                } else if (x === 4 && y === 10 || x === 16 && y === 10 || x === 4 && y === 7 || x === 16 && y === 7) {
                    interior[y][x] = {
                        type: 'furniture',
                        solid: true,
                        furniture: 'table'
                    };
                } else if (x >= 17 && x <= 18 && y >= 12 && y <= 13) {
                    interior[y][x] = {
                        type: 'furniture',
                        solid: true,
                        furniture: 'desk'
                    };
                } else if (y === 0 && (x === 5 || x === 9 || x === 13 || x === 17)) {
                    interior[y][x] = {
                        type: 'window',
                        solid: true
                    };
                } else {
                    interior[y][x] = {
                        type: 'floor',
                        solid: false
                    };
                }
            }
        }
        return interior;
    }
    renderBuildingSpecificElements(ctx) {
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
        for(let i = 0; i < 8; i++){
            const angle = i * Math.PI / 4;
            const x = 400 + Math.cos(angle) * 15 - this.cameraX;
            const y = 180 + Math.sin(angle) * 15 - this.cameraY;
            ctx.fillRect(x - 2, y - 2, 4, 4);
        }
        // Dance floor lighting effects
        const time = Date.now() * 0.003;
        const colors = [
            '#FF1493',
            '#00FFFF',
            '#FF4500',
            '#32CD32',
            '#9400D3',
            '#FFD700'
        ];
        // Animated floor spots
        for(let i = 0; i < 6; i++){
            const x = 200 + i % 3 * 150;
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
        for(let i = 0; i < 20; i++){
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
const __TURBOPACK__default__export__ = CentrosInterior;
}),
"[project]/app/components/off-campus/EdgeInterior.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>__TURBOPACK__default__export__
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$components$2f$off$2d$campus$2f$BaseOffCampusBuilding$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/components/off-campus/BaseOffCampusBuilding.ts [app-ssr] (ecmascript)");
;
class EdgeInterior extends __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$components$2f$off$2d$campus$2f$BaseOffCampusBuilding$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"] {
    type = 'edge';
    getBuildingName() {
        return 'The Edge - Student Apartment Complex';
    }
    getBuildingType() {
        return 'apartment';
    }
    generateBuilding() {
        const interior = [];
        for(let y = 0; y < this.buildingHeight; y++){
            interior[y] = [];
            for(let x = 0; x < this.buildingWidth; x++){
                // Create the layout for a 4-bedroom apartment with kitchen, living room, and private bathrooms
                // Outer walls
                if (x === 0 || x === this.buildingWidth - 1 || y === 0 || y === this.buildingHeight - 1) {
                    interior[y][x] = {
                        type: 'wall',
                        solid: true
                    };
                } else if (y === this.buildingHeight - 1 && x === Math.floor(this.buildingWidth / 2)) {
                    interior[y][x] = {
                        type: 'door',
                        solid: false
                    };
                } else if (x >= 7 && x <= 12 && y >= 9 && y <= 12) {
                    // TV on wall
                    if (x === 7 && y === 10) {
                        interior[y][x] = {
                            type: 'furniture',
                            solid: true,
                            furniture: 'tv'
                        };
                    } else if (x >= 9 && x <= 11 && y === 11) {
                        interior[y][x] = {
                            type: 'furniture',
                            solid: true,
                            furniture: 'couch'
                        };
                    } else if (x === 10 && y === 10) {
                        interior[y][x] = {
                            type: 'furniture',
                            solid: true,
                            furniture: 'table'
                        };
                    } else {
                        interior[y][x] = {
                            type: 'floor',
                            solid: false
                        };
                    }
                } else if (x >= 13 && x <= 17 && y >= 9 && y <= 12) {
                    // Refrigerator
                    if (x === 13 && y === 9) {
                        interior[y][x] = {
                            type: 'furniture',
                            solid: true,
                            furniture: 'refrigerator'
                        };
                    } else if (x >= 14 && x <= 16 && y === 9) {
                        interior[y][x] = {
                            type: 'furniture',
                            solid: true,
                            furniture: 'counter'
                        };
                    } else if (x === 17 && y === 10) {
                        interior[y][x] = {
                            type: 'furniture',
                            solid: true,
                            furniture: 'sink'
                        };
                    } else if (x >= 14 && x <= 15 && y === 11) {
                        interior[y][x] = {
                            type: 'furniture',
                            solid: true,
                            furniture: 'table'
                        };
                    } else if (x === 13 && y === 11 || x === 16 && y === 11) {
                        interior[y][x] = {
                            type: 'furniture',
                            solid: true,
                            furniture: 'chair'
                        };
                    } else {
                        interior[y][x] = {
                            type: 'floor',
                            solid: false
                        };
                    }
                } else if (x >= 2 && x <= 6 && y >= 2 && y <= 6) {
                    // Bedroom 1 walls
                    if (x === 6 && y >= 2 && y <= 6) {
                        interior[y][x] = {
                            type: 'wall',
                            solid: true
                        };
                    } else if (y === 6 && x >= 2 && x <= 5) {
                        interior[y][x] = {
                            type: 'wall',
                            solid: true
                        };
                    } else if (x === 5 && y === 6) {
                        interior[y][x] = {
                            type: 'door',
                            solid: false
                        };
                    } else if (x >= 3 && x <= 4 && y >= 3 && y <= 4) {
                        interior[y][x] = {
                            type: 'furniture',
                            solid: true,
                            furniture: 'bed'
                        };
                    } else if (x === 2 && y === 5) {
                        interior[y][x] = {
                            type: 'furniture',
                            solid: true,
                            furniture: 'dresser'
                        };
                    } else {
                        interior[y][x] = {
                            type: 'floor',
                            solid: false
                        };
                    }
                } else if (x >= 13 && x <= 17 && y >= 2 && y <= 6) {
                    // Bedroom 2 walls
                    if (x === 13 && y >= 2 && y <= 6) {
                        interior[y][x] = {
                            type: 'wall',
                            solid: true
                        };
                    } else if (y === 6 && x >= 14 && x <= 17) {
                        interior[y][x] = {
                            type: 'wall',
                            solid: true
                        };
                    } else if (x === 14 && y === 6) {
                        interior[y][x] = {
                            type: 'door',
                            solid: false
                        };
                    } else if (x >= 15 && x <= 16 && y >= 3 && y <= 4) {
                        interior[y][x] = {
                            type: 'furniture',
                            solid: true,
                            furniture: 'bed'
                        };
                    } else if (x === 17 && y === 5) {
                        interior[y][x] = {
                            type: 'furniture',
                            solid: true,
                            furniture: 'dresser'
                        };
                    } else {
                        interior[y][x] = {
                            type: 'floor',
                            solid: false
                        };
                    }
                } else if (x >= 2 && x <= 6 && y >= 9 && y <= 13) {
                    // Bedroom 3 walls
                    if (x === 6 && y >= 9 && y <= 13) {
                        interior[y][x] = {
                            type: 'wall',
                            solid: true
                        };
                    } else if (y === 9 && x >= 2 && x <= 5) {
                        interior[y][x] = {
                            type: 'wall',
                            solid: true
                        };
                    } else if (x === 5 && y === 9) {
                        interior[y][x] = {
                            type: 'door',
                            solid: false
                        };
                    } else if (x >= 3 && x <= 4 && y >= 10 && y <= 11) {
                        interior[y][x] = {
                            type: 'furniture',
                            solid: true,
                            furniture: 'bed'
                        };
                    } else if (x === 2 && y === 12) {
                        interior[y][x] = {
                            type: 'furniture',
                            solid: true,
                            furniture: 'dresser'
                        };
                    } else {
                        interior[y][x] = {
                            type: 'floor',
                            solid: false
                        };
                    }
                } else if (x >= 8 && x <= 12 && y >= 2 && y <= 6) {
                    // Bedroom 4 walls
                    if (y === 6 && x >= 8 && x <= 12) {
                        interior[y][x] = {
                            type: 'wall',
                            solid: true
                        };
                    } else if (x === 10 && y === 6) {
                        interior[y][x] = {
                            type: 'door',
                            solid: false
                        };
                    } else if (x >= 9 && x <= 10 && y >= 3 && y <= 4) {
                        interior[y][x] = {
                            type: 'furniture',
                            solid: true,
                            furniture: 'bed'
                        };
                    } else if (x === 11 && y === 5) {
                        interior[y][x] = {
                            type: 'furniture',
                            solid: true,
                            furniture: 'dresser'
                        };
                    } else {
                        interior[y][x] = {
                            type: 'floor',
                            solid: false
                        };
                    }
                } else if (y === 0 && (x === 3 || x === 5 || x === 9 || x === 11 || x === 15 || x === 17) || x === 0 && (y === 3 || y === 5 || y === 10 || y === 12) || x === this.buildingWidth - 1 && (y === 3 || y === 5 || y === 10 || y === 12)) {
                    interior[y][x] = {
                        type: 'window',
                        solid: true
                    };
                } else {
                    interior[y][x] = {
                        type: 'floor',
                        solid: false
                    };
                }
            }
        }
        return interior;
    }
    renderBuildingSpecificElements(ctx) {
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
        for(let x = 224; x < 576; x += 16){
            for(let y = 224; y < 416; y += 16){
                if (x >= 224 && x <= 384 && y >= 288 && y <= 384) {
                    ctx.strokeRect(x - this.cameraX, y - this.cameraY, 16, 16);
                }
            }
        }
    }
}
const __TURBOPACK__default__export__ = EdgeInterior;
}),
"[project]/app/components/off-campus/TechTerraceInterior.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>__TURBOPACK__default__export__
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$components$2f$off$2d$campus$2f$BaseOffCampusBuilding$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/components/off-campus/BaseOffCampusBuilding.ts [app-ssr] (ecmascript)");
;
class TechTerraceInterior extends __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$components$2f$off$2d$campus$2f$BaseOffCampusBuilding$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"] {
    type = 'techterrace';
    getBuildingName() {
        return 'Tech Terrace - Student Apartment Complex';
    }
    getBuildingType() {
        return 'apartment';
    }
    generateBuilding() {
        const interior = [];
        for(let y = 0; y < this.buildingHeight; y++){
            interior[y] = [];
            for(let x = 0; x < this.buildingWidth; x++){
                // Create the layout for a 4-bedroom apartment with kitchen, living room, and private bathrooms
                // Outer walls
                if (x === 0 || x === this.buildingWidth - 1 || y === 0 || y === this.buildingHeight - 1) {
                    interior[y][x] = {
                        type: 'wall',
                        solid: true
                    };
                } else if (y === this.buildingHeight - 1 && x === Math.floor(this.buildingWidth / 2)) {
                    interior[y][x] = {
                        type: 'door',
                        solid: false
                    };
                } else if (x >= 7 && x <= 12 && y >= 10 && y <= 13) {
                    // TV on wall
                    if (x === 7 && y === 11) {
                        interior[y][x] = {
                            type: 'furniture',
                            solid: true,
                            furniture: 'tv'
                        };
                    } else if (x >= 9 && x <= 11 && y === 12) {
                        interior[y][x] = {
                            type: 'furniture',
                            solid: true,
                            furniture: 'couch'
                        };
                    } else if (x === 10 && y === 11) {
                        interior[y][x] = {
                            type: 'furniture',
                            solid: true,
                            furniture: 'table'
                        };
                    } else {
                        interior[y][x] = {
                            type: 'floor',
                            solid: false
                        };
                    }
                } else if (x >= 13 && x <= 17 && y >= 10 && y <= 13) {
                    // Refrigerator
                    if (x === 13 && y === 10) {
                        interior[y][x] = {
                            type: 'furniture',
                            solid: true,
                            furniture: 'refrigerator'
                        };
                    } else if (x >= 14 && x <= 16 && y === 10) {
                        interior[y][x] = {
                            type: 'furniture',
                            solid: true,
                            furniture: 'counter'
                        };
                    } else if (x === 17 && y === 11) {
                        interior[y][x] = {
                            type: 'furniture',
                            solid: true,
                            furniture: 'sink'
                        };
                    } else if (x >= 14 && x <= 15 && y === 12) {
                        interior[y][x] = {
                            type: 'furniture',
                            solid: true,
                            furniture: 'table'
                        };
                    } else if (x === 13 && y === 12 || x === 16 && y === 12) {
                        interior[y][x] = {
                            type: 'furniture',
                            solid: true,
                            furniture: 'chair'
                        };
                    } else {
                        interior[y][x] = {
                            type: 'floor',
                            solid: false
                        };
                    }
                } else if (x >= 2 && x <= 6 && y >= 2 && y <= 6) {
                    // Bedroom 1 walls
                    if (x === 6 && y >= 2 && y <= 6) {
                        interior[y][x] = {
                            type: 'wall',
                            solid: true
                        };
                    } else if (y === 6 && x >= 2 && x <= 5) {
                        interior[y][x] = {
                            type: 'wall',
                            solid: true
                        };
                    } else if (x === 5 && y === 6) {
                        interior[y][x] = {
                            type: 'door',
                            solid: false
                        };
                    } else if (x >= 3 && x <= 4 && y >= 3 && y <= 4) {
                        interior[y][x] = {
                            type: 'furniture',
                            solid: true,
                            furniture: 'bed'
                        };
                    } else if (x === 2 && y === 5) {
                        interior[y][x] = {
                            type: 'furniture',
                            solid: true,
                            furniture: 'desk'
                        };
                    } else {
                        interior[y][x] = {
                            type: 'floor',
                            solid: false
                        };
                    }
                } else if (x >= 13 && x <= 17 && y >= 2 && y <= 6) {
                    // Bedroom 2 walls
                    if (x === 13 && y >= 2 && y <= 6) {
                        interior[y][x] = {
                            type: 'wall',
                            solid: true
                        };
                    } else if (y === 6 && x >= 14 && x <= 17) {
                        interior[y][x] = {
                            type: 'wall',
                            solid: true
                        };
                    } else if (x === 14 && y === 6) {
                        interior[y][x] = {
                            type: 'door',
                            solid: false
                        };
                    } else if (x >= 15 && x <= 16 && y >= 3 && y <= 4) {
                        interior[y][x] = {
                            type: 'furniture',
                            solid: true,
                            furniture: 'bed'
                        };
                    } else if (x === 17 && y === 5) {
                        interior[y][x] = {
                            type: 'furniture',
                            solid: true,
                            furniture: 'dresser'
                        };
                    } else {
                        interior[y][x] = {
                            type: 'floor',
                            solid: false
                        };
                    }
                } else if (x >= 2 && x <= 6 && y >= 9 && y <= 13) {
                    // Bedroom 3 walls
                    if (x === 6 && y >= 9 && y <= 13) {
                        interior[y][x] = {
                            type: 'wall',
                            solid: true
                        };
                    } else if (y === 9 && x >= 2 && x <= 5) {
                        interior[y][x] = {
                            type: 'wall',
                            solid: true
                        };
                    } else if (x === 5 && y === 9) {
                        interior[y][x] = {
                            type: 'door',
                            solid: false
                        };
                    } else if (x >= 3 && x <= 4 && y >= 10 && y <= 11) {
                        interior[y][x] = {
                            type: 'furniture',
                            solid: true,
                            furniture: 'bed'
                        };
                    } else if (x === 2 && y === 12) {
                        interior[y][x] = {
                            type: 'furniture',
                            solid: true,
                            furniture: 'chair'
                        };
                    } else {
                        interior[y][x] = {
                            type: 'floor',
                            solid: false
                        };
                    }
                } else if (x >= 8 && x <= 12 && y >= 2 && y <= 6) {
                    // Bedroom 4 walls
                    if (y === 6 && x >= 8 && x <= 12) {
                        interior[y][x] = {
                            type: 'wall',
                            solid: true
                        };
                    } else if (x === 10 && y === 6) {
                        interior[y][x] = {
                            type: 'door',
                            solid: false
                        };
                    } else if (x >= 9 && x <= 10 && y >= 3 && y <= 4) {
                        interior[y][x] = {
                            type: 'furniture',
                            solid: true,
                            furniture: 'bed'
                        };
                    } else if (x === 11 && y === 5) {
                        interior[y][x] = {
                            type: 'furniture',
                            solid: true,
                            furniture: 'dresser'
                        };
                    } else {
                        interior[y][x] = {
                            type: 'floor',
                            solid: false
                        };
                    }
                } else if (y === 0 && (x === 3 || x === 5 || x === 9 || x === 11 || x === 15 || x === 17) || x === 0 && (y === 3 || y === 5 || y === 10 || y === 12) || x === this.buildingWidth - 1 && (y === 3 || y === 5 || y === 10 || y === 12)) {
                    interior[y][x] = {
                        type: 'window',
                        solid: true
                    };
                } else {
                    interior[y][x] = {
                        type: 'floor',
                        solid: false
                    };
                }
            }
        }
        return interior;
    }
    renderBuildingSpecificElements(ctx) {
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
        for(let x = 224; x < 576; x += 16){
            for(let y = 320; y < 416; y += 16){
                if (x >= 224 && x <= 384 && y >= 320 && y <= 416) {
                    ctx.strokeRect(x - this.cameraX, y - this.cameraY, 16, 16);
                }
            }
        }
    }
}
const __TURBOPACK__default__export__ = TechTerraceInterior;
}),
"[project]/app/components/off-campus/FoodLionInterior.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>__TURBOPACK__default__export__
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$components$2f$off$2d$campus$2f$BaseOffCampusBuilding$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/components/off-campus/BaseOffCampusBuilding.ts [app-ssr] (ecmascript)");
;
class FoodLionInterior extends __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$components$2f$off$2d$campus$2f$BaseOffCampusBuilding$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"] {
    type = 'foodlion';
    getBuildingName() {
        return 'Food Lion - Grocery Store';
    }
    getBuildingType() {
        return 'commercial';
    }
    generateBuilding() {
        const interior = [];
        for(let y = 0; y < this.buildingHeight; y++){
            interior[y] = [];
            for(let x = 0; x < this.buildingWidth; x++){
                // Create the layout for Food Lion grocery store
                // Outer walls
                if (x === 0 || x === this.buildingWidth - 1 || y === 0 || y === this.buildingHeight - 1) {
                    interior[y][x] = {
                        type: 'wall',
                        solid: true
                    };
                } else if (y === this.buildingHeight - 1 && x === Math.floor(this.buildingWidth / 2)) {
                    interior[y][x] = {
                        type: 'door',
                        solid: false
                    };
                } else if (x >= 2 && x <= 3 && y >= 11 && y <= 13) {
                    interior[y][x] = {
                        type: 'furniture',
                        solid: true,
                        furniture: 'desk'
                    };
                } else if (x >= 5 && x <= 6 && y >= 11 && y <= 13) {
                    interior[y][x] = {
                        type: 'furniture',
                        solid: true,
                        furniture: 'desk'
                    };
                } else if (x >= 8 && x <= 9 && y >= 11 && y <= 13) {
                    interior[y][x] = {
                        type: 'furniture',
                        solid: true,
                        furniture: 'desk'
                    };
                } else if (x >= 11 && x <= 12 && y >= 11 && y <= 13) {
                    interior[y][x] = {
                        type: 'furniture',
                        solid: true,
                        furniture: 'desk'
                    };
                } else if (x >= 15 && x <= 17 && y >= 11 && y <= 12) {
                    interior[y][x] = {
                        type: 'furniture',
                        solid: true,
                        furniture: 'desk'
                    };
                } else if (x >= 14 && x <= 15 && y >= 13 && y <= 13) {
                    interior[y][x] = {
                        type: 'furniture',
                        solid: true,
                        furniture: 'chair'
                    };
                } else if (x >= 1 && x <= 4 && y >= 2 && y <= 5) {
                    interior[y][x] = {
                        type: 'furniture',
                        solid: true,
                        furniture: 'table'
                    };
                } else if (x >= 1 && x <= 4 && y >= 7 && y <= 9) {
                    interior[y][x] = {
                        type: 'furniture',
                        solid: true,
                        furniture: 'table'
                    };
                } else if (x >= 6 && x <= 9 && y >= 2 && y <= 3) {
                    interior[y][x] = {
                        type: 'furniture',
                        solid: true,
                        furniture: 'kitchen'
                    };
                } else if (x >= 11 && x <= 14 && y >= 2 && y <= 3) {
                    interior[y][x] = {
                        type: 'furniture',
                        solid: true,
                        furniture: 'kitchen'
                    };
                } else if (x >= 16 && x <= 18 && y >= 2 && y <= 5) {
                    interior[y][x] = {
                        type: 'furniture',
                        solid: true,
                        furniture: 'kitchen'
                    };
                } else if (x >= 6 && x <= 7 && y >= 5 && y <= 9 || x >= 9 && x <= 10 && y >= 5 && y <= 9 || x >= 12 && x <= 13 && y >= 5 && y <= 9 || x >= 15 && x <= 16 && y >= 5 && y <= 9) {
                    interior[y][x] = {
                        type: 'furniture',
                        solid: true,
                        furniture: 'desk'
                    };
                } else if (y === 0 && (x === 4 || x === 8 || x === 12 || x === 16)) {
                    interior[y][x] = {
                        type: 'window',
                        solid: true
                    };
                } else {
                    interior[y][x] = {
                        type: 'floor',
                        solid: false
                    };
                }
            }
        }
        return interior;
    }
    renderBuildingSpecificElements(ctx) {
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
            {
                x: 200,
                label: 'CEREALS & SNACKS'
            },
            {
                x: 300,
                label: 'CANNED GOODS'
            },
            {
                x: 400,
                label: 'BEVERAGES'
            },
            {
                x: 500,
                label: 'HOUSEHOLD'
            }
        ];
        aisles.forEach((aisle, index)=>{
            // Shelf structure
            ctx.fillStyle = '#8B4513';
            ctx.fillRect(aisle.x - this.cameraX, 160 - this.cameraY, 60, 180);
            // Products on shelves
            const colors = [
                '#FF6B6B',
                '#4ECDC4',
                '#45B7D1',
                '#96CEB4',
                '#FFEAA7'
            ];
            for(let shelf = 0; shelf < 4; shelf++){
                for(let item = 0; item < 8; item++){
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
        const checkouts = [
            80,
            180,
            280,
            380
        ];
        checkouts.forEach((checkoutX, index)=>{
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
        for(let cart = 0; cart < 3; cart++){
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
const __TURBOPACK__default__export__ = FoodLionInterior;
}),
"[project]/app/components/SceneManager.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>__TURBOPACK__default__export__
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$components$2f$World$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/components/World.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$components$2f$campus$2f$BurrussInterior$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/components/campus/BurrussInterior.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$components$2f$campus$2f$TurnerInterior$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/components/campus/TurnerInterior.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$components$2f$campus$2f$TorgersenInterior$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/components/campus/TorgersenInterior.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$components$2f$campus$2f$SquiresInterior$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/components/campus/SquiresInterior.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$components$2f$off$2d$campus$2f$TotsDownstairs$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/components/off-campus/TotsDownstairs.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$components$2f$off$2d$campus$2f$TotsUpstairs$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/components/off-campus/TotsUpstairs.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$components$2f$off$2d$campus$2f$HokieHouseInterior$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/components/off-campus/HokieHouseInterior.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$components$2f$off$2d$campus$2f$CentrosInterior$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/components/off-campus/CentrosInterior.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$components$2f$off$2d$campus$2f$EdgeInterior$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/components/off-campus/EdgeInterior.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$components$2f$off$2d$campus$2f$TechTerraceInterior$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/components/off-campus/TechTerraceInterior.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$components$2f$off$2d$campus$2f$FoodLionInterior$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/components/off-campus/FoodLionInterior.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$components$2f$FridgeManager$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/components/FridgeManager.ts [app-ssr] (ecmascript)");
;
;
;
;
;
;
;
;
;
;
;
;
;
class SceneManager {
    currentScene;
    scenes = new Map();
    player;
    inputHandler;
    lastBuildingEntry = null;
    constructor(player, inputHandler){
        this.player = player;
        this.inputHandler = inputHandler;
        this.initializeScenes();
        this.currentScene = this.scenes.get('campus');
    }
    initializeScenes() {
        // Campus (outdoor world)
        this.scenes.set('campus', new __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$components$2f$World$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"]());
        // Campus building interiors
        this.scenes.set('burruss', new __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$components$2f$campus$2f$BurrussInterior$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"]());
        this.scenes.set('turner', new __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$components$2f$campus$2f$TurnerInterior$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"]());
        this.scenes.set('torgersen', new __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$components$2f$campus$2f$TorgersenInterior$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"]());
        this.scenes.set('squires', new __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$components$2f$campus$2f$SquiresInterior$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"]());
        // Off-campus restaurant interiors
        this.scenes.set('tots', new __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$components$2f$off$2d$campus$2f$TotsDownstairs$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"]());
        this.scenes.set('tots_upstairs', new __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$components$2f$off$2d$campus$2f$TotsUpstairs$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"]());
        this.scenes.set('hokiehouse', new __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$components$2f$off$2d$campus$2f$HokieHouseInterior$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"]());
        this.scenes.set('centros', new __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$components$2f$off$2d$campus$2f$CentrosInterior$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"]());
        // Off-campus apartment interiors
        this.scenes.set('edge', new __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$components$2f$off$2d$campus$2f$EdgeInterior$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"]());
        this.scenes.set('techterrace', new __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$components$2f$off$2d$campus$2f$TechTerraceInterior$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"]());
        // Off-campus commercial interiors
        this.scenes.set('foodlion', new __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$components$2f$off$2d$campus$2f$FoodLionInterior$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"]());
    }
    getCurrentScene() {
        return this.currentScene;
    }
    getCurrentSceneType() {
        return this.currentScene.type;
    }
    switchScene(newSceneType, entranceX, entranceY) {
        const newScene = this.scenes.get(newSceneType);
        if (!newScene) {
            console.warn(`Scene ${newSceneType} not found`);
            return;
        }
        const oldSceneType = this.currentScene.type;
        this.currentScene = newScene;
        // Position player at entrance or default position
        if (entranceX !== undefined && entranceY !== undefined) {
            this.player.x = entranceX;
            this.player.y = entranceY;
            console.log(`Switched from ${oldSceneType} to ${newSceneType} scene with position (${entranceX}, ${entranceY})`);
        } else if (newScene.getEntrancePosition) {
            const entrance = newScene.getEntrancePosition();
            this.player.x = entrance.x;
            this.player.y = entrance.y;
            console.log(`Switched from ${oldSceneType} to ${newSceneType} scene with entrance position (${entrance.x}, ${entrance.y})`);
        } else {
            console.log(`Switched from ${oldSceneType} to ${newSceneType} scene - no position change`);
        }
    }
    checkForSceneTransition() {
        // Check for ESC key to exit buildings - but only if fridge UI is not open
        const fridgeManager = __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$components$2f$FridgeManager$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].getInstance();
        const escPressed = this.inputHandler.wasKeyJustPressed('Escape');
        if (escPressed && !fridgeManager.isFridgeUIOpen()) {
            const currentSceneType = this.currentScene.type;
            console.log('ESC pressed! Current scene:', currentSceneType);
            if (currentSceneType !== 'campus') {
                console.log('Exiting building to campus');
                this.exitToOutside();
                return;
            } else {
                console.log('Already on campus - ESC has no effect');
            }
        }
        // Check if player is near a door on campus
        if (this.currentScene.type === 'campus') {
            this.checkBuildingEntrance();
        } else {
            // Check if player is near exit in building
            this.checkBuildingExit();
            // Check for stair transitions in buildings
            this.checkStairTransition();
        }
    }
    checkBuildingEntrance() {
        const world = this.currentScene;
        const playerTileX = Math.floor(this.player.x / 32);
        const playerTileY = Math.floor(this.player.y / 32);
        // Only check the exact tile the player is standing on for doors
        const tile = world.getTileAt && world.getTileAt(playerTileX, playerTileY);
        if (tile && tile.type === 'door') {
            const buildingType = tile.buildingType;
            console.log('🚪 Found door! Building type:', buildingType, 'at tile:', {
                playerTileX,
                playerTileY
            });
            if (buildingType && this.scenes.has(buildingType)) {
                console.log('✅ Entering building:', buildingType);
                // Track where the player entered from
                this.lastBuildingEntry = {
                    buildingType,
                    tileX: playerTileX,
                    tileY: playerTileY
                };
                this.switchScene(buildingType);
                return;
            } else {
                console.log('❌ Building type not recognized:', buildingType, 'Available scenes:', Array.from(this.scenes.keys()));
            }
        }
    }
    checkStairTransition() {
        // Check if player is on stairs in any building
        const currentScene = this.currentScene;
        if (currentScene.tiles) {
            const playerTileX = Math.floor(this.player.x / 32);
            const playerTileY = Math.floor(this.player.y / 32);
            // Check bounds
            if (playerTileX >= 0 && playerTileX < (currentScene.buildingWidth || currentScene.areaWidth) && playerTileY >= 0 && playerTileY < (currentScene.buildingHeight || currentScene.areaHeight)) {
                const tile = currentScene.tiles[playerTileY] && currentScene.tiles[playerTileY][playerTileX];
                if (tile && tile.type === 'stairs') {
                    console.log('🪜 Found stairs! Current scene:', this.currentScene.type);
                    // Handle specific stair transitions
                    if (this.currentScene.type === 'tots') {
                        console.log('✅ Going upstairs to tots_upstairs');
                        this.switchScene('tots_upstairs');
                    } else if (this.currentScene.type === 'tots_upstairs') {
                        console.log('✅ Going downstairs to tots');
                        this.switchScene('tots');
                    }
                }
            }
        }
    }
    checkBuildingExit() {
        const exitInfo = this.currentScene.getExitPosition?.();
        if (exitInfo) {
            const distance = Math.sqrt(Math.pow(this.player.x - exitInfo.x, 2) + Math.pow(this.player.y - exitInfo.y, 2));
            // If player is close to exit
            if (distance < 30) {
                // Use the tracked building position if available
                if (this.lastBuildingEntry) {
                    const exitX = this.lastBuildingEntry.tileX * 32 + 16; // Center of tile
                    const exitY = (this.lastBuildingEntry.tileY + 1) * 32; // One tile below the door
                    this.switchScene('campus', exitX, exitY);
                    console.log(`Exited building by walking to door: (${exitX}, ${exitY})`);
                } else {
                    // Fallback to the building's default exit position
                    this.switchScene(exitInfo.scene, exitInfo.x, exitInfo.y);
                }
            }
        }
    }
    exitToOutside() {
        // Exit building and return to campus
        if (this.lastBuildingEntry) {
            // Calculate position right below the building door
            const exitX = this.lastBuildingEntry.tileX * 32 + 16; // Center of tile
            const exitY = (this.lastBuildingEntry.tileY + 1) * 32; // One tile below the door
            this.switchScene('campus', exitX, exitY);
            console.log(`Exited building to position below door: (${exitX}, ${exitY})`);
        } else {
            // Fallback to campus center if no entry tracked
            this.switchScene('campus', 400, 912);
            console.log('Exited building with ESC key (fallback to center)');
        }
    }
    render(ctx) {
        this.currentScene.render(ctx, this.player);
    }
    update(deltaTime) {
        // Pass player to scene update for proximity detection
        if (this.currentScene.update.length > 1) {
            // Scene accepts player parameter
            this.currentScene.update(deltaTime, this.player);
        } else {
            // Scene only accepts deltaTime
            this.currentScene.update(deltaTime);
        }
        this.checkForSceneTransition();
    }
    canMoveTo(x, y, width, height) {
        return this.currentScene.canMoveTo(x, y, width, height);
    }
    getCameraPosition() {
        return {
            x: this.currentScene.cameraX || 0,
            y: this.currentScene.cameraY || 0
        };
    }
}
const __TURBOPACK__default__export__ = SceneManager;
}),
"[project]/app/components/GameEngine.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>__TURBOPACK__default__export__
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$components$2f$Player$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/components/Player.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$components$2f$InputHandler$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/components/InputHandler.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$components$2f$SceneManager$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/components/SceneManager.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$components$2f$FridgeManager$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/components/FridgeManager.ts [app-ssr] (ecmascript)");
;
;
;
;
class GameEngine {
    canvas;
    ctx;
    player;
    sceneManager;
    inputHandler;
    lastTime = 0;
    animationFrameId = null;
    isRunning = false;
    constructor(canvas, ctx, playerCharacter){
        this.canvas = canvas;
        this.ctx = ctx;
        // Initialize game objects
        this.player = new __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$components$2f$Player$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"](400, 912, playerCharacter); // Starting position in campus area (608 + 304)
        this.inputHandler = new __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$components$2f$InputHandler$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"]();
        this.sceneManager = new __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$components$2f$SceneManager$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"](this.player, this.inputHandler);
        // Bind the game loop
        this.gameLoop = this.gameLoop.bind(this);
    }
    start() {
        this.isRunning = true;
        this.lastTime = performance.now();
        this.gameLoop(this.lastTime);
    }
    stop() {
        this.isRunning = false;
        if (this.animationFrameId) {
            cancelAnimationFrame(this.animationFrameId);
        }
        // Clean up input handler
        this.inputHandler.destroy();
    }
    gameLoop(currentTime) {
        if (!this.isRunning) return;
        const deltaTime = currentTime - this.lastTime;
        this.lastTime = currentTime;
        // Update
        this.update(deltaTime);
        // Render
        this.render();
        // Continue loop
        this.animationFrameId = requestAnimationFrame(this.gameLoop);
    }
    update(deltaTime) {
        // Check scene transitions BEFORE clearing input state
        this.sceneManager.update(deltaTime);
        // Update player BEFORE clearing input state
        this.player.update(deltaTime, this.inputHandler, this.sceneManager.getCurrentScene());
        // Update input (this clears keyPressed state) - do this AFTER player has processed input
        this.inputHandler.update();
    }
    render() {
        // Clear canvas
        this.ctx.fillStyle = '#2a4d3a'; // Dark green background
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        // Render current scene
        this.sceneManager.render(this.ctx);
        // Render player
        const cameraPos = this.sceneManager.getCameraPosition();
        this.player.render(this.ctx, cameraPos.x, cameraPos.y);
        // Render fridge UI on top of everything
        const fridgeManager = __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$components$2f$FridgeManager$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].getInstance();
        fridgeManager.renderFridgeUI(this.ctx, 'player1'); // Use actual player ID
    }
}
const __TURBOPACK__default__export__ = GameEngine;
}),
"[project]/app/components/CharacterData.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "CHARACTER_OPTIONS",
    ()=>CHARACTER_OPTIONS,
    "GENDER_OPTIONS",
    ()=>GENDER_OPTIONS
]);
const CHARACTER_OPTIONS = [
    {
        id: 'char1',
        number: 1,
        skinColor: '#FFDBAC',
        hairColor: '#8B4513',
        shirtColor: '#FF6B6B',
        pantsColor: '#4ECDC4' // Teal pants
    },
    {
        id: 'char2',
        number: 2,
        skinColor: '#F5DEB3',
        hairColor: '#2C1810',
        shirtColor: '#FF6B35',
        pantsColor: '#2E5266' // Navy pants
    },
    {
        id: 'char3',
        number: 3,
        skinColor: '#8B4513',
        hairColor: '#1A0A00',
        shirtColor: '#9B59B6',
        pantsColor: '#2C3E50' // Dark blue pants
    },
    {
        id: 'char4',
        number: 4,
        skinColor: '#D2B48C',
        hairColor: '#654321',
        shirtColor: '#27AE60',
        pantsColor: '#8E44AD' // Purple pants
    },
    {
        id: 'char5',
        number: 5,
        skinColor: '#FFDBAC',
        hairColor: '#FFD700',
        shirtColor: '#E74C3C',
        pantsColor: '#34495E' // Gray pants
    },
    {
        id: 'char6',
        number: 6,
        skinColor: '#C49B61',
        hairColor: '#4A4A4A',
        shirtColor: '#3498DB',
        pantsColor: '#2C2C2C' // Black pants
    },
    {
        id: 'char7',
        number: 7,
        skinColor: '#E6B887',
        hairColor: '#2F1B14',
        shirtColor: '#F39C12',
        pantsColor: '#16A085' // Teal pants
    },
    {
        id: 'char8',
        number: 8,
        skinColor: '#CD853F',
        hairColor: '#654321',
        shirtColor: '#2ECC71',
        pantsColor: '#7F8C8D' // Gray pants
    }
];
const GENDER_OPTIONS = [
    {
        id: 'he',
        name: 'He/Him',
        pronouns: 'he/him'
    },
    {
        id: 'she',
        name: 'She/Her',
        pronouns: 'she/her'
    },
    {
        id: 'they',
        name: 'They/Them',
        pronouns: 'they/them'
    },
    {
        id: 'custom',
        name: 'Custom',
        pronouns: '',
        allowCustom: true
    },
    {
        id: 'prefer-not',
        name: 'Prefer not to specify',
        pronouns: ''
    }
];
}),
"[project]/app/components/CharacterSelection.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>__TURBOPACK__default__export__
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$4_react$2d$dom$40$19$2e$1$2e$0_react$40$19$2e$1$2e$0_$5f$react$40$19$2e$1$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@15.5.4_react-dom@19.1.0_react@19.1.0__react@19.1.0/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$4_react$2d$dom$40$19$2e$1$2e$0_react$40$19$2e$1$2e$0_$5f$react$40$19$2e$1$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@15.5.4_react-dom@19.1.0_react@19.1.0__react@19.1.0/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$components$2f$CharacterData$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/components/CharacterData.ts [app-ssr] (ecmascript)");
'use client';
;
;
;
const CharacterSelection = ({ onCharacterSelected })=>{
    const [selectedIndex, setSelectedIndex] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$4_react$2d$dom$40$19$2e$1$2e$0_react$40$19$2e$1$2e$0_$5f$react$40$19$2e$1$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(0);
    const [playerName, setPlayerName] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$4_react$2d$dom$40$19$2e$1$2e$0_react$40$19$2e$1$2e$0_$5f$react$40$19$2e$1$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])('');
    const [isEnteringName, setIsEnteringName] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$4_react$2d$dom$40$19$2e$1$2e$0_react$40$19$2e$1$2e$0_$5f$react$40$19$2e$1$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const [selectedGender, setSelectedGender] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$4_react$2d$dom$40$19$2e$1$2e$0_react$40$19$2e$1$2e$0_$5f$react$40$19$2e$1$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    const [selectedGenderIndex, setSelectedGenderIndex] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$4_react$2d$dom$40$19$2e$1$2e$0_react$40$19$2e$1$2e$0_$5f$react$40$19$2e$1$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(0);
    const [customPronouns, setCustomPronouns] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$4_react$2d$dom$40$19$2e$1$2e$0_react$40$19$2e$1$2e$0_$5f$react$40$19$2e$1$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])('');
    const [isEnteringCustomPronouns, setIsEnteringCustomPronouns] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$4_react$2d$dom$40$19$2e$1$2e$0_react$40$19$2e$1$2e$0_$5f$react$40$19$2e$1$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const [isSelectingGender, setIsSelectingGender] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$4_react$2d$dom$40$19$2e$1$2e$0_react$40$19$2e$1$2e$0_$5f$react$40$19$2e$1$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$4_react$2d$dom$40$19$2e$1$2e$0_react$40$19$2e$1$2e$0_$5f$react$40$19$2e$1$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        const handleKeyPress = (e)=>{
            if (isEnteringCustomPronouns) {
                if (e.key === 'Enter') {
                    setIsEnteringCustomPronouns(false);
                    setIsEnteringName(true);
                } else if (e.key === 'Escape') {
                    setIsEnteringCustomPronouns(false);
                    setCustomPronouns('');
                    setIsSelectingGender(true);
                } else if (e.key === 'Backspace') {
                    setCustomPronouns((prev)=>prev.slice(0, -1));
                } else if (e.key.length === 1 && customPronouns.length < 15) {
                    setCustomPronouns((prev)=>prev + e.key);
                }
            } else if (isSelectingGender) {
                if (e.key === 'ArrowUp' || e.key === 'KeyW') {
                    setSelectedGenderIndex((prev)=>(prev - 1 + __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$components$2f$CharacterData$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["GENDER_OPTIONS"].length) % __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$components$2f$CharacterData$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["GENDER_OPTIONS"].length);
                } else if (e.key === 'ArrowDown' || e.key === 'KeyS') {
                    setSelectedGenderIndex((prev)=>(prev + 1) % __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$components$2f$CharacterData$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["GENDER_OPTIONS"].length);
                } else if (e.key === 'Enter') {
                    const selected = __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$components$2f$CharacterData$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["GENDER_OPTIONS"][selectedGenderIndex];
                    setSelectedGender(selected);
                    if (selected.id === 'custom') {
                        setIsSelectingGender(false);
                        setIsEnteringCustomPronouns(true);
                    } else {
                        setIsSelectingGender(false);
                        setIsEnteringName(true);
                    }
                } else if (e.key === 'Escape') {
                    setIsSelectingGender(false);
                    setIsEnteringName(true);
                }
            } else if (isEnteringName) {
                if (e.key === 'Enter') {
                    handleStartGame();
                } else if (e.key === 'Escape') {
                    setIsEnteringName(false);
                    setIsSelectingGender(true);
                } else if (e.key === 'Backspace') {
                    setPlayerName((prev)=>prev.slice(0, -1));
                } else if (e.key.length === 1 && playerName.length < 20) {
                    setPlayerName((prev)=>prev + e.key);
                }
            } else {
                if (e.key === 'ArrowRight' || e.key === 'KeyD') {
                    setSelectedIndex((prev)=>(prev + 1) % __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$components$2f$CharacterData$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["CHARACTER_OPTIONS"].length);
                } else if (e.key === 'ArrowLeft' || e.key === 'KeyA') {
                    setSelectedIndex((prev)=>(prev - 1 + __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$components$2f$CharacterData$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["CHARACTER_OPTIONS"].length) % __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$components$2f$CharacterData$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["CHARACTER_OPTIONS"].length);
                } else if (e.key === 'ArrowDown' || e.key === 'KeyS') {
                    setSelectedIndex((prev)=>(prev + 4) % __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$components$2f$CharacterData$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["CHARACTER_OPTIONS"].length);
                } else if (e.key === 'ArrowUp' || e.key === 'KeyW') {
                    setSelectedIndex((prev)=>(prev - 4 + __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$components$2f$CharacterData$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["CHARACTER_OPTIONS"].length) % __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$components$2f$CharacterData$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["CHARACTER_OPTIONS"].length);
                } else if (e.key === 'Enter') {
                    setIsSelectingGender(true);
                }
            }
        };
        window.addEventListener('keydown', handleKeyPress);
        return ()=>window.removeEventListener('keydown', handleKeyPress);
    }, [
        isEnteringName,
        playerName,
        isEnteringCustomPronouns,
        customPronouns,
        isSelectingGender,
        selectedGenderIndex,
        selectedGender
    ]);
    const handleStartGame = ()=>{
        if (playerName.trim().length < 2) {
            return;
        }
        const characterData = {
            selectedCharacter: __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$components$2f$CharacterData$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["CHARACTER_OPTIONS"][selectedIndex],
            playerName: playerName.trim(),
            selectedGender: selectedGender,
            customPronouns: selectedGender?.id === 'custom' ? customPronouns : undefined,
            showPronouns: selectedGender ? selectedGender.id !== 'prefer-not' : false
        };
        onCharacterSelected(characterData);
    };
    const renderCharacterPreview = (character, scale = 6)=>{
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$4_react$2d$dom$40$19$2e$1$2e$0_react$40$19$2e$1$2e$0_$5f$react$40$19$2e$1$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("canvas", {
            width: 48,
            height: 48,
            style: {
                imageRendering: 'pixelated'
            },
            ref: (canvas)=>{
                if (canvas) {
                    const ctx = canvas.getContext('2d');
                    if (ctx) {
                        ctx.imageSmoothingEnabled = false;
                        drawCharacterSprite(ctx, character, 0, 0, scale);
                    }
                }
            }
        }, void 0, false, {
            fileName: "[project]/app/components/CharacterSelection.tsx",
            lineNumber: 102,
            columnNumber: 7
        }, ("TURBOPACK compile-time value", void 0));
    };
    const drawCharacterSprite = (ctx, character, x, y, scale)=>{
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        const spriteData = [
            [
                0,
                1,
                1,
                1,
                1,
                1,
                1,
                0
            ],
            [
                1,
                2,
                2,
                2,
                2,
                2,
                2,
                1
            ],
            [
                0,
                2,
                2,
                2,
                2,
                2,
                2,
                0
            ],
            [
                0,
                3,
                3,
                3,
                3,
                3,
                3,
                0
            ],
            [
                0,
                3,
                3,
                3,
                3,
                3,
                3,
                0
            ],
            [
                0,
                4,
                4,
                4,
                4,
                4,
                4,
                0
            ],
            [
                0,
                4,
                4,
                0,
                0,
                4,
                4,
                0
            ],
            [
                0,
                2,
                2,
                0,
                0,
                2,
                2,
                0
            ]
        ];
        ctx.fillStyle = 'rgba(0,0,0,0.3)';
        ctx.fillRect(x, y + 7 * scale, 8 * scale, scale);
        for(let row = 0; row < 8; row++){
            for(let col = 0; col < 8; col++){
                const pixel = spriteData[row][col];
                if (pixel !== 0) {
                    ctx.fillStyle = getPixelColor(pixel, character);
                    ctx.fillRect(x + col * scale, y + row * scale, scale, scale);
                }
            }
        }
    };
    const getPixelColor = (pixelType, character)=>{
        switch(pixelType){
            case 1:
                return character.hairColor;
            case 2:
                return character.skinColor;
            case 3:
                return character.shirtColor;
            case 4:
                return character.pantsColor;
            default:
                return 'transparent';
        }
    };
    if (isEnteringCustomPronouns) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$4_react$2d$dom$40$19$2e$1$2e$0_react$40$19$2e$1$2e$0_$5f$react$40$19$2e$1$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "character-selection min-h-screen bg-black text-white flex items-center justify-center",
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$4_react$2d$dom$40$19$2e$1$2e$0_react$40$19$2e$1$2e$0_$5f$react$40$19$2e$1$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "text-center",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$4_react$2d$dom$40$19$2e$1$2e$0_react$40$19$2e$1$2e$0_$5f$react$40$19$2e$1$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                        className: "text-4xl font-bold mb-8 text-orange-400",
                        children: "ENTER CUSTOM PRONOUNS"
                    }, void 0, false, {
                        fileName: "[project]/app/components/CharacterSelection.tsx",
                        lineNumber: 167,
                        columnNumber: 11
                    }, ("TURBOPACK compile-time value", void 0)),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$4_react$2d$dom$40$19$2e$1$2e$0_react$40$19$2e$1$2e$0_$5f$react$40$19$2e$1$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "mb-8",
                        children: renderCharacterPreview(__TURBOPACK__imported__module__$5b$project$5d2f$app$2f$components$2f$CharacterData$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["CHARACTER_OPTIONS"][selectedIndex], 8)
                    }, void 0, false, {
                        fileName: "[project]/app/components/CharacterSelection.tsx",
                        lineNumber: 168,
                        columnNumber: 11
                    }, ("TURBOPACK compile-time value", void 0)),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$4_react$2d$dom$40$19$2e$1$2e$0_react$40$19$2e$1$2e$0_$5f$react$40$19$2e$1$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "text-2xl mb-4",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$4_react$2d$dom$40$19$2e$1$2e$0_react$40$19$2e$1$2e$0_$5f$react$40$19$2e$1$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "text-gray-400",
                                children: "Pronouns: "
                            }, void 0, false, {
                                fileName: "[project]/app/components/CharacterSelection.tsx",
                                lineNumber: 172,
                                columnNumber: 13
                            }, ("TURBOPACK compile-time value", void 0)),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$4_react$2d$dom$40$19$2e$1$2e$0_react$40$19$2e$1$2e$0_$5f$react$40$19$2e$1$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "text-white",
                                children: customPronouns
                            }, void 0, false, {
                                fileName: "[project]/app/components/CharacterSelection.tsx",
                                lineNumber: 173,
                                columnNumber: 13
                            }, ("TURBOPACK compile-time value", void 0)),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$4_react$2d$dom$40$19$2e$1$2e$0_react$40$19$2e$1$2e$0_$5f$react$40$19$2e$1$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "animate-pulse",
                                children: "|"
                            }, void 0, false, {
                                fileName: "[project]/app/components/CharacterSelection.tsx",
                                lineNumber: 174,
                                columnNumber: 13
                            }, ("TURBOPACK compile-time value", void 0))
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/components/CharacterSelection.tsx",
                        lineNumber: 171,
                        columnNumber: 11
                    }, ("TURBOPACK compile-time value", void 0)),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$4_react$2d$dom$40$19$2e$1$2e$0_react$40$19$2e$1$2e$0_$5f$react$40$19$2e$1$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "text-gray-400 text-sm",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$4_react$2d$dom$40$19$2e$1$2e$0_react$40$19$2e$1$2e$0_$5f$react$40$19$2e$1$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                children: "Enter your pronouns (e.g., xe/xir, ze/zir)"
                            }, void 0, false, {
                                fileName: "[project]/app/components/CharacterSelection.tsx",
                                lineNumber: 177,
                                columnNumber: 13
                            }, ("TURBOPACK compile-time value", void 0)),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$4_react$2d$dom$40$19$2e$1$2e$0_react$40$19$2e$1$2e$0_$5f$react$40$19$2e$1$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                children: "Press ENTER to continue or ESCAPE to go back"
                            }, void 0, false, {
                                fileName: "[project]/app/components/CharacterSelection.tsx",
                                lineNumber: 178,
                                columnNumber: 13
                            }, ("TURBOPACK compile-time value", void 0)),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$4_react$2d$dom$40$19$2e$1$2e$0_react$40$19$2e$1$2e$0_$5f$react$40$19$2e$1$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                children: "Maximum 15 characters"
                            }, void 0, false, {
                                fileName: "[project]/app/components/CharacterSelection.tsx",
                                lineNumber: 179,
                                columnNumber: 13
                            }, ("TURBOPACK compile-time value", void 0))
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/components/CharacterSelection.tsx",
                        lineNumber: 176,
                        columnNumber: 11
                    }, ("TURBOPACK compile-time value", void 0))
                ]
            }, void 0, true, {
                fileName: "[project]/app/components/CharacterSelection.tsx",
                lineNumber: 166,
                columnNumber: 9
            }, ("TURBOPACK compile-time value", void 0))
        }, void 0, false, {
            fileName: "[project]/app/components/CharacterSelection.tsx",
            lineNumber: 165,
            columnNumber: 7
        }, ("TURBOPACK compile-time value", void 0));
    }
    if (isSelectingGender) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$4_react$2d$dom$40$19$2e$1$2e$0_react$40$19$2e$1$2e$0_$5f$react$40$19$2e$1$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "character-selection min-h-screen bg-black text-white flex items-center justify-center",
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$4_react$2d$dom$40$19$2e$1$2e$0_react$40$19$2e$1$2e$0_$5f$react$40$19$2e$1$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "text-center",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$4_react$2d$dom$40$19$2e$1$2e$0_react$40$19$2e$1$2e$0_$5f$react$40$19$2e$1$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                        className: "text-4xl font-bold mb-8 text-orange-400",
                        children: "CHOOSE GENDER (OPTIONAL)"
                    }, void 0, false, {
                        fileName: "[project]/app/components/CharacterSelection.tsx",
                        lineNumber: 190,
                        columnNumber: 11
                    }, ("TURBOPACK compile-time value", void 0)),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$4_react$2d$dom$40$19$2e$1$2e$0_react$40$19$2e$1$2e$0_$5f$react$40$19$2e$1$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "mb-8",
                        children: renderCharacterPreview(__TURBOPACK__imported__module__$5b$project$5d2f$app$2f$components$2f$CharacterData$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["CHARACTER_OPTIONS"][selectedIndex], 8)
                    }, void 0, false, {
                        fileName: "[project]/app/components/CharacterSelection.tsx",
                        lineNumber: 191,
                        columnNumber: 11
                    }, ("TURBOPACK compile-time value", void 0)),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$4_react$2d$dom$40$19$2e$1$2e$0_react$40$19$2e$1$2e$0_$5f$react$40$19$2e$1$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "mb-6",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$4_react$2d$dom$40$19$2e$1$2e$0_react$40$19$2e$1$2e$0_$5f$react$40$19$2e$1$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "grid grid-cols-1 gap-3 max-w-md mx-auto mb-6",
                            children: __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$components$2f$CharacterData$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["GENDER_OPTIONS"].map((gender, index)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$4_react$2d$dom$40$19$2e$1$2e$0_react$40$19$2e$1$2e$0_$5f$react$40$19$2e$1$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: `p-3 border-2 rounded-lg transition-all text-left ${selectedGenderIndex === index ? 'border-orange-400 bg-orange-900 bg-opacity-20' : 'border-gray-600'}`,
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$4_react$2d$dom$40$19$2e$1$2e$0_react$40$19$2e$1$2e$0_$5f$react$40$19$2e$1$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "text-lg font-bold text-orange-300",
                                            children: gender.name
                                        }, void 0, false, {
                                            fileName: "[project]/app/components/CharacterSelection.tsx",
                                            lineNumber: 206,
                                            columnNumber: 19
                                        }, ("TURBOPACK compile-time value", void 0)),
                                        gender.pronouns && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$4_react$2d$dom$40$19$2e$1$2e$0_react$40$19$2e$1$2e$0_$5f$react$40$19$2e$1$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "text-sm text-gray-400",
                                            children: gender.pronouns
                                        }, void 0, false, {
                                            fileName: "[project]/app/components/CharacterSelection.tsx",
                                            lineNumber: 208,
                                            columnNumber: 21
                                        }, ("TURBOPACK compile-time value", void 0))
                                    ]
                                }, gender.id, true, {
                                    fileName: "[project]/app/components/CharacterSelection.tsx",
                                    lineNumber: 198,
                                    columnNumber: 17
                                }, ("TURBOPACK compile-time value", void 0)))
                        }, void 0, false, {
                            fileName: "[project]/app/components/CharacterSelection.tsx",
                            lineNumber: 196,
                            columnNumber: 13
                        }, ("TURBOPACK compile-time value", void 0))
                    }, void 0, false, {
                        fileName: "[project]/app/components/CharacterSelection.tsx",
                        lineNumber: 195,
                        columnNumber: 11
                    }, ("TURBOPACK compile-time value", void 0)),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$4_react$2d$dom$40$19$2e$1$2e$0_react$40$19$2e$1$2e$0_$5f$react$40$19$2e$1$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "text-gray-400 text-sm",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$4_react$2d$dom$40$19$2e$1$2e$0_react$40$19$2e$1$2e$0_$5f$react$40$19$2e$1$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                children: "Use ARROW KEYS or WS to select"
                            }, void 0, false, {
                                fileName: "[project]/app/components/CharacterSelection.tsx",
                                lineNumber: 217,
                                columnNumber: 13
                            }, ("TURBOPACK compile-time value", void 0)),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$4_react$2d$dom$40$19$2e$1$2e$0_react$40$19$2e$1$2e$0_$5f$react$40$19$2e$1$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                children: "Press ENTER to confirm selection"
                            }, void 0, false, {
                                fileName: "[project]/app/components/CharacterSelection.tsx",
                                lineNumber: 218,
                                columnNumber: 13
                            }, ("TURBOPACK compile-time value", void 0)),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$4_react$2d$dom$40$19$2e$1$2e$0_react$40$19$2e$1$2e$0_$5f$react$40$19$2e$1$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                children: "Press ESCAPE to skip gender selection"
                            }, void 0, false, {
                                fileName: "[project]/app/components/CharacterSelection.tsx",
                                lineNumber: 219,
                                columnNumber: 13
                            }, ("TURBOPACK compile-time value", void 0)),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$4_react$2d$dom$40$19$2e$1$2e$0_react$40$19$2e$1$2e$0_$5f$react$40$19$2e$1$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "text-orange-300 mt-2",
                                children: 'Pronouns will be shown automatically (except "Prefer not to specify")'
                            }, void 0, false, {
                                fileName: "[project]/app/components/CharacterSelection.tsx",
                                lineNumber: 220,
                                columnNumber: 13
                            }, ("TURBOPACK compile-time value", void 0))
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/components/CharacterSelection.tsx",
                        lineNumber: 216,
                        columnNumber: 11
                    }, ("TURBOPACK compile-time value", void 0))
                ]
            }, void 0, true, {
                fileName: "[project]/app/components/CharacterSelection.tsx",
                lineNumber: 189,
                columnNumber: 9
            }, ("TURBOPACK compile-time value", void 0))
        }, void 0, false, {
            fileName: "[project]/app/components/CharacterSelection.tsx",
            lineNumber: 188,
            columnNumber: 7
        }, ("TURBOPACK compile-time value", void 0));
    }
    if (isEnteringName) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$4_react$2d$dom$40$19$2e$1$2e$0_react$40$19$2e$1$2e$0_$5f$react$40$19$2e$1$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "character-selection min-h-screen bg-black text-white flex items-center justify-center",
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$4_react$2d$dom$40$19$2e$1$2e$0_react$40$19$2e$1$2e$0_$5f$react$40$19$2e$1$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "text-center",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$4_react$2d$dom$40$19$2e$1$2e$0_react$40$19$2e$1$2e$0_$5f$react$40$19$2e$1$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                        className: "text-4xl font-bold mb-8 text-orange-400",
                        children: "ENTER YOUR NAME"
                    }, void 0, false, {
                        fileName: "[project]/app/components/CharacterSelection.tsx",
                        lineNumber: 231,
                        columnNumber: 11
                    }, ("TURBOPACK compile-time value", void 0)),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$4_react$2d$dom$40$19$2e$1$2e$0_react$40$19$2e$1$2e$0_$5f$react$40$19$2e$1$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "mb-8",
                        children: renderCharacterPreview(__TURBOPACK__imported__module__$5b$project$5d2f$app$2f$components$2f$CharacterData$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["CHARACTER_OPTIONS"][selectedIndex], 8)
                    }, void 0, false, {
                        fileName: "[project]/app/components/CharacterSelection.tsx",
                        lineNumber: 232,
                        columnNumber: 11
                    }, ("TURBOPACK compile-time value", void 0)),
                    selectedGender && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$4_react$2d$dom$40$19$2e$1$2e$0_react$40$19$2e$1$2e$0_$5f$react$40$19$2e$1$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "mb-4",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$4_react$2d$dom$40$19$2e$1$2e$0_react$40$19$2e$1$2e$0_$5f$react$40$19$2e$1$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "text-gray-400",
                                children: "Gender: "
                            }, void 0, false, {
                                fileName: "[project]/app/components/CharacterSelection.tsx",
                                lineNumber: 238,
                                columnNumber: 15
                            }, ("TURBOPACK compile-time value", void 0)),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$4_react$2d$dom$40$19$2e$1$2e$0_react$40$19$2e$1$2e$0_$5f$react$40$19$2e$1$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "text-orange-300",
                                children: selectedGender.name
                            }, void 0, false, {
                                fileName: "[project]/app/components/CharacterSelection.tsx",
                                lineNumber: 239,
                                columnNumber: 15
                            }, ("TURBOPACK compile-time value", void 0)),
                            selectedGender.id === 'custom' && customPronouns && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$4_react$2d$dom$40$19$2e$1$2e$0_react$40$19$2e$1$2e$0_$5f$react$40$19$2e$1$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$4_react$2d$dom$40$19$2e$1$2e$0_react$40$19$2e$1$2e$0_$5f$react$40$19$2e$1$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Fragment"], {
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$4_react$2d$dom$40$19$2e$1$2e$0_react$40$19$2e$1$2e$0_$5f$react$40$19$2e$1$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "text-gray-400",
                                        children: " ("
                                    }, void 0, false, {
                                        fileName: "[project]/app/components/CharacterSelection.tsx",
                                        lineNumber: 242,
                                        columnNumber: 19
                                    }, ("TURBOPACK compile-time value", void 0)),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$4_react$2d$dom$40$19$2e$1$2e$0_react$40$19$2e$1$2e$0_$5f$react$40$19$2e$1$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "text-orange-300",
                                        children: customPronouns
                                    }, void 0, false, {
                                        fileName: "[project]/app/components/CharacterSelection.tsx",
                                        lineNumber: 243,
                                        columnNumber: 19
                                    }, ("TURBOPACK compile-time value", void 0)),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$4_react$2d$dom$40$19$2e$1$2e$0_react$40$19$2e$1$2e$0_$5f$react$40$19$2e$1$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "text-gray-400",
                                        children: ")"
                                    }, void 0, false, {
                                        fileName: "[project]/app/components/CharacterSelection.tsx",
                                        lineNumber: 244,
                                        columnNumber: 19
                                    }, ("TURBOPACK compile-time value", void 0))
                                ]
                            }, void 0, true),
                            selectedGender.pronouns && selectedGender.id !== 'custom' && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$4_react$2d$dom$40$19$2e$1$2e$0_react$40$19$2e$1$2e$0_$5f$react$40$19$2e$1$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$4_react$2d$dom$40$19$2e$1$2e$0_react$40$19$2e$1$2e$0_$5f$react$40$19$2e$1$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Fragment"], {
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$4_react$2d$dom$40$19$2e$1$2e$0_react$40$19$2e$1$2e$0_$5f$react$40$19$2e$1$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "text-gray-400",
                                        children: " ("
                                    }, void 0, false, {
                                        fileName: "[project]/app/components/CharacterSelection.tsx",
                                        lineNumber: 249,
                                        columnNumber: 19
                                    }, ("TURBOPACK compile-time value", void 0)),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$4_react$2d$dom$40$19$2e$1$2e$0_react$40$19$2e$1$2e$0_$5f$react$40$19$2e$1$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "text-orange-300",
                                        children: selectedGender.pronouns
                                    }, void 0, false, {
                                        fileName: "[project]/app/components/CharacterSelection.tsx",
                                        lineNumber: 250,
                                        columnNumber: 19
                                    }, ("TURBOPACK compile-time value", void 0)),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$4_react$2d$dom$40$19$2e$1$2e$0_react$40$19$2e$1$2e$0_$5f$react$40$19$2e$1$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "text-gray-400",
                                        children: ")"
                                    }, void 0, false, {
                                        fileName: "[project]/app/components/CharacterSelection.tsx",
                                        lineNumber: 251,
                                        columnNumber: 19
                                    }, ("TURBOPACK compile-time value", void 0))
                                ]
                            }, void 0, true)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/components/CharacterSelection.tsx",
                        lineNumber: 237,
                        columnNumber: 13
                    }, ("TURBOPACK compile-time value", void 0)),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$4_react$2d$dom$40$19$2e$1$2e$0_react$40$19$2e$1$2e$0_$5f$react$40$19$2e$1$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "text-2xl mb-4",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$4_react$2d$dom$40$19$2e$1$2e$0_react$40$19$2e$1$2e$0_$5f$react$40$19$2e$1$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "text-gray-400",
                                children: "Name: "
                            }, void 0, false, {
                                fileName: "[project]/app/components/CharacterSelection.tsx",
                                lineNumber: 258,
                                columnNumber: 13
                            }, ("TURBOPACK compile-time value", void 0)),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$4_react$2d$dom$40$19$2e$1$2e$0_react$40$19$2e$1$2e$0_$5f$react$40$19$2e$1$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "text-white",
                                children: playerName
                            }, void 0, false, {
                                fileName: "[project]/app/components/CharacterSelection.tsx",
                                lineNumber: 259,
                                columnNumber: 13
                            }, ("TURBOPACK compile-time value", void 0)),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$4_react$2d$dom$40$19$2e$1$2e$0_react$40$19$2e$1$2e$0_$5f$react$40$19$2e$1$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "animate-pulse",
                                children: "|"
                            }, void 0, false, {
                                fileName: "[project]/app/components/CharacterSelection.tsx",
                                lineNumber: 260,
                                columnNumber: 13
                            }, ("TURBOPACK compile-time value", void 0))
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/components/CharacterSelection.tsx",
                        lineNumber: 257,
                        columnNumber: 11
                    }, ("TURBOPACK compile-time value", void 0)),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$4_react$2d$dom$40$19$2e$1$2e$0_react$40$19$2e$1$2e$0_$5f$react$40$19$2e$1$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "text-gray-400 text-sm",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$4_react$2d$dom$40$19$2e$1$2e$0_react$40$19$2e$1$2e$0_$5f$react$40$19$2e$1$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                children: "Type your name and press ENTER to start"
                            }, void 0, false, {
                                fileName: "[project]/app/components/CharacterSelection.tsx",
                                lineNumber: 263,
                                columnNumber: 13
                            }, ("TURBOPACK compile-time value", void 0)),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$4_react$2d$dom$40$19$2e$1$2e$0_react$40$19$2e$1$2e$0_$5f$react$40$19$2e$1$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                children: "Press ESCAPE to go back"
                            }, void 0, false, {
                                fileName: "[project]/app/components/CharacterSelection.tsx",
                                lineNumber: 264,
                                columnNumber: 13
                            }, ("TURBOPACK compile-time value", void 0)),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$4_react$2d$dom$40$19$2e$1$2e$0_react$40$19$2e$1$2e$0_$5f$react$40$19$2e$1$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                children: "Minimum 2 characters required"
                            }, void 0, false, {
                                fileName: "[project]/app/components/CharacterSelection.tsx",
                                lineNumber: 265,
                                columnNumber: 13
                            }, ("TURBOPACK compile-time value", void 0))
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/components/CharacterSelection.tsx",
                        lineNumber: 262,
                        columnNumber: 11
                    }, ("TURBOPACK compile-time value", void 0))
                ]
            }, void 0, true, {
                fileName: "[project]/app/components/CharacterSelection.tsx",
                lineNumber: 230,
                columnNumber: 9
            }, ("TURBOPACK compile-time value", void 0))
        }, void 0, false, {
            fileName: "[project]/app/components/CharacterSelection.tsx",
            lineNumber: 229,
            columnNumber: 7
        }, ("TURBOPACK compile-time value", void 0));
    }
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$4_react$2d$dom$40$19$2e$1$2e$0_react$40$19$2e$1$2e$0_$5f$react$40$19$2e$1$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "character-selection min-h-screen bg-black text-white flex items-center justify-center",
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$4_react$2d$dom$40$19$2e$1$2e$0_react$40$19$2e$1$2e$0_$5f$react$40$19$2e$1$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "text-center",
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$4_react$2d$dom$40$19$2e$1$2e$0_react$40$19$2e$1$2e$0_$5f$react$40$19$2e$1$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                    className: "text-4xl font-bold mb-8 text-orange-400",
                    children: "CHOOSE YOUR CHARACTER"
                }, void 0, false, {
                    fileName: "[project]/app/components/CharacterSelection.tsx",
                    lineNumber: 275,
                    columnNumber: 9
                }, ("TURBOPACK compile-time value", void 0)),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$4_react$2d$dom$40$19$2e$1$2e$0_react$40$19$2e$1$2e$0_$5f$react$40$19$2e$1$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "grid grid-cols-4 gap-8 mb-8",
                    children: __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$components$2f$CharacterData$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["CHARACTER_OPTIONS"].map((character, index)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$4_react$2d$dom$40$19$2e$1$2e$0_react$40$19$2e$1$2e$0_$5f$react$40$19$2e$1$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: `character-option p-4 border-2 rounded-lg transition-all ${selectedIndex === index ? 'border-orange-400 bg-orange-900 bg-opacity-20' : 'border-gray-600'}`,
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$4_react$2d$dom$40$19$2e$1$2e$0_react$40$19$2e$1$2e$0_$5f$react$40$19$2e$1$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex flex-col items-center",
                                children: [
                                    renderCharacterPreview(character),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$4_react$2d$dom$40$19$2e$1$2e$0_react$40$19$2e$1$2e$0_$5f$react$40$19$2e$1$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "text-lg font-bold mt-2 text-orange-300",
                                        children: character.number
                                    }, void 0, false, {
                                        fileName: "[project]/app/components/CharacterSelection.tsx",
                                        lineNumber: 289,
                                        columnNumber: 17
                                    }, ("TURBOPACK compile-time value", void 0))
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/components/CharacterSelection.tsx",
                                lineNumber: 287,
                                columnNumber: 15
                            }, ("TURBOPACK compile-time value", void 0))
                        }, character.id, false, {
                            fileName: "[project]/app/components/CharacterSelection.tsx",
                            lineNumber: 279,
                            columnNumber: 13
                        }, ("TURBOPACK compile-time value", void 0)))
                }, void 0, false, {
                    fileName: "[project]/app/components/CharacterSelection.tsx",
                    lineNumber: 277,
                    columnNumber: 9
                }, ("TURBOPACK compile-time value", void 0)),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$4_react$2d$dom$40$19$2e$1$2e$0_react$40$19$2e$1$2e$0_$5f$react$40$19$2e$1$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "mb-8",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$4_react$2d$dom$40$19$2e$1$2e$0_react$40$19$2e$1$2e$0_$5f$react$40$19$2e$1$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                            className: "text-2xl font-bold mb-4 text-orange-400",
                            children: "Selected Character"
                        }, void 0, false, {
                            fileName: "[project]/app/components/CharacterSelection.tsx",
                            lineNumber: 298,
                            columnNumber: 11
                        }, ("TURBOPACK compile-time value", void 0)),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$4_react$2d$dom$40$19$2e$1$2e$0_react$40$19$2e$1$2e$0_$5f$react$40$19$2e$1$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex justify-center mb-4",
                            children: renderCharacterPreview(__TURBOPACK__imported__module__$5b$project$5d2f$app$2f$components$2f$CharacterData$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["CHARACTER_OPTIONS"][selectedIndex], 8)
                        }, void 0, false, {
                            fileName: "[project]/app/components/CharacterSelection.tsx",
                            lineNumber: 299,
                            columnNumber: 11
                        }, ("TURBOPACK compile-time value", void 0)),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$4_react$2d$dom$40$19$2e$1$2e$0_react$40$19$2e$1$2e$0_$5f$react$40$19$2e$1$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "text-xl text-orange-300",
                            children: [
                                "Character ",
                                __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$components$2f$CharacterData$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["CHARACTER_OPTIONS"][selectedIndex].number
                            ]
                        }, void 0, true, {
                            fileName: "[project]/app/components/CharacterSelection.tsx",
                            lineNumber: 302,
                            columnNumber: 11
                        }, ("TURBOPACK compile-time value", void 0))
                    ]
                }, void 0, true, {
                    fileName: "[project]/app/components/CharacterSelection.tsx",
                    lineNumber: 297,
                    columnNumber: 9
                }, ("TURBOPACK compile-time value", void 0)),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$4_react$2d$dom$40$19$2e$1$2e$0_react$40$19$2e$1$2e$0_$5f$react$40$19$2e$1$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "text-gray-400 text-sm",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$4_react$2d$dom$40$19$2e$1$2e$0_react$40$19$2e$1$2e$0_$5f$react$40$19$2e$1$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                            children: "Use ARROW KEYS or WASD to select a character"
                        }, void 0, false, {
                            fileName: "[project]/app/components/CharacterSelection.tsx",
                            lineNumber: 306,
                            columnNumber: 11
                        }, ("TURBOPACK compile-time value", void 0)),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$4_react$2d$dom$40$19$2e$1$2e$0_react$40$19$2e$1$2e$0_$5f$react$40$19$2e$1$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                            children: "Press ENTER to continue to gender selection"
                        }, void 0, false, {
                            fileName: "[project]/app/components/CharacterSelection.tsx",
                            lineNumber: 307,
                            columnNumber: 11
                        }, ("TURBOPACK compile-time value", void 0))
                    ]
                }, void 0, true, {
                    fileName: "[project]/app/components/CharacterSelection.tsx",
                    lineNumber: 305,
                    columnNumber: 9
                }, ("TURBOPACK compile-time value", void 0))
            ]
        }, void 0, true, {
            fileName: "[project]/app/components/CharacterSelection.tsx",
            lineNumber: 274,
            columnNumber: 7
        }, ("TURBOPACK compile-time value", void 0))
    }, void 0, false, {
        fileName: "[project]/app/components/CharacterSelection.tsx",
        lineNumber: 273,
        columnNumber: 5
    }, ("TURBOPACK compile-time value", void 0));
};
const __TURBOPACK__default__export__ = CharacterSelection;
}),
"[project]/app/components/Game.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>__TURBOPACK__default__export__
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$4_react$2d$dom$40$19$2e$1$2e$0_react$40$19$2e$1$2e$0_$5f$react$40$19$2e$1$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@15.5.4_react-dom@19.1.0_react@19.1.0__react@19.1.0/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$4_react$2d$dom$40$19$2e$1$2e$0_react$40$19$2e$1$2e$0_$5f$react$40$19$2e$1$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@15.5.4_react-dom@19.1.0_react@19.1.0__react@19.1.0/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$components$2f$GameEngine$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/components/GameEngine.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$components$2f$CharacterSelection$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/components/CharacterSelection.tsx [app-ssr] (ecmascript)");
'use client';
;
;
;
;
const Game = ()=>{
    const canvasRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$4_react$2d$dom$40$19$2e$1$2e$0_react$40$19$2e$1$2e$0_$5f$react$40$19$2e$1$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(null);
    const gameEngineRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$4_react$2d$dom$40$19$2e$1$2e$0_react$40$19$2e$1$2e$0_$5f$react$40$19$2e$1$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(null);
    const [isLoaded, setIsLoaded] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$4_react$2d$dom$40$19$2e$1$2e$0_react$40$19$2e$1$2e$0_$5f$react$40$19$2e$1$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const [playerCharacter, setPlayerCharacter] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$4_react$2d$dom$40$19$2e$1$2e$0_react$40$19$2e$1$2e$0_$5f$react$40$19$2e$1$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    const [showCharacterSelection, setShowCharacterSelection] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$4_react$2d$dom$40$19$2e$1$2e$0_react$40$19$2e$1$2e$0_$5f$react$40$19$2e$1$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(true);
    const handleCharacterSelected = (character)=>{
        setPlayerCharacter(character);
        setShowCharacterSelection(false);
    };
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$4_react$2d$dom$40$19$2e$1$2e$0_react$40$19$2e$1$2e$0_$5f$react$40$19$2e$1$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        if (canvasRef.current && !gameEngineRef.current && playerCharacter && !showCharacterSelection) {
            const canvas = canvasRef.current;
            const ctx = canvas.getContext('2d');
            if (ctx) {
                // Set canvas size
                canvas.width = 800;
                canvas.height = 600;
                // Enable pixel-perfect rendering
                ctx.imageSmoothingEnabled = false;
                // Initialize game engine with character data
                gameEngineRef.current = new __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$components$2f$GameEngine$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"](canvas, ctx, playerCharacter);
                gameEngineRef.current.start();
                setIsLoaded(true);
                // Focus canvas for keyboard input
                canvas.focus();
            }
        }
        return ()=>{
            if (gameEngineRef.current) {
                gameEngineRef.current.stop();
            }
        };
    }, [
        playerCharacter,
        showCharacterSelection
    ]);
    if (showCharacterSelection) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$4_react$2d$dom$40$19$2e$1$2e$0_react$40$19$2e$1$2e$0_$5f$react$40$19$2e$1$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$app$2f$components$2f$CharacterSelection$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
            onCharacterSelected: handleCharacterSelected
        }, void 0, false, {
            fileName: "[project]/app/components/Game.tsx",
            lineNumber: 51,
            columnNumber: 12
        }, ("TURBOPACK compile-time value", void 0));
    }
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$4_react$2d$dom$40$19$2e$1$2e$0_react$40$19$2e$1$2e$0_$5f$react$40$19$2e$1$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "relative game-ui",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$4_react$2d$dom$40$19$2e$1$2e$0_react$40$19$2e$1$2e$0_$5f$react$40$19$2e$1$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("canvas", {
                ref: canvasRef,
                className: "pixel-border pixelated",
                tabIndex: 0,
                style: {
                    imageRendering: 'pixelated',
                    outline: 'none'
                },
                onFocus: ()=>console.log('Canvas focused - keyboard controls active')
            }, void 0, false, {
                fileName: "[project]/app/components/Game.tsx",
                lineNumber: 56,
                columnNumber: 7
            }, ("TURBOPACK compile-time value", void 0)),
            !isLoaded && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$4_react$2d$dom$40$19$2e$1$2e$0_react$40$19$2e$1$2e$0_$5f$react$40$19$2e$1$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "absolute inset-0 flex items-center justify-center loading-screen text-white",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$4_react$2d$dom$40$19$2e$1$2e$0_react$40$19$2e$1$2e$0_$5f$react$40$19$2e$1$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "text-center",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$4_react$2d$dom$40$19$2e$1$2e$0_react$40$19$2e$1$2e$0_$5f$react$40$19$2e$1$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "text-xl mb-2",
                            children: "LOADING..."
                        }, void 0, false, {
                            fileName: "[project]/app/components/Game.tsx",
                            lineNumber: 69,
                            columnNumber: 13
                        }, ("TURBOPACK compile-time value", void 0)),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$4_react$2d$dom$40$19$2e$1$2e$0_react$40$19$2e$1$2e$0_$5f$react$40$19$2e$1$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "text-sm",
                            children: "Initializing pixel world..."
                        }, void 0, false, {
                            fileName: "[project]/app/components/Game.tsx",
                            lineNumber: 70,
                            columnNumber: 13
                        }, ("TURBOPACK compile-time value", void 0))
                    ]
                }, void 0, true, {
                    fileName: "[project]/app/components/Game.tsx",
                    lineNumber: 68,
                    columnNumber: 11
                }, ("TURBOPACK compile-time value", void 0))
            }, void 0, false, {
                fileName: "[project]/app/components/Game.tsx",
                lineNumber: 67,
                columnNumber: 9
            }, ("TURBOPACK compile-time value", void 0)),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$4_react$2d$dom$40$19$2e$1$2e$0_react$40$19$2e$1$2e$0_$5f$react$40$19$2e$1$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "mt-4 text-white text-center game-ui",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$4_react$2d$dom$40$19$2e$1$2e$0_react$40$19$2e$1$2e$0_$5f$react$40$19$2e$1$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "bg-black bg-opacity-80 p-4 rounded border border-white inline-block",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$4_react$2d$dom$40$19$2e$1$2e$0_react$40$19$2e$1$2e$0_$5f$react$40$19$2e$1$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                            className: "text-sm mb-1",
                            children: "🎮 VIRGINIA TECH CAMPUS"
                        }, void 0, false, {
                            fileName: "[project]/app/components/Game.tsx",
                            lineNumber: 76,
                            columnNumber: 11
                        }, ("TURBOPACK compile-time value", void 0)),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$4_react$2d$dom$40$19$2e$1$2e$0_react$40$19$2e$1$2e$0_$5f$react$40$19$2e$1$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                            className: "text-xs",
                            children: "WASD or Arrow Keys to move around campus"
                        }, void 0, false, {
                            fileName: "[project]/app/components/Game.tsx",
                            lineNumber: 77,
                            columnNumber: 11
                        }, ("TURBOPACK compile-time value", void 0)),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$4_react$2d$dom$40$19$2e$1$2e$0_react$40$19$2e$1$2e$0_$5f$react$40$19$2e$1$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                            className: "text-xs",
                            children: "Stand directly on building doors to enter!"
                        }, void 0, false, {
                            fileName: "[project]/app/components/Game.tsx",
                            lineNumber: 78,
                            columnNumber: 11
                        }, ("TURBOPACK compile-time value", void 0)),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$4_react$2d$dom$40$19$2e$1$2e$0_react$40$19$2e$1$2e$0_$5f$react$40$19$2e$1$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                            className: "text-xs mt-2",
                            children: "Click canvas first, then use keyboard"
                        }, void 0, false, {
                            fileName: "[project]/app/components/Game.tsx",
                            lineNumber: 79,
                            columnNumber: 11
                        }, ("TURBOPACK compile-time value", void 0))
                    ]
                }, void 0, true, {
                    fileName: "[project]/app/components/Game.tsx",
                    lineNumber: 75,
                    columnNumber: 9
                }, ("TURBOPACK compile-time value", void 0))
            }, void 0, false, {
                fileName: "[project]/app/components/Game.tsx",
                lineNumber: 74,
                columnNumber: 7
            }, ("TURBOPACK compile-time value", void 0))
        ]
    }, void 0, true, {
        fileName: "[project]/app/components/Game.tsx",
        lineNumber: 55,
        columnNumber: 5
    }, ("TURBOPACK compile-time value", void 0));
};
const __TURBOPACK__default__export__ = Game;
}),
"[project]/app/page.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>Home
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$4_react$2d$dom$40$19$2e$1$2e$0_react$40$19$2e$1$2e$0_$5f$react$40$19$2e$1$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@15.5.4_react-dom@19.1.0_react@19.1.0__react@19.1.0/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$components$2f$Game$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/components/Game.tsx [app-ssr] (ecmascript)");
'use client';
;
;
function Home() {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$4_react$2d$dom$40$19$2e$1$2e$0_react$40$19$2e$1$2e$0_$5f$react$40$19$2e$1$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "flex items-center justify-center min-h-screen bg-black",
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$4_react$2d$dom$40$19$2e$1$2e$0_react$40$19$2e$1$2e$0_$5f$react$40$19$2e$1$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$app$2f$components$2f$Game$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {}, void 0, false, {
            fileName: "[project]/app/page.tsx",
            lineNumber: 8,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/app/page.tsx",
        lineNumber: 7,
        columnNumber: 5
    }, this);
}
}),
];

//# sourceMappingURL=app_30a9b647._.js.map