* AuthContext.jsx — localStorage: token / user */
(function (global) {
  'use strict';

  var STORAGE_TOKEN = 'token';
  var STORAGE_USER = 'user';

  function createAuth() {
    var user = null;
    var loading = true;

    function init() {
      var token = localStorage.getItem(STORAGE_TOKEN);
      var userData = localStorage.getItem(STORAGE_USER);
      if (token && userData) {
        try {
          user = JSON.parse(userData);
        } catch (e) {
          localStorage.removeItem(STORAGE_TOKEN);
          localStorage.removeItem(STORAGE_USER);
          user = null;
        }
      }
      loading = false;
    }

    function login(token, userData) {
      localStorage.setItem(STORAGE_TOKEN, token);
      localStorage.setItem(STORAGE_USER, JSON.stringify(userData));
      user = userData;
    }

    function logout() {
      localStorage.removeItem(STORAGE_TOKEN);
      localStorage.removeItem(STORAGE_USER);
      user = null;
    }

    return {
      init: init,
      login: login,
      logout: logout,
      getToken: function () {
        return localStorage.getItem(STORAGE_TOKEN);
      },
      get loading() {
        return loading;
      },
      get user() {
        return user;
      },
      isAuthenticated: function () {
        return !!user;
      }
    };
  }

  global.XL = global.XL || {};
  global.XL.createAuth = createAuth;
})(window);
