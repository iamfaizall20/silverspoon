import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-sidebar',
  imports: [RouterLinkActive, CommonModule, RouterLink],
  templateUrl: './sidebar.html',
  styleUrls: ['./sidebar.css']
})
export class Sidebar implements OnInit {

  activeLink: string = 'dashboard';

  // Example: replace with real service call
  pendingOrders: number = 5;

  constructor(private router: Router) { }

  ngOnInit(): void {
    // Sync active link with current route on load
    const url = this.router.url;
    const segments = url.split('/');
    this.activeLink = segments[segments.length - 1] || 'dashboard';
  }

  setActive(link: string): void {
    this.activeLink = link;
  }

  logout(): void {
    // Clear session/token here, e.g.:
    // localStorage.removeItem('token');
    // this.authService.logout();
    this.router.navigate(['/login']);
  }
}