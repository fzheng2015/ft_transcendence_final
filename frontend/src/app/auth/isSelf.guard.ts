import { Injectable } from "@angular/core";
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot } from "@angular/router";
import { AuthService } from "./auth.service";

@Injectable({
    providedIn: 'root'
})
export class IsSelfGuard implements CanActivate {

    constructor(
        private auth: AuthService,
        private router: Router
    ) {
    }

    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
        const userId = route.params['id'];
        if (!this.auth.isLoggedIn() || this.auth.getId() != userId) {
            this.router.navigate(['/user/' + this.auth.getId()]);
            return false;
        }
        return true;
    }

}