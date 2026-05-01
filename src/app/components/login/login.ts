import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service.ts';

@Component({
  selector: 'app-login',
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {

  constructor(private router: Router, private authService: AuthService) { }

  email = '';
  password = '';
  rememberMe = false;
  showPassword = false;
  isLoading = false;

  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  async onLogin() {
    if (!this.email || !this.password || this.isLoading) return;
    this.isLoading = true;

    try {
      // 1. Sign in via Supabase Auth
      const res = await this.authService.login(this.email.trim(), this.password);
      const uid = res.user?.id;

      // 2. Fetch name from profiles table
      let name = '';
      if (uid) {
        const profile = await this.authService.getUserProfile(uid);
        name = profile?.name ?? '';
        console.log('Name from profile:', name); // ← remove after confirming
      }

      // 3. Store in localStorage
      localStorage.setItem('user', JSON.stringify({
        name,
        email: this.email.trim(),
        isLoggedIn: true,
      }));

      console.log('Stored in localStorage:', { name, email: this.email.trim(), isLoggedIn: true });

      this.router.navigate(['/']);

    } catch (err: any) {
      console.error(err);
      if (err.message?.includes('Invalid login credentials')) {
        alert('Invalid email or password ❌');
      } else {
        alert(err.message || 'Login failed');
      }
    } finally {
      this.isLoading = false;
    }
  }

  onGoogleLogin() {
    // hook up Google OAuth here
  }
}