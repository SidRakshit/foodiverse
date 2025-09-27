import InputHandler from './InputHandler';
import { Scene } from './types';

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

  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
  }

  update(deltaTime: number, inputHandler: InputHandler, scene: Scene): void {
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
  }

  private drawPixelArtCharacter(
    ctx: CanvasRenderingContext2D, 
    x: number, 
    y: number, 
    direction: string, 
    frame: number
  ): void {
    const pixelSize = 1;
    
    // Define character colors
    const skinColor = '#FFDBAC';
    const shirtColor = '#FF6B6B';
    const pantsColor = '#4ECDC4';
    const hairColor = '#8B4513';
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
    switch (pixelType) {
      case 1: return '#8B4513'; // Hair (brown)
      case 2: return '#FFDBAC'; // Skin
      case 3: return '#FF6B6B'; // Shirt (red)
      case 4: return '#4ECDC4'; // Pants (teal)
      default: return 'transparent';
    }
  }

  // Getter methods for collision detection
  public getLeft(): number { return this.x; }
  public getRight(): number { return this.x + this.width; }
  public getTop(): number { return this.y; }
  public getBottom(): number { return this.y + this.height; }
}

export default Player;
