import { Component, Input, Output, EventEmitter, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { Group, GroupStatus } from '../../../../models/group.model';

@Component({
  selector: 'app-group-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule
  ],
  template: `
    <form [formGroup]="groupForm" (ngSubmit)="onSubmit()">
      <div class="form-grid">
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Group Name</mat-label>
          <input matInput 
                 formControlName="name" 
                 required 
                 minlength="3" 
                 maxlength="50"
                 placeholder="Enter group name">
          <mat-error *ngIf="groupForm.get('name')?.hasError('required')">
            Group name is required
          </mat-error>
          <mat-error *ngIf="groupForm.get('name')?.hasError('minlength')">
            Group name must be at least 3 characters
          </mat-error>
          <mat-error *ngIf="groupForm.get('name')?.hasError('maxlength')">
            Group name must not exceed 50 characters
          </mat-error>
        </mat-form-field>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Description</mat-label>
          <textarea matInput 
                    formControlName="description" 
                    rows="4" 
                    maxlength="500"
                    placeholder="Enter group description"></textarea>
          <mat-error *ngIf="groupForm.get('description')?.hasError('maxlength')">
            Description must not exceed 500 characters
          </mat-error>
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Category</mat-label>
          <mat-select formControlName="category" required>
            <mat-option value="">Select Category</mat-option>
            <mat-option value="technology">Technology</mat-option>
            <mat-option value="business">Business</mat-option>
            <mat-option value="education">Education</mat-option>
            <mat-option value="entertainment">Entertainment</mat-option>
            <mat-option value="design">Design</mat-option>
            <mat-option value="other">Other</mat-option>
          </mat-select>
          <mat-error *ngIf="groupForm.get('category')?.hasError('required')">
            Category is required
          </mat-error>
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Status</mat-label>
          <mat-select formControlName="status" required>
            <mat-option [value]="GroupStatus.ACTIVE">Active</mat-option>
            <mat-option [value]="GroupStatus.INACTIVE">Inactive</mat-option>
            <mat-option [value]="GroupStatus.PENDING">Pending</mat-option>
          </mat-select>
          <mat-error *ngIf="groupForm.get('status')?.hasError('required')">
            Status is required
          </mat-error>
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Max Members</mat-label>
          <input matInput 
                 type="number" 
                 formControlName="maxMembers" 
                 min="1" 
                 max="1000"
                 placeholder="Maximum number of members">
          <mat-error *ngIf="groupForm.get('maxMembers')?.hasError('min')">
            Max members must be at least 1
          </mat-error>
          <mat-error *ngIf="groupForm.get('maxMembers')?.hasError('max')">
            Max members must not exceed 1000
          </mat-error>
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Privacy</mat-label>
          <mat-select formControlName="isPrivate">
            <mat-option [value]="false">Public</mat-option>
            <mat-option [value]="true">Private</mat-option>
          </mat-select>
        </mat-form-field>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Tags (comma-separated)</mat-label>
          <input matInput 
                 formControlName="tags" 
                 placeholder="art, design, creative"
                 maxlength="200">
          <mat-hint align="end">{{ groupForm.get('tags')?.value?.length || 0 }}/200</mat-hint>
        </mat-form-field>
      </div>

      <div class="form-actions">
        <button mat-stroked-button type="button" (click)="onCancel.emit()">
          Cancel
        </button>
        <button mat-raised-button 
                color="primary" 
                type="submit" 
                [disabled]="!groupForm.valid">
          <mat-icon>save</mat-icon>
          {{ isEditMode ? 'Update Group' : 'Create Group' }}
        </button>
      </div>
    </form>
  `,
  styles: [`
    .form-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 24px;
      margin-bottom: 32px;
    }
    .full-width {
      grid-column: 1 / -1;
    }
    .form-actions {
      display: flex;
      justify-content: flex-end;
      gap: 16px;
      padding-top: 24px;
      border-top: 1px solid #e0e0e0;
    }
    @media (max-width: 768px) {
      .form-grid {
        grid-template-columns: 1fr;
        gap: 16px;
      }
      .form-actions {
        flex-direction: column;
      }
    }
  `]
})
export class GroupFormComponent implements OnInit, OnChanges {
  @Input() group: Group | null = null;
  @Output() formSubmit = new EventEmitter<Partial<Group>>();
  @Output() onCancel = new EventEmitter<void>();

  groupForm!: FormGroup;
  GroupStatus = GroupStatus;
  isEditMode = false;

  constructor(private fb: FormBuilder) { }

  ngOnInit(): void {
    this.initForm();
    // If group data is already available, populate the form
    if (this.group) {
      this.isEditMode = true;
      this.populateForm();
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['group'] && this.group) {
      this.isEditMode = true;
      // Only populate if form is already initialized
      if (this.groupForm) {
        this.populateForm();
      }
    } else if (changes['group'] && !this.group) {
      this.isEditMode = false;
      this.initForm(); // Reset form if group becomes null
    }
  }

  initForm(): void {
    this.groupForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(50)]],
      description: ['', Validators.maxLength(500)],
      category: ['', Validators.required],
      status: [GroupStatus.ACTIVE, Validators.required],
      maxMembers: [100, [Validators.min(1), Validators.max(1000)]],
      isPrivate: [false],
      tags: ['', Validators.maxLength(200)]
    });
  }

  populateForm(): void {
    if (this.group) {
      console.log('Populating group form with data:', this.group);
      this.groupForm.patchValue({
        name: this.group.name,
        description: this.group.description || '',
        category: this.group.category || 'general',
        status: this.group.status || GroupStatus.ACTIVE,
        maxMembers: this.group.maxMembers || 100,
        isPrivate: this.group.isPrivate || false,
        tags: this.group.tags ? this.group.tags.join(', ') : ''
      });
      // Don't mark as pristine immediately - let user make changes
      console.log('Form after population:', this.groupForm.value);
      console.log('Form valid:', this.groupForm.valid);
      console.log('Form pristine:', this.groupForm.pristine);
    }
  }

  onSubmit(): void {
    if (this.groupForm.valid) {
      const formData = { ...this.groupForm.value };

      // Convert tags string to array
      if (formData.tags) {
        formData.tags = formData.tags.split(',').map((tag: string) => tag.trim()).filter((tag: string) => tag.length > 0);
      } else {
        formData.tags = [];
      }

      this.formSubmit.emit(formData);
    }
  }
}
