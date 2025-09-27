import { apiService } from '../services/ApiService';

export class BackendChecker {
  private static hasShownWarning = false;

  static async checkBackendConnection(): Promise<void> {
    if (this.hasShownWarning || typeof window === 'undefined') return;

    try {
      const result = await apiService.testConnection();
      
      if (!result.success) {
        this.hasShownWarning = true;
        this.showBackendWarning(result.message, result.details);
      } else {
        console.log('✅ Backend connection verified successfully');
      }
    } catch (error) {
      this.hasShownWarning = true;
      this.showBackendWarning('Failed to test backend connection', { error });
    }
  }

  private static showBackendWarning(message: string, details?: any): void {
    console.group('🚨 Backend Connection Issue');
    console.error('Message:', message);
    if (details) {
      console.error('Details:', details);
    }
    console.log('');
    console.log('🔧 How to fix:');
    console.log('1. Open a new terminal');
    console.log('2. Navigate to the backend directory: cd backend');
    console.log('3. Start the backend server: npm run dev');
    console.log('4. Make sure it says "Server started on port 8080"');
    console.log('5. Refresh this page');
    console.log('');
    console.log('💡 The fridge system will work in offline mode until the backend is connected.');
    console.groupEnd();

    // Also show a subtle notification to the user
    if (typeof window !== 'undefined') {
      this.showUserNotification();
    }
  }

  private static showUserNotification(): void {
    // Create a simple notification element
    const notification = document.createElement('div');
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: #FFF3CD;
      border: 1px solid #FFEAA7;
      border-radius: 8px;
      padding: 12px 16px;
      max-width: 300px;
      font-family: Arial, sans-serif;
      font-size: 12px;
      color: #856404;
      z-index: 10000;
      box-shadow: 0 4px 12px rgba(0,0,0,0.1);
    `;

    notification.innerHTML = `
      <div style="display: flex; align-items: start; gap: 8px;">
        <span style="font-size: 16px;">🔌</span>
        <div>
          <div style="font-weight: bold; margin-bottom: 4px;">Backend Offline</div>
          <div>Fridge data is in offline mode. Check console for setup instructions.</div>
        </div>
        <button onclick="this.parentElement.parentElement.remove()" style="
          background: none; 
          border: none; 
          font-size: 16px; 
          cursor: pointer; 
          color: #856404;
          margin-left: auto;
        ">×</button>
      </div>
    `;

    document.body.appendChild(notification);

    // Auto-remove after 10 seconds
    setTimeout(() => {
      if (notification.parentElement) {
        notification.remove();
      }
    }, 10000);
  }

  static async retryConnection(): Promise<boolean> {
    console.log('🔄 Retrying backend connection...');
    const result = await apiService.testConnection();
    
    if (result.success) {
      console.log('✅ Backend connection restored!');
      return true;
    } else {
      console.error('❌ Backend still unavailable:', result.message);
      return false;
    }
  }
}

// Auto-check on import in development
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  setTimeout(() => {
    BackendChecker.checkBackendConnection();
  }, 2000);
}
