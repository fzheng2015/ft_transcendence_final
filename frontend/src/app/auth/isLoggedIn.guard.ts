import { Injectable } from "@angular/core";
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot } from "@angular/router";
import { AuthService } from "./auth.service";

@Injectable({
    providedIn: 'root'
})
export class IsLoggedInGuard implements CanActivate {

    constructor(
        private auth: AuthService,
        private router: Router
    ) {
    }

    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
        if (!this.auth.isLoggedIn()) {
            this.router.navigate(['/login']);
            return false;
        }
        return true;
    }

}