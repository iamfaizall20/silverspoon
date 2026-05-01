import { Injectable } from '@angular/core';
import { supabase } from '../supabase.client';

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
          role: 'user'
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
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  }

  /**
   * Fetches only 'name' from profiles table — matches your insert schema (id, name, role).
   * Email is not stored in profiles, so we don't select it here.
   */
  async getUserProfile(uid: string): Promise<{ name: string } | null> {
    const { data, error } = await supabase
      .from('profiles')
      .select('name')       // only select what actually exists in the table
      .eq('id', uid)
      .single();

    if (error) {
      console.error('Error fetching user profile:', error.message);
      return null;
    }

    console.log('Profile fetched:', data); // ← remove after confirming it works
    return data;
  }
}