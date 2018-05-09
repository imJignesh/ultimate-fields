import React from 'react';
import Field from './../Field.jsx';
import { map } from 'lodash';

export default class Select extends Field {
	/**
	 * Prepares the options for the input and renders it according
	 *
	 * @return {React.Component} A component with the fields' input.
	 */
	renderInput() {
		const { input_type } = this.props;

		return 'radio' === input_type
			? this.renderRadios( this.getOptions() )
			: this.renderDropdown( this.getOptions() );
	}

	/**
	 * Renders a dropdown (select) with options.
	 *
	 * @param  {Object} options  An object with all available options.
	 * @return {React.Component} A select field.
	 */
	renderDropdown( options ) {
		const { name, onValueChanged } = this.props;

		const children = map( options, ( label, key ) =>
			'object' === typeof label
				? this.renderGroup( key, label )
				: this.renderOption( key, label )
		);

		return React.createElement( 'select', {
			id:        this.id,
			value:     this.getValue(),
			children:  children,
			className: 'field__input field__input--select',
			ref:       'input',
			onChange:  e => onValueChanged( name, e.target.value )
		});
	}

	renderOption( key, label ) {
		return <option key={ key } value={ key }>{ label }</option>
	}

	renderGroup( label, options ) {
		return <optgroup label={ label } key={label}>
			{ map( options, ( label, key ) => this.renderOption( key, label ) ) }
		</optgroup>
	}

	/**
	 * Renders a list with radio buttons.
	 *
	 * @param  {Object} options  An object with all available options.
	 * @return {React.Component} A select field.
	 */
	renderRadios( options ) {
		const { orientation } = this.props;

		return <ul className={ 'uf-radio uf-radio--' + orientation }>
			{ map( options, ( label, key ) => {
				const checked = this.getValue() === key;

				return <li key={ key }>
					<label>
						<input type="radio" name={ this.id } value={ key } checked={ checked } onChange={ this.radioChanged.bind( this ) } />
						<span dangerouslySetInnerHTML={{ __html: label }} />
					</label>
				</li>
			})}
		</ul>
	}

	radioChanged( e ) {
		const { name, onValueChanged } = this.props;

		onValueChanged( name, e.target.value );
	}

	static getOptions( props ) {
		let { options } = props;

		if( ! options ) {
			options = {}

			React.Children.forEach( this.props.children, child => {
				options[ child.props.key ] = child.props.children;
			});
		}

		return options;
	}

	getOptions() {
		return Select.getOptions( this.props );
	}

	static prepareValue( value, field ) {
		const options = Select.getOptions( field.props, true );

		if( value in options ) {
			return value;
		}

		value = null;
		map( options, ( label, key ) => {
			if( null === value ) {
				value = key;
			}
		});

		return value;
	}

	componentDidMount() {
		const { input } = this.refs;
		const { input_type, use_select2 } = this.props;

		if( 'select' == input_type && use_select2 ) {
			jQuery( input ).select2();
		}
	}
}
