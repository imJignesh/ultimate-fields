/**
 * External dependencies
 */
import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';

/**
 * Internal dependencies
 */
import OverlayAlert from 'components/overlay-alert';
import OverlayScreen from 'components/overlay-screen';

/**
 * Handles the display and transitions of overlays.
 */
class Overlay {
	layers = [];
	currentAlert = null;
	currentAlertRef = null;
	node = null;

	/**
	 * Adds a new layer to the overlay.
	 *
	 * @param {Object} props The props for the layer. Check the prop types below.
	 */
	addLayer( props ) {
		// Let devs know why something could be quirky
		PropTypes.checkPropTypes( {
			title: PropTypes.string.isRequired,
			body: PropTypes.element.isRequired,
			tabs: PropTypes.element,
			icon: PropTypes.string,

			// Buttons will be generated by the overlay, so only props here
			buttons: PropTypes.arrayOf( PropTypes.object ),
		}, props, 'Overlay', 'addLayer' )

		// Save the layer and render
		this.layers.push( props );
		this.render();
	}

	/**
	 * Removes a layer from the overlay.
	 */
	popLayer = () => {
		const layer = this.layers.pop();

		if ( layer.onRemove ) {
			layer.onRemove();
		}

		if ( this.layers.length ) {
			this.render();
		} else {
			this.destroyNode();
		}
	}

	/**
	 * Pops multiple layers at once (by clicking breadcrumbs)
	 *
	 * @param {number} count The amount of layers to pop.
	 */
	popLayers( count ) {
		for ( let i=0; i<count; i++ ) {
			const layer = this.layers.pop();

			if ( layer.onRemove ) {
				layer.onRemove();
			}
		}

		if ( this.layers.length ) {
			this.render();
		} else {
			this.destroyNode();
		}
	}

	/**
	 * Displays an alert within the overlay.
	 *
	 * @param {string}  title The title of the alert.
	 * @param {Element} body  The body of the alert.
	 */
	alert( title, body ) {
		if ( this.currentAlert ) {
			alert( 'An alert was already created!' );
			return;
		}

		this.currentAlert = <OverlayAlert
			title={ title }
			children={ body }
			ref={ ref => this.currentAlertRef = ref }
			onClose={ this.onAlertClose }
		/>

		this.render();
	}

	/**
	 * Handles the closing of the alert, if any.
	 */
	onAlertClose = () => {
		// Null the alerts
		this.currentAlert = null;
		this.currentAlertRef = null;

		// Re-render to remove the alert
		this.render();
	}

	/**
	 * Listens to keystrokes and removes the last layer when
	 * ESC has been pressed.
	 *
	 * @param {Event} e The event that occured.
	 */
	keyListener = e => {
		if ( 27 !== e.keyCode ) {
			return;
		}

		if( this.currentAlert ) {
			this.currentAlertRef.close();
		} else {
			this.popLayer();
		}
	}

	/**
	 * Initializes the DOM node if needed.
	 *
	 * @return {HTMLElement} The local node.
	 */
	initializeNode() {
		if ( null !== this.node ) {
			return this.node;
		}

		// Create the node
		this.node = document.createElement( 'div' );
		this.node.classList.add( 'uf-overlay' );
		document.body.appendChild( this.node );

		// Add esc listeners
		document.body.addEventListener( 'keyup', this.keyListener );

		return this.node;
	}

	/**
	 * Destroys the local node if any.
	 */
	destroyNode() {
		// Node doesn't exist
		if ( null === this.node ) {
			return;
		}

		// Remove the node
		ReactDOM.unmountComponentAtNode( this.node );
		document.body.removeChild( this.node );
		this.node = null;

		// Remove listeners
		document.body.removeEventListener( 'keyup', this.keyListener );
	}

	/**
	 * Renders the current content of the overlay.
	 */
	render() {
		const node = this.initializeNode();

		// Prepare stuff
		const theLayer = this.layers[ this.layers.length - 1 ];
		const { body, buttons, tabs } = theLayer;

		tabs
			? node.classList.add( 'uf-overlay--has-tabs' )
			: node.classList.remove( 'uf-overlay--has-tabs' );

		// Render
		ReactDOM.render( [
			<div className="uf-overlay__background" key="bg" />,

			<div className="uf-overlay__box" key="box">
				<div className="uf-overlay__header">
					<h2 className="uf-overlay__title">{ this.renderTitle() }</h2>

					<button type="button" className="uf-overlay__close" onClick={ this.popLayer }>
						<span className="dashicons dashicons-no-alt"></span>
						<span className="screen-reader-text">Close overlay</span>
					</button>

					{ tabs }
				</div>

				<div className="uf-overlay__body">
					{ this.layers.map( ( layer, i ) => {
						const { body } = layer;
						const main = layer === theLayer;
						const animate = this.layers.length > 1;

						return <OverlayScreen key={ i } isMainScreen={ main } animate={ animate }>
							{ body }
						</OverlayScreen>;
					} ) }
				</div>

				<div className="uf-overlay__footer">
					{ buttons }
				</div>

				{ this.currentAlert }
			</div>
			], node
		);
	}

	/**
	 * Renders the title, which may also contain breadcrumbs.
	 *
	 * @return {Array}
	 */
	renderTitle() {
		const partials = [];

		this.layers.forEach( ( layer, i ) => {
			const { title, icon } = layer;
			const isLast = ( i + 1 ) === this.layers.length;

			// The last screen will be just text
			if ( isLast ) {
				if ( icon ) {
					partials.unshift( <span key="icon" className={ icon } /> );
				}

				return partials.push(
					<span key={ i }>{ title }</span>
				);
			}

			const goBack = e => {
				e.preventDefault();
				const layersToPop = this.layers.length - i - 1;
				this.popLayers( layersToPop );
			}

			partials.push(
				<a href="#" key={ i } onClick={ goBack }>{ title }</a>
			);

			partials.push(
				<span className="uf-overlay__separator" key={ `${i}-separator` } />
			);
		} );

		return partials;
	}
}

// Export a single instance of the class
const overlay = new Overlay;
export default overlay;
