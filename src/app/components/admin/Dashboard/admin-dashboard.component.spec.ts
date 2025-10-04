import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AdminDashboardComponent } from './admin-dashboard.component';
import { AdminService } from '../../../services/admin.service';
import { TestHelpers } from '../../../testing/test-helpers';

describe('AdminDashboardComponent', () => {
    let component: AdminDashboardComponent;
    let fixture: ComponentFixture<AdminDashboardComponent>;
    let adminService: jasmine.SpyObj<AdminService>;

    beforeEach(async () => {
        const adminSpy = jasmine.createSpyObj('AdminService', [
            'getDashboardStats', 'getSystemStats', 'getUserStats', 'getGroupStats', 'getChannelStats'
        ]);

        await TestBed.configureTestingModule({
            imports: [AdminDashboardComponent],
            providers: [
                { provide: AdminService, useValue: adminSpy }
            ]
        }).compileComponents();

        fixture = TestBed.createComponent(AdminDashboardComponent);
        component = fixture.componentInstance;
        adminService = TestBed.inject(AdminService) as jasmine.SpyObj<AdminService>;
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should load dashboard stats on init', async () => {
        const mockStats = {
            totalUsers: 100,
            totalGroups: 25,
            totalChannels: 150,
            totalMessages: 5000,
            activeUsers: 45,
            newUsersToday: 5
        };
        adminService.getDashboardStats.and.returnValue(TestHelpers.createSuccessObservable(mockStats));

        await component.ngOnInit();

        expect(adminService.getDashboardStats).toHaveBeenCalled();
        expect(component.dashboardStats).toEqual(mockStats);
    });

    it('should load system stats', async () => {
        const mockSystemStats = {
            systemUptime: '5 days',
            memoryUsage: '512MB',
            diskUsage: '2GB',
            cpuUsage: '25%'
        };
        adminService.getSystemStats.and.returnValue(TestHelpers.createSuccessObservable(mockSystemStats));

        await component.loadSystemStats();

        expect(adminService.getSystemStats).toHaveBeenCalled();
        expect(component.systemStats).toEqual(mockSystemStats);
    });

    it('should load user stats', async () => {
        const mockUserStats = {
            totalUsers: 100,
            activeUsers: 45,
            newUsersToday: 5,
            bannedUsers: 2
        };
        adminService.getUserStats.and.returnValue(TestHelpers.createSuccessObservable(mockUserStats));

        await component.loadUserStats();

        expect(adminService.getUserStats).toHaveBeenCalled();
        expect(component.userStats).toEqual(mockUserStats);
    });

    it('should load group stats', async () => {
        const mockGroupStats = {
            totalGroups: 25,
            publicGroups: 20,
            privateGroups: 5,
            averageMembersPerGroup: 8.5
        };
        adminService.getGroupStats.and.returnValue(TestHelpers.createSuccessObservable(mockGroupStats));

        await component.loadGroupStats();

        expect(adminService.getGroupStats).toHaveBeenCalled();
        expect(component.groupStats).toEqual(mockGroupStats);
    });

    it('should load channel stats', async () => {
        const mockChannelStats = {
            totalChannels: 150,
            textChannels: 120,
            imageChannels: 20,
            fileChannels: 10
        };
        adminService.getChannelStats.and.returnValue(TestHelpers.createSuccessObservable(mockChannelStats));

        await component.loadChannelStats();

        expect(adminService.getChannelStats).toHaveBeenCalled();
        expect(component.channelStats).toEqual(mockChannelStats);
    });

    it('should handle loading states', async () => {
        adminService.getDashboardStats.and.returnValue(new Promise(resolve => setTimeout(() => resolve({ success: true, data: {} }), 100)));

        const promise = component.loadDashboardStats();
        expect(component.isLoading).toBe(true);

        await promise;
        expect(component.isLoading).toBe(false);
    });

    it('should handle error states', async () => {
        adminService.getDashboardStats.and.returnValue(TestHelpers.createErrorObservable('Network error'));

        await component.loadDashboardStats();

        expect(component.error).toBe('Network error');
    });

    it('should refresh all stats', async () => {
        spyOn(component, 'loadDashboardStats').and.returnValue(Promise.resolve());
        spyOn(component, 'loadSystemStats').and.returnValue(Promise.resolve());
        spyOn(component, 'loadUserStats').and.returnValue(Promise.resolve());
        spyOn(component, 'loadGroupStats').and.returnValue(Promise.resolve());
        spyOn(component, 'loadChannelStats').and.returnValue(Promise.resolve());

        await component.refreshStats();

        expect(component.loadDashboardStats).toHaveBeenCalled();
        expect(component.loadSystemStats).toHaveBeenCalled();
        expect(component.loadUserStats).toHaveBeenCalled();
        expect(component.loadGroupStats).toHaveBeenCalled();
        expect(component.loadChannelStats).toHaveBeenCalled();
    });

    it('should format numbers correctly', () => {
        expect(component.formatNumber(1000)).toBe('1,000');
        expect(component.formatNumber(1000000)).toBe('1,000,000');
        expect(component.formatNumber(500)).toBe('500');
    });

    it('should calculate percentage correctly', () => {
        expect(component.calculatePercentage(25, 100)).toBe(25);
        expect(component.calculatePercentage(50, 200)).toBe(25);
        expect(component.calculatePercentage(0, 100)).toBe(0);
    });
});
