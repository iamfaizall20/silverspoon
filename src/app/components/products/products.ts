import { CommonModule } from '@angular/common';
import { Component, OnInit, HostListener } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MenuService } from '../../services/menu.service.ts';

// ── Matches DB: flavours (id, name, color, is_active)
export interface Flavour {
  id: string;
  name: string;
  color: string;
  is_active: boolean;
}

// ── Matches DB: items (id, name, scoops, price, is_active, category)
// category is either 'cup' or 'pack'
export interface CupSize {
  id: string;
  name: string;
  scoops: number;
  price: number;
  is_active: boolean;
  category: 'cup' | 'pack';
}

type TabType = 'flavours' | 'items';
type ModalType = 'flavour' | 'cup' | '';
type DeleteTarget = 'flavour' | 'cup';

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './products.html',
  styleUrls: ['./products.css'],
})
export class Products implements OnInit {

  constructor(private menuService: MenuService) { }

  // ── ACTIVE TAB ──
  activeTab: TabType = 'flavours';

  // ── DROPDOWN MENU ──
  openMenuId: string | null = null;

  // ── MODAL STATE ──
  modalOpen = false;
  modalType: ModalType = '';
  editIndex = -1;

  // ── CONFIRM DELETE STATE ──
  confirmOpen = false;
  confirmLabel = '';
  private deleteTarget: DeleteTarget = 'flavour';
  private deleteIndex = -1;

  // ── TOAST ──
  toastVisible = false;
  toastMsg = '';
  private toastTimer: any;

  // ── DATA ──
  flavours: Flavour[] = [];
  cupSizes: CupSize[] = [];

  // ── FORM MODELS ──
  flavourForm: Omit<Flavour, 'id'> = { name: '', color: '#F5E6C8', is_active: true };
  cupForm: Omit<CupSize, 'id'> = { name: '', scoops: 1, price: 0, is_active: true, category: 'cup' };

  quickColors = [
    '#F5E6C8', '#FFD580', '#F4A0A0', '#A8C5A0',
    '#80CBC4', '#9BA8D0', '#DEB887', '#7B4F2E',
    '#C8E6C9', '#FFCCBC', '#CE93D8', '#B0BEC5',
  ];

  // ── DERIVED: items split by category ──
  get cups(): CupSize[] {
    return this.cupSizes.filter(c => c.category === 'cup');
  }

  get packs(): CupSize[] {
    return this.cupSizes.filter(c => c.category === 'pack');
  }

  /** Returns the index of a CupSize in the master cupSizes array. */
  getCupSizeIndex(item: CupSize): number {
    return this.cupSizes.indexOf(item);
  }

  ngOnInit(): void {
    this.loadFlavours();
    this.loadCups();
  }

  // ── CLOSE DROPDOWN ON OUTSIDE CLICK ──
  @HostListener('document:click')
  onDocumentClick(): void {
    this.openMenuId = null;
  }

  // ── DROPDOWN MENU HELPERS ──
  toggleMenu(id: string, event: Event): void {
    event.stopPropagation();
    this.openMenuId = this.openMenuId === id ? null : id;
  }

  closeMenu(): void {
    this.openMenuId = null;
  }

  // ── UTILS ──
  uid(): string {
    return Math.random().toString(36).slice(2, 9);
  }

  setTab(tab: TabType): void {
    this.activeTab = tab;
    this.openMenuId = null;
  }

  // ── TOAST ──
  showToast(msg: string): void {
    this.toastMsg = msg;
    this.toastVisible = true;
    clearTimeout(this.toastTimer);
    this.toastTimer = setTimeout(() => { this.toastVisible = false; }, 2800);
  }

  // ── MODAL HELPERS ──
  openAddModal(): void {
    if (this.activeTab === 'flavours') this.openFlavourModal();
    else this.openCupModal();
  }

  closeModal(): void {
    this.modalOpen = false;
    this.modalType = '';
    this.editIndex = -1;
  }

  // ──────────────────────────────
  // FLAVOUR CRUD
  // ──────────────────────────────

  async loadFlavours() {
    try {
      const data = await this.menuService.getFlavours();
      this.flavours = (data as Flavour[]) ?? [];
    } catch (err) {
      console.error(err);
    }
  }

  openFlavourModal(): void {
    this.flavourForm = { name: '', color: '#F5E6C8', is_active: true };
    this.editIndex = -1;
    this.modalType = 'flavour';
    this.modalOpen = true;
  }

  editFlavour(f: Flavour, i: number): void {
    this.flavourForm = { name: f.name, color: f.color, is_active: f.is_active };
    this.editIndex = i;
    this.modalType = 'flavour';
    this.modalOpen = true;
  }

  async saveFlavour(): Promise<void> {
    if (!this.flavourForm.name.trim()) return;
    try {
      if (this.editIndex >= 0) {
        const id = this.flavours[this.editIndex].id;
        await this.menuService.updateFlavour(id, {
          name: this.flavourForm.name,
          color: this.flavourForm.color,
          is_active: this.flavourForm.is_active,
        });
        this.flavours[this.editIndex] = { ...this.flavours[this.editIndex], ...this.flavourForm };
        this.showToast(`Flavour "${this.flavourForm.name}" updated.`);
      } else {
        const newFlavour = await this.menuService.insertFlavour({
          name: this.flavourForm.name,
          color: this.flavourForm.color,
          is_active: this.flavourForm.is_active,
        });
        this.flavours.push(newFlavour);
        this.showToast(`Flavour "${this.flavourForm.name}" added.`);
      }
      this.closeModal();
    } catch (err) {
      console.error(err);
    }
  }

  async toggleFlavourAvailable(i: number): Promise<void> {
    const flavour = this.flavours[i];
    const newVal = !flavour.is_active;
    try {
      await this.menuService.toggleFlavourAvailable(flavour.id, newVal);
      this.flavours[i].is_active = newVal;
      this.showToast(`"${flavour.name}" marked as ${newVal ? 'available' : 'unavailable'}.`);
    } catch (err) {
      console.error(err);
    }
  }

  deleteFlavour(i: number): void {
    this.deleteTarget = 'flavour';
    this.deleteIndex = i;
    this.confirmLabel = this.flavours[i].name;
    this.confirmOpen = true;
  }

  // ──────────────────────────────
  // CUP SIZE CRUD  (Items tab)
  // ──────────────────────────────

  async loadCups() {
    try {
      const data = await this.menuService.getCups();
      this.cupSizes = (data as CupSize[]) ?? [];
    } catch (err) {
      console.error(err);
    }
  }

  openCupModal(): void {
    this.cupForm = { name: '', scoops: 1, price: 0, is_active: true, category: 'cup' };
    this.editIndex = -1;
    this.modalType = 'cup';
    this.modalOpen = true;
  }

  editCup(c: CupSize, i: number): void {
    this.cupForm = { name: c.name, scoops: c.scoops, price: c.price, is_active: c.is_active, category: c.category };
    this.editIndex = i;
    this.modalType = 'cup';
    this.modalOpen = true;
  }

  async saveCup(): Promise<void> {
    if (!this.cupForm.name.trim() || this.cupForm.scoops < 1) return;
    try {
      if (this.editIndex >= 0) {
        const id = this.cupSizes[this.editIndex].id;
        await this.menuService.updateCup(id, this.cupForm);
        this.cupSizes[this.editIndex] = { ...this.cupSizes[this.editIndex], ...this.cupForm };
        this.showToast(`"${this.cupForm.name}" updated.`);
      } else {
        const newCup = await this.menuService.insertCup(this.cupForm);
        this.cupSizes.push(newCup);
        this.showToast(`"${this.cupForm.name}" added.`);
      }
      this.closeModal();
    } catch (err) {
      console.error(err);
    }
  }

  async toggleCupAvailable(i: number): Promise<void> {
    const cup = this.cupSizes[i];
    const newVal = !cup.is_active;
    try {
      await this.menuService.toggleCupAvailable(cup.id, newVal);
      this.cupSizes[i].is_active = newVal;
      this.showToast(`"${cup.name}" marked as ${newVal ? 'available' : 'unavailable'}.`);
    } catch (err) {
      console.error(err);
    }
  }

  deleteCup(i: number): void {
    this.deleteTarget = 'cup';
    this.deleteIndex = i;
    this.confirmLabel = this.cupSizes[i].name;
    this.confirmOpen = true;
  }

  // ──────────────────────────────
  // SHARED DELETE EXECUTION
  // ──────────────────────────────

  async executeDelete() {
    const i = this.deleteIndex;
    let msg = '';
    try {
      switch (this.deleteTarget) {
        case 'flavour':
          await this.menuService.deleteFlavour(this.flavours[i].id);
          msg = `"${this.flavours[i].name}" deleted.`;
          this.flavours.splice(i, 1);
          break;
        case 'cup':
          await this.menuService.deleteCup(this.cupSizes[i].id);
          msg = `"${this.cupSizes[i].name}" deleted.`;
          this.cupSizes.splice(i, 1);
          break;
      }
      this.confirmOpen = false;
      this.showToast(msg);
    } catch (err) {
      this.showToast('Delete failed. Please try again.');
    }
  }
}