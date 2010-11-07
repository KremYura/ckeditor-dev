/*
Copyright (c) 2003-2010, CKSource - Frederico Knabben. All rights reserved.
For licensing, see LICENSE.html or http://ckeditor.com/license
*/

/**
 * @fileOverview The "placeholder" plugin.
 *
 */

(function()
{
	var placeholderReplaceRegex = /\[\[[^\]]+\]\]/g;
	CKEDITOR.plugins.add( 'placeholder',
	{
		requires : [ 'dialog' ],
		lang : [ 'en' ],
		init : function( editor )
		{
			var lang = editor.lang.placeholder;

			editor.addCommand( 'createplaceholder', new CKEDITOR.dialogCommand( 'createplaceholder' ) );
			editor.addCommand( 'editplaceholder', new CKEDITOR.dialogCommand( 'editplaceholder' ) );

			editor.ui.addButton( 'CreatePlaceholder',
			{
				label : lang.toolbar,
				command :'createplaceholder',
				icon : this.path + 'placeholder.gif'
			});

			if ( editor.addMenuItems )
			{
				editor.addMenuGroup( 'placeholder', 20 );
				editor.addMenuItems(
					{
						editplaceholder :
						{
							label : lang.edit,
							command : 'editplaceholder',
							group : 'placeholder',
							order : 1,
							icon : this.path + 'placeholder.gif'
						}
					} );

				if ( editor.contextMenu )
				{
					editor.contextMenu.addListener( function( element, selection )
						{
							if ( !element || !element.hasAttribute( '_cke_placeholder' ) )
								return null;

							return { editplaceholder : CKEDITOR.TRISTATE_OFF };
						} );
				}
			}

			editor.on( 'doubleclick', function( evt )
				{
					var element = evt.data.element;
					if ( element.hasAttribute( '_cke_placeholder' ) )
						evt.data.dialog = 'editplaceholder';
				});

			editor.addCss(
				'.cke_placeholder' + 
				'{' + 
					'background-color: #ffff00;' + 
					( CKEDITOR.env.gecko ? 'cursor: default;' : '' ) +
				'}'
			);

			editor.on( 'contentDom', function()
				{
					editor.document.getBody().on( 'resizestart', function( evt )
						{
							if ( editor.getSelection().getSelectedElement().hasAttribute( '_cke_placeholder' ) )
								evt.data.preventDefault();
						});
				});

			CKEDITOR.dialog.add( 'createplaceholder', this.path + 'dialogs/placeholder.js' );
			CKEDITOR.dialog.add( 'editplaceholder', this.path + 'dialogs/placeholder.js' );
		},
		afterInit : function( editor )
		{
			var dataProcessor = editor.dataProcessor,
				dataFilter = dataProcessor && dataProcessor.dataFilter;
				htmlFilter = dataProcessor && dataProcessor.htmlFilter;

			if ( dataFilter )
			{
				dataFilter.addRules(
				{
					text : function( text )
					{
						return text.replace( placeholderReplaceRegex, function( match )
							{
								return CKEDITOR.plugins.placeholder.createPlaceholder( editor, null, match, 1 );
							});
					}
				});
			}

			if ( htmlFilter )
			{
				htmlFilter.addRules(
				{
					elements :
					{
						'span' : function( element )
						{
							if ( element.attributes && element.attributes._cke_placeholder )
								delete element.name;
						}
					}
				});
			}
		}
	});
})();

CKEDITOR.plugins.placeholder = 
{
	createPlaceholder : function( editor, oldElement, text, isGet )
	{
		var element = new CKEDITOR.dom.element( 'span', editor.document );
		element.setAttributes(
			{
				contentEditable	: 'false',
				_cke_placeholder	: 1,
				'class'		: 'cke_placeholder'
			}
		);

		text && element.setText( text );

		if ( isGet )
			return element.getOuterHtml();

		if ( oldElement )
		{
			if ( CKEDITOR.env.ie )
			{
				element.insertAfter( oldElement );
				// Some time is required for IE before the element is removed.
				setTimeout( function()
					{
						oldElement.remove();
						element.focus();
					}, 10 );
			}
			else
				element.replace( oldElement );
		}
		else
			editor.insertElement( element );
	}
};
