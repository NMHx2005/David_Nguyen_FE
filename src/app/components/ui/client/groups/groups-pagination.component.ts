import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
    selector: 'app-groups-pagination',
    standalone: true,
    imports: [
        CommonModule,
        MatButtonModule,
        MatIconModule
    ],
    template: `
    <div class="pagination" *ngIf="totalPages > 1">
      <button 
        mat-button 
        [disabled]="currentPage === 1"
        (click)="onPageChange(currentPage - 1)"
        matTooltip="Previous page">
        <mat-icon>chevron_left</mat-icon>
        Previous
      </button>

      <div class="page-info">
        Page {{ currentPage }} of {{ totalPages }}
      </div>

      <button 
        mat-button 
        [disabled]="currentPage === totalPages"
        (click)="onPageChange(currentPage + 1)"
        matTooltip="Next page">
        Next
        <mat-icon>chevron_right</mat-icon>
      </button>
    </div>
  `,
    styles: [`
    .pagination {
      display: flex;
      justify-content: center;
      align-items: center;
      gap: 16px;
      margin: 24px 0;
      padding: 16px;
      background: white;
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }

    .page-info {
      font-weight: 500;
      color: #666;
      min-width: 100px;
      text-align: center;
    }

    @media (max-width: 768px) {
      .pagination {
        flex-direction: column;
        gap: 12px;
      }
    }
  `]
})
export class GroupsPaginationComponent {
    @Input() currentPage = 1;
    @Input() totalPages = 1;

    @Output() pageChange = new EventEmitter<number>();

    onPageChange(page: number): void {
        this.pageChange.emit(page);
    }
}
