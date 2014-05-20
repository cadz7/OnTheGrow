/* global window */

angular.module('sproutApp.user', [
  'sproutApp.server',
  'sproutApp.util'
])

.factory('userStorage', [

  function () {
    'use strict';
    var service = {};

    service.get = function () {
      return JSON.parse(window.localStorage.getItem('user'));
    };

    service.set = function (user) {
      return window.localStorage.setItem('user', JSON.stringify(user));
    };

    service.removeUser = function () {
      return window.localStorage.removeItem('user');
    };

    return service;
  }
])

.factory('user', ['userStorage', '$q', '$log', '$window', 'util', 'server',
  function (userStorage, $q, $log, $window, util, server) {
    'use strict';
    var user = {};
    var authenticatedDeferred = $q.defer();

    user.isAuthenticated = false; // Shows whether the user is authenticated.
    // This does not mean the server thinks we are authenticated, just that
    // the user is logged in as far as the client is concerned. If we are
    // logged but have lost the auth token, we are still "authenticated",
    // our authentication is just on hold. This service does not concern
    // itself with this - that should be handled by the server service.

    // Since the app will need to work in an off-line mode, we'll have to be
    // optimistic about authentication: once we've authenticated the user,
    // we consider them authenticated until we hear otherwise.
    function getUserStatus() {
      user.data = userStorage.get();
      if (_.isObject(user.data) && user.data.userId) {
        user.isAuthenticated = true;
        authenticatedDeferred.resolve();
      }
      return user.data;
    }

    /**
     * Returns a promise that resolves when the user is authenticated. This is
     * to account for the case where the app starts in a non-authenticated mode
     * and goes into the authenticated mode later.
     *
     * @return {promise}               A $q promise that resolves when the user
     *                                 is authenticated.
     */
    user.whenAuthenticated = function () {
      return authenticatedDeferred.promise;
    };

    /**
     * Tries to logs the user in with the provided user name and password.
     *
     * @param  {String} username       User name.
     * @param  {String} password       Password.
     * @return {promise}               A $q promise that resolves when the user
     *                                 is logged in or is rejected when the
     *                                 login fails.
     */
    user.login = function (username, password) {
      return server.login(username, password)
        .then(function(newUser) {
          user.data = newUser;
          userStorage.set('user', newUser);
          user.isAuthenticated = true;
          authenticatedDeferred.resolve();
        });
    };

    /**
     * Attemps to log out the user.
     *
     * @return {promise}               A $q promise that is rejected if the
     *                                 logout fails. (We don't return anything
     *                                 in case of success since the app is
     *                                 reloaded at this point.)
     */
    user.logout = function () {
      user.isAuthenticated = false;
      userStorage.removeUser();
      $window.location.replace('/');
      return util.q.makeResolvedPromise();
    };

    // Runs initialization.
    function init() {
      getUserStatus();
    }

    // Some functions for testing purposes.
    user.testing = {
      reload: function () {
        init();
      }
    };

    init();

    return user;
  }
]);