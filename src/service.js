var CryptoJS = require("crypto-js");
const SECRETKEY = secretKey("0x0");

/* @ngInject */
function authService($cookies, PermPermissionStore, $urlRouter, $state, $timeout) {
    var service = this;

    service.uiRouterSync = function () {
        // Once permissions are set-up
        // kick-off router and start the application rendering
        $urlRouter.sync();
        // Also enable router to listen to url changes
        $urlRouter.listen();
    };

    //After SignIn And SignOut Action Handler 
    service.signHandler = function (action, target) {
        let targetAction = action || "state";
        if (targetAction == "state") {
            $timeout(function () {
                $state.go(target);
            }, 500);
        }
        else if (targetAction == "href") {
            location.href = target;
        }
        else {
            throw new Error(
                "targetAction in config have a problem"
            );
        }
    };

    service.pageStateNameHandler = function (action, roles, config) {
        if (roles) {
            let userRoles = roles.split(",");
            let allRoles = config.roles;

            if (userRoles.length == 1) {
                let userRole = {};
                for (let i = 0; i < allRoles.length; i++) {
                    if (userRoles[i] != null) {
                        userRole = allRoles.find(
                            state => state.roleName === userRoles[i]
                        );
                    }
                }
                if (action == "signIn") {
                    service.signHandler(userRole.action, userRole.afterSignIn)
                } else if (action == "logOut") {
                    service.signHandler(userRole.action, userRole.afterLogOut)
                } else {
                    throw new Error(
                        "pageStateNameHandler need one action for input function"
                    );
                }
            } else if (userRoles.length >= 1) {

                let multiRole = allRoles.find(
                    state => state.roleName === "multiRole"
                );
                if (action == "signIn") {
                    service.signHandler(multiRole.action, multiRole.afterSignIn)
                } else if (action == "logOut") {
                    service.signHandler(multiRole.action, multiRole.afterLogOut)
                } else {
                    throw new Error(
                        "pageStateNameHandler need one action for input function"
                    );
                }
            } else {
                let defaultState = allRoles.find(
                    state => state.roleName === "defaultState"
                );
                if (action == "signIn") {
                    service.signHandler(defaultState.action, defaultState.afterSignIn)
                } else if (action == "logOut") {
                    service.signHandler(defaultState.action, defaultState.afterLogOut)
                } else {
                    throw new Error(
                        "pageStateNameHandler need one action for input function"
                    );
                }
            }
        }
    };

    service.permissionHandler = function (action) {
        PermPermissionStore.clearStore();
        if (action == "signIn") {
            let authData = service.getAuthData();
            let userRoles = authData[config.rolePropertyName];
            var permissions = ["authorized", userRoles];
            PermPermissionStore.defineManyPermissions(
                permissions,
    /*@ngInject*/ function (permissionName) {
                    return permissions.includes(permissionName);
                }
            );
        } else if (action == "logOut") {
            PermPermissionStore.definePermission("anonymous", function () {
                return true;
            });
        } else {
            throw new Error(
                "permissionHandler need one action for input function"
            );
        }
    };

    service.saveAuthData = function (authData) {
        let rawAuthData = authData;
        var encryptAuthData = CryptoJS.AES.encrypt(
            JSON.stringify(rawAuthData),
            SECRETKEY
        ).toString();
        let expires_in = rawAuthData.expires_in;
        let date = new Date();
        date.setTime(date.getTime() + expires_in * 1000);
        let expires = date.toGMTString();
        $cookies.putObject("authData", encryptAuthData, {
            expires: expires
        });
    };

    service.hasValidToken = function () {
        var authData = service.getAuthData();
        if (!authData) return false;

        var now = Date.now();
        // var issuedAtMSec = claims.iat * 1000;
        var expiresAtMSec = new Date().getTime() + authData.expires_in * 1000;
        // var marginMSec = 1000 * 60 * 5; // 5 Minutes

        // Substract margin, because browser time could be a bit in the past
        // if (issuedAtMSec - marginMSec > now) {
        //     console.log('oidc-connect: Token is not yet valid!')
        //     return false
        // }

        if (expiresAtMSec < now) {

            return false;
        }


        return true;
    };

    service.notAuthorized = function (authData, config) {
        let allRoles = config.roles;
        if (!authData) {
            let afterLogOut = allRoles.find(
                state => state.roleName === "defaultState"
            ).afterLogOut;
            return afterLogOut;
        }
        if (authData[config.rolePropertyName]) {

            let userRoles = authData[config.rolePropertyName].split(",");

            if (userRoles.length == 1) {
                let userRole = {};
                for (let i = 0; i < allRoles.length; i++) {
                    if (userRoles[i] != null) {
                        userRole = allRoles.find(
                            state => state.roleName === userRoles[i]
                        );
                    }
                }
                return userRole.afterSignIn;
            }
            else if (userRoles.length >= 1) {
                let multiRole = allRoles.find(
                    state => state.roleName === "multiRole"
                );
                return multiRole.afterSignIn;
            } else {
                throw new Error(
                    "User Not Any Role"
                );
            }
        }
    };

    service.getAuthData = function () {
        let authData = $cookies.getObject("authData");
        if (authData) {
            var bytesAuthData = CryptoJS.AES.decrypt(authData, SECRETKEY);
            var decryptedAuthData = JSON.parse(
                bytesAuthData.toString(CryptoJS.enc.Utf8)
            );
            return decryptedAuthData;
        } else {
            return false;
        }
    };

    service.clearAuthData = function () {
        $cookies.remove("authData");
    };
}

export {
    authService
}