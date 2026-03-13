export class NotDatePipe {
  transform(a: unknown, b: unknown) {
    return [a, b];
  }
}

export class C {
  constructor(private svc: NotDatePipe) {}

  ok(d: Date) {
    return this.svc.transform(d, 'MM/dd/yyyy');
  }
}

