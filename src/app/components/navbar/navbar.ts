import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-navbar',
  imports: [CommonModule],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css',
})
export class Navbar {

  constructor(private router: Router) { }

  onLogin() {
    this.router.navigate(['/login']);
  }

  onSignup() {
    this.router.navigate(['/signup']);
  }
}
