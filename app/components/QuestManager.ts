interface Quest {
  id: string;
  title: string;
  description: string;
  type: 'claim_expiring' | 'claim_items' | 'visit_locations' | 'chat_npcs' | 'add_items';
  target: number;
  current: number;
  points: number;
  completed: boolean;
  timeLimit?: number; // in hours
}

interface QuestSet {
  quests: Quest[];
  generatedAt: number;
  expiresAt: number;
}

class QuestManager {
  private static instance: QuestManager | null = null;
  private currentQuestSet: QuestSet | null = null;
  private isOpen: boolean = false;
  private iconPosition: { x: number; y: number } = { x: 0, y: 0 };
  private iconSize: number = 40;
  private selectedQuestIndex: number = 0;

  private constructor() {
    this.setupIconPosition();
    this.initializeQuests();
  }

  public static getInstance(): QuestManager {
    if (!QuestManager.instance) {
      QuestManager.instance = new QuestManager();
    }
    return QuestManager.instance;
  }

  private setupIconPosition(): void {
    // Position icon under the leaderboard icon
    this.iconPosition = { x: 750, y: 60 }; // 50px below leaderboard icon
  }

  private initializeQuests(): void {
    const now = Date.now();
    
    // Check if we have existing quests that haven't expired
    const saved = localStorage.getItem('foodiverse_quests');
    if (saved) {
      try {
        const questSet: QuestSet = JSON.parse(saved);
        if (now < questSet.expiresAt) {
          this.currentQuestSet = questSet;
          console.log('📜 Loaded existing quest set');
          return;
        }
      } catch (error) {
        console.error('📜 Error loading saved quests:', error);
      }
    }

    // Generate new quest set
    this.generateNewQuests();
  }

  private generateNewQuests(): void {
    const now = Date.now();
    const questTemplates = [
      {
        type: 'claim_expiring' as const,
        title: 'Food Saver',
        description: 'Claim {target} items that expire within 24 hours',
        target: 3,
        points: 150,
        timeLimit: 24
      },
      {
        type: 'claim_items' as const,
        title: 'Community Helper',
        description: 'Claim {target} items from any fridge',
        target: 5,
        points: 100,
        timeLimit: 48
      },
      {
        type: 'add_items' as const,
        title: 'Generous Sharer',
        description: 'Add {target} items to fridges',
        target: 4,
        points: 120,
        timeLimit: 36
      },
      {
        type: 'visit_locations' as const,
        title: 'Explorer',
        description: 'Visit {target} different apartments',
        target: 3,
        points: 80,
        timeLimit: 72
      },
      {
        type: 'chat_npcs' as const,
        title: 'Social Butterfly',
        description: 'Chat with {target} different NPCs',
        target: 2,
        points: 60,
        timeLimit: 48
      }
    ];

    // Randomly select 3 quests
    const shuffled = [...questTemplates].sort(() => Math.random() - 0.5);
    const selectedTemplates = shuffled.slice(0, 3);

    const quests: Quest[] = selectedTemplates.map((template, index) => ({
      id: `quest_${now}_${index}`,
      title: template.title,
      description: template.description.replace('{target}', template.target.toString()),
      type: template.type,
      target: template.target,
      current: 0,
      points: template.points,
      completed: false,
      timeLimit: template.timeLimit
    }));

    this.currentQuestSet = {
      quests,
      generatedAt: now,
      expiresAt: now + (8 * 60 * 60 * 1000) // 8 hours from now
    };

    this.saveQuests();
    console.log('📜 Generated new quest set:', quests.length, 'quests');
  }

  private saveQuests(): void {
    if (this.currentQuestSet) {
      localStorage.setItem('foodiverse_quests', JSON.stringify(this.currentQuestSet));
    }
  }

  public updateQuestProgress(type: Quest['type'], amount: number = 1): void {
    if (!this.currentQuestSet) return;

    let progressMade = false;
    for (const quest of this.currentQuestSet.quests) {
      if (quest.type === type && !quest.completed) {
        quest.current = Math.min(quest.current + amount, quest.target);
        if (quest.current >= quest.target) {
          quest.completed = true;
          console.log(`🎉 Quest completed: ${quest.title} (+${quest.points} points)`);
          // Here you could add points to player's score via API
        }
        progressMade = true;
      }
    }

    if (progressMade) {
      this.saveQuests();
      this.checkAllQuestsCompleted();
    }
  }

  private checkAllQuestsCompleted(): void {
    if (!this.currentQuestSet) return;

    const allCompleted = this.currentQuestSet.quests.every(q => q.completed);
    if (allCompleted) {
      console.log('🎊 All quests completed! Generating new quest set...');
      setTimeout(() => {
        this.generateNewQuests();
      }, 2000); // Wait 2 seconds before refreshing
    }
  }

  public checkQuestExpiration(): void {
    if (!this.currentQuestSet) return;

    const now = Date.now();
    if (now >= this.currentQuestSet.expiresAt) {
      console.log('⏰ Quests expired, generating new set...');
      this.generateNewQuests();
    }
  }

  public getQuests(): Quest[] {
    return this.currentQuestSet?.quests || [];
  }

  public getTotalPoints(): number {
    if (!this.currentQuestSet) return 0;
    return this.currentQuestSet.quests
      .filter(q => q.completed)
      .reduce((sum, q) => sum + q.points, 0);
  }

  public getTimeUntilRefresh(): string {
    if (!this.currentQuestSet) return '0h 0m';
    
    const now = Date.now();
    const timeLeft = this.currentQuestSet.expiresAt - now;
    
    if (timeLeft <= 0) return '0h 0m';
    
    const hours = Math.floor(timeLeft / (60 * 60 * 1000));
    const minutes = Math.floor((timeLeft % (60 * 60 * 1000)) / (60 * 1000));
    
    return `${hours}h ${minutes}m`;
  }

  public handleClick(mouseX: number, mouseY: number): boolean {
    // Check if click is on the quest icon
    if (mouseX >= this.iconPosition.x && 
        mouseX <= this.iconPosition.x + this.iconSize &&
        mouseY >= this.iconPosition.y && 
        mouseY <= this.iconPosition.y + this.iconSize) {
      
      if (this.isOpen) {
        this.closeQuests();
      } else {
        this.openQuests();
      }
      return true; // Click was handled
    }

    // Check if click is on close button when quest UI is open
    if (this.isOpen) {
      const uiWidth = 600;
      const uiHeight = 500;
      const uiX = (800 - uiWidth) / 2;
      const uiY = (600 - uiHeight) / 2;
      
      // Close button area
      if (mouseX >= uiX + uiWidth - 35 && mouseX <= uiX + uiWidth - 5 &&
          mouseY >= uiY + 5 && mouseY <= uiY + 35) {
        this.closeQuests();
        return true;
      }
    }

    return false; // Click was not handled
  }

  public handleKeyInput(key: string): boolean {
    if (key === 'KeyQ') {
      if (this.isOpen) {
        this.closeQuests();
      } else {
        this.openQuests();
      }
      return true;
    }

    if (this.isOpen) {
      if (key === 'ArrowUp' || key === 'KeyW') {
        this.selectPreviousQuest();
        return true;
      }
      if (key === 'ArrowDown' || key === 'KeyS') {
        this.selectNextQuest();
        return true;
      }
      if (key === 'Escape') {
        this.closeQuests();
        return true;
      }
    }

    return false;
  }

  private selectPreviousQuest(): void {
    const quests = this.getQuests();
    if (quests.length > 0) {
      this.selectedQuestIndex = (this.selectedQuestIndex - 1 + quests.length) % quests.length;
    }
  }

  private selectNextQuest(): void {
    const quests = this.getQuests();
    if (quests.length > 0) {
      this.selectedQuestIndex = (this.selectedQuestIndex + 1) % quests.length;
    }
  }

  public openQuests(): void {
    if (this.isOpen) return;
    
    this.isOpen = true;
    this.checkQuestExpiration(); // Check for expiration when opening
    console.log('📜 Opening quest log...');
  }

  public closeQuests(): void {
    this.isOpen = false;
    console.log('📜 Closing quest log');
  }

  public isQuestUIOpen(): boolean {
    return this.isOpen;
  }

  public renderQuestIcon(ctx: CanvasRenderingContext2D): void {
    const { x, y } = this.iconPosition;
    const size = this.iconSize;

    ctx.save();

    // Icon background - scroll/parchment shape
    ctx.fillStyle = '#F4E4BC'; // Parchment color
    ctx.strokeStyle = '#8B4513'; // Brown border
    ctx.lineWidth = 2;

    // Draw parchment background
    ctx.fillRect(x + 4, y + 2, size - 8, size - 4);
    ctx.strokeRect(x + 4, y + 2, size - 8, size - 4);

    // Draw scroll curls at top and bottom
    ctx.beginPath();
    ctx.arc(x + size / 2, y + 4, 6, 0, Math.PI * 2);
    ctx.fillStyle = '#DDD1AA';
    ctx.fill();
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(x + size / 2, y + size - 4, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Add quest lines
    ctx.strokeStyle = '#8B4513';
    ctx.lineWidth = 1;
    for (let i = 0; i < 3; i++) {
      const lineY = y + 12 + (i * 6);
      ctx.beginPath();
      ctx.moveTo(x + 8, lineY);
      ctx.lineTo(x + size - 8, lineY);
      ctx.stroke();
    }

    // Add quest completion indicator
    const quests = this.getQuests();
    const completedQuests = quests.filter(q => q.completed).length;
    
    ctx.fillStyle = '#27AE60'; // Green for completion
    ctx.font = 'bold 10px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(`${completedQuests}/3`, x + size / 2, y + size - 8);

    // Hover effect
    if (this.isOpen) {
      ctx.shadowColor = '#F4E4BC';
      ctx.shadowBlur = 8;
      ctx.strokeStyle = '#DAA520';
      ctx.lineWidth = 3;
      ctx.strokeRect(x - 2, y - 2, size + 4, size + 4);
    }

    ctx.restore();
  }

  public renderQuestUI(ctx: CanvasRenderingContext2D): void {
    if (!this.isOpen) return;

    const uiWidth = 600;
    const uiHeight = 500;
    const uiX = (ctx.canvas.width - uiWidth) / 2;
    const uiY = (ctx.canvas.height - uiHeight) / 2;

    ctx.save();
    
    // Background overlay
    ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    
    // Quest UI panel - parchment style
    ctx.fillStyle = '#F4E4BC';
    ctx.fillRect(uiX, uiY, uiWidth, uiHeight);
    
    // Add parchment texture border
    ctx.strokeStyle = '#8B4513';
    ctx.lineWidth = 3;
    ctx.strokeRect(uiX, uiY, uiWidth, uiHeight);
    
    // Header
    ctx.fillStyle = '#8B4513';
    ctx.fillRect(uiX, uiY, uiWidth, 60);
    
    ctx.fillStyle = '#F4E4BC';
    ctx.font = 'bold 24px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('📜 Quest Log', uiX + uiWidth / 2, uiY + 38);
    
    // Close button
    ctx.fillStyle = '#E74C3C';
    ctx.fillRect(uiX + uiWidth - 40, uiY + 10, 30, 40);
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 20px Arial';
    ctx.fillText('×', uiX + uiWidth - 25, uiY + 35);

    // Time until refresh
    ctx.fillStyle = '#666';
    ctx.font = '12px Arial';
    ctx.textAlign = 'right';
    ctx.fillText(`Refreshes in: ${this.getTimeUntilRefresh()}`, uiX + uiWidth - 50, uiY + 80);

    // Render quest list
    this.renderQuestList(ctx, uiX + 20, uiY + 90, uiWidth - 40, uiHeight - 140);
    
    // Instructions
    ctx.fillStyle = '#8B4513';
    ctx.font = '12px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Click the scroll icon or press Q to toggle quests • ↑↓ to navigate', uiX + uiWidth / 2, uiY + uiHeight - 20);

    ctx.restore();
  }

  private renderQuestList(ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number): void {
    const quests = this.getQuests();
    
    if (quests.length === 0) {
      ctx.fillStyle = '#8B4513';
      ctx.font = '16px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('Generating new quests...', x + width / 2, y + height / 2);
      return;
    }

    const questHeight = 120;
    const spacing = 10;

    for (let i = 0; i < quests.length; i++) {
      const quest = quests[i];
      const questY = y + i * (questHeight + spacing);

      // Quest background
      ctx.fillStyle = i === this.selectedQuestIndex ? '#F0E68C' : '#E8DCC0';
      if (quest.completed) {
        ctx.fillStyle = '#D4F4DD'; // Light green for completed
      }
      ctx.fillRect(x, questY, width, questHeight);

      // Quest border
      ctx.strokeStyle = quest.completed ? '#27AE60' : '#8B4513';
      ctx.lineWidth = quest.completed ? 3 : 2;
      ctx.strokeRect(x, questY, width, questHeight);

      // Quest title
      ctx.fillStyle = quest.completed ? '#27AE60' : '#8B4513';
      ctx.font = 'bold 18px Arial';
      ctx.textAlign = 'left';
      ctx.fillText(quest.title, x + 15, questY + 25);

      // Quest points
      ctx.fillStyle = '#DAA520';
      ctx.font = 'bold 14px Arial';
      ctx.textAlign = 'right';
      ctx.fillText(`${quest.points} pts`, x + width - 15, questY + 25);

      // Quest description
      ctx.fillStyle = '#5D4E37';
      ctx.font = '14px Arial';
      ctx.textAlign = 'left';
      ctx.fillText(quest.description, x + 15, questY + 50);

      // Progress bar
      this.renderProgressBar(ctx, quest, x + 15, questY + 70, width - 30, 20);

      // Progress text
      ctx.fillStyle = '#8B4513';
      ctx.font = '12px Arial';
      ctx.textAlign = 'center';
      const progressText = quest.completed ? 'COMPLETED!' : `${quest.current}/${quest.target}`;
      ctx.fillText(progressText, x + width / 2, questY + 105);

      // Completion checkmark
      if (quest.completed) {
        ctx.fillStyle = '#27AE60';
        ctx.font = 'bold 20px Arial';
        ctx.textAlign = 'right';
        ctx.fillText('✓', x + width - 15, questY + 50);
      }
    }
  }

  private renderProgressBar(ctx: CanvasRenderingContext2D, quest: Quest, x: number, y: number, width: number, height: number): void {
    // Progress bar background
    ctx.fillStyle = '#DDD';
    ctx.fillRect(x, y, width, height);
    
    // Progress bar border
    ctx.strokeStyle = '#8B4513';
    ctx.lineWidth = 1;
    ctx.strokeRect(x, y, width, height);

    // Progress fill
    if (quest.target > 0) {
      const progressWidth = (quest.current / quest.target) * width;
      ctx.fillStyle = quest.completed ? '#27AE60' : '#3498DB';
      ctx.fillRect(x, y, progressWidth, height);
    }

    // Progress bar shine effect
    const gradient = ctx.createLinearGradient(x, y, x, y + height);
    gradient.addColorStop(0, 'rgba(255, 255, 255, 0.3)');
    gradient.addColorStop(0.5, 'rgba(255, 255, 255, 0.1)');
    gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
    
    ctx.fillStyle = gradient;
    const progressWidth = quest.target > 0 ? (quest.current / quest.target) * width : 0;
    ctx.fillRect(x, y, progressWidth, height);
  }

  // Methods for game integration
  public onItemClaimed(isExpiring: boolean = false): void {
    this.updateQuestProgress('claim_items');
    if (isExpiring) {
      this.updateQuestProgress('claim_expiring');
    }
  }

  public onItemAdded(): void {
    this.updateQuestProgress('add_items');
  }

  public onLocationVisited(): void {
    this.updateQuestProgress('visit_locations');
  }

  public onNPCChatted(): void {
    this.updateQuestProgress('chat_npcs');
  }

  // Force refresh for testing
  public forceRefresh(): void {
    this.generateNewQuests();
    console.log('📜 Quest set manually refreshed');
  }
}

export default QuestManager;
