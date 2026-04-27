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
}

export interface CupQtyMap {
  [key: string]: number;
}

export interface OrderData {
  name: string;
  phone: string;
  altPhone: string;
  address: string;
  cupQtys: CupQtyMap;
  flavours: string[];
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

  order: OrderData = {
    name: '',
    phone: '',
    altPhone: '',
    address: '',
    cupQtys: { small: 0, medium: 0, large: 0, family: 0 },
    flavours: [],
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
        return this.totalCupsCount < 1 || this.order.flavours.length === 0;
      case 3:
        return !this.order.paymentMethod;
      default:
        return false;
    }
  }

  // ── Load cups from database
  async loadCups() {
    try {
      const data = await this.menuService.getCups();

      this.cupSizes = data.map((c: any) => ({
        id: c.id,
        name: c.name,
        scoops: c.scoops,
        price: c.price
      }));

    } catch (err) {
      console.error('Error loading cups:', err);
    }
  }

  // load flavours from database

  async loadFlavours() {
    try {
      const data = await this.menuService.getFlavours();

      this.flavours = data.map((f: any) => ({
        id: f.id,
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
  }

  decrementCup(cup: CupSize): void {
    const cur = this.order.cupQtys[cup.id] ?? 0;
    if (cur > 0) this.order.cupQtys[cup.id] = cur - 1;
  }

  get totalCupsCount(): number {
    return Object.values(this.order.cupQtys).reduce((a, b) => a + b, 0);
  }

  // ── FLAVOUR SELECTION ──

  toggleFlavour(id: string): void {
    const idx = this.order.flavours.indexOf(id);
    if (idx > -1) {
      this.order.flavours.splice(idx, 1);
    } else if (this.order.flavours.length < 2) {
      this.order.flavours.push(id);
    }
  }

  isFlavourSelected(id: string): boolean {
    return this.order.flavours.includes(id);
  }

  getFlavourById(id: string): Flavour | undefined {
    return this.flavours.find(f => f.id === id);
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

  get deliveryFee(): number {
    return 40;
  }

  get total(): number {
    return this.subtotal + this.deliveryFee;
  }

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

  get selectedFlavourNames(): string {
    return this.order.flavours
      .map(id => this.getFlavourById(id)?.name ?? id)
      .join(' + ') || '—';
  }

  get paymentLabel(): string {
    return this.order.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Online Payment';
  }

  // PlaceOrder - Supabase
  async placeOrder() {
    try {
      // Orders Table Payload(data)
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

      // 2. Prepare order_cups data
      const orderCups = this.cupSizes
        .filter(cup => (this.order.cupQtys[cup.id] ?? 0) > 0)
        .map(cup => ({
          order_id: orderId,
          cup_id: cup.id,
          quantity: this.order.cupQtys[cup.id],
          price_at_time: cup.price
        }));

      if (orderCups.length > 0) {
        await this.menuService.insertOrderCups(orderCups);
      }

      // 3. Prepare order_flavours data
      const orderFlavours = this.order.flavours.map(flavourId => ({
        order_id: orderId,
        flavour_id: flavourId
      }));

      if (orderFlavours.length > 0) {
        await this.menuService.insertOrderFlavours(orderFlavours);
      }

      // 4. Success UI
      console.log('Order placed successfully');
      this.showSuccess = true;

      setTimeout(() => {
        this.router.navigate(['/']);
      }, 3000);

    } catch (err) {
      console.error('Order failed:', err);
      alert('Something went wrong placing your order');
    }
  }

  goHome(): void {
    this.router.navigate(['/']);
  }

  cancelOrder(): void {
    this.router.navigate(['/']);
  }
}