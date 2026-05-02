import { Injectable } from '@angular/core';
import { supabase } from '../supabase.client';

@Injectable({
  providedIn: 'root',
})
export class ProfileService {

  // ─────────────────────────────────────
  // AUTH USER
  // ─────────────────────────────────────

  async getCurrentUser() {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error) throw error;
    return user;
  }

  // ─────────────────────────────────────
  // CHANGE PASSWORD
  // ─────────────────────────────────────

  async changePassword(newPassword: string) {
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) throw error;
  }

  // ─────────────────────────────────────
  // ORDER SUMMARY  (keyed by customer_name — adjust if you store email/user_id)
  // ─────────────────────────────────────

  async getOrderSummary(customerName: string) {
    const { data, error } = await supabase
      .from('orders')
      .select('id, total, status')
      .eq('customer_name', customerName);

    if (error) throw error;

    const orders = data ?? [];

    const totalOrders = orders.length;
    const totalSpent = orders.reduce((sum, o) => sum + (o.total ?? 0), 0);
    const pendingOrders = orders.filter(o => o.status === 'pending').length;
    const preparingOrders = orders.filter(o => o.status === 'preparing').length;
    const deliveredOrders = orders.filter(o => o.status === 'delivered').length;
    const cancelledOrders = orders.filter(o => o.status === 'cancelled').length;

    return {
      totalOrders,
      totalSpent,
      pendingOrders,
      preparingOrders,
      deliveredOrders,
      cancelledOrders,
    };
  }

  // ─────────────────────────────────────
  // SIGN OUT
  // ─────────────────────────────────────

  async signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  }
}