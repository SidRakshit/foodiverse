class InputHandler {
  private keys: Set<string> = new Set();
  private keyPressed: Set<string> = new Set();
  private keyReleased: Set<string> = new Set();
  private mouseClicks: Array<{ x: number; y: number }> = [];
  private canvas: HTMLCanvasElement | null = null;

  constructor() {
    this.handleKeyDown = this.handleKeyDown.bind(this);
    this.handleKeyUp = this.handleKeyUp.bind(this);
    this.handleMouseClick = this.handleMouseClick.bind(this);
    
    // Add event listeners
    if (typeof window !== 'undefined') {
      window.addEventListener('keydown', this.handleKeyDown);
      window.addEventListener('keyup', this.handleKeyUp);
    }
  }

  public setCanvas(canvas: HTMLCanvasElement): void {
    if (this.canvas) {
      this.canvas.removeEventListener('click', this.handleMouseClick);
    }
    
    this.canvas = canvas;
    if (canvas) {
      canvas.addEventListener('click', this.handleMouseClick);
    }
  }

  private handleKeyDown(event: KeyboardEvent): void {
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

  private handleKeyUp(event: KeyboardEvent): void {
    const key = event.code;
    
    if (this.keys.has(key)) {
      this.keys.delete(key);
      this.keyReleased.add(key);
    }
  }

  private handleMouseClick(event: MouseEvent): void {
    if (!this.canvas) return;
    
    const rect = this.canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    
    // Scale coordinates if canvas is scaled
    const scaleX = this.canvas.width / rect.width;
    const scaleY = this.canvas.height / rect.height;
    
    this.mouseClicks.push({
      x: x * scaleX,
      y: y * scaleY
    });
  }

  private isGameKey(key: string): boolean {
    const gameKeys = [
      'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight',
      'KeyW', 'KeyA', 'KeyS', 'KeyD',
      'Space', 'Enter', 'Escape', 'KeyE', 'KeyL'
    ];
    return gameKeys.includes(key);
  }

  public isKeyPressed(key: string): boolean {
    return this.keys.has(key);
  }

  public wasKeyJustPressed(key: string): boolean {
    return this.keyPressed.has(key);
  }

  public wasKeyJustReleased(key: string): boolean {
    return this.keyReleased.has(key);
  }

  public getMouseClicks(): Array<{ x: number; y: number }> {
    return [...this.mouseClicks];
  }

  public update(): void {
    // Clear frame-specific key states
    this.keyPressed.clear();
    this.keyReleased.clear();
    this.mouseClicks.length = 0; // Clear mouse clicks
  }

  public destroy(): void {
    if (typeof window !== 'undefined') {
      window.removeEventListener('keydown', this.handleKeyDown);
      window.removeEventListener('keyup', this.handleKeyUp);
    }
    
    if (this.canvas) {
      this.canvas.removeEventListener('click', this.handleMouseClick);
    }
    
    this.keys.clear();
    this.keyPressed.clear();
    this.keyReleased.clear();
    this.mouseClicks.length = 0;
  }
}

export default InputHandler;
