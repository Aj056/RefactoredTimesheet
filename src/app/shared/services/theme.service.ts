import { Injectable, signal, effect } from '@angular/core';

export type Theme = 'light' | 'dark';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly THEME_KEY = 'app-theme';
  
  // Get initial theme from localStorage or default to light
  private readonly initialTheme: Theme = 
    (localStorage.getItem(this.THEME_KEY) as Theme) || 'light';
  
  // Current theme signal
  readonly currentTheme = signal<Theme>(this.initialTheme);
  
  // Computed property for easy access
  readonly isDark = signal(this.currentTheme() === 'dark');
  
  constructor() {
    // Apply theme on initialization
    this.applyTheme(this.currentTheme());
    
    // Watch for theme changes and apply them
    effect(() => {
      const theme = this.currentTheme();
      this.applyTheme(theme);
      this.isDark.set(theme === 'dark');
    }, { allowSignalWrites: true });
  }
  
  toggleTheme(): void {
    const newTheme: Theme = this.currentTheme() === 'light' ? 'dark' : 'light';
    this.setTheme(newTheme);
  }
  
  setTheme(theme: Theme): void {
    this.currentTheme.set(theme);
    localStorage.setItem(this.THEME_KEY, theme);
  }
  
  private applyTheme(theme: Theme): void {
    const root = document.documentElement;
    
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }
}
