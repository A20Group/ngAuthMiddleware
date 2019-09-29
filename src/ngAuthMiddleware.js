/*
	MIT License http://www.opensource.org/licenses/mit-license.php
    Author AmirHossein Abdollahzadeh @A20Group
*/

"use strict";

import { authService } from "./service";
import { authProvider } from "./provider";

const ngAuthMiddleware = angular.module("ngAuthMiddleware", [
    "permission",
    "permission.ui",
    "ngCookies",
    "ui.router"
]);

ngAuthMiddleware.service("authService", authService);
ngAuthMiddleware.provider("$auth", authProvider);

export {
    ngAuthMiddleware
}
