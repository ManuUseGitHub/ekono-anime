import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'searchString',
})
export class SearchStringPipe implements PipeTransform {
  transform(value: string, ...args: any[]): string {
    
    return value;
  }
}
