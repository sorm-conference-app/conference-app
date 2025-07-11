// Simple event emitter for React Native
class SimpleEventEmitter {
  private listeners: { [key: string]: (() => void)[] } = {};

  on(event: string, callback: () => void) {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event].push(callback);
  }

  off(event: string, callback: () => void) {
    if (this.listeners[event]) {
      this.listeners[event] = this.listeners[event].filter(cb => cb !== callback);
    }
  }

  emit(event: string) {
    if (this.listeners[event]) {
      this.listeners[event].forEach(callback => callback());
    }
  }
}

// Create a singleton event emitter instance
const surveyFlashEmitter = new SimpleEventEmitter();

// Export the emitter instance
export default surveyFlashEmitter;

// Helper function to trigger the survey flash
export const triggerSurveyFlash = () => {
  surveyFlashEmitter.emit('triggerSurveyFlash');
};

// Helper function to listen for survey flash events
export const onSurveyFlash = (callback: () => void) => {
  surveyFlashEmitter.on('triggerSurveyFlash', callback);
  
  // Return cleanup function
  return () => {
    surveyFlashEmitter.off('triggerSurveyFlash', callback);
  };
}; 