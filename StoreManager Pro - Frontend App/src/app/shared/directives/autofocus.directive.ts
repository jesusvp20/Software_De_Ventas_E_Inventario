import { Directive, ElementRef, AfterViewInit, Input } from '@angular/core';

@Directive({
  standalone: false,
  selector: '[appAutofocus]'
})
export class AutofocusDirective implements AfterViewInit {
  @Input() appAutofocus: boolean = true;
  @Input() delay: number = 100;

  constructor(private elementRef: ElementRef) { }

  ngAfterViewInit(): void {
    if (this.appAutofocus) {
      setTimeout(() => {
        this.elementRef.nativeElement.focus();
      }, this.delay);
    }
  }
}