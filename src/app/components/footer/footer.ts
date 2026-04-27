import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

@Component({
  selector: 'app-footer',
  imports: [CommonModule],
  templateUrl: './footer.html',
  styleUrl: './footer.css',
})
export class Footer {

  currentYear = 2026;

  navLinks = [
    { label: 'Home', href: '#' },
    { label: 'About us', href: '#' },
    { label: 'Contact us', href: '#' },
    { label: 'Feedback', href: '#' },
    { label: 'Privacy policy', href: '#' },
  ];

  socialLinks = [
    { label: 'Instagram', icon: 'photo_camera' },
    { label: 'TikTok', icon: 'music_video' },
    { label: 'Facebook', icon: 'thumb_up' },
    { label: 'X', icon: 'tag' },
  ];
}
