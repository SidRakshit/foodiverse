import { BaseNPC, NPCConfig } from '../NPC';
import { jakeService } from '../../services/JakeService';

export class BartenderNPC extends BaseNPC {
  private isThinking: boolean = false;
  private currentResponse: string = '';
  private responseTimer: number = 0;
  private responseDuration: number = 4000; // 4 seconds
  private thinkingTimer: number = 0;
  private thinkingDuration: number = 2000; // 2 seconds thinking time

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

  public update(deltaTime: number): void {
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

  public async respondToPlayer(playerMessage: string): Promise<void> {
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
      const response = await jakeService.chatWithJake(playerMessage);
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

  public isNearPlayer(playerX: number, playerY: number): boolean {
    const distance = Math.sqrt(
      Math.pow(playerX - (this.x + this.width / 2), 2) + 
      Math.pow(playerY - (this.y + this.height / 2), 2)
    );
    return distance <= 80; // Within 80 pixels (increased for easier interaction)
  }

  public render(ctx: CanvasRenderingContext2D, cameraX: number, cameraY: number): void {
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

  private renderChatBubble(ctx: CanvasRenderingContext2D, npcX: number, npcY: number): void {
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
    const lines: string[] = [];
    let currentLine = '';
    
    for (const word of words) {
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
    const bubbleWidth = Math.min(maxWidth, Math.max(...lines.map(line => ctx.measureText(line).width)) + padding * 2);
    const bubbleHeight = lines.length * lineHeight + padding * 2;
    const bubbleX = npcX + this.width / 2 - bubbleWidth / 2;

    // Draw bubble background (different color for Jake)
    ctx.fillStyle = this.isThinking ? 'rgba(255, 255, 200, 0.9)' : 'rgba(200, 255, 200, 0.9)';
    ctx.strokeStyle = '#8B0000'; // VT Maroon border
    ctx.lineWidth = 2;
    
    // Rounded rectangle for bubble
    this.drawRoundedRect(ctx, bubbleX, bubbleY, bubbleWidth, bubbleHeight, 8);
    ctx.fill();
    ctx.stroke();

    // Draw bubble tail pointing to Jake
    ctx.beginPath();
    ctx.moveTo(npcX + this.width / 2, bubbleY + bubbleHeight);
    ctx.lineTo(npcX + this.width / 2 - 5, bubbleY + bubbleHeight + 8);
    ctx.lineTo(npcX + this.width / 2 + 5, bubbleY + bubbleHeight + 8);
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
      ctx.fillText(thinkingText, bubbleX + bubbleWidth / 2, bubbleY + bubbleHeight / 2);
    } else {
      // Draw multiple lines of text
      const startY = bubbleY + padding + lineHeight / 2;
      lines.forEach((line, index) => {
        ctx.fillText(line, bubbleX + bubbleWidth / 2, startY + index * lineHeight);
      });
    }

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
