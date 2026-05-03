import { Injectable } from '@angular/core';
import { supabase } from '../supabase.client';

export interface UserProfile {
  name: string;
  role: 'user' | 'admin';
}

export interface StoredUser {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
  isLoggedIn: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {

  async signUp(email: string, password: string, name: string) {
    const { data, error } = await supabase.auth.signUp({ email, password });

    if (error) {
      console.error('Signup error:', error.message);
      throw error;
    }

    if (data.user) {
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: data.user.id,
          name: name,
          role: 'user',
        });

      if (profileError) {
        console.error('Profile insert error:', profileError.message);
        throw profileError;
      }
    }

    return data;
  }

  async login(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data;
  }

  async logout() {
    localStorage.removeItem('user');
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  }

  /**
   * Step 1: Send reset link to email.
   * Supabase emails a link like: yourapp.com/reset-password#access_token=...
   */
  async sendPasswordResetEmail(email: string) {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: 'http://localhost:4200/login/reset', // 🔁 change to your prod URL
    });
    if (error) throw error;
  }

  /**
   * Step 2: Called after user clicks the email link and lands back on /reset-password.
   * Supabase auto-restores the session from the URL hash — just call updateUser.
   */
  async updatePassword(newPassword: string) {
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) throw error;
  }

  /**
   * Fetches name + role from profiles table.
   */
  async getUserProfile(uid: string): Promise<UserProfile | null> {
    const { data, error } = await supabase
      .from('profiles')
      .select('name, role')
      .eq('id', uid)
      .single();

    if (error) {
      console.error('Error fetching user profile:', error.message);
      return null;
    }

    return data as UserProfile;
  }

  /**
   * Returns the currently stored user from localStorage, or null.
   */
  getStoredUser(): StoredUser | null {
    const raw = localStorage.getItem('user');
    if (!raw) return null;
    try {
      return JSON.parse(raw) as StoredUser;
    } catch {
      return null;
    }
  }

  isLoggedIn(): boolean {
    return !!this.getStoredUser()?.isLoggedIn;
  }

  isAdmin(): boolean {
    return this.getStoredUser()?.role === 'admin';
  }
}