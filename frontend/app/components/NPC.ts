import { SceneType } from './types';

export interface NPCConfig {
  x: number;
  y: number;
  width: number;
  height: number;
  name: string;
  type: 'bartender' | 'customer' | 'staff' | 'vendor';
  dialogues?: string[];
  color?: string;
  clothingColor?: string;
}

export abstract class BaseNPC {
  protected x: number;
  protected y: number;
  protected width: number;
  protected height: number;
  protected name: string;
  protected type: string;
  protected dialogues: string[];
  protected currentDialogue: number = 0;
  protected color: string;
  protected clothingColor: string;

  constructor(config: NPCConfig) {
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

  public render(ctx: CanvasRenderingContext2D, cameraX: number, cameraY: number): void {
    const screenX = this.x - cameraX;
    const screenY = this.y - cameraY;

    // Draw NPC body
    this.renderBody(ctx, screenX, screenY);
    
    // Draw name tag (optional)
    this.renderNameTag(ctx, screenX, screenY);
  }

  protected abstract renderBody(ctx: CanvasRenderingContext2D, x: number, y: number): void;

  protected renderNameTag(ctx: CanvasRenderingContext2D, x: number, y: number): void {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(x - 10, y - 25, this.name.length * 6 + 4, 14);
    
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '10px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(this.name, x + this.width / 2, y - 15);
  }

  public interact(): string {
    if (this.dialogues.length === 0) return `Hello, I'm ${this.name}`;
    
    const dialogue = this.dialogues[this.currentDialogue];
    this.currentDialogue = (this.currentDialogue + 1) % this.dialogues.length;
    return dialogue;
  }

  public getBounds(): { x: number, y: number, width: number, height: number } {
    return { x: this.x, y: this.y, width: this.width, height: this.height };
  }

  public update(deltaTime: number): void {
    // Base update logic - can be overridden for animations
  }
}
