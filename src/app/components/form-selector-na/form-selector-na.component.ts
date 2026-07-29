import { booleanAttribute, Component, Input, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { INCLUSIVE_MARK } from '../../../ressources/value';
import { CommonModule } from '@angular/common';
import { TagOptionPipe } from '../../pipes/tag.pipe';
import { MatFormField, MatLabel, MatSelect, MatOption } from '@angular/material/select';

@Component({
  selector: 'app-form-selector-na',
  templateUrl: './form-selector-na.component.html',
  styleUrl: './form-selector-na.component.scss',
  imports: [FormsModule, CommonModule, TagOptionPipe, ReactiveFormsModule, MatFormField, MatLabel, MatSelect, MatOption],
  standalone: true,
})
export class FormSelectorNaComponent implements OnInit {
  @Input({ transform: booleanAttribute }) compact: Boolean = false;
  @Input() filterForm!: FormGroup;
  @Input() text!: string;
  @Input() controlName!: string;
  @Input() options!: any;
  @Input() specifics!: string[];
  @Input() onReadOption: (option:any) => string = (option:any) => option;

  inclMark = INCLUSIVE_MARK;
  control: any = undefined;

  get isCompact() {
    return this.compact == true;
  }

  get getClassIfDefault() {
    return this.control.value == INCLUSIVE_MARK ? '!text-gray-300' : '';
  }

  ngOnInit(): void {
    this.control = this.filterForm.get(this.controlName);
  }
}
