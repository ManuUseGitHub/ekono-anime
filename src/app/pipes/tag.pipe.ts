import { Pipe, PipeTransform } from '@angular/core';
import { tagOption } from '../lib/regex';

@Pipe({
  name: 'tagOption',
  standalone: true,
})
export class TagOptionPipe implements PipeTransform {
  transform(value: string, part: 'option' | 'value' = 'option'): string {
    return tagOption(value)[part];
  }
}
