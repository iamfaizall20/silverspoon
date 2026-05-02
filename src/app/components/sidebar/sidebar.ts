import { CommonModule } from '@angular/common';
import { Component, OnInit, HostListener } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { AuthService } from '../../services/auth.service.ts';

@Component({
  selector: 'app-sidebar',
  imports: [RouterLinkActive, CommonModule, RouterLink],
  templateUrl: './sidebar.html',
  styleUrls: ['./sidebar.css']
})
export class Sidebar implements OnInit {

  activeLink: string = 'dashboard';
  pendingOrders: number = 5;
  isOpen: boolean = false;

  constructor(private router: Router, private authService: AuthService) { }

  ngOnInit(): void {
    // Sync active link on initial load
    this.syncActiveLink(this.router.url);

    // Auto-close sidebar on route change (mobile nav tap)
    this.router.events
      .pipe(filter(e => e instanceof NavigationEnd))
      .subscribe((e: any) => {
        this.syncActiveLink(e.urlAfterRedirects);
        this.closeSidebar();
      });
  }

  private syncActiveLink(url: string): void {
    const segments = url.split('/');
    this.activeLink = segments[segments.length - 1] || 'dashboard';
  }

  toggleSidebar(): void {
    this.isOpen = !this.isOpen;
  }

  closeSidebar(): void {
    this.isOpen = false;
  }

  setActive(link: string): void {
    this.activeLink = link;
  }

  // Close sidebar on Escape key
  @HostListener('document:keydown.escape')
  onEscape(): void {
    this.closeSidebar();
  }

  async logout(): Promise<void> {
    try {
      await this.authService.logout();
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      this.router.navigate(['/login']);
    }
  }
}