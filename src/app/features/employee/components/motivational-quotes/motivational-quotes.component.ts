import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { 
  CardComponent, 
  ReusableButtonComponent, 
} from '../../../../shared/components';

interface Quote {
  Quote: string;
  Author: string;
  Tags: string;
  ID: number;
}

@Component({
  selector: 'app-motivational-quotes',
  standalone: true,
  imports: [CommonModule, CardComponent, ReusableButtonComponent],
  template: `
    <app-card class="relative overflow-hidden hover:shadow-lg transition-all duration-300">
      <!-- Background decoration -->
      <div class="absolute inset-0 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-blue-900/10 dark:via-indigo-900/10 dark:to-purple-900/10 transition-colors"></div>
      <div class="absolute top-0 right-0 w-24 sm:w-32 h-24 sm:h-32 bg-blue-100 dark:bg-blue-800/10 rounded-full -translate-y-12 sm:-translate-y-16 translate-x-12 sm:translate-x-16 opacity-30 dark:opacity-20"></div>
      <div class="absolute bottom-0 left-0 w-16 sm:w-20 h-16 sm:h-20 bg-purple-100 dark:bg-purple-800/10 rounded-full translate-y-8 sm:translate-y-10 -translate-x-8 sm:-translate-x-10 opacity-30 dark:opacity-20"></div>
      
      <!-- Content -->
      <div class="relative z-10 p-4 sm:p-6">
        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-3 sm:gap-0">
          <div class="flex items-center space-x-2 sm:space-x-3">
            <div class="p-1.5 sm:p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg shadow-sm">
              <svg class="w-4 h-4 sm:w-5 sm:h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <h3 class="text-base sm:text-lg font-semibold text-gray-900 dark:text-white transition-colors">Daily Motivation</h3>
          </div>
          
          <div class="flex gap-2">
            <app-reusable-button
              text="New Quote"
              variant="secondary"
              size="sm"
              icon="refresh"
              [disabled]="isLoading()"
              (click)="refreshQuote()" />
          </div>
        </div>

        @if (isLoading()) {
          <div class="flex items-center justify-center py-6 sm:py-8">
            <div class="animate-spin rounded-full h-5 w-5 sm:h-6 sm:w-6 border-b-2 border-blue-600 dark:border-blue-400"></div>
            <span class="ml-2 text-sm text-gray-600 dark:text-gray-400 transition-colors">Loading inspiration...</span>
          </div>
        } @else if (currentQuote()) {
          <div class="space-y-3 sm:space-y-4">
            <!-- Quote mark -->
            <div class="text-3xl sm:text-4xl text-blue-600 dark:text-blue-400 font-serif leading-none transition-colors">"</div>
            
            <!-- Quote content -->
            <blockquote class="text-gray-700 dark:text-gray-300 text-base sm:text-lg leading-relaxed italic -mt-2 sm:-mt-3 transition-colors">
              {{ currentQuote()!.Quote }}
            </blockquote>
            
            <!-- Author -->
            <div class="flex items-center space-x-2 pt-1 sm:pt-2">
              <div class="w-6 sm:w-8 h-px bg-gradient-to-r from-blue-500 to-purple-600"></div>
              <cite class="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400 not-italic transition-colors">
                {{ currentQuote()!.Author }}
              </cite>
            </div>
            
            <!-- Tags and ID (if available) -->
            @if (currentQuote()!.Tags) {
              <div class="text-xs text-gray-500 dark:text-gray-400 mt-2 transition-colors">
                <div class="mb-1">Tags: {{ currentQuote()!.Tags }}</div>
                <div class="text-gray-400 dark:text-gray-500">ID: {{ currentQuote()!.ID }}</div>
              </div>
            } @else {
              <div class="text-xs text-gray-400 dark:text-gray-500 mt-2 transition-colors">
                ID: {{ currentQuote()!.ID }}
              </div>
            }
          </div>
        } @else if (error()) {
          <div class="text-center py-4 sm:py-6">
            <div class="text-red-500 dark:text-red-400 mb-2 transition-colors">
              <svg class="w-6 h-6 sm:w-8 sm:h-8 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p class="text-sm text-gray-500 dark:text-gray-400 mb-3 transition-colors">Unable to load quote</p>
            <app-reusable-button
              text="Try Again"
              variant="primary"
              size="sm"
              (click)="refreshQuote()" />
          </div>
        }
      </div>
    </app-card>
  `,
  styles: [`
    :host {
      display: block;
    }
  `]
})
export class MotivationalQuotesComponent implements OnInit {
  private readonly http = inject(HttpClient);

  readonly isLoading = signal(false);
  readonly currentQuote = signal<Quote | null>(null);
  readonly error = signal(false);

  // Fallback quotes in case API fails - keeping only last 10 quotes
  private readonly fallbackQuotes: Quote[] = [
    {
      Quote: "The way to get started is to quit talking and begin doing.",
      Author: "Walt Disney",
      Tags: "motivation, action, success, leadership",
      ID: 1
    },
    {
      Quote: "Innovation distinguishes between a leader and a follower.",
      Author: "Steve Jobs",
      Tags: "innovation, leadership, business, technology",
      ID: 2
    },
    {
      Quote: "Your work is going to fill a large part of your life, and the only way to be truly satisfied is to do what you believe is great work.",
      Author: "Steve Jobs",
      Tags: "work, satisfaction, passion, career",
      ID: 3
    },
    {
      Quote: "Success is not final, failure is not fatal: it is the courage to continue that counts.",
      Author: "Winston Churchill",
      Tags: "success, failure, courage, persistence",
      ID: 4
    },
    {
      Quote: "The only way to do great work is to love what you do.",
      Author: "Steve Jobs",
      Tags: "work, passion, love, greatness",
      ID: 5
    },
    {
      Quote: "Believe you can and you're halfway there.",
      Author: "Theodore Roosevelt",
      Tags: "belief, confidence, motivation, success",
      ID: 6
    },
    {
      Quote: "Don't watch the clock; do what it does. Keep going.",
      Author: "Sam Levenson",
      Tags: "persistence, time, motivation, work",
      ID: 7
    },
    {
      Quote: "The future depends on what you do today.",
      Author: "Mahatma Gandhi",
      Tags: "future, action, responsibility, today",
      ID: 8
    },
    {
      Quote: "Every great soul was inspired by another great soul.",
      Author: "Lailah Gifty Akita",
      Tags: "believe, deeds, encouragement, good-thoughts, great, great-expectations, great-men, inspirational, inspired, life, motivation, sharing-life, soul, spiritual-life, wisdom-of-lailah-gifty-akita, wise",
      ID: 9
    },
    {
      Quote: "Excellence is not a skill, it's an attitude.",
      Author: "Ralph Marston",
      Tags: "excellence, attitude, mindset, success, quality",
      ID: 10
    }
  ];  ngOnInit(): void {
    this.loadQuote();
  }

  refreshQuote(): void {
    this.loadQuote();
  }

  // Method to test API response directly
  testApiResponse(): void {
    console.log('Testing thequoteshub.com API...');
    
    this.http.get('https://thequoteshub.com/api/random', {
      responseType: 'text'
    }).subscribe({
      next: (response) => {
        console.log('Raw API Response:');
        console.log('Type:', typeof response);
        console.log('Content:', response);
        
        if (response.includes('<html>')) {
          console.log('❌ Response is HTML, not JSON');
        } else {
          try {
            const parsed = JSON.parse(response);
            console.log('✅ Parsed JSON:', parsed);
          } catch (e) {
            console.log('❌ Failed to parse as JSON:', e);
          }
        }
      },
      error: (error) => {
        console.error('❌ API Error:', error);
      }
    });
  }

  private loadQuote() {
    this.isLoading.set(true);
    this.error.set(false);

    // Try different endpoints and approaches for thequoteshub.com
    const endpoints = [
      'https://thequoteshub.com/api/random-quote',
      'https://thequoteshub.com/api/quotes/random', 
      'https://thequoteshub.com/api/random',
      // Try with CORS proxy if direct access fails
      'https://cors-anywhere.herokuapp.com/https://thequoteshub.com/api/random'
    ];

    this.tryApiEndpoints(endpoints, 0);
  }

  private tryApiEndpoints(endpoints: string[], index: number) {
    if (index >= endpoints.length) {
      // All endpoints failed, use fallback
      console.warn('All API endpoints failed, using fallback quotes');
      this.useFallbackQuote();
      return;
    }

    const endpoint = endpoints[index];
    console.log(`Trying endpoint: ${endpoint}`);

    this.http.get(endpoint, {
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      responseType: 'text' // Get as text first to check if it's HTML
    }).subscribe({
      next: (response) => {
        console.log(`Response from ${endpoint}:`, response);
        
        // Check if response is HTML
        if (response.includes('<html>') || response.includes('<!DOCTYPE')) {
          console.warn(`${endpoint} returned HTML, trying next endpoint`);
          this.tryApiEndpoints(endpoints, index + 1);
          return;
        }

        // Try to parse as JSON
        try {
          const jsonResponse = JSON.parse(response);
          this.handleJsonResponse(jsonResponse);
        } catch (parseError) {
          console.error(`Failed to parse JSON from ${endpoint}:`, parseError);
          this.tryApiEndpoints(endpoints, index + 1);
        }
      },
      error: (error) => {
        console.error(`Error from ${endpoint}:`, error);
        this.tryApiEndpoints(endpoints, index + 1);
      }
    });
  }

  private handleJsonResponse(response: any) {
    this.isLoading.set(false);
    
    // Try to extract quote data from various possible response formats
    const quote: Quote = {
      Quote: response.content || response.quote || response.text || response.Quote || '',
      Author: response.author || response.authorName || response.Author || '',
      Tags: response.tags || response.category || response.Tags || 'motivation, inspiration',
      ID: response.id || response._id || response.ID || Math.floor(Math.random() * 100000)
    };

    if (quote.Quote && quote.Author) {
      this.currentQuote.set(quote);
      this.error.set(false);
      console.log('Successfully loaded quote:', quote);
    } else {
      console.warn('Quote data incomplete:', quote);
      this.useFallbackQuote();
    }
  }
  private useFallbackQuote(): void {
    const randomIndex = Math.floor(Math.random() * this.fallbackQuotes.length);
    this.currentQuote.set(this.fallbackQuotes[randomIndex]);
    this.error.set(false);
    this.isLoading.set(false);
  }
}
