import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-anime-count',
  imports: [],
  templateUrl: './anime-count.html',
  styleUrl: './anime-count.scss'
})
export class AnimeCount {
  @Input()
  count?: number = 0;
}
