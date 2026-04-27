import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Footer } from "../../components/footer/footer";
import { Navbar } from '../../components/navbar/navbar';
import { Router } from '@angular/router';
import { MenuService } from '../../services/menu.service.ts';

export interface flavour {
  name: string;
  color: string;
}

@Component({
  selector: 'app-landingpage',
  imports: [CommonModule, FormsModule, Footer, Navbar],
  templateUrl: './landingpage.html',
  styleUrl: './landingpage.css',
})
export class Landingpage {

  constructor(private router: Router, private menuService: MenuService) { }

  ngOnInit() {
    this.getFlavours();
  }

  activeTab: 'cups' | 'packs' = 'cups';
  newsletterEmail = '';
  subscribed = false;

  onSubscribe() {
    if (this.newsletterEmail) {
      this.subscribed = true;
      this.newsletterEmail = '';
      setTimeout(() => this.subscribed = false, 5000);
    }
  }

  flavours: flavour[] = [];

  cups = [
    { name: 'Extra Small Cup', icon: 'icecream', color: '#E67E00', lightBg: '#FFF3E0', scoops: '1 Scoop', desc: 'Perfect solo treat', price: 100 },
    { name: 'Small Cup', icon: 'local_cafe', color: '#C2185B', lightBg: '#FCE4EC', scoops: '2 Scoops', desc: 'Classic everyday pick', price: 130 },
    { name: 'Medium Cup', icon: 'emoji_food_beverage', color: '#1565C0', lightBg: '#E3F2FD', scoops: '3 Scoops', desc: 'For the big appetite', price: 180 },
    { name: 'Large Cup plain', icon: 'sports_bar', color: '#6A1B9A', lightBg: '#F3E5F5', scoops: '4 Scoops', desc: 'Go all out', price: 250 },
    { name: 'Large Cup + Falooda', icon: 'celebration', color: '#2E7D32', lightBg: '#E8F5E9', scoops: '4 Scoops + Falooda', desc: "Share or don't — no judgment", price: 290 },
  ];

  packs = [
    { name: 'Half Litre', icon: 'water_drop', color: '#0277BD', lightBg: '#E1F5FE', badge: 'Starter', desc: '2–3 servings · any 2 flavours', price: 350 },
    { name: '1 Litre', icon: 'opacity', color: '#00796B', lightBg: '#E0F2F1', badge: 'Popular', desc: '4–5 servings · any 3 flavours', price: 620 },
    { name: '1.5 Litre', icon: 'inventory_2', color: '#E67E00', lightBg: '#FFF3E0', badge: 'Value', desc: '6–8 servings · any 4 flavours', price: 880 },
  ];

  // get Flavours
  async getFlavours() {
    try {
      const data = await this.menuService.getFlavours();
      this.flavours = (data as flavour[]) ?? [];
    } catch (err) {
      throw err;
    }
  }


  onOrder() {
    this.router.navigate(['/order/new']);
  }
}