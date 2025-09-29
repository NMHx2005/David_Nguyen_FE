import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
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
    // Check if user is authenticated first; try to reload from storage to avoid transient nulls
    if (!this.authService.isAuthenticated()) {
      this.authService.ensureUserLoaded();
    }

    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
      return false;
    }

    const requiredRoles = route.data['roles'] as UserRole[];

    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const hasRequiredRole = requiredRoles.some(role => this.authService.hasRole(role));

    if (hasRequiredRole) {
      return true;
    } else {
      // Redirect to appropriate page based on user role
      const currentUser = this.authService.getCurrentUser();
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
