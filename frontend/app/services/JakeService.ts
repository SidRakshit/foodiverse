export interface JakeMessage {
  message: string;
  sender: 'Player' | 'Jake';
  timestamp: string;
}

export interface JakeResponse {
  message: string;
  sender: string;
  timestamp: string;
  fallback?: boolean;
}

class JakeService {
  private baseUrl: string;
  private conversationHistory: JakeMessage[] = [];

  constructor() {
    this.baseUrl = process.env.NEXT_PUBLIC_API_URL || (typeof window !== 'undefined' && window.location.origin ? '/api' : 'http://localhost:8080');
  }

  async chatWithJake(playerMessage: string): Promise<string> {
    try {
      console.log(`🗣️ JakeService: Sending message to Jake: "${playerMessage}"`);
      console.log(`🗣️ JakeService: Using baseUrl: ${this.baseUrl}`);

      // Add player message to history
      this.conversationHistory.push({
        message: playerMessage,
        sender: 'Player',
        timestamp: new Date().toISOString()
      });

      console.log(`🗣️ JakeService: Making fetch request to ${this.baseUrl}/jake/chat`);
      const response = await fetch(`${this.baseUrl}/jake/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: playerMessage,
          conversationHistory: this.conversationHistory
        })
      });

      console.log(`🗣️ JakeService: Got response status: ${response.status}`);

      if (!response.ok) {
        console.error(`🚨 JakeService: HTTP error ${response.status}`);
        throw new Error(`HTTP ${response.status}`);
      }

      const jakeResponse: JakeResponse = await response.json();
      console.log(`🗣️ JakeService: Parsed response:`, jakeResponse);
      
      // Add Jake's response to history
      this.conversationHistory.push({
        message: jakeResponse.message,
        sender: 'Jake',
        timestamp: jakeResponse.timestamp
      });

      // Keep only last 10 messages to prevent memory issues
      if (this.conversationHistory.length > 10) {
        this.conversationHistory = this.conversationHistory.slice(-10);
      }

      console.log(`🍺 JakeService: Returning Jake's response: "${jakeResponse.message}"`);
      
      if (jakeResponse.fallback) {
        console.warn('⚠️ Jake used fallback response (Gemini may be unavailable)');
      }

      return jakeResponse.message;

    } catch (error) {
      console.error('Error chatting with Jake:', error);
      
      // Local fallback if backend is completely unavailable
      const localFallbacks = [
        "Hey there! Sorry, I'm having trouble hearing you over the crowd.",
        "Welcome to the bar! What can I get you, Hokie?",
        "Go Hokies! Sorry, what did you say?",
        "Hey! Good to see you. Mind saying that again?",
        "Sorry about that - the music's pretty loud in here!"
      ];
      
      return localFallbacks[Math.floor(Math.random() * localFallbacks.length)];
    }
  }

  // Clear conversation history (useful for testing)
  clearHistory(): void {
    this.conversationHistory = [];
    console.log('🧹 Cleared Jake conversation history');
  }

  // Get conversation history (useful for debugging)
  getHistory(): JakeMessage[] {
    return [...this.conversationHistory];
  }

  // Check if Jake service is available
  async isAvailable(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/jake/status`);
      return response.ok;
    } catch {
      return false;
    }
  }
}

// Singleton instance
export const jakeService = new JakeService();
export default JakeService;
