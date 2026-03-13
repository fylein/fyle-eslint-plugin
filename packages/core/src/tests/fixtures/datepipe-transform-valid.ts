import { DatePipe } from '@angular/common';

export class C {
  constructor(private datePipe: DatePipe) {}

  ok(d: Date) {
    return this.datePipe.transform(d);
  }
}

