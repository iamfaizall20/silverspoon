import { CommonModule, Location } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Navbar } from '../../components/navbar/navbar';
import { Footer } from '../../components/footer/footer';
import { ProfileService } from '../../services/profile.service.ts';

@Component({
  selector: 'app-profile',
  imports: [CommonModule, FormsModule, Navbar, Footer],
  templateUrl: './profile.html',
  styleUrl: './profile.css',
})
export class Profile {

  constructor(
    private router: Router,
    private location: Location,
    private profileService: ProfileService,
  ) { }

  // ── user ──
  user: any = null;
  loading = true;

  // ── order stats ──
  totalOrders = 0;
  totalSpent = 0;
  pendingOrders = 0;
  preparingOrders = 0;
  deliveredOrders = 0;
  cancelledOrders = 0;

  // ── change password ──
  currentPassword = '';
  newPassword = '';
  confirmPassword = '';
  showCurrent = false;
  showNew = false;
  showConfirm = false;
  changingPassword = false;
  passwordError = '';
  passwordSuccess = '';

  // ── delete account ──
  confirmDelete = false;
  deleting = false;

  // ──────────────────────────────────────
  async ngOnInit() {
    await this.loadProfile();
  }

  // ──────────────────────────────────────
  async loadProfile() {
    this.loading = true;
    try {
      const authUser = await this.profileService.getCurrentUser();

      if (!authUser) {
        this.router.navigate(['/login']);
        return;
      }

      // ── Read name from localStorage (same source as Navbar) ──
      // so the displayed name is always consistent across both components
      let nameFromStorage: string | null = null;
      try {
        const raw = localStorage.getItem('user');
        if (raw) {
          const parsed = JSON.parse(raw);
          nameFromStorage = parsed?.name?.trim() || null;
        }
      } catch { /* ignore parse errors */ }

      this.user = {
        name: nameFromStorage
          ?? authUser.user_metadata?.['full_name']
          ?? authUser.email?.split('@')[0]
          ?? 'User',
        email: authUser.email,
        phone: authUser.user_metadata?.['phone'] ?? null,
        created_at: authUser.created_at,
      };

      // Load order summary keyed by the same customer_name used when placing orders
      const summary = await this.profileService.getOrderSummary(this.user.name);
      this.totalOrders = summary.totalOrders;
      this.totalSpent = summary.totalSpent;
      this.pendingOrders = summary.pendingOrders;
      this.preparingOrders = summary.preparingOrders;
      this.deliveredOrders = summary.deliveredOrders;
      this.cancelledOrders = summary.cancelledOrders;

    } catch (err) {
      console.error('Error loading profile:', err);
    } finally {
      this.loading = false;
    }
  }

  // ──────────────────────────────────────
  goBack() {
    this.location.back();
  }

  // ──────────────────────────────────────
  async onChangePassword() {
    this.passwordError = '';
    this.passwordSuccess = '';

    if (!this.newPassword || !this.confirmPassword) {
      this.passwordError = 'Please fill in all password fields.';
      return;
    }
    if (this.newPassword !== this.confirmPassword) {
      this.passwordError = 'New passwords do not match.';
      return;
    }
    if (this.newPassword.length < 8) {
      this.passwordError = 'Password must be at least 8 characters.';
      return;
    }

    this.changingPassword = true;
    try {
      await this.profileService.changePassword(this.newPassword);
      this.passwordSuccess = 'Password updated successfully!';
      this.currentPassword = '';
      this.newPassword = '';
      this.confirmPassword = '';
      setTimeout(() => (this.passwordSuccess = ''), 5000);
    } catch (err: any) {
      this.passwordError = err?.message ?? 'Failed to update password.';
    } finally {
      this.changingPassword = false;
    }
  }

  // ──────────────────────────────────────
  onDeleteAccount() {
    this.confirmDelete = true;
  }

  async onConfirmDelete() {
    this.deleting = true;
    try {
      await this.profileService.signOut();
      localStorage.removeItem('user');   // clear same key navbar uses
      this.router.navigate(['/']);
    } catch (err: any) {
      console.error('Delete account error:', err);
      alert(err?.message ?? 'Failed to delete account. Please contact support.');
    } finally {
      this.deleting = false;
      this.confirmDelete = false;
    }
  }
}