import { Injectable } from '@angular/core';
import { supabase } from '../supabase.client';

@Injectable({
  providedIn: 'root',
})
export class MenuService {

  // ─────────────────────────────────────
  // CUPS  (DB columns: id, name, scoops, price, is_active, category)
  // category values: 'cup' | 'pack'
  // ─────────────────────────────────────

  async getCups() {
    const { data, error } = await supabase
      .from('items')
      .select('*')
      .order('id', { ascending: true });

    if (error) throw error;
    return data;
  }

  async insertCup(cup: { name: string; scoops: number; price: number; is_active: boolean; category: 'cup' | 'pack' }) {
    const { data, error } = await supabase
      .from('items')
      .insert([{ id: crypto.randomUUID(), ...cup }])
      .select()
      .single();

    if (error) {
      console.error('Error inserting item:', error);
      alert('Error while adding item');
      throw error;
    }
    return data;
  }

  async updateCup(
    id: string | number,
    updates: { name?: string; scoops?: number; price?: number; is_active?: boolean; category?: 'cup' | 'pack' }
  ) {
    const { data, error } = await supabase
      .from('items')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating item:', error);
      alert('Error while updating item');
      throw error;
    }
    return data;
  }

  async deleteCup(id: string | number) {
    const { error } = await supabase
      .from('items')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting item:', error);
      alert('Error while deleting item');
      throw error;
    }
  }

  async toggleCupAvailable(id: string | number, is_active: boolean) {
    const { data, error } = await supabase
      .from('items')
      .update({ is_active })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error toggling item availability:', error);
      throw error;
    }
    return data;
  }

  // ─────────────────────────────────────
  // FLAVOURS  (DB columns: id, name, color, is_active)
  // ─────────────────────────────────────

  async getFlavours() {
    const { data, error } = await supabase
      .from('flavours')
      .select('*');

    if (error) throw error;
    return data;
  }

  async insertFlavour(flavour: { name: string; color: string; is_active?: boolean }) {
    const { data, error } = await supabase
      .from('flavours')
      .insert([flavour])
      .select()
      .single();

    if (error) {
      console.error('Error inserting flavour:', error);
      alert('Error while adding flavour');
      throw error;
    }
    return data;
  }

  async updateFlavour(id: string | number, updates: { name?: string; color?: string; is_active?: boolean }) {
    const { data, error } = await supabase
      .from('flavours')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating flavour:', error);
      alert('Error while updating flavour');
      throw error;
    }
    return data;
  }

  async toggleFlavourAvailable(id: string | number, is_active: boolean) {
    const { data, error } = await supabase
      .from('flavours')
      .update({ is_active })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error toggling flavour availability:', error);
      throw error;
    }
    return data;
  }

  async deleteFlavour(id: string | number) {
    const { error } = await supabase
      .from('flavours')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting flavour:', error);
      alert('Error in deleting the flavour');
      throw error;
    }
  }

  // ─────────────────────────────────────
  // ORDERS
  // ─────────────────────────────────────

  async createOrder(order: any) {
    const { data, error } = await supabase
      .from('orders')
      .insert([order])
      .select()
      .single();

    if (error) {
      console.error('Error creating order:', error);
      throw error;
    }
    return data;
  }

  async insertOrderCups(orderCups: any[]) {
    const { error } = await supabase
      .from('order_items')
      .insert(orderCups);

    if (error) {
      console.error('Error inserting order cups:', error);
      throw error;
    }
  }

  async insertOrderFlavours(orderFlavours: any[]) {
    const { error } = await supabase
      .from('order_flavours')
      .insert(orderFlavours);

    if (error) {
      console.error('Error inserting order flavours:', error);
      throw error;
    }
  }

  async getOrders() {
    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        order_number,
        order_items (
          id,
          order_id,
          cup_id,
          quantity,
          price_at_time,
          items ( id, name, scoops, price, is_active, category )
        ),
        order_flavours (
          id,
          order_id,
          flavour_id,
          flavours(id,name)
        )
      `)
      .order('order_date', { ascending: false });

    if (error) {
      console.error('Error fetching orders:', error);
      throw error;
    }
    return data;
  }

  async updateOrderStatus(orderId: number, status: string) {
    const { data, error } = await supabase
      .from('orders')
      .update({ status })
      .eq('id', orderId)
      .select()
      .single();

    if (error) {
      console.error('Error updating order status:', error);
      throw error;
    }
    return data;
  }

  // ─────────────────────────────────────
  // DASHBOARD
  // ─────────────────────────────────────

  async getDashboardKpis() {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    const yesterdayStart = new Date(todayStart);
    yesterdayStart.setDate(yesterdayStart.getDate() - 1);
    const yesterdayEnd = new Date(todayEnd);
    yesterdayEnd.setDate(yesterdayEnd.getDate() - 1);

    const weekStart = new Date(todayStart);
    weekStart.setDate(weekStart.getDate() - 6);

    const [todayOrdersRes, yesterdayOrdersRes, totalCustomersRes, weekOrdersRes] = await Promise.all([
      supabase
        .from('orders')
        .select('id, total, customer_name')
        .gte('order_date', todayStart.toISOString())
        .lte('order_date', todayEnd.toISOString()),

      supabase
        .from('orders')
        .select('id, total')
        .gte('order_date', yesterdayStart.toISOString())
        .lte('order_date', yesterdayEnd.toISOString()),

      supabase
        .from('orders')
        .select('customer_name', { count: 'exact', head: false }),

      supabase
        .from('orders')
        .select('id, total')
        .gte('order_date', weekStart.toISOString())
        .lte('order_date', todayEnd.toISOString()),
    ]);

    if (todayOrdersRes.error) throw todayOrdersRes.error;
    if (yesterdayOrdersRes.error) throw yesterdayOrdersRes.error;
    if (totalCustomersRes.error) throw totalCustomersRes.error;
    if (weekOrdersRes.error) throw weekOrdersRes.error;

    const todayOrders = todayOrdersRes.data ?? [];
    const yesterdayOrders = yesterdayOrdersRes.data ?? [];

    const todayRevenue = todayOrders.reduce((sum: number, o: any) => sum + (o.total ?? 0), 0);
    const yesterdayRevenue = yesterdayOrders.reduce((sum: number, o: any) => sum + (o.total ?? 0), 0);

    const todayOrderCount = todayOrders.length;
    const yesterdayOrderCount = yesterdayOrders.length;

    const uniqueCustomers = new Set(
      (totalCustomersRes.data ?? []).map((o: any) => o.customer_name)
    ).size;

    const weekOrders = weekOrdersRes.data ?? [];
    const weekRevenue = weekOrders.reduce((sum: number, o: any) => sum + (o.total ?? 0), 0);
    const avgOrderValue = weekOrders.length > 0 ? Math.round(weekRevenue / weekOrders.length) : 0;

    const lastWeekStart = new Date(weekStart);
    lastWeekStart.setDate(lastWeekStart.getDate() - 7);
    const lastWeekEnd = new Date(todayStart);
    lastWeekEnd.setDate(lastWeekEnd.getDate() - 7);

    const lastWeekOrdersRes = await supabase
      .from('orders')
      .select('id, total')
      .gte('order_date', lastWeekStart.toISOString())
      .lte('order_date', lastWeekEnd.toISOString());

    const lastWeekOrders = lastWeekOrdersRes.data ?? [];
    const lastWeekRevenue = lastWeekOrders.reduce((sum: number, o: any) => sum + (o.total ?? 0), 0);
    const lastWeekAvg = lastWeekOrders.length > 0 ? Math.round(lastWeekRevenue / lastWeekOrders.length) : 0;

    const revenueChange = yesterdayRevenue > 0
      ? Math.round(((todayRevenue - yesterdayRevenue) / yesterdayRevenue) * 100)
      : 0;
    const ordersChange = todayOrderCount - yesterdayOrderCount;
    const avgChange = lastWeekAvg > 0
      ? Math.round(((avgOrderValue - lastWeekAvg) / lastWeekAvg) * 100)
      : 0;

    return {
      todayRevenue,
      todayOrderCount,
      uniqueCustomers,
      avgOrderValue,
      revenueChange,
      ordersChange,
      avgChange,
    };
  }

  async getWeeklyRevenue() {
    const today = new Date();
    today.setHours(23, 59, 59, 999);

    const days: { label: string; start: Date; end: Date }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const start = new Date(d);
      start.setHours(0, 0, 0, 0);
      const end = new Date(d);
      end.setHours(23, 59, 59, 999);
      days.push({
        label: d.toLocaleDateString('en-PK', { weekday: 'short' }),
        start,
        end,
      });
    }

    const lastWeekDays = days.map(d => {
      const start = new Date(d.start);
      start.setDate(start.getDate() - 7);
      const end = new Date(d.end);
      end.setDate(end.getDate() - 7);
      return { start, end };
    });

    const rangeStart = days[0].start;
    const rangeEnd = days[6].end;
    const lastRangeStart = lastWeekDays[0].start;
    const lastRangeEnd = lastWeekDays[6].end;

    const [thisWeekRes, lastWeekRes] = await Promise.all([
      supabase
        .from('orders')
        .select('order_date, total')
        .gte('order_date', rangeStart.toISOString())
        .lte('order_date', rangeEnd.toISOString()),

      supabase
        .from('orders')
        .select('order_date, total')
        .gte('order_date', lastRangeStart.toISOString())
        .lte('order_date', lastRangeEnd.toISOString()),
    ]);

    if (thisWeekRes.error) throw thisWeekRes.error;
    if (lastWeekRes.error) throw lastWeekRes.error;

    const sumByDay = (orders: any[], dayBuckets: { start: Date; end: Date }[]) =>
      dayBuckets.map(bucket =>
        orders
          .filter((o: any) => {
            const d = new Date(o.order_date);
            return d >= bucket.start && d <= bucket.end;
          })
          .reduce((sum: number, o: any) => sum + (o.total ?? 0), 0)
      );

    const thisWeekTotals = sumByDay(thisWeekRes.data ?? [], days.map(d => ({ start: d.start, end: d.end })));
    const lastWeekTotals = sumByDay(lastWeekRes.data ?? [], lastWeekDays);

    return days.map((d, i) => ({
      day: d.label,
      thisWeek: thisWeekTotals[i],
      lastWeek: lastWeekTotals[i],
    }));
  }

  async getTodayCupStats() {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    const { data, error } = await supabase
      .from('order_items')
      .select(`
        quantity,
        items ( id, name ),
        orders!inner ( order_date )
      `)
      .gte('orders.order_date', todayStart.toISOString())
      .lte('orders.order_date', todayEnd.toISOString());

    if (error) throw error;

    const countMap: Record<string, { name: string; count: number }> = {};
    for (const row of data ?? []) {
      const id = (row.items as any)?.id;
      const name = (row.items as any)?.name ?? 'Unknown';
      if (!id) continue;
      if (!countMap[id]) countMap[id] = { name, count: 0 };
      countMap[id].count += row.quantity ?? 1;
    }

    const total = Object.values(countMap).reduce((s, v) => s + v.count, 0);
    const palette = ['#B87333', '#D4956A', '#E8C4A0', '#F2DDD0', '#9A9088', '#7A4E22'];

    return Object.values(countMap)
      .sort((a, b) => b.count - a.count)
      .map((v, i) => ({
        label: v.name,
        count: v.count,
        percent: total > 0 ? Math.round((v.count / total) * 100) : 0,
        color: palette[i % palette.length],
      }));
  }

  async getTopFlavours() {
    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - 6);
    weekStart.setHours(0, 0, 0, 0);

    const { data, error } = await supabase
      .from('order_flavours')
      .select(`
        flavour_id,
        flavours ( id, name, color ),
        orders!inner ( order_date )
      `)
      .gte('orders.order_date', weekStart.toISOString());

    if (error) throw error;

    const countMap: Record<string, { name: string; color: string; count: number }> = {};
    for (const row of data ?? []) {
      const id = (row.flavours as any)?.id;
      if (!id) continue;
      if (!countMap[id]) {
        countMap[id] = {
          name: (row.flavours as any)?.name ?? 'Unknown',
          color: (row.flavours as any)?.color ?? '#B87333',
          count: 0,
        };
      }
      countMap[id].count++;
    }

    const maxCount = Math.max(...Object.values(countMap).map(v => v.count), 1);

    return Object.values(countMap)
      .sort((a, b) => b.count - a.count)
      .slice(0, 6)
      .map(v => ({
        name: v.name,
        color: v.color,
        percent: Math.round((v.count / maxCount) * 100),
      }));
  }

  async getRecentOrders(limit = 7) {
    const { data, error } = await supabase
      .from('orders')
      .select(`
        id,
        customer_name,
        order_date,
        total,
        status,
        order_items (
          quantity,
          items ( name )
        )
      `)
      .order('order_date', { ascending: false })
      .limit(limit);

    if (error) throw error;

    return (data ?? []).map((o: any) => {
      const cupParts: string[] = [];
      for (const oi of o.order_items ?? []) {
        const name = oi.items?.name ?? 'Item';
        cupParts.push(oi.quantity > 1 ? `${oi.quantity}× ${name}` : name);
      }

      const orderDate = new Date(o.order_date);
      const diffMs = Date.now() - orderDate.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      let timeLabel: string;
      if (diffMins < 1) timeLabel = 'just now';
      else if (diffMins < 60) timeLabel = `${diffMins}m ago`;
      else if (diffMins < 1440) timeLabel = `${Math.floor(diffMins / 60)}h ago`;
      else timeLabel = `${Math.floor(diffMins / 1440)}d ago`;

      return {
        id: `#${o.id}`,
        customer: o.customer_name ?? 'Unknown',
        time: timeLabel,
        cup: cupParts.join(', ') || '—',
        amount: o.total ?? 0,
        status: o.status as 'delivered' | 'preparing' | 'cancelled' | 'pending',
      };
    });
  }

  async getFlavourStats() {
    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - 6);
    weekStart.setHours(0, 0, 0, 0);

    const [flavoursRes, scoopsRes] = await Promise.all([
      supabase.from('flavours').select('id, is_active'),
      supabase
        .from('order_flavours')
        .select(`
          flavour_id,
          orders!inner ( order_date )
        `)
        .gte('orders.order_date', weekStart.toISOString()),
    ]);

    if (flavoursRes.error) throw flavoursRes.error;
    if (scoopsRes.error) throw scoopsRes.error;

    const allFlavours = flavoursRes.data ?? [];
    const activeFlavours = allFlavours.filter((f: any) => f.is_active).length;
    const soldOutFlavours = allFlavours.filter((f: any) => !f.is_active).length;
    const scoopsServedThisWeek = scoopsRes.data?.length ?? 0;

    return { activeFlavours, scoopsServedThisWeek, soldOutFlavours };
  }
}