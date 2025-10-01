import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { AuthService } from '../components/auth/auth.service';
import { UserRole } from '../models';

@Injectable({
  providedIn: 'root'
})
export class RoleGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private router: Router
  ) { }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    console.log('RoleGuard: Checking access to', state.url);
    console.log('Required roles:', route.data['roles']);

    // Check if user is authenticated first; try to reload from storage to avoid transient nulls
    if (!this.authService.isAuthenticated()) {
      console.log('RoleGuard: User not authenticated, trying to reload from storage');
      this.authService.ensureUserLoaded();
    }

    if (!this.authService.isAuthenticated()) {
      console.log('RoleGuard: User still not authenticated, redirecting to login');
      this.router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
      return false;
    }

    const currentUser = this.authService.getCurrentUser();
    console.log('RoleGuard: Current user:', currentUser);
    console.log('RoleGuard: User roles:', currentUser?.roles);

    const requiredRoles = route.data['roles'] as UserRole[];

    if (!requiredRoles || requiredRoles.length === 0) {
      console.log('RoleGuard: No required roles, allowing access');
      return true;
    }

    const hasRequiredRole = requiredRoles.some(role => this.authService.hasRole(role));
    console.log('RoleGuard: Has required role:', hasRequiredRole);

    if (hasRequiredRole) {
      console.log('RoleGuard: Access granted');
      return true;
    } else {
      console.log('RoleGuard: Access denied, redirecting based on user role');
      // Redirect to appropriate page based on user role
      if (currentUser) {
        if (this.authService.isSuperAdmin()) {
          this.router.navigate(['/admin']);
        } else if (this.authService.isGroupAdmin()) {
          this.router.navigate(['/admin']);
        } else {
          this.router.navigate(['/home']);
        }
      } else {
        this.router.navigate(['/login']);
      }
      return false;
    }
  }
}
