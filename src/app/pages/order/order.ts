import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MenuService } from '../../services/menu.service.ts';

export interface Flavour {
  id: string;
  name: string;
  color: string;
}

export interface CupSize {
  id: string;
  name: string;
  scoops: string;
  price: number;
  category: 'cup' | 'pack';
}

export interface CupQtyMap {
  [key: string]: number;
}

// Per-item flavour map: { [cupId]: string[] }
export interface ItemFlavoursMap {
  [cupId: string]: string[];
}

export interface OrderData {
  name: string;
  phone: string;
  altPhone: string;
  address: string;
  cupQtys: CupQtyMap;
  itemFlavours: ItemFlavoursMap;   // NEW: flavours per item
  paymentMethod: 'cod' | 'online' | '';
}

@Component({
  selector: 'app-order',
  imports: [FormsModule, CommonModule, RouterLink],
  templateUrl: './order.html',
  styleUrls: ['./order.css']
})
export class Order implements OnInit {

  currentStep = 1;
  totalSteps = 4;
  showSuccess = false;
  isPlacingOrder = false;
  copied = false;


  order: OrderData = {
    name: '',
    phone: '',
    altPhone: '',
    address: '',
    cupQtys: {},
    itemFlavours: {},
    paymentMethod: ''
  };

  cupSizes: CupSize[] = [];
  flavours: Flavour[] = [];

  orderNumber: string = '';
  barcodePattern: { w: number; c: string }[] = [];

  constructor(private router: Router, private menuService: MenuService) { }

  ngOnInit(): void {
    this.orderNumber = 'ORD-' + Math.floor(100000 + Math.random() * 900000);
    this.generateBarcode();
    this.loadCups();
    this.loadFlavours();
  }

  generateBarcode(): void {
    const bars: { w: number; c: string }[] = [];
    for (let i = 0; i < 60; i++) {
      bars.push({ w: Math.random() > 0.5 ? 2 : 1, c: Math.random() > 0.3 ? '#1a1a1a' : '#ffffff' });
    }
    this.barcodePattern = bars;
  }

  // ── STEP NAVIGATION ──

  isActive(step: number): boolean { return this.currentStep === step; }
  isDone(step: number): boolean { return this.currentStep > step; }
  isLineDone(step: number): boolean { return this.currentStep > step; }

  nextStep(): void {
    if (this.currentStep < this.totalSteps) {
      this.currentStep++;
    } else {
      this.placeOrder();
    }
  }

  prevStep(): void {
    if (this.currentStep > 1) this.currentStep--;
  }

  get confirmLabel(): string {
    return this.currentStep === this.totalSteps ? 'Place Order' : 'Continue';
  }

  get isNextDisabled(): boolean {
    switch (this.currentStep) {
      case 1:
        return !this.order.name.trim() || !this.order.phone.trim() || !this.order.address.trim();
      case 2:
        // At least one cup selected AND every selected item has at least 1 flavour
        return this.totalCupsCount < 1 || !this.allItemsHaveFlavours;
      case 3:
        return !this.order.paymentMethod;
      default:
        return false;
    }
  }

  // ── DATA LOADING ──

  async loadCups() {
    try {
      const data = await this.menuService.getCups();
      this.cupSizes = data.map((c: any) => ({
        id: c.id,
        name: c.name,
        scoops: c.scoops,
        price: c.price,
        category: c.category
      }));
    } catch (err) {
      console.error('Error loading cups:', err);
    }
  }

  async loadFlavours() {
    try {
      const data = await this.menuService.getFlavours();
      this.flavours = data.map((f: any) => ({
        id: String(f.id),
        name: f.name,
        color: f.color
      }));
    } catch (err) {
      console.error('Error loading flavours:', err);
    }
  }

  // ── CUP QUANTITY ──

  getCupQty(id: string): number {
    return this.order.cupQtys[id] ?? 0;
  }

  incrementCup(cup: CupSize): void {
    this.order.cupQtys[cup.id] = (this.order.cupQtys[cup.id] ?? 0) + 1;
    // Initialise flavour array if first time
    if (!this.order.itemFlavours[cup.id]) {
      this.order.itemFlavours[cup.id] = [];
    }
  }

  decrementCup(cup: CupSize): void {
    const cur = this.order.cupQtys[cup.id] ?? 0;
    if (cur > 0) {
      this.order.cupQtys[cup.id] = cur - 1;
      // If quantity reaches 0, clear flavours for that item
      if (this.order.cupQtys[cup.id] === 0) {
        this.order.itemFlavours[cup.id] = [];
      }
    }
  }

  get totalCupsCount(): number {
    return Object.values(this.order.cupQtys).reduce((a, b) => a + b, 0);
  }

  get selectedItems(): CupSize[] {
    return this.cupSizes.filter(c => this.getCupQty(c.id) > 0);
  }

  // ── PER-ITEM FLAVOUR SELECTION ──

  getItemFlavours(cupId: string): string[] {
    return this.order.itemFlavours[cupId] ?? [];
  }

  toggleItemFlavour(cupId: string, flavourId: string): void {
    if (!this.order.itemFlavours[cupId]) {
      this.order.itemFlavours[cupId] = [];
    }
    const arr = this.order.itemFlavours[cupId];
    const idx = arr.indexOf(flavourId);
    if (idx > -1) {
      arr.splice(idx, 1);
    } else if (arr.length < 2) {
      arr.push(flavourId);
    }
  }

  isItemFlavourSelected(cupId: string, flavourId: string): boolean {
    return (this.order.itemFlavours[cupId] ?? []).includes(flavourId);
  }

  getFlavourById(id: string): Flavour | undefined {
    return this.flavours.find(f => f.id === id);
  }

  getItemFlavourNames(cupId: string): string {
    return (this.order.itemFlavours[cupId] ?? [])
      .map(id => this.getFlavourById(id)?.name ?? id)
      .join(' + ') || '—';
  }

  // Ensure every selected item has at least 1 flavour chosen
  get allItemsHaveFlavours(): boolean {
    return this.selectedItems.every(c => (this.order.itemFlavours[c.id]?.length ?? 0) > 0);
  }

  // ── PAYMENT ──

  selectPayment(method: 'cod' | 'online'): void {
    this.order.paymentMethod = method;
  }

  // ── INVOICE / TOTAL ──

  get subtotal(): number {
    return this.cupSizes.reduce((sum, cup) => {
      return sum + (cup.price * (this.order.cupQtys[cup.id] ?? 0));
    }, 0);
  }

  get deliveryFee(): number { return 40; }

  get total(): number { return this.subtotal + this.deliveryFee; }

  get orderDate(): string {
    return new Date().toLocaleDateString('en-PK', {
      day: '2-digit', month: '2-digit', year: 'numeric'
    });
  }

  get orderTime(): string {
    return new Date().toLocaleTimeString('en-PK', {
      hour: '2-digit', minute: '2-digit', hour12: true
    });
  }

  get paymentLabel(): string {
    return this.order.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Online Payment';
  }

  // Copy Order ID
  copyOrderId(): void {
    navigator.clipboard.writeText(this.orderNumber).then(() => {
      this.copied = true;
      setTimeout(() => this.copied = false, 2000);
    });
  }

  // ── PLACE ORDER ──

  async placeOrder() {
    this.isPlacingOrder = true;
    try {
      const orderPayload = {
        customer_name: this.order.name,
        order_number: this.orderNumber,
        phone: this.order.phone,
        alt_phone: this.order.altPhone,
        address: this.order.address,
        payment_method: this.order.paymentMethod,
        subtotal: this.subtotal,
        delivery_fee: this.deliveryFee,
        total: this.total,
        status: 'new'
      };

      const createdOrder = await this.menuService.createOrder(orderPayload);
      const orderId = createdOrder.id;

      // Insert order_items
      const orderCups = this.cupSizes
        .filter(cup => (this.order.cupQtys[cup.id] ?? 0) > 0)
        .map(cup => ({
          order_id: orderId,
          cup_id: cup.id,
          quantity: this.order.cupQtys[cup.id],
          price_at_time: cup.price
        }));

      let insertedItems: any[] = [];
      if (orderCups.length > 0) {
        insertedItems = await this.menuService.insertOrderCups(orderCups);
      }

      // Insert order_item_flavours (per-item)
      const flavourRows: { order_item_id: number; flavour_id: string }[] = [];
      for (const item of insertedItems) {
        const flavourIds = this.order.itemFlavours[item.cup_id] ?? [];
        for (const fId of flavourIds) {
          flavourRows.push({ order_item_id: item.id, flavour_id: fId });
        }
      }

      if (flavourRows.length > 0) {
        await this.menuService.insertOrderItemFlavours(flavourRows);
      }

      console.log('Order placed successfully');
      this.showSuccess = true;
      setTimeout(() => this.router.navigate(['/']), 5000);

    } catch (err) {
      console.error('Order failed:', err);
      alert('Something went wrong placing your order');
    } finally {
      this.isPlacingOrder = false;
    }
  }

  goHome(): void { this.router.navigate(['/']); }
  cancelOrder(): void { this.router.navigate(['/']); }
}