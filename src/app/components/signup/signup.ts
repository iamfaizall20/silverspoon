import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-signup',
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './signup.html',
  styleUrl: './signup.css',
})
export class Signup {

  constructor(private router: Router) { }


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

  onSignup() {
    if (!this.formValid) return;

    const user: any = {
      username: this.fullName,
      email: this.email,
      password: this.password
    }

    localStorage.setItem('user', JSON.stringify(user));

    this.isLoading = true;
    setTimeout(() => {
      this.isLoading = false
      this.router.navigate(['/login']);
    }, 1000);

  }

  onGoogleSignup() { }
}
