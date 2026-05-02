import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Footer } from "../../components/footer/footer";
import { Navbar } from '../../components/navbar/navbar';
import { Router } from '@angular/router';
import { MenuService } from '../../services/menu.service.ts';

export interface Flavour {
  id: string;
  name: string;
  color: string;
  is_active: boolean;
}

export interface Item {
  id: string;
  name: string;
  scoops: string;
  price: number;
  is_active: boolean;
  category: 'cup' | 'pack';
}

// icon + color mappings for cups (keyed by id)
const CUP_STYLES: Record<string, { icon: string; color: string; lightBg: string }> = {
  'extra-small': { icon: 'icecream', color: '#E67E00', lightBg: '#FFF3E0' },
  'small': { icon: 'local_cafe', color: '#C2185B', lightBg: '#FCE4EC' },
  'medium': { icon: 'emoji_food_beverage', color: '#1565C0', lightBg: '#E3F2FD' },
  'large-plain': { icon: 'sports_bar', color: '#6A1B9A', lightBg: '#F3E5F5' },
  'large-falooda': { icon: 'celebration', color: '#2E7D32', lightBg: '#E8F5E9' },
};

const PACK_STYLES: Record<string, { icon: string; color: string; lightBg: string; badge: string }> = {
  'half-liter': { icon: 'water_drop', color: '#0277BD', lightBg: '#E1F5FE', badge: 'Starter' },
  'one-liter': { icon: 'opacity', color: '#00796B', lightBg: '#E0F2F1', badge: 'Popular' },
  'one-and-half-liter': { icon: 'inventory_2', color: '#E67E00', lightBg: '#FFF3E0', badge: 'Value' },
  'ea372631-1537-4ff7-9f61-20e954027cef': { icon: 'kitchen', color: '#5C3D1E', lightBg: '#FDF3E7', badge: 'XL' },
};

// fallback defaults for unknown ids
const CUP_DEFAULT = { icon: 'icecream', color: '#C88A4A', lightBg: '#FDF3E7' };
const PACK_DEFAULT = { icon: 'kitchen', color: '#5C3D1E', lightBg: '#FDF3E7', badge: 'Pack' };

@Component({
  selector: 'app-landingpage',
  imports: [CommonModule, FormsModule, Footer, Navbar],
  templateUrl: './landingpage.html',
  styleUrl: './landingpage.css',
})
export class Landingpage {

  constructor(private router: Router, private menuService: MenuService) { }

  ngOnInit() {
    this.loadData();
  }

  activeTab: 'cups' | 'packs' = 'cups';
  newsletterEmail = '';
  subscribed = false;

  flavours: Flavour[] = [];
  cups: any[] = [];
  packs: any[] = [];

  onSubscribe() {
    if (this.newsletterEmail) {
      this.subscribed = true;
      this.newsletterEmail = '';
      setTimeout(() => this.subscribed = false, 5000);
    }
  }

  async loadData() {
    await Promise.all([this.getFlavours(), this.getItems()]);
  }

  async getFlavours() {
    try {
      const data = await this.menuService.getFlavours();
      this.flavours = ((data as Flavour[]) ?? []).filter(f => f.is_active);
    } catch (err) {
      console.error('Error loading flavours:', err);
    }
  }

  async getItems() {
    try {
      const data = (await this.menuService.getCups()) as Item[];
      const active = data.filter(i => i.is_active);

      this.cups = active
        .filter(i => i.category === 'cup')
        .map(i => ({
          ...i,
          ...(CUP_STYLES[i.id] ?? CUP_DEFAULT),
        }));

      this.packs = active
        .filter(i => i.category === 'pack')
        .map(i => ({
          ...i,
          ...(PACK_STYLES[i.id] ?? PACK_DEFAULT),
          desc: i.scoops,   // reuse scoops field as description for packs
        }));

    } catch (err) {
      console.error('Error loading items:', err);
    }
  }

  onOrder() {
    this.router.navigate(['/order/new']);
  }
}