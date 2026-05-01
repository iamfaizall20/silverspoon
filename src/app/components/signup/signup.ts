import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service.ts';

@Component({
  selector: 'app-signup',
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './signup.html',
  styleUrl: './signup.css',
})
export class Signup {

  constructor(private router: Router, private authservice: AuthService) { }

  fullName = '';
  email = '';
  password = '';
  confirmPassword = '';
  agreeTerms = false;
  showPassword = false;
  showConfirmPassword = false;
  isLoading = false;

  get passwordMismatch(): boolean {
    return this.confirmPassword.length > 0 && this.password !== this.confirmPassword;
  }

  get passwordStrength(): 'weak' | 'medium' | 'strong' | null {
    if (!this.password) return null;
    if (this.password.length < 6) return 'weak';
    if (this.password.length < 10 || !/[0-9]/.test(this.password)) return 'medium';
    return 'strong';
  }

  get strengthLabel(): string {
    const map = { weak: 'Weak', medium: 'Medium', strong: 'Strong' };
    return this.passwordStrength ? map[this.passwordStrength] : '';
  }

  get formValid(): boolean {
    return !!this.fullName && !!this.email && !!this.password &&
      !this.passwordMismatch && this.agreeTerms;
  }

  togglePassword() { this.showPassword = !this.showPassword; }
  toggleConfirmPassword() { this.showConfirmPassword = !this.showConfirmPassword; }

  async onSignup() {
    if (!this.formValid || this.isLoading) return;

    this.isLoading = true;

    try {
      const user = await this.authservice.signUp(
        this.email.trim(),
        this.password,
        this.fullName.trim()
      );

      alert("Signup successful 🎉");
      this.router.navigate(['/login']);

    } catch (err: any) {
      if (err.message.includes('rate limit')) {
        alert("Too many attempts. Please wait a moment ⏳");
      } else {
        alert(err.message);
      }
    } finally {
      this.isLoading = false;
    }
  }

  onGoogleSignup() { }
}
