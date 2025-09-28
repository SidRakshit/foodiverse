import InputHandler from './InputHandler';
import { Scene } from './types';
import FridgeManager from './FridgeManager';
import { BackendChecker } from '../utils/BackendChecker';
import { BartenderNPC } from './off-campus/BartenderNPC';
import { PlayerCharacter } from './CharacterData';

class Player {
  public x: number;
  public y: number;
  public width: number = 16;
  public height: number = 16;
  private speed: number = 120; // pixels per second
  private direction: 'down' | 'up' | 'left' | 'right' = 'down';
  private animationFrame: number = 0;
  private animationTimer: number = 0;
  private animationSpeed: number = 200; // ms per frame
  private isMoving: boolean = false;

  // Chat functionality
  private isChatting: boolean = false;
  private currentMessage: string = '';
  private displayMessage: string = '';
  private messageTimer: number = 0;
  private messageDuration: number = 3000; // 3 seconds

  // Interaction system
  private nearbyFridge: string | null = null;
  private playerId: string = 'player1'; // This should be set based on actual player identity
  private nearbyJake: BartenderNPC | null = null;

  // Character data
  private playerCharacter: PlayerCharacter;

  constructor(x: number, y: number, playerCharacter: PlayerCharacter) {
    this.x = x;
    this.y = y;
    this.playerCharacter = playerCharacter;
    this.setupChatEventListeners();
  }

  update(deltaTime: number, inputHandler: InputHandler, scene: Scene): void {
    // Handle chat input first
    this.updateChat(deltaTime, inputHandler);
    
    // Handle fridge interactions
    this.updateFridgeInteraction(inputHandler, scene);
    
    // Only allow movement if not chatting and fridge UI is not open
    const fridgeManager = FridgeManager.getInstance();
    if (!this.isChatting && !fridgeManager.isFridgeUIOpen()) {
      let newX = this.x;
      let newY = this.y;
      this.isMoving = false;

      // Handle movement input
      if (inputHandler.isKeyPressed('ArrowUp') || inputHandler.isKeyPressed('KeyW')) {
        newY -= (this.speed * deltaTime) / 1000;
        this.direction = 'up';
        this.isMoving = true;
      }
      if (inputHandler.isKeyPressed('ArrowDown') || inputHandler.isKeyPressed('KeyS')) {
        newY += (this.speed * deltaTime) / 1000;
        this.direction = 'down';
        this.isMoving = true;
      }
      if (inputHandler.isKeyPressed('ArrowLeft') || inputHandler.isKeyPressed('KeyA')) {
        newX -= (this.speed * deltaTime) / 1000;
        this.direction = 'left';
        this.isMoving = true;
      }
      if (inputHandler.isKeyPressed('ArrowRight') || inputHandler.isKeyPressed('KeyD')) {
        newX += (this.speed * deltaTime) / 1000;
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

  private canMoveTo(x: number, y: number, scene: Scene): boolean {
    // Check scene boundaries (world is now 800x1216 pixels - two full screens stacked)
    if (x < 0 || y < 0 || x + this.width > 800 || y + this.height > 1216) {
      console.log('Movement blocked by world boundaries:', { x, y, worldBounds: [800, 1216] });
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

  render(ctx: CanvasRenderingContext2D, cameraX: number = 0, cameraY: number = 0): void {
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
    if (this.nearbyFridge && !FridgeManager.getInstance().isFridgeUIOpen()) {
      this.renderFridgePrompt(ctx, screenX, screenY);
    }
  }

  private drawPixelArtCharacter(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    direction: string,
    frame: number
  ): void {
    const pixelSize = 1;
    const shadowColor = 'rgba(0,0,0,0.3)';

    // Draw shadow
    ctx.fillStyle = shadowColor;
    ctx.fillRect(x, y + 7, 8, 1);

    // Character sprite data (8x8 pixels)
    const spriteData = this.getCharacterSprite(direction, frame);

    // Draw the character pixel by pixel
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        const pixel = spriteData[row][col];
        if (pixel !== 0) {
          ctx.fillStyle = this.getPixelColor(pixel);
          ctx.fillRect(x + col, y + row, pixelSize, pixelSize);
        }
      }
    }
  }

  private getCharacterSprite(direction: string, frame: number): number[][] {
    // Simplified sprite data where:
    // 0 = transparent, 1 = hair, 2 = skin, 3 = shirt, 4 = pants
    
    const baseSprite = [
      [0, 1, 1, 1, 1, 1, 1, 0], // Hair
      [1, 2, 2, 2, 2, 2, 2, 1], // Head
      [0, 2, 2, 2, 2, 2, 2, 0], // Face
      [0, 3, 3, 3, 3, 3, 3, 0], // Shirt
      [0, 3, 3, 3, 3, 3, 3, 0], // Shirt
      [0, 4, 4, 4, 4, 4, 4, 0], // Pants
      [0, 4, 4, 0, 0, 4, 4, 0], // Legs
      [0, 2, 2, 0, 0, 2, 2, 0], // Feet
    ];

    // Add simple animation for walking
    if (frame === 1 && direction !== 'up') {
      // Slightly offset legs for walking animation
      baseSprite[6] = [0, 4, 0, 4, 4, 0, 4, 0];
      baseSprite[7] = [0, 2, 0, 2, 2, 0, 2, 0];
    }

    return baseSprite;
  }

  private getPixelColor(pixelType: number): string {
    const character = this.playerCharacter.selectedCharacter;
    switch (pixelType) {
      case 1: return character.hairColor;
      case 2: return character.skinColor;
      case 3: return character.shirtColor;
      case 4: return character.pantsColor;
      default: return 'transparent';
    }
  }

  private renderPlayerName(ctx: CanvasRenderingContext2D, playerX: number, playerY: number): void {
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
    ctx.fillRect(
      nameX - backgroundWidth / 2,
      nameY - backgroundHeight / 2,
      backgroundWidth,
      backgroundHeight
    );

    // Draw border
    ctx.strokeStyle = '#E5751F';
    ctx.lineWidth = 1;
    ctx.strokeRect(
      nameX - backgroundWidth / 2,
      nameY - backgroundHeight / 2,
      backgroundWidth,
      backgroundHeight
    );

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

  private setupChatEventListeners(): void {
    if (typeof window !== 'undefined') {
      // Listen for keyboard events
      window.addEventListener('keydown', (event: KeyboardEvent) => {
        const fridgeManager = FridgeManager.getInstance();
        
        // Handle fridge input mode first
        if (fridgeManager.isFridgeUIOpen() && fridgeManager.isInInputMode()) {
          this.handleFridgeInput(event, fridgeManager);
          event.preventDefault();
          return;
        }
        
        // Handle chat input
        if (event.key === 'Enter' && !this.isChatting) {
          this.startChatting();
          event.preventDefault();
        } else if (event.key === 'Enter' && this.isChatting) {
          this.sendMessage();
          event.preventDefault();
        } else if (event.key === 'Escape' && this.isChatting) {
          this.cancelChatting();
          event.preventDefault();
        } else if (this.isChatting) {
          this.handleChatInput(event);
        }
      });
    }
  }

  private updateChat(deltaTime: number, inputHandler: InputHandler): void {
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

  private startChatting(): void {
    this.isChatting = true;
    this.currentMessage = '';
    console.log('💬 Started chatting mode - bubble should appear');
  }

  private cancelChatting(): void {
    this.isChatting = false;
    this.currentMessage = '';
    console.log('Cancelled chatting mode');
  }

  private sendMessage(): void {
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

  private handleChatInput(event: KeyboardEvent): void {
    if (event.key === 'Backspace') {
      this.currentMessage = this.currentMessage.slice(0, -1);
      event.preventDefault();
    } else if (event.key.length === 1) {
      // Only add printable characters
      this.currentMessage += event.key;
      event.preventDefault();
    }
  }

  private renderChatBubble(ctx: CanvasRenderingContext2D, playerX: number, playerY: number): void {
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
    ctx.fillText(
      message,
      bubbleX + bubbleWidth / 2,
      bubbleY + bubbleHeight / 2,
      maxWidth - padding * 2
    );

    ctx.restore();
  }

  private drawRoundedRect(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    width: number,
    height: number,
    radius: number
  ): void {
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

  private renderFridgePrompt(ctx: CanvasRenderingContext2D, screenX: number, screenY: number): void {
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

  private updateFridgeInteraction(inputHandler: InputHandler, scene: Scene): void {
    const fridgeManager = FridgeManager.getInstance();
    
    // Check if we're near a fridge in the Edge apartment
    if (scene.type === 'edge') {
      const fridgeX = 13 * 32; // Tile 13 * 32 pixels
      const fridgeY = 9 * 32;  // Tile 9 * 32 pixels
      
      const distance = Math.sqrt(
        Math.pow(this.x + this.width / 2 - (fridgeX + 16), 2) + 
        Math.pow(this.y + this.height / 2 - (fridgeY + 16), 2)
      );
      
      if (distance <= 48) { // Within interaction range
        this.nearbyFridge = 'edge';
        
        // Handle interaction input
        if (inputHandler.wasKeyJustPressed('KeyE')) {
          console.log('🔑 E key pressed - opening Edge fridge UI!');
          if (!fridgeManager.isFridgeUIOpen()) {
            fridgeManager.openFridgeUI('edge').then(() => {
              console.log('📋 Edge fridge UI opened');
            }).catch(error => {
              console.error('Failed to open fridge UI:', error);
              console.log('💡 Tip: The fridge will still work in offline mode');
            });
          }
        }
      } else {
        this.nearbyFridge = null;
      }
    }
    // Check if we're near a fridge in the Tech Terrace apartment
    else if (scene.type === 'techterrace') {
      const fridgeX = 13 * 32; // Tile 13 * 32 pixels
      const fridgeY = 10 * 32; // Tile 10 * 32 pixels (TechTerrace fridge is at y=10)
      
      const distance = Math.sqrt(
        Math.pow(this.x + this.width / 2 - (fridgeX + 16), 2) + 
        Math.pow(this.y + this.height / 2 - (fridgeY + 16), 2)
      );
      
      if (distance <= 48) { // Within interaction range
        this.nearbyFridge = 'techterrace';
        
        // Handle interaction input
        if (inputHandler.wasKeyJustPressed('KeyE')) {
          console.log('🔑 E key pressed - opening Tech Terrace fridge UI!');
          if (!fridgeManager.isFridgeUIOpen()) {
            fridgeManager.openFridgeUI('techterrace').then(() => {
              console.log('📋 Tech Terrace fridge UI opened');
            }).catch(error => {
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

  private handleFridgeUIInput(inputHandler: InputHandler, fridgeManager: FridgeManager): void {
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
        fridgeManager.claimAndDeleteItem(selectedItem.id).then(success => {
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
        fridgeManager.deleteSelectedItem(this.playerId).then(success => {
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
        BackendChecker.retryConnection().then(connected => {
          if (connected) {
            console.log('🎉 Backend reconnected! Refreshing data...');
          }
          return fridgeManager.forceRefresh();
        }).then(() => {
          console.log('✅ Fridge data refreshed');
        }).catch(error => {
          console.error('❌ Error during refresh:', error);
        });
      }
    }
  }

  private handleFridgeInput(event: KeyboardEvent, fridgeManager: FridgeManager): void {
    if (event.key === 'Enter') {
      // Submit the input
      console.log('🍎 Submitting food item:', fridgeManager.getInputText());
      fridgeManager.submitInput(this.playerId).then(success => {
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
      if (fridgeManager.getInputText().length < 50) { // Character limit
        fridgeManager.handleInputCharacter(event.key);
      }
    }
  }

  // Jake interaction methods
  public setNearbyJake(jake: BartenderNPC | null): void {
    this.nearbyJake = jake;
    if (jake) {
      console.log('🍺 Player is now near Jake');
    } else {
      console.log('🍺 Player left Jake\'s area');
    }
  }

  public isNearJake(): boolean {
    return this.nearbyJake !== null;
  }

  // Debug method to test Jake manually
  public testJakeResponse(): void {
    if (this.nearbyJake) {
      console.log('🧪 Testing Jake response...');
      this.nearbyJake.respondToPlayer('Hello Jake, this is a test message!');
    } else {
      console.log('🧪 No Jake nearby to test');
    }
  }

  // Getter methods for collision detection
  public getLeft(): number { return this.x; }
  public getRight(): number { return this.x + this.width; }
  public getTop(): number { return this.y; }
  public getBottom(): number { return this.y + this.height; }
}

export default Player;
