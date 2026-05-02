import { CommonModule } from '@angular/common';
import { Component, OnInit, HostListener } from '@angular/core';
import { Router } from '@angular/router';

interface StoredUser {
  name: string;
  email: string;
  isLoggedIn: boolean;
}

@Component({
  selector: 'app-navbar',
  imports: [CommonModule],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css',
})
export class Navbar implements OnInit {

  user: StoredUser | null = null;
  userInitial: string = '';
  dropdownOpen: boolean = false;

  constructor(private router: Router) { }

  ngOnInit(): void {
    this.loadUserFromStorage();
  }

  private loadUserFromStorage(): void {
    try {
      const raw = localStorage.getItem('user');
      if (!raw) return;

      const parsed: StoredUser = JSON.parse(raw);

      if (parsed?.isLoggedIn && parsed?.name?.trim()) {
        this.user = parsed;
        this.userInitial = parsed.name.trim().charAt(0).toUpperCase();
      }
    } catch {
      this.user = null;
      this.userInitial = '';
    }
  }

  toggleDropdown(): void {
    this.dropdownOpen = !this.dropdownOpen;
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    if (!target.closest('.user-profile')) {
      this.dropdownOpen = false;
    }
  }

  onMyProfile(): void {
    this.dropdownOpen = false;
    this.router.navigate(['/profile']);
  }

  onMyOrders(): void {
    this.dropdownOpen = false;
    this.router.navigate(['/order/status']);
  }

  onLogout(): void {
    this.dropdownOpen = false;
    localStorage.removeItem('user');
    this.user = null;
    this.userInitial = '';
    this.router.navigate(['/login']);
  }

  onLogin(): void {
    this.router.navigate(['/login']);
  }

  onSignup(): void {
    this.router.navigate(['/signup']);
  }
}