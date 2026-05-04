import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../services/auth.service.ts';

@Component({
  selector: 'app-confirm-email',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './confirm-email.html',
  styleUrl: './confirm-email.css',
})
export class confirmEmail implements OnInit, OnDestroy {
  email = '';
  resendCooldown = 0;
  isResending = false;
  resendSuccess = false;

  private cooldownTimer: any;

  constructor(private router: Router, private authService: AuthService) { }

  ngOnInit() {
    // Router navigation state (set by signup page via router.navigate)
    const navState = this.router.getCurrentNavigation()?.extras?.state;
    this.email = navState?.['email'] || history.state?.email || '';

    // If someone navigates here directly without going through signup, redirect back
    if (!this.email) {
      this.router.navigate(['/signup']);
    }
  }

  async onResend() {
    if (this.resendCooldown > 0 || this.isResending) return;

    this.isResending = true;
    this.resendSuccess = false;

    try {
      await this.authService.resendConfirmationEmail(this.email);
      this.resendSuccess = true;
      this.startCooldown(60);
    } catch (err: any) {
      alert(err.message || 'Failed to resend. Please try again.');
    } finally {
      this.isResending = false;
    }
  }

  private startCooldown(seconds: number) {
    this.resendCooldown = seconds;
    clearInterval(this.cooldownTimer);
    this.cooldownTimer = setInterval(() => {
      this.resendCooldown--;
      if (this.resendCooldown <= 0) {
        clearInterval(this.cooldownTimer);
      }
    }, 1000);
  }

  ngOnDestroy() {
    clearInterval(this.cooldownTimer);
  }
}