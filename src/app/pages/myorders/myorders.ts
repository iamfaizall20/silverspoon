import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { MenuService } from '../../services/menu.service.ts';

type OrderStatus = 'new' | 'pending' | 'out to delivery' | 'delivered' | 'cancelled' | 'received';

interface StatusStep {
  key: OrderStatus;
  label: string;
  icon: string;
}

interface OrderResult {
  id: number;
  order_number: string;
  status: OrderStatus;
  customer_name: string;
  order_date: string;
  total: number;
  order_items: { quantity: number; price_at_time: number; items: { name: string; scoops: number } }[];
  order_flavours: { flavours: { name: string } }[];
}

@Component({
  selector: 'app-myorders',
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './myorders.html',
  styleUrl: './myorders.css',
})
export class Myorders {

  orderId = '';
  loading = signal(false);
  error = signal<string | null>(null);
  order = signal<OrderResult | null>(null);

  readonly statusSteps: StatusStep[] = [
    { key: 'pending', label: 'Order Accepted', icon: 'check_circle' },
    { key: 'out to delivery', label: 'Out for Delivery', icon: 'delivery_dining' },
    { key: 'delivered', label: 'Delivered', icon: 'inventory_2' },
    { key: 'received', label: 'Received', icon: 'task_alt' },
  ];

  constructor(private menuService: MenuService) { }

  async trackOrder(): Promise<void> {
    const id = this.orderId.trim().toUpperCase();
    if (!id) {
      this.error.set('Please enter an order ID.');
      return;
    }

    this.loading.set(true);
    this.error.set(null);
    this.order.set(null);

    try {
      const all = await this.menuService.getOrders() as OrderResult[];
      const found = all.find(o =>
        (o.order_number ?? '').toUpperCase() === id
      );
      if (!found) {
        this.error.set(`No order found with ID ${id}.`);
      } else {
        this.order.set(found);
      }
    } catch (err: any) {
      this.error.set(err?.message ?? 'Something went wrong.');
    } finally {
      this.loading.set(false);
    }
  }

  reset(): void {
    this.orderId = '';
    this.order.set(null);
    this.error.set(null);
  }

  stepIndex(status: OrderStatus): number {
    return this.statusSteps.findIndex(s => s.key === status);
  }

  isStepDone(orderStatus: OrderStatus, stepKey: OrderStatus): boolean {
    const orderIdx = this.stepIndex(orderStatus);
    const stepIdx = this.stepIndex(stepKey);
    if (orderIdx === -1 || stepIdx === -1) return false;
    return orderIdx > stepIdx;
  }

  isStepActive(orderStatus: OrderStatus, stepKey: OrderStatus): boolean {
    return orderStatus === stepKey;
  }

  nextStepKey(index: number): OrderStatus {
    return this.statusSteps[index + 1]?.key ?? 'delivered';
  }

  statusLabel(status: OrderStatus): string {
    const map: Record<OrderStatus, string> = {
      'new': 'Awaiting Acceptance',
      'pending': 'Accepted',
      'out to delivery': 'Out for Delivery',
      'delivered': 'Delivered',
      'cancelled': 'Cancelled',
      'received': 'Received',
    };
    return map[status] ?? status;
  }

  statusBadgeClass(status: OrderStatus): string {
    const map: Record<OrderStatus, string> = {
      'new': 'badge-new',
      'pending': 'badge-pending',
      'out to delivery': 'badge-delivery',
      'delivered': 'badge-delivered',
      'cancelled': 'badge-cancelled',
      'received': 'badge-received',
    };
    return map[status] ?? 'badge-pending';
  }

  formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString('en-PK', {
      day: 'numeric', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
  }

  flavourNames(order: OrderResult): string {
    return (order.order_flavours ?? [])
      .map(f => f.flavours?.name)
      .filter((n): n is string => !!n)
      .join(', ') || '—';
  }
}