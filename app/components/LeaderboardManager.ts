interface LeaderboardEntry {
  id: number;
  name: string;
  email: string;
  points: number;
  reputation_score: number;
}

class LeaderboardManager {
  private static instance: LeaderboardManager | null = null;
  private leaderboardData: LeaderboardEntry[] = [];
  private isOpen: boolean = false;
  private isLoading: boolean = false;
  private lastFetchTime: number = 0;
  private fetchCooldown: number = 30000; // 30 seconds
  private iconPosition: { x: number; y: number } = { x: 0, y: 0 };
  private iconSize: number = 40;

  private constructor() {
    this.setupIconPosition();
  }

  public static getInstance(): LeaderboardManager {
    if (!LeaderboardManager.instance) {
      LeaderboardManager.instance = new LeaderboardManager();
    }
    return LeaderboardManager.instance;
  }

  private setupIconPosition(): void {
    // Position icon in top-right corner of screen
    this.iconPosition = { x: 750, y: 10 }; // 800px canvas width - 50px margin
  }

  public async fetchLeaderboard(): Promise<void> {
    const now = Date.now();
    
    // Check cooldown to avoid spamming the API
    if (now - this.lastFetchTime < this.fetchCooldown && this.leaderboardData.length > 0) {
      console.log('🏆 Using cached leaderboard data');
      return;
    }

    this.isLoading = true;
    this.lastFetchTime = now;

    try {
      const response = await fetch('/api/leaderboard');
      if (response.ok) {
        this.leaderboardData = await response.json();
        console.log('🏆 Leaderboard data fetched:', this.leaderboardData.length, 'entries');
      } else {
        console.error('🏆 Failed to fetch leaderboard:', response.status);
        // Use mock data if API fails
        this.useMockData();
      }
    } catch (error) {
      console.error('🏆 Error fetching leaderboard:', error);
      // Use mock data if API fails
      this.useMockData();
    } finally {
      this.isLoading = false;
    }
  }

  private useMockData(): void {
    this.leaderboardData = [
      { id: 1, name: 'Alice Johnson', email: 'alice@vt.edu', points: 1250, reputation_score: 95 },
      { id: 2, name: 'Bob Smith', email: 'bob@vt.edu', points: 1100, reputation_score: 88 },
      { id: 3, name: 'Charlie Brown', email: 'charlie@vt.edu', points: 950, reputation_score: 82 },
      { id: 4, name: 'Diana Prince', email: 'diana@vt.edu', points: 875, reputation_score: 79 },
      { id: 5, name: 'Ethan Hunt', email: 'ethan@vt.edu', points: 720, reputation_score: 74 },
    ];
    console.log('🏆 Using mock leaderboard data');
  }

  public async openLeaderboard(): Promise<void> {
    if (this.isOpen) return;
    
    this.isOpen = true;
    console.log('🏆 Opening leaderboard...');
    
    // Fetch fresh data when opening
    await this.fetchLeaderboard();
  }

  public closeLeaderboard(): void {
    this.isOpen = false;
    console.log('🏆 Closing leaderboard');
  }

  public isLeaderboardOpen(): boolean {
    return this.isOpen;
  }

  public handleClick(mouseX: number, mouseY: number): boolean {
    // Check if click is on the leaderboard icon
    if (mouseX >= this.iconPosition.x && 
        mouseX <= this.iconPosition.x + this.iconSize &&
        mouseY >= this.iconPosition.y && 
        mouseY <= this.iconPosition.y + this.iconSize) {
      
      if (this.isOpen) {
        this.closeLeaderboard();
      } else {
        this.openLeaderboard();
      }
      return true; // Click was handled
    }

    // Check if click is on close button when leaderboard is open
    if (this.isOpen) {
      const uiWidth = 500;
      const uiHeight = 600;
      const uiX = (800 - uiWidth) / 2; // Assuming 800px canvas width
      const uiY = (600 - uiHeight) / 2; // Assuming 600px canvas height
      
      // Close button area
      if (mouseX >= uiX + uiWidth - 35 && mouseX <= uiX + uiWidth - 5 &&
          mouseY >= uiY + 5 && mouseY <= uiY + 35) {
        this.closeLeaderboard();
        return true;
      }
    }

    return false; // Click was not handled
  }

  public renderLeaderboardIcon(ctx: CanvasRenderingContext2D): void {
    const { x, y } = this.iconPosition;
    const size = this.iconSize;

    ctx.save();

    // Icon background - trophy shape
    ctx.fillStyle = '#FFD700'; // Gold color
    ctx.strokeStyle = '#B8860B'; // Darker gold for border
    ctx.lineWidth = 2;

    // Draw trophy cup
    ctx.beginPath();
    if (ctx.roundRect) {
      ctx.roundRect(x + 8, y + 8, size - 16, size - 20, 4);
    } else {
      // Fallback for browsers without roundRect support
      ctx.rect(x + 8, y + 8, size - 16, size - 20);
    }
    ctx.fill();
    ctx.stroke();

    // Draw trophy handles
    ctx.beginPath();
    ctx.arc(x + 4, y + 16, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(x + size - 4, y + 16, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Draw trophy base
    ctx.fillRect(x + 12, y + size - 12, size - 24, 8);
    ctx.strokeRect(x + 12, y + size - 12, size - 24, 8);

    // Add trophy number "1"
    ctx.fillStyle = '#8B4513'; // Brown color for text
    ctx.font = 'bold 12px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('1', x + size / 2, y + size / 2);

    // Hover effect (simple glow)
    if (this.isOpen) {
      ctx.shadowColor = '#FFD700';
      ctx.shadowBlur = 10;
      ctx.strokeStyle = '#FFD700';
      ctx.lineWidth = 3;
      ctx.strokeRect(x - 2, y - 2, size + 4, size + 4);
    }

    ctx.restore();
  }

  public renderLeaderboardUI(ctx: CanvasRenderingContext2D): void {
    if (!this.isOpen) return;

    const uiWidth = 500;
    const uiHeight = 600;
    const uiX = (ctx.canvas.width - uiWidth) / 2;
    const uiY = (ctx.canvas.height - uiHeight) / 2;

    ctx.save();
    
    // Background overlay
    ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    
    // Leaderboard UI panel
    ctx.fillStyle = '#F8F9FA';
    ctx.fillRect(uiX, uiY, uiWidth, uiHeight);
    
    // Header
    ctx.fillStyle = '#2C3E50';
    ctx.fillRect(uiX, uiY, uiWidth, 50);
    
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 20px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('🏆 Leaderboard', uiX + uiWidth / 2, uiY + 32);
    
    // Close button
    ctx.fillStyle = '#E74C3C';
    ctx.fillRect(uiX + uiWidth - 35, uiY + 5, 30, 40);
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 20px Arial';
    ctx.fillText('×', uiX + uiWidth - 20, uiY + 30);
    
    // Loading indicator
    if (this.isLoading) {
      ctx.fillStyle = '#3498DB';
      ctx.font = '16px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('🔄 Loading leaderboard...', uiX + uiWidth / 2, uiY + uiHeight / 2);
      ctx.restore();
      return;
    }

    // Render leaderboard entries
    this.renderLeaderboardEntries(ctx, uiX + 20, uiY + 70, uiWidth - 40, uiHeight - 120);
    
    // Instructions
    ctx.fillStyle = '#7F8C8D';
    ctx.font = '12px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Click the trophy icon or press L to toggle leaderboard', uiX + uiWidth / 2, uiY + uiHeight - 20);

    ctx.restore();
  }

  private renderLeaderboardEntries(ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number): void {
    if (this.leaderboardData.length === 0) {
      ctx.fillStyle = '#7F8C8D';
      ctx.font = '16px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('No leaderboard data available', x + width / 2, y + height / 2);
      return;
    }

    const entryHeight = 50;
    const maxEntries = Math.floor(height / entryHeight);
    const entriesToShow = Math.min(this.leaderboardData.length, maxEntries);

    ctx.textAlign = 'left';

    for (let i = 0; i < entriesToShow; i++) {
      const entry = this.leaderboardData[i];
      const entryY = y + i * entryHeight;

      // Entry background
      ctx.fillStyle = i % 2 === 0 ? '#FFFFFF' : '#F8F9FA';
      ctx.fillRect(x, entryY, width, entryHeight);

      // Rank background color
      let rankColor = '#95A5A6'; // Default gray
      if (i === 0) rankColor = '#FFD700'; // Gold for 1st
      else if (i === 1) rankColor = '#C0C0C0'; // Silver for 2nd
      else if (i === 2) rankColor = '#CD7F32'; // Bronze for 3rd

      // Rank circle
      ctx.fillStyle = rankColor;
      ctx.beginPath();
      ctx.arc(x + 25, entryY + 25, 15, 0, Math.PI * 2);
      ctx.fill();

      // Rank number
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 14px Arial';
      ctx.textAlign = 'center';
      ctx.fillText((i + 1).toString(), x + 25, entryY + 30);

      // Player name
      ctx.fillStyle = '#2C3E50';
      ctx.font = 'bold 16px Arial';
      ctx.textAlign = 'left';
      ctx.fillText(entry.name, x + 50, entryY + 20);

      // Points
      ctx.fillStyle = '#27AE60';
      ctx.font = '14px Arial';
      ctx.fillText(`${entry.points} pts`, x + 50, entryY + 38);

      // Reputation score
      ctx.fillStyle = '#3498DB';
      ctx.font = '12px Arial';
      ctx.textAlign = 'right';
      ctx.fillText(`Rep: ${entry.reputation_score}`, x + width - 10, entryY + 25);

      // Border
      ctx.strokeStyle = '#E5E5E5';
      ctx.lineWidth = 1;
      ctx.strokeRect(x, entryY, width, entryHeight);
    }
  }
}

export default LeaderboardManager;
