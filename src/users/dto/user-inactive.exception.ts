export class UserInactiveException extends Error {
    constructor(){
        super("User is not active")
    }
}