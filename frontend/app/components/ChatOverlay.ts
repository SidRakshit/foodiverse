export interface ChatMessage {
  id: string;
  text: string;
  sender: 'Player' | 'Jake';
  timestamp: number;
  opacity: number;
}

export class ChatOverlay {
  private messages: ChatMessage[] = [];
  private messageLifetime: number = 12000; // 12 seconds
  private fadeStartTime: number = 9000; // Start fading after 9 seconds
  private maxMessages: number = 5; // Max messages on screen
  private nextMessageId: number = 0;

  // Chat positioning and styling
  private readonly padding = 15;
  private readonly messageSpacing = 4;
  private readonly fontSize = 14;
  private readonly lineHeight = 18;
  private readonly maxMessageWidth = 300;
  private readonly backgroundColor = 'rgba(0, 0, 0, 0.7)';
  private readonly playerColor = '#4A90E2';
  private readonly jakeColor = '#E67E22';
  private readonly textColor = '#FFFFFF';
  private readonly senderLabelWidth = 80; // Space reserved for "Player:" or "Jake:" labels

  public addMessage(text: string, sender: 'Player' | 'Jake'): void {
    const message: ChatMessage = {
      id: `msg_${this.nextMessageId++}`,
      text,
      sender,
      timestamp: Date.now(),
      opacity: 1
    };

    this.messages.push(message);

    // Keep only the most recent messages
    if (this.messages.length > this.maxMessages) {
      this.messages = this.messages.slice(-this.maxMessages);
    }

    console.log(`💬 ChatOverlay: Added ${sender} message: "${text}"`);
  }

  public update(deltaTime: number): void {
    const now = Date.now();

    // Update message opacity and remove expired messages
    this.messages = this.messages.filter(message => {
      const age = now - message.timestamp;

      if (age > this.messageLifetime) {
        return false; // Remove expired message
      }

      // Calculate fade opacity
      if (age > this.fadeStartTime) {
        const fadeProgress = (age - this.fadeStartTime) / (this.messageLifetime - this.fadeStartTime);
        message.opacity = Math.max(0, 1 - fadeProgress);
      } else {
        message.opacity = 1;
      }

      return true;
    });
  }

  public render(ctx: CanvasRenderingContext2D): void {
    if (this.messages.length === 0) return;

    ctx.save();

    // Calculate total height needed for all messages
    let totalHeight = 0;
    const messageData: Array<{
      message: ChatMessage;
      lines: string[];
      height: number;
    }> = [];

    ctx.font = `${this.fontSize}px 'Courier New', monospace`;

    // Pre-calculate message dimensions
    for (const message of this.messages) {
      // Account for sender label width when wrapping text
      const availableTextWidth = this.maxMessageWidth - this.padding * 2 - this.senderLabelWidth;
      const lines = this.wrapText(ctx, message.text, availableTextWidth);
      const height = Math.max(lines.length * this.lineHeight, this.lineHeight) + this.padding * 2;

      messageData.push({ message, lines, height });
      totalHeight += height + this.messageSpacing;
    }

    // Remove the extra spacing from the last message
    totalHeight -= this.messageSpacing;

    // Position messages at bottom-left, stacking upward
    const canvasHeight = ctx.canvas.height;
    let currentY = canvasHeight - this.padding - totalHeight;

    // Render each message
    for (const { message, lines, height } of messageData) {
      this.renderMessage(ctx, message, lines, this.padding, currentY, height);
      currentY += height + this.messageSpacing;
    }

    ctx.restore();
  }

  private renderMessage(
    ctx: CanvasRenderingContext2D,
    message: ChatMessage,
    lines: string[],
    x: number,
    y: number,
    height: number
  ): void {
    const width = this.maxMessageWidth;

    // Apply opacity for fading effect
    ctx.globalAlpha = message.opacity;

    // Draw background
    ctx.fillStyle = this.backgroundColor;
    this.drawRoundedRect(ctx, x, y, width, height, 6);
    ctx.fill();

    // Draw sender indicator (colored left border)
    const senderColor = message.sender === 'Jake' ? this.jakeColor : this.playerColor;
    ctx.fillStyle = senderColor;
    ctx.fillRect(x, y, 4, height);

    // Draw sender name inside the message area
    ctx.fillStyle = senderColor;
    ctx.font = `bold ${this.fontSize}px 'Courier New', monospace`;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';

    const senderLabel = message.sender + ':';
    ctx.fillText(senderLabel, x + this.padding + 4, y + this.padding);

    // Draw message text, positioned to the right of the sender label
    ctx.fillStyle = this.textColor;
    ctx.font = `${this.fontSize}px 'Courier New', monospace`;

    const messageStartX = x + this.padding + this.senderLabelWidth;

    for (let i = 0; i < lines.length; i++) {
      const lineY = y + this.padding + (i * this.lineHeight);
      ctx.fillText(lines[i], messageStartX, lineY);
    }
  }

  private wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
    const words = text.split(' ');
    const lines: string[] = [];
    let currentLine = '';

    for (const word of words) {
      const testLine = currentLine + (currentLine ? ' ' : '') + word;
      const metrics = ctx.measureText(testLine);

      if (metrics.width > maxWidth && currentLine) {
        lines.push(currentLine);
        currentLine = word;
      } else {
        currentLine = testLine;
      }
    }

    if (currentLine) {
      lines.push(currentLine);
    }

    return lines;
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

  // Public methods for debugging and management
  public clearMessages(): void {
    this.messages = [];
    console.log('💬 ChatOverlay: Cleared all messages');
  }

  public getMessageCount(): number {
    return this.messages.length;
  }
}