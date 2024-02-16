import { DatePipe } from '@angular/common';
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'frenchDate'
})
export class FrenchDatePipe implements PipeTransform {

  transform(value: any, format: string = 'dd/MM/yyyy') {
    const datePipe: DatePipe = new DatePipe('fr');
    return datePipe.transform(value, format);
  }
}
