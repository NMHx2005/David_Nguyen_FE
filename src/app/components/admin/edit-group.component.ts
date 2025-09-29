import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { AuthService } from '../../services/auth.service';
import { AdminLayoutComponent } from '../layouts/admin-layout.component';
import { User, UserRole } from '../../models/user.model';
import { Group, GroupStatus } from '../../models/group.model';

@Component({
    selector: 'app-edit-group',
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        RouterLink,
        MatCardModule,
        MatButtonModule,
        MatIconModule,
        MatFormFieldModule,
        MatInputModule,
        MatSelectModule,
        MatSnackBarModule,
        AdminLayoutComponent
    ],
    template: `
    <app-admin-layout [pageTitle]="'Edit Group'">
      <div class="edit-group-container">
        <!-- Header Section -->
        <mat-card class="page-header-card">
          <div class="page-header">
            <div class="header-content">
              <h1>Edit Group</h1>
              <p>Update group information and settings</p>
            </div>
            <div class="header-actions">
              <button mat-stroked-button [routerLink]="['/admin/groups', groupId]">
                <mat-icon>arrow_back</mat-icon>
                Back to Group
              </button>
            </div>
          </div>
        </mat-card>

        <!-- Edit Form -->
        <mat-card class="edit-form-card" *ngIf="group">
          <mat-card-content>
            <form [formGroup]="editForm" (ngSubmit)="updateGroup()">
              <div class="form-grid">
                <mat-form-field appearance="outline" class="full-width">
                  <mat-label>Group Name</mat-label>
                  <input matInput 
                         formControlName="name" 
                         required 
                         minlength="3" 
                         maxlength="50"
                         placeholder="Enter group name">
                  <mat-error *ngIf="editForm.get('name')?.hasError('required')">
                    Group name is required
                  </mat-error>
                  <mat-error *ngIf="editForm.get('name')?.hasError('minlength')">
                    Group name must be at least 3 characters
                  </mat-error>
                  <mat-error *ngIf="editForm.get('name')?.hasError('maxlength')">
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
                  <mat-error *ngIf="editForm.get('description')?.hasError('maxlength')">
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
                  <mat-error *ngIf="editForm.get('category')?.hasError('required')">
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
                  <mat-error *ngIf="editForm.get('status')?.hasError('required')">
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
                  <mat-error *ngIf="editForm.get('maxMembers')?.hasError('min')">
                    Max members must be at least 1
                  </mat-error>
                  <mat-error *ngIf="editForm.get('maxMembers')?.hasError('max')">
                    Max members must not exceed 1000
                  </mat-error>
                </mat-form-field>
              </div>

              <div class="form-actions">
                <button mat-stroked-button type="button" [routerLink]="['/admin/groups', groupId]">
                  Cancel
                </button>
                <button mat-raised-button 
                        color="primary" 
                        type="submit" 
                        [disabled]="!editForm.valid || editForm.pristine">
                  <mat-icon>save</mat-icon>
                  Update Group
                </button>
              </div>
            </form>
          </mat-card-content>
        </mat-card>

        <!-- Loading State -->
        <div *ngIf="!group" class="loading-state">
          <mat-icon class="loading-icon">refresh</mat-icon>
          <p>Loading group details...</p>
        </div>
      </div>
    </app-admin-layout>
  `,
    styles: [`
    .edit-group-container {
      margin: 0 auto;
      padding: 24px;
      max-width: 800px;
    }

    .page-header-card {
      margin-bottom: 24px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
    }

    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16px;
    }

    .header-content h1 {
      margin: 0 0 8px 0;
      font-size: 2rem;
      font-weight: 500;
    }

    .header-content p {
      margin: 0;
      opacity: 0.9;
    }

    .header-actions {
      display: flex;
      gap: 16px;
    }

    .edit-form-card {
      margin-bottom: 24px;
    }

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

    .loading-state {
      text-align: center;
      padding: 60px 20px;
      color: #666;
    }

    .loading-icon {
      font-size: 48px;
      color: #667eea;
      margin-bottom: 16px;
      animation: spin 1s linear infinite;
    }

    @keyframes spin {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }

    @media (max-width: 768px) {
      .edit-group-container {
        padding: 16px;
      }

      .page-header {
        flex-direction: column;
        gap: 16px;
        text-align: center;
      }

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
export class EditGroupComponent implements OnInit {
    editForm: FormGroup;
    group: Group | null = null;
    groupId: string = '';
    currentUser: User | null = null;

    // Expose enums to template
    GroupStatus = GroupStatus;

    constructor(
        private fb: FormBuilder,
        private route: ActivatedRoute,
        private router: Router,
        private authService: AuthService,
        private snackBar: MatSnackBar
    ) {
        this.editForm = this.fb.group({
            name: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(50)]],
            description: ['', Validators.maxLength(500)],
            category: ['', Validators.required],
            status: [GroupStatus.ACTIVE, Validators.required],
            maxMembers: [100, [Validators.min(1), Validators.max(1000)]]
        });
    }

    /**
     * Lifecycle: initialize current user and subscribe to route params to load group.
     */
    ngOnInit(): void {
        this.currentUser = this.authService.getCurrentUser();
        this.route.params.subscribe(params => {
            this.groupId = params['groupId'];
            if (this.groupId) {
                this.loadGroup();
            }
        });
    }

    /**
     * Load group data from localStorage by id.
     */
    loadGroup(): void {
        const storedGroups = localStorage.getItem('groups');
        if (storedGroups) {
            const groups: Group[] = JSON.parse(storedGroups);
            this.group = groups.find(g => g.id === this.groupId) || null;

            if (this.group) {
                this.populateForm();
            } else {
                this.snackBar.open('Group not found', 'Close', {
                    duration: 3000,
                    panelClass: ['error-snackbar']
                });
                this.router.navigate(['/admin/groups']);
            }
        }
    }

    /**
     * Populate reactive form with selected group's data.
     */
    populateForm(): void {
        if (this.group) {
            this.editForm.patchValue({
                name: this.group.name,
                description: this.group.description || '',
                category: this.group.category,
                status: this.group.status,
                maxMembers: this.group.maxMembers || 100
            });
        }
    }

    /**
     * Validate and persist group updates to localStorage; show feedback; navigate back to detail.
     */
    updateGroup(): void {
        if (this.editForm.valid && this.group) {
            try {
                // Check permissions
                if (!this.canEditGroup(this.group)) {
                    this.snackBar.open('You do not have permission to edit this group', 'Close', {
                        duration: 5000,
                        panelClass: ['error-snackbar']
                    });
                    return;
                }

                // Check for name conflicts
                const newName = this.editForm.value.name;
                if (newName !== this.group.name) {
                    const storedGroups = localStorage.getItem('groups');
                    if (storedGroups) {
                        const groups: Group[] = JSON.parse(storedGroups);
                        const nameExists = groups.some(g => g.name === newName && g.id !== this.groupId);
                        if (nameExists) {
                            this.snackBar.open('Group name already exists', 'Close', {
                                duration: 3000,
                                panelClass: ['error-snackbar']
                            });
                            return;
                        }
                    }
                }

                // Update group
                const updatedGroup: Group = {
                    ...this.group,
                    name: this.editForm.value.name,
                    description: this.editForm.value.description,
                    category: this.editForm.value.category,
                    status: this.editForm.value.status,
                    maxMembers: this.editForm.value.maxMembers,
                    updatedAt: new Date()
                };

                // Save to localStorage
                const storedGroups = localStorage.getItem('groups');
                if (storedGroups) {
                    const groups: Group[] = JSON.parse(storedGroups);
                    const index = groups.findIndex(g => g.id === this.groupId);
                    if (index > -1) {
                        groups[index] = updatedGroup;
                        localStorage.setItem('groups', JSON.stringify(groups));
                    }
                }

                this.snackBar.open('Group updated successfully', 'Close', {
                    duration: 3000,
                    panelClass: ['success-snackbar']
                });

                this.router.navigate(['/admin/groups', this.groupId]);

            } catch (error) {
                this.snackBar.open('Failed to update group. Please try again.', 'Close', {
                    duration: 5000,
                    panelClass: ['error-snackbar']
                });
            }
        }
    }

    /**
     * Determine if current user can edit the group based on role and ownership.
     * @param group Group to check permissions for.
     * @returns True if permitted, otherwise false.
     */
    canEditGroup(group: Group): boolean {
        if (!this.currentUser) return false;
        if (this.currentUser.roles.includes(UserRole.SUPER_ADMIN)) return true;
        if (this.currentUser.roles.includes(UserRole.GROUP_ADMIN)) {
            return group.createdBy === this.currentUser.id;
        }
        return false;
    }
}
