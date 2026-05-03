import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, Router } from '@angular/router';
import { AuthService } from '../services/auth.service.ts';
import { supabase } from '../supabase.client';

type ResetStep = 'request' | 'update' | 'done';

@Component({
  selector: 'app-reset-password',
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './reset-password.html',
  styleUrl: './reset-password.css',
})
export class ResetPassword implements OnInit {

  step: ResetStep = 'request';

  // Step 1 fields
  email = '';

  // Step 2 fields
  newPassword = '';
  confirmPassword = '';
  showNewPassword = false;
  showConfirmPassword = false;

  isLoading = false;
  errorMessage = '';

  constructor(private authService: AuthService, private router: Router) { }

  ngOnInit() {
    /**
     * When user clicks the Supabase email link, they land here with
     * #access_token=...&type=recovery in the URL hash.
     * Supabase SDK automatically picks this up and creates a session.
     * We listen to that event to switch to the "update" step.
     */
    supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        this.step = 'update'; // show new-password fields
      }
    });
  }

  // ── Step 1: Request reset link ──────────────────────────────────────────────

  async onRequestReset() {
    if (!this.email) return;
    this.isLoading = true;
    this.errorMessage = '';

    try {
      await this.authService.sendPasswordResetEmail(this.email);
      this.step = 'done'; // show "check your inbox"
    } catch (err: any) {
      this.errorMessage = err.message || 'Something went wrong. Please try again.';
    } finally {
      this.isLoading = false;
    }
  }

  // ── Step 2: Update password ─────────────────────────────────────────────────

  get passwordMismatch(): boolean {
    return this.confirmPassword.length > 0 && this.newPassword !== this.confirmPassword;
  }

  async onUpdatePassword() {
    if (this.newPassword !== this.confirmPassword) {
      this.errorMessage = 'Passwords do not match.';
      return;
    }
    if (this.newPassword.length < 6) {
      this.errorMessage = 'Password must be at least 6 characters.';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    try {
      await this.authService.updatePassword(this.newPassword);
      this.router.navigate(['/login']); // ✅ redirect after success
    } catch (err: any) {
      this.errorMessage = err.message || 'Failed to update password.';
    } finally {
      this.isLoading = false;
    }
  }
}