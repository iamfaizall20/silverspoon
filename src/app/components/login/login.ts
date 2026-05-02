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

      if (!uid) throw new Error('Login failed: no user returned.');

      // 2. Fetch name + role from profiles table
      const profile = await this.authService.getUserProfile(uid);

      if (!profile) throw new Error('Could not load user profile.');

      // 3. Persist full user object (including role) to localStorage
      const storedUser = {
        id: uid,
        name: profile.name,
        email: this.email.trim(),
        role: profile.role,      // ← 'user' | 'admin'
        isLoggedIn: true,
      };

      localStorage.setItem('user', JSON.stringify(storedUser));

      // 4. Role-based redirect
      if (profile.role === 'admin') {
        this.router.navigate(['/admin']);
      } else {
        this.router.navigate(['/']);
      }

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