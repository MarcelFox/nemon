import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class LocalStorageService {

  constructor() { }

  public set(key: string, value: string): void {
    localStorage.setItem(key, value)
  }

  public setAndGet(key:string, value: string): string {
    this.set(key, value);
    return localStorage.getItem(key) as string;
  }

  public get(key: string): string | null {
    return localStorage.getItem(key)
  }

  public update(key: string, value: string): void {
    this.set(key, value)
  }
  public updateAndGet(key: string, value: string): string {
    return this.setAndGet(key, value)
  }

  public delete(key: string): void {
    localStorage.removeItem(key)
  }
}
