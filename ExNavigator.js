'use strict';

import React, {
  Image,
  Navigator,
  PropTypes,
  Text,
  View,
} from 'react-native';

import autobind from 'autobind-decorator';
import invariant from 'invariant';
import cloneReferencedElement from 'react-native-clone-referenced-element';

import ExNavigatorMixin from './ExNavigatorMixin';
import ExNavigatorStyles from './ExNavigatorStyles';
import ExRouteRenderer from './ExRouteRenderer';
import ExSceneConfigs from './ExSceneConfigs';
import ExNavigationBar from './ExNavigationBar';

import type * as ExRoute from './ExRoute';

export default class ExNavigator extends React.Component {
  static Styles = ExNavigatorStyles
  static SceneConfigs = ExSceneConfigs;

  static propTypes = {
    ...Navigator.props,
    showNavigationBar: PropTypes.bool,
    navigationBarStyle: View.propTypes.style,
    titleStyle: Text.propTypes.style,
    barButtonTextStyle: Text.propTypes.style,
    barButtonIconStyle: Image.propTypes.style,
    renderNavigationBar: PropTypes.func,
    augmentScene: PropTypes.func,
  };

  static defaultProps = {
    ...Navigator.defaultProps,
    showNavigationBar: true,
    renderNavigationBar: props => {
      return <ExNavigationBar {...props} />
    },
  };

  constructor(props, context) {
    super(props, context);
    // NOTE: currently only the initial props are honored
    this._routeRenderer = new ExRouteRenderer(this, {
      titleStyle: props.titleStyle,
      barButtonTextStyle: props.barButtonTextStyle,
      barButtonIconStyle: props.barButtonIconStyle,
    });
  }

  render() {
    return (
      <Navigator
        {...this.props}
        ref={this._setNavigatorRef}
        configureScene={this._routeRenderer.configureScene}
        renderScene={this._renderScene}
        navigationBar={this._renderNavigationBar()}
        sceneStyle={[ExNavigatorStyles.scene, this.props.sceneStyle]}
        style={[ExNavigatorStyles.navigator, this.props.style]}
      />
    );
  }

  @autobind
  _renderScene(route: ExRoute, navigator: Navigator) {
    // We need to subscribe to the navigation context before the navigator is
    // mounted because it emits a didfocus event when it is mounted, before we
    // can get a ref to it
    if (!this._subscribedToFocusEvents) {
      this._subscribeToFocusEvents(navigator);
    }

    // We need to save a reference to the navigator already. Otherwise this
    // would crash if the route calls any method on us in the first render-pass.
    this.__navigator = navigator;

    let scene = this._routeRenderer.renderScene(route, this);
    if (typeof this.props.augmentScene === 'function') {
      scene = this.props.augmentScene(scene, route);
    }
    let firstRoute = navigator.getCurrentRoutes()[0];
    if (route === firstRoute) {
      scene = cloneReferencedElement(scene, {
        ref: component => { this._firstScene = component; },
      });
    }
    return scene;
  }

  _renderNavigationBar(): ?Navigator.NavigationBar {
    return this.props.renderNavigationBar({
      routeMapper: this._routeRenderer.navigationBarRouteMapper,
      style: [ExNavigatorStyles.bar, this.props.navigationBarStyle],
    });
  }

  @autobind
  _setNavigatorRef(navigator) {
    this.__navigator = navigator;
    if (navigator) {
      invariant(
        this._subscribedToFocusEvents,
        'Expected to have subscribed to the navigator before it was mounted.',
      );
    } else {
      this._unsubscribeFromFocusEvents(navigator);
    }
  }

  _subscribeToFocusEvents(navigator) {
    invariant(
      !this._subscribedToFocusEvents,
      'The navigator is already subscribed to focus events',
    );

    let navigationContext = navigator.navigationContext;
    this._onWillFocusSubscription = navigationContext.addListener(
      'willfocus',
      this._routeRenderer.onWillFocus,
    );
    this._onDidFocusSubscription = navigationContext.addListener(
      'didfocus',
      this._routeRenderer.onDidFocus,
    );
    this._subscribedToFocusEvents = true;
  }

  _unsubscribeFromFocusEvents() {
    this._onWillFocusSubscription.remove();
    this._onDidFocusSubscription.remove();
    this._subscribedToFocusEvents = false;
  }

  // Navigator properties

  get navigationContext() {
    return this.__navigator.navigationContext;
  }

  get parentNavigator() {
    // Navigator sets its `parentNavigator` property in componentWillMount, but
    // we don't get a reference to the Navigator until it has been mounted. So
    // there is a window of time during which the Navigator's `parentNavigator`
    // property has been set but we don't have a reference to the Navigator;
    // when that happens we'll simulate Navigator and return our `navigator`
    // prop.
    return !this.__navigator ?
      this.props.navigator :
      this.__navigator.parentNavigator;
  }
}

Object.assign(ExNavigator.prototype, ExNavigatorMixin);

export * from './ExRoute';
