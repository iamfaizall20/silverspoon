import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Sidebar } from '../../components/sidebar/sidebar';

@Component({
  selector: 'app-adminlayout',
  imports: [RouterOutlet, Sidebar],
  templateUrl: './adminlayout.html',
  styleUrl: './adminlayout.css',
})
export class Adminlayout {

}
