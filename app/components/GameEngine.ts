import Player from './Player';
import World from './World';
import InputHandler from './InputHandler';
import SceneManager from './SceneManager';
import FridgeManager from './FridgeManager';
import LeaderboardManager from './LeaderboardManager';
import QuestManager from './QuestManager';
import { PlayerCharacter } from './CharacterData';
import { ChatOverlay } from './ChatOverlay';

class GameEngine {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private player: Player;
  private sceneManager: SceneManager;
  private inputHandler: InputHandler;
  private chatOverlay: ChatOverlay;
  private leaderboardManager: LeaderboardManager;
  private questManager: QuestManager;
  private lastTime: number = 0;
  private animationFrameId: number | null = null;
  private isRunning: boolean = false;

  constructor(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D, playerCharacter: PlayerCharacter) {
    this.canvas = canvas;
    this.ctx = ctx;

    // Initialize game objects
    this.player = new Player(400, 912, playerCharacter); // Starting position in campus area (608 + 304)
    this.inputHandler = new InputHandler();
    this.inputHandler.setCanvas(canvas); // Set canvas for mouse events
    this.chatOverlay = new ChatOverlay();
    this.leaderboardManager = LeaderboardManager.getInstance();
    this.questManager = QuestManager.getInstance();
    this.sceneManager = new SceneManager(this.player, this.inputHandler, this.chatOverlay);

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
    // Handle leaderboard input BEFORE clearing input state
    this.handleLeaderboardInput();

    // Check for quest expiration periodically
    this.questManager.checkQuestExpiration();

    // Check scene transitions BEFORE clearing input state
    this.sceneManager.update(deltaTime);

    // Update player BEFORE clearing input state
    this.player.update(deltaTime, this.inputHandler, this.sceneManager.getCurrentScene());

    // Update chat overlay
    this.chatOverlay.update(deltaTime);

    // Update input (this clears keyPressed state) - do this AFTER all components have processed input
    this.inputHandler.update();
  }

  private handleLeaderboardInput(): void {
    // Handle leaderboard keyboard toggle (L key)
    if (this.inputHandler.wasKeyJustPressed('KeyL')) {
      if (this.leaderboardManager.isLeaderboardOpen()) {
        this.leaderboardManager.closeLeaderboard();
      } else {
        this.leaderboardManager.openLeaderboard();
      }
    }

    // Handle quest input
    const questHandled = this.handleQuestInput();

    // Handle mouse clicks (only if quest didn't handle them)
    if (!questHandled) {
      const mouseClicks = this.inputHandler.getMouseClicks();
      for (const click of mouseClicks) {
        const leaderboardHandled = this.leaderboardManager.handleClick(click.x, click.y);
        if (!leaderboardHandled) {
          this.questManager.handleClick(click.x, click.y);
        }
      }
    }
  }

  private handleQuestInput(): boolean {
    // Check quest keyboard input first
    if (this.inputHandler.wasKeyJustPressed('KeyQ')) {
      this.questManager.handleKeyInput('KeyQ');
      return true;
    }

    if (this.questManager.isQuestUIOpen()) {
      if (this.inputHandler.wasKeyJustPressed('ArrowUp') || this.inputHandler.wasKeyJustPressed('KeyW')) {
        this.questManager.handleKeyInput('ArrowUp');
        return true;
      }
      if (this.inputHandler.wasKeyJustPressed('ArrowDown') || this.inputHandler.wasKeyJustPressed('KeyS')) {
        this.questManager.handleKeyInput('ArrowDown');
        return true;
      }
      if (this.inputHandler.wasKeyJustPressed('Escape')) {
        this.questManager.handleKeyInput('Escape');
        return true;
      }
    }

    // Handle quest mouse clicks
    const mouseClicks = this.inputHandler.getMouseClicks();
    for (const click of mouseClicks) {
      if (this.questManager.handleClick(click.x, click.y)) {
        return true;
      }
    }

    return false;
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

    // Render UI icons (always visible)
    this.leaderboardManager.renderLeaderboardIcon(this.ctx);
    this.questManager.renderQuestIcon(this.ctx);

    // Render fridge UI on top of everything
    const fridgeManager = FridgeManager.getInstance();
    fridgeManager.renderFridgeUI(this.ctx, 'player1'); // Use actual player ID

    // Render overlay UIs (if open)
    this.leaderboardManager.renderLeaderboardUI(this.ctx);
    this.questManager.renderQuestUI(this.ctx);

    // Render chat overlay on top of everything else
    this.chatOverlay.render(this.ctx);
  }

  // Public getter for ChatOverlay (for NPCs and other components)
  public getChatOverlay(): ChatOverlay {
    return this.chatOverlay;
  }

  // Public getter for QuestManager (for external components)
  public getQuestManager(): QuestManager {
    return this.questManager;
  }

  // Debug method to test quest progression (can be called from browser console)
  public testQuestProgression(): void {
    console.log('🧪 Testing quest progression...');
    
    // Simulate different quest actions
    this.questManager.onItemClaimed(false); // Regular item claim
    this.questManager.onItemClaimed(true);  // Expiring item claim
    this.questManager.onItemAdded();        // Item added
    this.questManager.onLocationVisited();  // Location visited
    this.questManager.onNPCChatted();       // NPC chatted
    
    console.log('🧪 Quest test completed - check quest log for progress');
  }

}

export default GameEngine;
