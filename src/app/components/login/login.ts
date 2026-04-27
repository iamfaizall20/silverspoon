import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-login',
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {

  constructor(private router: Router) { }

  email = '';
  password = '';
  rememberMe = false;
  showPassword = false;
  isLoading = false;

  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  onLogin() {
    if (!this.email || !this.password) return;

    if (this.email === "admin" && this.password == "admin123") {
      this.isLoading = true;

      setTimeout(() => {
        this.isLoading = false;
        this.router.navigate(['/admin'])
      }, 2000);
    } else {
      alert("Invalid email or password");
    }
  }

  onGoogleLogin() {
    // hook up Google OAuth here
  }
}
