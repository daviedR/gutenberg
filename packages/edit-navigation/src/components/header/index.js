/**
 * WordPress dependencies
 */
import { NavigableToolbar } from '@wordpress/block-editor';
import { DropdownMenu } from '@wordpress/components';
import { useViewportMatch } from '@wordpress/compose';
import { PinnedItems } from '@wordpress/interface';
import { __, sprintf } from '@wordpress/i18n';
import { decodeEntities } from '@wordpress/html-entities';

/**
 * Internal dependencies
 */
import SaveButton from './save-button';
import UndoButton from './undo-button';
import RedoButton from './redo-button';
import MenuSwitcher from '../menu-switcher';
import { useMenuEntityProp } from '../../hooks';

export default function Header( {
	isMenuSelected,
	menus,
	selectedMenuId,
	onSelectMenu,
	isPending,
	navigationPost,
} ) {
	const isMediumViewport = useViewportMatch( 'medium' );
	const [ menuName ] = useMenuEntityProp( 'name', selectedMenuId );
	let actionHeaderText;

	if ( menuName ) {
		actionHeaderText = sprintf(
			// translators: Name of the menu being edited, e.g. 'Main Menu'.
			__( 'Editing: %s' ),
			menuName
		);
	} else if ( isPending ) {
		// Loading text won't be displayed if menus are preloaded.
		actionHeaderText = __( 'Loading …' );
	} else {
		actionHeaderText = __( 'No menus available' );
	}

	return (
		<div className="edit-navigation-header">
			{ isMediumViewport && (
				<div className="edit-navigation-header__toolbar-wrapper">
					<h1 className="edit-navigation-header__title">
						{ __( 'Navigation' ) }
					</h1>
					<NavigableToolbar
						className="edit-navigation-header__toolbar"
						aria-label={ __( 'Document tools' ) }
					>
						<UndoButton />
						<RedoButton />
					</NavigableToolbar>
				</div>
			) }
			<h2 className="edit-navigation-header__subtitle">
				{ isMenuSelected && decodeEntities( actionHeaderText ) }
			</h2>
			{ isMenuSelected && (
				<div className="edit-navigation-header__actions">
					<DropdownMenu
						icon={ null }
						toggleProps={ {
							children: __( 'Switch menu' ),
							'aria-label': __(
								'Switch menu, or create a new menu'
							),
							showTooltip: false,
							variant: 'tertiary',
							disabled: ! menus?.length,
							__experimentalIsFocusable: true,
						} }
						popoverProps={ {
							className:
								'edit-navigation-header__menu-switcher-dropdown',
							position: 'bottom center',
						} }
					>
						{ ( { onClose } ) => (
							<MenuSwitcher
								menus={ menus }
								selectedMenuId={ selectedMenuId }
								onSelectMenu={ ( menuId ) => {
									onSelectMenu( menuId );
									onClose();
								} }
							/>
						) }
					</DropdownMenu>

					<SaveButton navigationPost={ navigationPost } />
					<PinnedItems.Slot scope="core/edit-navigation" />
				</div>
			) }
		</div>
	);
}
