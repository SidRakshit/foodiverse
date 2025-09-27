import { BaseNPC, NPCConfig } from '../NPC';

export class BartenderNPC extends BaseNPC {
  constructor(x: number, y: number) {
    const config: NPCConfig = {
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
      color: '#FFDBAC', // Skin color
      clothingColor: '#8B0000' // VT Maroon apron/shirt
    };
    super(config);
  }

  protected renderBody(ctx: CanvasRenderingContext2D, x: number, y: number): void {
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
