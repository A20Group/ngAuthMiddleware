# ngAuthMiddleware

Library to provide user authentication and access management, browser-based JavaScript client Angularjs applications.

[![npm](https://img.shields.io/npm/v/ng-auth-middleware?style=flat-square)](https://www.npmjs.com/package/ng-auth-middleware)

## Getting started

To install ngAuthMiddleware use npm

```
npm install ng-auth-middleware --save
```

## Dependencies

```
 - angular
 - angular-permission
 - angular-cookies
 - @uirouter/angularjs
```

Inject the `ngAuthMiddleware` in your module and `$authProvider` to config the module while configuring your angular-application.

```javascript
var app = angular.module("myApp", ["ngAuthMiddleware"]);

app.config([
  "$authProvider",
  function($authProvider) {
    $authProvider.configure({
      withPermission: true, // by default set false

      rolePropertyName: "userRole", // property name of role which become from server

      roles: [
        {
          action: "href", // href or state

          roleName: "default", // name of each role

          afterSignIn: "applicant", // login according to role

          afterLogOut: "authorization.login" // logout according to role
        }
      ]
    });
  }
]);
```

# Sample

There is a full example in the sample Folder.

### This is preface sample:

#### app.config

```javascript
App.congif.$inject = ["$authProvider"];
function AppConfig(authProvider) {
  authProvider.configure({
    withPermission: true,
    signAction: "state",
    roles: [
      {
        action: "href",
        roleName: "default",
        afterSignIn: "module.panel.dashboard",
        afterLogOut: "authorization.login"
      },
      {
        action: "href",
        roleName: "admin",
        afterSignIn: "admin.panel.dashboard",
        afterLogOut: "authorization.login"
      },
      {
        action: "state",
        roleName: "multiRole",
        afterSignIn: "module.panel.selectedRole",
        afterLogOut: "authorization.login"
      }
    ]
  });
}
```

### updateRole Method Sample

It takes a param where the new role name is assigned, this method remove all roles of user and replace new role which get from param.
you can use this method when you have multirole and choose one of them and remove rest of it.

```javascript
$auth.updateRole(roleName);
```

### user Method Sample

return store data.

```javascript
$auth.user();
```

### signIn Method Sample

It stores the information coming from the server and directs the user to the target given the role and address entered in the configuration.

```javascript
$auth.signIn(response);
```

### notAuthorized Method Sample

Invokes the method afterSingIn() if the user does not have access to a page

```javascript
$auth.notAuthorized();
```

### isAuthenticated Method Sample

Returns a boolean whether or not the user is authenticated

```javascript
$auth.isAuthenticated();
```

### logOut Method Sample

First it clears all data and roles Given the role and address entered in Configuration, it redirects the user to that target.

```javascript
auth.logOut();
```

## Running the Sample

npm start and then browse to [http://localhost:5000](http://localhost:5000).

## Docs

Some initial docs are [here](https://github.com/A20Group/ngAuthMiddleware/wiki).

### First step:

Inject `ngAuthMiddleware` in app module.

```javascript
var app = angular.module("myApp", ["ngAuthMiddleware"]);
```

### Second step:

Inject `$authProvider` in config file, as mentioned above the object exist in `authProviderConfigure()` has some properties which want explain here:

#### create object of authProvider.

```javascript
authProvider.configure({
  withPermission: true,

  rolePropertyName: "userRole",

  roles: [
    {
      action: "state",

      roleName: "defult",

      afterSignIn: "app.dashboard",

      afterLogOut: "app.login"
    }
  ]
});
```

#### "with permission":

Could set false or true, if set false you haven't connection with angular-permission else you have connected with angular-permission, if you dont set value by default set false.

#### "rolePropertyName":

The response you receive from the server in which property the roles are assigned.

#### "roles":

This property is array which set objects,each object says how to behave with each role:

##### "roles > action":

Could set href or state, href uses for change url in one project externally, state uses for change url in one project internally.

##### "roles > roleName":

Could set name of role and you can set just one role, if your project has multiRole, you have to set multiRole for value of roleName and go to selected role page to choose one role, and at the end you have to set default for one of objects which exist in roles array.

##### "afterSignIn":

As is clear from the word, which page to go after login.

##### "afterLogOut":

As is clear from the word, which page to go after logOut.

## Feedback, Feature requests, and Bugs

All are welcome on the [issue tracker](https://github.com/A20Group/ngAuthMiddleware/issues).
