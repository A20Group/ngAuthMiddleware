var CryptoJS = require("crypto-js");

import secretKey from "./secretKey";
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
        if (!target) {
            return;
        }

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

    service.pageStateNameHandler = function (action, roles = "", config) {
        let userRoles = roles.split(",").filter(rule => rule);
        let allRoles = config.roles;

        if (userRoles[0] == "" || userRoles.length == 0) {
            let defaultRole = allRoles.find(
                state => state.roleName === "default"
            );
            if (action == "signIn") {
                service.signHandler(defaultRole.action, defaultRole.afterSignIn)
            } else if (action == "logOut") {
                service.signHandler(defaultRole.action, defaultRole.afterLogOut)
            } else {
                throw new Error(
                    "pageStateNameHandler need one action for input function"
                );
            }
        }
        else if (userRoles.length == 1) {
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
        }
        else if (userRoles.length >= 1) {

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
        }
    };

    service.permissionHandler = function (action, config) {
        PermPermissionStore.clearStore();
        if (action == "signIn") {
            let authData = service.getAuthData(config);
            let userPermissions = authData[config.permissionPropertyName];
            let permissions = ["authorized"];

            if (userPermissions) {
                userPermissions = userPermissions.split(",");
                if (userPermissions.length > 0) {
                    permissions = permissions.concat(userPermissions);
                }
            }

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
                `currentAction : ${action} \n permissionHandler need one action for input function`
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
        $cookies.put("authData", encryptAuthData, {
            expires: expires
        });
    };

    service.savePermissionData = function (permissionData) {
        if (permissionData) {
            let rawPermissionData = permissionData;

            if (!(typeof rawPermissionData === 'string' || rawPermissionData instanceof String || Array.isArray(rawPermissionData))) {
                throw new Error(
                    `permissionPropertyName value must be string or array`
                );
            }

            if (Array.isArray(rawPermissionData)) {
                rawPermissionData = rawPermissionData.toString();
            }

            var encryptPermissionData = CryptoJS.AES.encrypt(
                JSON.stringify(rawPermissionData),
                SECRETKEY
            ).toString();
            localStorage["permissionData"] = encryptPermissionData;
        }
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
                state => state.roleName === "default"
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

    service.IsValidJSONString = function (str) {
        try {
            JSON.parse(str);
        } catch (e) {
            return false;
        }
        return true;
    }

    service.getAuthData = function (config = { withPermission: false, permissionPropertyName: "permission" }) {
        let authData = $cookies.get("authData");

        if (service.IsValidJSONString(authData)) {
            service.clearAuthData();
            return false;
        }

        if (authData) {
            let bytesAuthData = CryptoJS.AES.decrypt(authData, SECRETKEY);
            var decryptedAuthData = JSON.parse(
                bytesAuthData.toString(CryptoJS.enc.Utf8)
            );

            if (config.withPermission) {
                let permissionData = localStorage["permissionData"];
                if (permissionData) {
                    let bytesPermissionData = CryptoJS.AES.decrypt(permissionData, SECRETKEY);
                    let decryptedPermissionData = JSON.parse(
                        bytesPermissionData.toString(CryptoJS.enc.Utf8)
                    );
                    decryptedAuthData[config.permissionPropertyName] = decryptedPermissionData;
                }
            }
            return decryptedAuthData;
        } else {
            return false;
        }
    };

    service.clearAuthData = function () {
        $cookies.remove("authData");
        localStorage.removeItem("permissionData");
    };
}

export {
    authService
}