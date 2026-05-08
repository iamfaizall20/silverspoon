import { Component, OnInit, signal } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { AuthService } from './services/auth.service.ts';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnInit {

  protected readonly title = signal('silverspoon');

  constructor(
    private authService: AuthService,
    private router: Router
  ) { }

  ngOnInit(): void {

    const user = this.authService.getStoredUser();

    if (user?.isLoggedIn) {
      if (user.role === 'admin') {

        if (!this.router.url.startsWith('/admin')) {
          this.router.navigate(['/admin']);
        }

      }

      // NORMAL USER
      else {

        // Redirect normal users to home
        if (this.router.url === '/' || this.router.url === '/login') {
          this.router.navigate(['/']);
        }

      }

    }

  }

}