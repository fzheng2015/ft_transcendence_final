export class IValidatedUser {
    id: number; // Needed to redirect to the profile page
    jwt: string; // Needed for authorization
    jwtRefresh: string // Needed to refresh the authorization token
    userExists: boolean; // Needed to redirect to edit profile page if user was created
    isTfaEnabled?: boolean;
}