/* @ngInject */
function authProvider() {
    // Default configuration
    var config = {
        rolePropertyName: null,
        withPermission: false,
        roles: null
    };

    return {
        // Service configuration
        configure: function (params) {
            angular.extend(config, params);
        },

        // Service itself
        $get: [
            "$q",
            "authService",
            function ($q, authService) {
                if (!config.roles || !Array.isArray(config.roles)) {
                    throw new Error(
                        "roles is a required field and should be is Array."
                    );
                }
                if (!config.rolePropertyName) {
                    throw new Error(
                        "rolePropertyName is a required field"
                    );
                }

                var init = function () {
                    let authData = authService.getAuthData();
                    if (authData) {
                        if (config.withPermission) {
                            authService.permissionHandler("signIn");
                            authService.uiRouterSync();
                        }
                    } else {
                        startLogout();
                    }
                };

                var startSignIn = function (authData, pageHandlerStatus) {
                    authService.saveAuthData(authData);
                    if (config.withPermission) {
                        authService.permissionHandler("signIn");
                        authService.uiRouterSync();
                    }
                    if (pageHandlerStatus) {
                        authService.pageStateNameHandler(
                            "signIn",
                            authData[config.rolePropertyName],
                            config
                        );
                    }
                };

                var startLogout = function () {
                    let authData = authService.getAuthData();
                    authService.clearAuthData();
                    if (config.withPermission) {
                        authService.permissionHandler("logOut");
                        authService.uiRouterSync();
                    }
                    authService.pageStateNameHandler("logOut", authData[config.rolePropertyName], config);
                };

                var updateRole = function (newRoleName) {
                    let authData = authService.getAuthData();
                    authData[config.rolePropertyName] = newRoleName;
                    authService.saveAuthData(authData);
                    authService.permissionHandler("signIn");
                    authService.uiRouterSync();
                    authService.pageStateNameHandler(
                        "signIn",
                        authData[config.rolePropertyName],
                        config
                    );
                };

                var notAuthorized = function () {
                    let authData = authService.getAuthData();
                    return authService.notAuthorized(authData, config);
                };

                init();

                return {
                    config: config,

                    isAuthenticated: function () {
                        return authService.hasValidToken();
                    },

                    notAuthorized: function () {
                        return notAuthorized();
                    },

                    signIn: function (authData, pageHandler) {
                        let pageHandlerStatus;
                        if (pageHandler == false) {
                            pageHandlerStatus = false;
                        }
                        else {
                            pageHandlerStatus = true;
                        }
                        startSignIn(authData, pageHandlerStatus);
                    },

                    logOut: function () {
                        startLogout();
                    },

                    user: function () {
                        return authService.getAuthData();
                    },

                    updateRole: function (newRoleName) {
                        if (!newRoleName) {
                            throw new Error(
                                "newRoleName is a required field For updateRole()"
                            );
                        }
                        else {
                            updateRole(newRoleName);
                        }
                    }
                };
            }
        ]
    };
}

export {
    authProvider
}