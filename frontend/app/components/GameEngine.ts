import Player from './Player';
import World from './World';
import InputHandler from './InputHandler';
import SceneManager from './SceneManager';

class GameEngine {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private player: Player;
  private sceneManager: SceneManager;
  private inputHandler: InputHandler;
  private lastTime: number = 0;
  private animationFrameId: number | null = null;
  private isRunning: boolean = false;

  constructor(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D) {
    this.canvas = canvas;
    this.ctx = ctx;
    
    // Initialize game objects
    this.player = new Player(400, 912); // Starting position in campus area (608 + 304)
    this.inputHandler = new InputHandler();
    this.sceneManager = new SceneManager(this.player, this.inputHandler);
    
    // Bind the game loop
    this.gameLoop = this.gameLoop.bind(this);
  }

  start(): void {
    this.isRunning = true;
    this.lastTime = performance.now();
    this.gameLoop(this.lastTime);
  }

  stop(): void {
    this.isRunning = false;
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }
    // Clean up input handler
    this.inputHandler.destroy();
  }

  private gameLoop(currentTime: number): void {
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

  private update(deltaTime: number): void {
    // Check scene transitions BEFORE clearing input state
    this.sceneManager.update(deltaTime);
    
    // Update input (this clears keyPressed state)
    this.inputHandler.update();
    
    // Update player
    this.player.update(deltaTime, this.inputHandler, this.sceneManager.getCurrentScene());
  }

  private render(): void {
    // Clear canvas
    this.ctx.fillStyle = '#2a4d3a'; // Dark green background
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    
    // Render current scene
    this.sceneManager.render(this.ctx);
    
    // Render player
    const cameraPos = this.sceneManager.getCameraPosition();
    this.player.render(this.ctx, cameraPos.x, cameraPos.y);
    
    // Render UI
    this.renderUI();
  }

  private renderUI(): void {
    // Show entrance instructions when near door
    if (this.sceneManager.getCurrentSceneType() === 'campus') {
      this.ctx.fillStyle = '#FF8C00';
      this.ctx.font = '10px monospace';
      this.ctx.fillText('Stand directly on building doors to enter!', 10, 580);
    } else {
      this.ctx.fillStyle = '#32CD32';
      this.ctx.font = '10px monospace';
      this.ctx.fillText('Walk to green EXIT area to leave building', 10, 580);
    }
  }
}

export default GameEngine;
