import React, { Component } from 'react';
import { connect } from 'react-redux';
import classNames from 'classnames';

import { areDependenciesMet } from 'state/data/selectors';
import { isTabActive } from 'state/tabs/selectors';
import { changeTab } from 'state/tabs/actions';

class Tab extends Component {
	render() {
		const { label, icon, style, active, enabled } = this.props;

		const className = classNames( [
			'uf-tab',
			`uf-tab--${style}`,
			active && 'uf-tab--active',
			! enabled && 'uf-tab--disabled',
		] );

		return (
			<a href="#" className={ className } onClick={ this.onClick }>
				{ icon && <span className={ `uf-tab__icon dashicons ${icon}` } /> }
				<span className="uf-tab__text">{ label }</span>
			</a>
		);
	}

	onClick = e => {
		const { active, enabled, onClick } = this.props;

		e.preventDefault();

		if ( enabled && ! active ) {
			onClick();
		}
	}
}

export default connect(
	( state, { dataPath, container, name, dependencies } ) => ( {
		active: isTabActive( state, container, name ),
		enabled: areDependenciesMet( state, dataPath, dependencies ),
	} ),
	( dispatch, { container, name } ) => ( {
		onClick: () => dispatch( changeTab( container, name ) ),
	} )
)( Tab );