import Player from './Player';
import InputHandler from './InputHandler';
import SceneManager from './SceneManager';

interface BackendConfig {
  baseUrl: string;
  email: string;
  password: string;
}

class GameEngine {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private player: Player;
  private sceneManager: SceneManager;
  private inputHandler: InputHandler;
  private lastTime: number = 0;
  private animationFrameId: number | null = null;
  private isRunning: boolean = false;
  private backendConfig?: BackendConfig;
  private authToken: string | null = null;
  private isInitializingBackend = false;
  private backendInitialized = false;
  private photoTrigger = { x: 12 * 32 + 16, y: 19 * 32 + 9 * 32 + 16, radius: 28 };
  private isTriggeringPhoto = false;
  private lastTriggerTime = 0;
  private triggerCooldown = 5000;
  private statusMessage: string | null = null;
  private statusMessageTimer = 0;

  constructor(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D, backendConfig?: BackendConfig) {
    this.canvas = canvas;
    this.ctx = ctx;
    this.backendConfig = backendConfig;
    
    // Initialize game objects
    this.player = new Player(400, 912); // Starting position in campus area (608 + 304)
    this.sceneManager = new SceneManager(this.player);
    this.inputHandler = new InputHandler();
    
    // Bind the game loop
    this.gameLoop = this.gameLoop.bind(this);
  }

  start(): void {
    this.isRunning = true;
    this.lastTime = performance.now();
    this.gameLoop(this.lastTime);
    void this.initializeBackend();
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
    // Update input
    this.inputHandler.update();
    
    // Update player
    this.player.update(deltaTime, this.inputHandler, this.sceneManager.getCurrentScene());
    
    // Update scene manager (handles scene transitions)
    this.sceneManager.update(deltaTime);

    this.updateStatusMessage(deltaTime);
    this.checkPhotoTrigger();
  }

  private render(): void {
    // Clear canvas
    this.ctx.fillStyle = '#2a4d3a'; // Dark green background
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    
    // Render current scene
    this.sceneManager.render(this.ctx);
    
    // Render player
    const cameraPos = this.sceneManager.getCameraPosition();
    this.renderPhotoTrigger(cameraPos.x, cameraPos.y);
    this.player.render(this.ctx, cameraPos.x, cameraPos.y);
    
    // Render UI
    this.renderUI();
  }

  private renderUI(): void {
    // Render simple UI elements
    this.ctx.fillStyle = 'white';
    this.ctx.font = '12px monospace';
    this.ctx.fillText(`Position: (${Math.floor(this.player.x)}, ${Math.floor(this.player.y)})`, 10, 20);
    const cameraPos = this.sceneManager.getCameraPosition();
    this.ctx.fillText(`Camera: (${Math.floor(cameraPos.x)}, ${Math.floor(cameraPos.y)})`, 10, 40);
    this.ctx.fillText(`Scene: ${this.sceneManager.getCurrentSceneType()}`, 10, 60);
    
    // Show entrance instructions when near door
    if (this.sceneManager.getCurrentSceneType() === 'campus') {
      this.ctx.fillStyle = '#FF8C00';
      this.ctx.font = '10px monospace';
      this.ctx.fillText('Walk to building doors to enter!', 10, 580);
    } else {
      this.ctx.fillStyle = '#32CD32';
      this.ctx.font = '10px monospace';
      this.ctx.fillText('Walk to green EXIT area to leave building', 10, 580);
    }

    if (this.statusMessage) {
      this.ctx.fillStyle = 'rgba(0, 0, 0, 0.65)';
      this.ctx.fillRect(200, 70, 400, 26);
      this.ctx.strokeStyle = '#FFD700';
      this.ctx.strokeRect(200, 70, 400, 26);
      this.ctx.fillStyle = '#FFD700';
      this.ctx.font = '12px monospace';
      this.ctx.fillText(this.statusMessage, 210, 87);
    }
  }

  private async initializeBackend(): Promise<void> {
    if (!this.backendConfig || this.isInitializingBackend) return;
    this.isInitializingBackend = true;
    try {
      await this.ensureAuthToken();
      if (this.authToken) {
        this.backendInitialized = true;
        this.setStatusMessage('Connected to Foodiverse backend');
      }
    } catch (err) {
      console.error('Backend initialization failed', err);
      this.setStatusMessage('Backend connection failed');
    } finally {
      this.isInitializingBackend = false;
    }
  }

  private async ensureAuthToken(): Promise<void> {
    if (!this.backendConfig) return;
    if (this.authToken) return;

    try {
      await this.login();
    } catch (loginErr) {
      if (loginErr instanceof Error) {
        console.warn('Login failed, attempting registration', loginErr.message);
      }
      await this.register();
      await this.login();
    }
  }

  private async login(): Promise<void> {
    if (!this.backendConfig) return;
    const response = await fetch(`${this.backendConfig.baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: this.backendConfig.email, password: this.backendConfig.password }),
    });

    if (!response.ok) {
      const payload = await response.json().catch(() => ({}));
      throw new Error(payload?.error || 'Login failed');
    }

    const payload = await response.json();
    this.authToken = payload.token;
  }

  private async register(): Promise<void> {
    if (!this.backendConfig) return;
    const response = await fetch(`${this.backendConfig.baseUrl}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Campus Tester',
        email: this.backendConfig.email,
        password: this.backendConfig.password,
      }),
    });

    if (!response.ok && response.status !== 400) {
      const payload = await response.json().catch(() => ({}));
      throw new Error(payload?.error || 'Registration failed');
    }
  }

  private checkPhotoTrigger(): void {
    if (this.sceneManager.getCurrentSceneType() !== 'campus') return;
    const now = performance.now();
    if (this.isTriggeringPhoto) return;
    if (now - this.lastTriggerTime < this.triggerCooldown) return;

    const playerCenterX = this.player.x + this.player.width / 2;
    const playerCenterY = this.player.y + this.player.height / 2;
    const dx = playerCenterX - this.photoTrigger.x;
    const dy = playerCenterY - this.photoTrigger.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance <= this.photoTrigger.radius) {
      this.lastTriggerTime = now;
      this.isTriggeringPhoto = true;
      void this.triggerPhotoWorkflow();
    }
  }

  private async triggerPhotoWorkflow(): Promise<void> {
    if (!this.backendConfig) {
      this.setStatusMessage('Backend not configured');
      this.isTriggeringPhoto = false;
      return;
    }

    if (!this.backendInitialized) {
      await this.initializeBackend();
    }

    if (!this.authToken) {
      this.setStatusMessage('Auth token unavailable');
      this.isTriggeringPhoto = false;
      return;
    }

    this.setStatusMessage('Identifying food photo...');

    try {
      const response = await fetch(`${this.backendConfig.baseUrl}/listings/photo/sample`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.authToken}`,
        },
        body: JSON.stringify({ location: 'Campus Sample Pickup' }),
      });

      const payload = await response.json().catch(() => ({}));

      if (!response.ok) {
        const message = typeof payload?.error === 'string' ? payload.error : 'Photo workflow failed';
        this.setStatusMessage(message);
        return;
      }

      if (payload?.item_name) {
        this.setStatusMessage(`Identified item: ${payload.item_name}`);
      } else {
        this.setStatusMessage('Photo workflow completed');
      }
    } catch (err) {
      console.error('Photo workflow error', err);
      this.setStatusMessage('Photo workflow failed');
    } finally {
      this.isTriggeringPhoto = false;
    }
  }

  private renderPhotoTrigger(cameraX: number, cameraY: number): void {
    if (this.sceneManager.getCurrentSceneType() !== 'campus') return;

    const screenX = this.photoTrigger.x - cameraX;
    const screenY = this.photoTrigger.y - cameraY;

    if (screenX < -50 || screenY < -50 || screenX > this.canvas.width + 50 || screenY > this.canvas.height + 50) {
      return;
    }

    this.ctx.save();
    this.ctx.translate(screenX, screenY);

    this.ctx.beginPath();
    this.ctx.fillStyle = 'rgba(255, 215, 0, 0.85)';
    this.ctx.arc(0, 0, this.photoTrigger.radius, 0, Math.PI * 2);
    this.ctx.fill();

    this.ctx.strokeStyle = '#8B4513';
    this.ctx.lineWidth = 3;
    this.ctx.stroke();

    this.ctx.strokeStyle = '#FFFFFF';
    this.ctx.lineWidth = 4;
    this.ctx.beginPath();
    this.ctx.moveTo(-this.photoTrigger.radius / 2, 0);
    this.ctx.lineTo(this.photoTrigger.radius / 2, 0);
    this.ctx.moveTo(0, -this.photoTrigger.radius / 2);
    this.ctx.lineTo(0, this.photoTrigger.radius / 2);
    this.ctx.stroke();

    this.ctx.restore();
  }

  private setStatusMessage(message: string, duration = 4000): void {
    this.statusMessage = message;
    this.statusMessageTimer = duration;
  }

  private updateStatusMessage(deltaTime: number): void {
    if (this.statusMessageTimer > 0) {
      this.statusMessageTimer = Math.max(0, this.statusMessageTimer - deltaTime);
      if (this.statusMessageTimer === 0) {
        this.statusMessage = null;
      }
    }
  }
}

export default GameEngine;
