'use strict';

export default {

  // Navigator methods

  getCurrentRoutes() {
    return this.__navigator.getCurrentRoutes();
  },

  jumpBack() {
    if (!this._transitionsDisabled())
      return this.__navigator.jumpBack();
  },

  jumpForward() {
    if (!this._transitionsDisabled())
      return this.__navigator.jumpForward();
  },

  jumpTo(route) {
    if (!this._transitionsDisabled())
      return this.__navigator.jumpTo(route);
  },

  push(route) {
    if (!this._transitionsDisabled())
      return this.__navigator.push(route);
  },

  pop() {
    if (!this._transitionsDisabled())
      return this.__navigator.pop();
  },

  replace(route) {
    if (!this._transitionsDisabled())
      return this.__navigator.replace(route);
  },

  replaceAtIndex(route, index) {
    if (!this._transitionsDisabled())
      return this.__navigator.replaceAtIndex(route, index);
  },

  replacePrevious(route) {
    if (!this._transitionsDisabled())
      return this.__navigator.replacePrevious(route);
  },

  resetTo(route) {
    if (!this._transitionsDisabled())
      return this.__navigator.resetTo(route);
  },

  immediatelyResetRouteStack(routeStack) {
    if (!this._transitionsDisabled())
      return this.__navigator.immediatelyResetRouteStack(routeStack);
  },

  popToRoute(route) {
    if (!this._transitionsDisabled())
      return this.__navigator.popToRoute(route);
  },

  popToTop() {
    if (!this._transitionsDisabled())
      return this.__navigator.popToTop();
  },
  
  replacePreviousAndPop(route) {
    return this.__navigator.replacePreviousAndPop(route);
  },

  // Convenience methods

  /**
   * Replaces the top-most route with the given route and navigates to it
   * with a pop transition
   */
  transitionToTop(route) {
    this.replaceAtIndex(route, 0);
    this.popToTop();
  },

  /**
   * Pops back `n` routes. That is, `pop()` behaves like `popBack(1)`.
   */
  popBack(n) {
    let routes = this.getCurrentRoutes();
    this.popToRoute(routes[routes.length - n - 1]);
  },
};
