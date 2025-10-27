import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SidebarService {

  private isCollapsedSubject = new BehaviorSubject<boolean>(false);
  public isCollapsed$: Observable<boolean> = this.isCollapsedSubject.asObservable();

  constructor() {
    const savedState = localStorage.getItem('sidebarCollapsed');
    if (savedState !== null) {
      this.isCollapsedSubject.next(JSON.parse(savedState));
    }
  }

  toggleSidebar(): void {
    const newState = !this.isCollapsedSubject.value;
    this.isCollapsedSubject.next(newState);
    localStorage.setItem('sidebarCollapsed', JSON.stringify(newState));
  }

  setSidebarState(collapsed: boolean): void {
    this.isCollapsedSubject.next(collapsed);
    localStorage.setItem('sidebarCollapsed', JSON.stringify(collapsed));
  }

  getSidebarState(): boolean {
    return this.isCollapsedSubject.value;
  }
}
