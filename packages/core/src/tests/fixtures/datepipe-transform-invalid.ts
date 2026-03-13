import { DatePipe } from '@angular/common';

export class C {
  constructor(private datePipe: DatePipe) {}

  bad(d: Date) {
    return this.datePipe.transform(d, 'MM/dd/yyyy');
  }
}

