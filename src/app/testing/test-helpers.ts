import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialogModule } from '@angular/material/dialog';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { of, throwError } from 'rxjs';

export interface MockUser {
    _id: string;
    username: string;
    email: string;
    roles: string[];
    avatar?: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface MockGroup {
    _id: string;
    name: string;
    description: string;
    createdBy: string;
    members: string[];
    admins: string[];
    isPrivate: boolean;
}

export interface MockChannel {
    _id: string;
    name: string;
    description: string;
    groupId: string;
    createdBy: string;
    members: string[];
    type: 'text' | 'image' | 'file';
    isActive: boolean;
    isPrivate: boolean;
}

export interface MockMessage {
    _id: string;
    channelId: string;
    userId: string;
    username: string;
    text: string;
    type: 'text' | 'image' | 'file';
    createdAt: string;
}

export class TestHelpers {
    static createMockUser(overrides: Partial<MockUser> = {}): MockUser {
        return {
            _id: '507f1f77bcf86cd799439011',
            username: 'testuser',
            email: 'test@example.com',
            roles: ['user'],
            isActive: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            ...overrides
        };
    }

    static createMockGroup(overrides: Partial<MockGroup> = {}): MockGroup {
        return {
            _id: '507f1f77bcf86cd799439012',
            name: 'Test Group',
            description: 'A test group',
            createdBy: '507f1f77bcf86cd799439011',
            members: ['507f1f77bcf86cd799439011'],
            admins: ['507f1f77bcf86cd799439011'],
            isPrivate: false,
            ...overrides
        };
    }

    static createMockChannel(overrides: Partial<MockChannel> = {}): MockChannel {
        return {
            _id: '507f1f77bcf86cd799439013',
            name: 'general',
            description: 'General channel',
            groupId: '507f1f77bcf86cd799439012',
            createdBy: '507f1f77bcf86cd799439011',
            members: ['507f1f77bcf86cd799439011'],
            type: 'text',
            isActive: true,
            isPrivate: false,
            ...overrides
        };
    }

    static createMockMessage(overrides: Partial<MockMessage> = {}): MockMessage {
        return {
            _id: '507f1f77bcf86cd799439014',
            channelId: '507f1f77bcf86cd799439013',
            userId: '507f1f77bcf86cd799439011',
            username: 'testuser',
            text: 'Test message',
            type: 'text',
            createdAt: new Date().toISOString(),
            ...overrides
        };
    }

    static getDefaultTestBedConfig() {
        return {
            imports: [
                HttpClientTestingModule,
                RouterTestingModule,
                MatSnackBarModule,
                MatDialogModule,
                BrowserAnimationsModule
            ]
        };
    }

    static createMockService(methods: string[]) {
        const mockService: any = {};
        methods.forEach(method => {
            mockService[method] = () => of({});
        });
        return mockService;
    }

    static createErrorObservable(message: string = 'Test error') {
        return throwError(() => new Error(message));
    }

    static createSuccessObservable(data: any = {}) {
        return of({ success: true, data });
    }

    static async waitForAsync(fn: () => void) {
        await new Promise(resolve => setTimeout(resolve, 0));
        fn();
    }

    static triggerEvent(element: HTMLElement, eventType: string) {
        const event = new Event(eventType, { bubbles: true });
        element.dispatchEvent(event);
    }

    static setInputValue(input: HTMLInputElement, value: string) {
        input.value = value;
        input.dispatchEvent(new Event('input', { bubbles: true }));
    }
}
