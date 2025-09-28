class InputHandler {
  private keys: Set<string> = new Set();
  private keyPressed: Set<string> = new Set();
  private keyReleased: Set<string> = new Set();

  constructor() {
    this.handleKeyDown = this.handleKeyDown.bind(this);
    this.handleKeyUp = this.handleKeyUp.bind(this);
    
    // Add event listeners
    if (typeof window !== 'undefined') {
      window.addEventListener('keydown', this.handleKeyDown);
      window.addEventListener('keyup', this.handleKeyUp);
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

  private isGameKey(key: string): boolean {
    const gameKeys = [
      'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight',
      'KeyW', 'KeyA', 'KeyS', 'KeyD',
      'Space', 'Enter', 'Escape', 'KeyE'
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

  public update(): void {
    // Clear frame-specific key states
    this.keyPressed.clear();
    this.keyReleased.clear();
  }

  public destroy(): void {
    if (typeof window !== 'undefined') {
      window.removeEventListener('keydown', this.handleKeyDown);
      window.removeEventListener('keyup', this.handleKeyUp);
    }
    this.keys.clear();
    this.keyPressed.clear();
    this.keyReleased.clear();
  }
}

export default InputHandler;
