import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderpageVisiteurComponent } from './components/headerpage-visiteur/headerpage-visiteur.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet,HeaderpageVisiteurComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'collabdev';
}
