import { CommonModule, DatePipe } from '@angular/common';
import { Component, HostListener, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MenuService } from '../../services/menu.service.ts';

type OrderStatus = 'new' | 'pending' | 'out to delivery' | 'delivered' | 'cancelled';

interface Cup {
  id: string;
  name: string;
  scoops: string;
  price: number;
  is_active: boolean;
}

interface flavour {
  id: number;
  name: string;
  color: string;
}

interface OrderCup {
  id: number;
  order_id: number;
  cup_id: string;
  quantity: number;
  price_at_time: number;
  cups?: Cup;
}

interface OrderFlavour {
  id: number;
  flavours: flavour;
  order_id: number;
  flavour_id?: number;
}

interface OrderRecord {
  id: number;
  order_number: string;
  customer_name: string;
  phone: string;
  alt_phone?: string;
  address: string;
  payment_method: 'cod' | 'online';
  subtotal: number;
  delivery_fee: number;
  total: number;
  status: OrderStatus;
  order_date: string;
  order_cups?: OrderCup[];
  order_flavours?: OrderFlavour[];
}

@Component({
  selector: 'app-orders',
  standalone: true,
  imports: [CommonModule, FormsModule, DatePipe],
  templateUrl: './manageOrders.html',
  styleUrls: ['./manageOrders.css']
})
export class Orders implements OnInit {

  constructor(private menuService: MenuService) { }

  orders: OrderRecord[] = [];
  filteredOrders: OrderRecord[] = [];

  currentPage = 1;
  pageSize = 10;
  totalPages = 1;
  statusFilter: OrderStatus | 'all' = 'all';

  selectedOrder: OrderRecord | null = null;
  isSummaryOpen = false;
  isLoading = false;

  openMenuId: number | null = null;

  // ── Toast ─────────────────────────────────────────────────────────────────────
  toastVisible = false;
  toastMsg = '';
  private toastTimer: ReturnType<typeof setTimeout> | null = null;

  showToast(msg: string): void {
    if (this.toastTimer) clearTimeout(this.toastTimer);
    this.toastMsg = msg;
    this.toastVisible = true;
    this.toastTimer = setTimeout(() => (this.toastVisible = false), 3000);
  }

  // ─── Status Options ───────────────────────────────────────────────────────────

  readonly statusOptions: Array<{ value: OrderStatus; label: string }> = [
    { value: 'new', label: 'New Order' },
    { value: 'pending', label: 'Preparing' },
    { value: 'out to delivery', label: 'Out for Delivery' },
    { value: 'delivered', label: 'Delivered' },
  ];

  readonly actionableStatusOptions = this.statusOptions.filter(
    o => o.value !== 'new' && o.value !== 'cancelled'
  );

  readonly pageSizeOptions = [10, 15, 20];

  // ─── Lifecycle ────────────────────────────────────────────────────────────────

  async ngOnInit(): Promise<void> {
    await this.loadOrders();
  }

  // ─── Close menu on outside click ──────────────────────────────────────────────

  @HostListener('document:click')
  onDocumentClick(): void {
    this.openMenuId = null;
  }

  // ─── Data Loading ─────────────────────────────────────────────────────────────

  async loadOrders(): Promise<void> {
    this.isLoading = true;
    try {
      const data = await this.menuService.getOrders();
      this.orders = (data as OrderRecord[]) ?? [];
    } catch (error) {
      console.error('Error loading orders:', error);
      this.showToast('Failed to load orders');
    } finally {
      this.isLoading = false;
      this.applyFilters();
    }
  }

  // ─── Filtering & Pagination ───────────────────────────────────────────────────

  applyFilters(): void {
    this.filteredOrders = this.statusFilter === 'all'
      ? this.orders
      : this.orders.filter(o => o.status === this.statusFilter);

    this.totalPages = Math.max(1, Math.ceil(this.filteredOrders.length / this.pageSize));

    if (this.currentPage > this.totalPages) {
      this.currentPage = this.totalPages;
    }
  }

  get pagedOrders(): OrderRecord[] {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.filteredOrders.slice(start, start + this.pageSize);
  }

  get hasOrders(): boolean {
    return this.filteredOrders.length > 0;
  }

  get visiblePages(): number[] {
    const pages: number[] = [];
    const total = this.totalPages;
    const cur = this.currentPage;

    pages.push(1);
    for (let p = Math.max(2, cur - 1); p <= Math.min(total - 1, cur + 1); p++) {
      pages.push(p);
    }
    if (total > 1) pages.push(total);

    return [...new Set(pages)];
  }

  get pageStartIndex(): number {
    return this.hasOrders ? (this.currentPage - 1) * this.pageSize + 1 : 0;
  }

  get pageEndIndex(): number {
    return this.hasOrders
      ? Math.min(this.currentPage * this.pageSize, this.filteredOrders.length)
      : 0;
  }

  // ─── Stats ────────────────────────────────────────────────────────────────────

  get preparingCount(): number {
    return this.orders.filter(o => o.status === 'pending').length;
  }

  get outForDeliveryCount(): number {
    return this.orders.filter(o => o.status === 'out to delivery').length;
  }

  get deliveredCount(): number {
    return this.orders.filter(o => o.status === 'delivered').length;
  }

  // ─── Pagination Controls ──────────────────────────────────────────────────────

  changePage(page: number): void {
    if (page < 1 || page > this.totalPages) return;
    this.currentPage = page;
  }

  nextPage(): void { this.changePage(this.currentPage + 1); }
  previousPage(): void { this.changePage(this.currentPage - 1); }

  onPageSizeChange(value: string): void {
    this.pageSize = Number(value);
    this.currentPage = 1;
    this.applyFilters();
  }

  onStatusFilterChange(value: string): void {
    this.statusFilter = value as OrderStatus | 'all';
    this.currentPage = 1;
    this.applyFilters();
  }

  // ─── Drawer ───────────────────────────────────────────────────────────────────

  openOrderSummary(order: OrderRecord): void {
    this.selectedOrder = this.orders.find(o => o.id === order.id) ?? order;
    this.isSummaryOpen = true;
  }

  closeOrderSummary(): void {
    this.isSummaryOpen = false;
    this.selectedOrder = null;
  }

  // ─── Menu ─────────────────────────────────────────────────────────────────────

  toggleMenu(orderId: number, event?: Event): void {
    event?.stopPropagation();
    this.openMenuId = this.openMenuId === orderId ? null : orderId;
  }

  // ─── Order Actions ────────────────────────────────────────────────────────────

  acceptOrder(order: OrderRecord): void {
    this.updateOrderStatus(order.id, 'pending');
  }

  onStatusDropdownChange(order: OrderRecord, newStatus: string): void {
    this.updateOrderStatus(order.id, newStatus as OrderStatus);
  }

  editOrder(order: OrderRecord): void {
    this.openMenuId = null;
    this.openOrderSummary(order);
  }

  cancelOrder(order: OrderRecord): void {
    this.openMenuId = null;
    this.updateOrderStatus(order.id, 'cancelled');
  }

  async updateOrderStatus(orderId: number, status: OrderStatus): Promise<void> {
    // Optimistic update — update UI immediately
    this.orders = this.orders.map(o => o.id === orderId ? { ...o, status } : o);
    if (this.selectedOrder?.id === orderId) {
      this.selectedOrder = { ...this.selectedOrder, status };
    }
    this.applyFilters();

    try {
      await this.menuService.updateOrderStatus(orderId, status);
      this.showToast('Order status updated');
    } catch (error) {
      console.error('Failed to update order status:', error);
      this.showToast('Failed to update status — reloading');
      await this.loadOrders();
    }
  }

  // ─── Helpers ──────────────────────────────────────────────────────────────────

  getStatusLabel(status: OrderStatus | 'all'): string {
    const map: Record<string, string> = {
      all: 'All',
      new: 'New Order',
      pending: 'Preparing',
      'out to delivery': 'Out for Delivery',
      delivered: 'Delivered',
      cancelled: 'Cancelled',
    };
    return map[status] ?? status;
  }

  trackByOrderId(_: number, order: OrderRecord): number {
    return order.id;
  }
}