declare module 'leo-profanity' {
  const leoProfanity: {
    list(): string[];
    check(text: string): boolean;
    clean(text: string, replacement?: string): string;
    add(str: string | string[]): void;
    remove(str: string | string[]): void;
    reset(): void;
    loadDictionary(): void;
  };
  
  export default leoProfanity;
} 