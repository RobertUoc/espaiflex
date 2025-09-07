import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'PipePreu',
    standalone: true
})

export class PipePreuPipe implements PipeTransform {
    transform(value: number): string {
        value = Number(value);
        return value.toFixed(2)
    }
}


