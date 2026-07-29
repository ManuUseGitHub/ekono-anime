import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'titleSplitter',
})
export class TitleSplitterPipe implements PipeTransform {
  transform(value: string, ...args: unknown[]): string {
    return value.split(':').join("<br/>");
  }
}
