import { Directive, Input, OnChanges, OnInit, SimpleChanges, TemplateRef, ViewContainerRef } from '@angular/core';
import {LetContext} from "./let-context";

@Directive({
  selector: '[let]',
})
export class LetDirective<T = unknown> implements OnChanges, OnInit {
  @Input() public letOf: T | undefined;

  private context: LetContext = new LetContext();

  constructor(private templateRef: TemplateRef<any>, private viewContainerRef: ViewContainerRef) {}

  public ngOnInit(): void {
    this.viewContainerRef.createEmbeddedView(this.templateRef, this.context);
  }

  public ngOnChanges(changes: SimpleChanges): void {
    if (changes.letOf) {
      Object.assign(this.context, this.letOf);
    }
  }
}
