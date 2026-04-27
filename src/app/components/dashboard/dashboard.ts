import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MenuService } from '../../services/menu.service.ts';

interface KpiCard {
  label: string;
  value: string;
  change: string;
  changeType: 'up' | 'down';
  icon: string;
  accentColor: string;
  iconBg: string;
  iconColor: string;
}

interface Order {
  id: string;
  customer: string;
  time: string;
  cup: string;
  amount: number;
  status: 'delivered' | 'preparing' | 'cancelled' | 'pending';
}

interface FlavourStat {
  name: string;
  color: string;
  percent: number;
}

interface CupStat {
  label: string;
  count: number;
  percent: number;
  color: string;
}

interface WeeklyDataPoint {
  day: string;
  thisWeek: number;
  lastWeek: number;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.css'],
})
export class Dashboard implements OnInit {

  today = new Date().toLocaleDateString('en-PK', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  });

  loading = true;
  error: string | null = null;

  kpis: KpiCard[] = [];
  recentOrders: Order[] = [];
  topFlavours: FlavourStat[] = [];
  cupStats: CupStat[] = [];
  weeklyData: WeeklyDataPoint[] = [];
  maxRevenue = 1;

  // Flavour stats row
  activeFlavours = 0;
  scoopsServedThisWeek = 0;
  soldOutFlavours = 0;

  // Donut total orders today (derived from cupStats)
  totalOrdersToday = 0;

  constructor(private menuService: MenuService) { }

  async ngOnInit() {
    try {
      await Promise.all([
        this.loadKpis(),
        this.loadWeeklyRevenue(),
        this.loadCupStats(),
        this.loadTopFlavours(),
        this.loadRecentOrders(),
        this.loadFlavourStats(),
      ]);
    } catch (err: any) {
      console.error('Dashboard load error:', err);
      this.error = 'Failed to load dashboard data. Please refresh.';
    } finally {
      this.loading = false;
    }
  }

  private async loadKpis() {
    const d = await this.menuService.getDashboardKpis();

    const revenueChangeAbs = Math.abs(d.revenueChange);
    const avgChangeAbs = Math.abs(d.avgChange);
    const ordersChangeAbs = Math.abs(d.ordersChange);

    this.kpis = [
      {
        label: "Today's Revenue",
        value: `Rs. ${d.todayRevenue.toLocaleString('en-PK')}`,
        change: `${d.revenueChange >= 0 ? '+' : '-'}${revenueChangeAbs}% vs yesterday`,
        changeType: d.revenueChange >= 0 ? 'up' : 'down',
        icon: 'payments',
        accentColor: '#B87333',
        iconBg: 'rgba(184,115,51,0.10)',
        iconColor: '#B87333',
      },
      {
        label: 'Orders Today',
        value: `${d.todayOrderCount}`,
        change: `${d.ordersChange >= 0 ? '+' : ''}${d.ordersChange} vs yesterday`,
        changeType: d.ordersChange >= 0 ? 'up' : 'down',
        icon: 'receipt_long',
        accentColor: '#2E7D52',
        iconBg: 'rgba(46,125,82,0.10)',
        iconColor: '#2E7D52',
      },
      {
        label: 'Total Customers',
        value: d.uniqueCustomers.toLocaleString('en-PK'),
        change: 'all time',
        changeType: 'up',
        icon: 'group',
        accentColor: '#2466B3',
        iconBg: 'rgba(36,102,179,0.10)',
        iconColor: '#2466B3',
      },
      {
        label: 'Avg. Order Value',
        value: `Rs. ${d.avgOrderValue}`,
        change: `${d.avgChange >= 0 ? '+' : '-'}${avgChangeAbs}% vs last week`,
        changeType: d.avgChange >= 0 ? 'up' : 'down',
        icon: d.avgChange >= 0 ? 'trending_up' : 'trending_down',
        accentColor: d.avgChange >= 0 ? '#2E7D52' : '#C0392B',
        iconBg: d.avgChange >= 0 ? 'rgba(46,125,82,0.10)' : 'rgba(192,57,43,0.10)',
        iconColor: d.avgChange >= 0 ? '#2E7D52' : '#C0392B',
      },
    ];
  }

  private async loadWeeklyRevenue() {
    this.weeklyData = await this.menuService.getWeeklyRevenue();
    const allValues = this.weeklyData.flatMap(d => [d.thisWeek, d.lastWeek]);
    this.maxRevenue = Math.max(...allValues, 1);
  }

  private async loadCupStats() {
    this.cupStats = await this.menuService.getTodayCupStats();
    this.totalOrdersToday = this.cupStats.reduce((sum, c) => sum + c.count, 0);
  }

  private async loadTopFlavours() {
    this.topFlavours = await this.menuService.getTopFlavours();
  }

  private async loadRecentOrders() {
    this.recentOrders = await this.menuService.getRecentOrders(7);
  }

  private async loadFlavourStats() {
    const stats = await this.menuService.getFlavourStats();
    this.activeFlavours = stats.activeFlavours;
    this.scoopsServedThisWeek = stats.scoopsServedThisWeek;
    this.soldOutFlavours = stats.soldOutFlavours;
  }

  getBarHeight(val: number): number {
    return Math.round((val / this.maxRevenue) * 100);
  }

  formatK(val: number): string {
    return val >= 1000 ? (val / 1000).toFixed(1) + 'k' : val.toString();
  }

  getStatusClass(status: Order['status']): string {
    const map: Record<Order['status'], string> = {
      delivered: 'status-delivered',
      preparing: 'status-preparing',
      cancelled: 'status-cancelled',
      pending: 'status-pending',
    };
    return map[status];
  }

  getStatusLabel(status: Order['status']): string {
    const map: Record<Order['status'], string> = {
      delivered: 'Delivered',
      preparing: 'Preparing',
      cancelled: 'Cancelled',
      pending: 'Pending',
    };
    return map[status];
  }

  /** Build SVG donut segments dynamically from cupStats */
  getDonutSegments(): { stroke: string; dasharray: string; dashoffset: string }[] {
    const circumference = 2 * Math.PI * 50; // r=50
    const segments: { stroke: string; dasharray: string; dashoffset: string }[] = [];
    let offset = 0;

    for (const c of this.cupStats) {
      const arc = (c.percent / 100) * circumference;
      segments.push({
        stroke: c.color,
        dasharray: `${arc.toFixed(1)} ${(circumference - arc).toFixed(1)}`,
        dashoffset: `${-offset.toFixed(1)}`,
      });
      offset += arc;
    }
    return segments;
  }
}