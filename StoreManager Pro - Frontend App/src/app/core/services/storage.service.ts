import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class StorageService {

  constructor() { }

  // LocalStorage methods
  setItem(key: string, value: any): void {
    try {
      const serializedValue = JSON.stringify(value);
      localStorage.setItem(key, serializedValue);
    } catch (error) {
      console.error('Error saving to localStorage:', error);
    }
  }

  getItem<T>(key: string): T | null {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch (error) {
      console.error('Error reading from localStorage:', error);
      return null;
    }
  }

  removeItem(key: string): void {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error('Error removing from localStorage:', error);
    }
  }

  clear(): void {
    try {
      localStorage.clear();
    } catch (error) {
      console.error('Error clearing localStorage:', error);
    }
  }

  // SessionStorage methods
  setSessionItem(key: string, value: any): void {
    try {
      const serializedValue = JSON.stringify(value);
      sessionStorage.setItem(key, serializedValue);
    } catch (error) {
      console.error('Error saving to sessionStorage:', error);
    }
  }

  getSessionItem<T>(key: string): T | null {
    try {
      const item = sessionStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch (error) {
      console.error('Error reading from sessionStorage:', error);
      return null;
    }
  }

  removeSessionItem(key: string): void {
    try {
      sessionStorage.removeItem(key);
    } catch (error) {
      console.error('Error removing from sessionStorage:', error);
    }
  }

  clearSession(): void {
    try {
      sessionStorage.clear();
    } catch (error) {
      console.error('Error clearing sessionStorage:', error);
    }
  }

  // Utility methods
  exists(key: string): boolean {
    return localStorage.getItem(key) !== null;
  }

  sessionExists(key: string): boolean {
    return sessionStorage.getItem(key) !== null;
  }

  // Auth specific methods
  setAuthToken(token: string): void {
    this.setItem('authToken', token);
  }

  getAuthToken(): string | null {
    return this.getItem<string>('authToken');
  }

  removeAuthToken(): void {
    this.removeItem('authToken');
  }

  setUserData(user: any): void {
    this.setItem('userData', user);
  }

  getUserData<T>(): T | null {
    return this.getItem<T>('userData');
  }

  removeUserData(): void {
    this.removeItem('userData');
  }

  // App settings
  setAppSettings(settings: any): void {
    this.setItem('appSettings', settings);
  }

  getAppSettings<T>(): T | null {
    return this.getItem<T>('appSettings');
  }

  // Theme
  setTheme(theme: string): void {
    this.setItem('theme', theme);
  }

  getTheme(): string | null {
    return this.getItem<string>('theme');
  }

  // Language
  setLanguage(language: string): void {
    this.setItem('language', language);
  }

  getLanguage(): string | null {
    return this.getItem<string>('language');
  }
}