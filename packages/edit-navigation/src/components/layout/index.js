/**
 * WordPress dependencies
 */
import {
	BlockEditorKeyboardShortcuts,
	BlockEditorProvider,
	BlockTools,
	__unstableUseBlockSelectionClearer as useBlockSelectionClearer,
} from '@wordpress/block-editor';
import { Popover, SlotFillProvider, Spinner } from '@wordpress/components';
import { useDispatch, useSelect } from '@wordpress/data';
import { useEffect, useMemo, useState } from '@wordpress/element';
import {
	InterfaceSkeleton,
	ComplementaryArea,
	store as interfaceStore,
} from '@wordpress/interface';
import { __ } from '@wordpress/i18n';
import { ShortcutProvider } from '@wordpress/keyboard-shortcuts';

/**
 * Internal dependencies
 */
import UnselectedMenuState from './unselected-menu-state';
import {
	IsMenuNameControlFocusedContext,
	useNavigationEditor,
	useNavigationBlockEditor,
	useMenuNotifications,
} from '../../hooks';
import ErrorBoundary from '../error-boundary';
import NavigationEditorShortcuts from './shortcuts';
import Sidebar from '../sidebar';
import Header from '../header';
import Notices from '../notices';
import Editor from '../editor';
import UnsavedChangesWarning from './unsaved-changes-warning';
import { store as editNavigationStore } from '../../store';

const interfaceLabels = {
	/* translators: accessibility text for the navigation screen top bar landmark region. */
	header: __( 'Navigation top bar' ),
	/* translators: accessibility text for the navigation screen content landmark region. */
	body: __( 'Navigation menu blocks' ),
	/* translators: accessibility text for the navigation screen settings landmark region. */
	sidebar: __( 'Navigation settings' ),
};

export default function Layout( { blockEditorSettings } ) {
	const contentAreaRef = useBlockSelectionClearer();
	const [ isMenuNameControlFocused, setIsMenuNameControlFocused ] = useState(
		false
	);
	const { saveNavigationPost } = useDispatch( editNavigationStore );
	const savePost = () => saveNavigationPost( navigationPost );

	const {
		menus,
		hasLoadedMenus,
		hasFinishedInitialLoad,
		selectedMenuId,
		navigationPost,
		isMenuBeingDeleted,
		selectMenu,
		deleteMenu,
		isMenuSelected,
	} = useNavigationEditor();

	const [ blocks, onInput, onChange ] = useNavigationBlockEditor(
		navigationPost
	);

	const { hasSidebarEnabled } = useSelect(
		( select ) => ( {
			hasSidebarEnabled: !! select(
				interfaceStore
			).getActiveComplementaryArea( 'core/edit-navigation' ),
		} ),
		[]
	);

	useEffect( () => {
		if ( ! selectedMenuId && menus?.length ) {
			selectMenu( menus[ 0 ].id );
		}
	}, [ selectedMenuId, menus ] );

	useMenuNotifications( selectedMenuId );

	const hasMenus = !! menus?.length;

	const isBlockEditorReady = !! (
		hasMenus &&
		navigationPost &&
		isMenuSelected
	);

	return (
		<ErrorBoundary>
			<ShortcutProvider>
				<div
					hidden={ ! isMenuBeingDeleted }
					className={ 'edit-navigation-layout__overlay' }
				/>
				<SlotFillProvider>
					<BlockEditorKeyboardShortcuts.Register />
					<NavigationEditorShortcuts.Register />
					<NavigationEditorShortcuts saveBlocks={ savePost } />
					<Notices />
					<BlockEditorProvider
						value={ blocks }
						onInput={ onInput }
						onChange={ onChange }
						settings={ {
							...blockEditorSettings,
							templateLock: 'all',
						} }
						useSubRegistry={ false }
					>
						<IsMenuNameControlFocusedContext.Provider
							value={ useMemo(
								() => [
									isMenuNameControlFocused,
									setIsMenuNameControlFocused,
								],
								[ isMenuNameControlFocused ]
							) }
						>
							<InterfaceSkeleton
								className="edit-navigation-layout"
								labels={ interfaceLabels }
								header={
									<Header
										isMenuSelected={ isMenuSelected }
										isPending={ ! hasLoadedMenus }
										menus={ menus }
										selectedMenuId={ selectedMenuId }
										onSelectMenu={ selectMenu }
										navigationPost={ navigationPost }
									/>
								}
								content={
									<>
										{ ! hasFinishedInitialLoad && (
											<Spinner />
										) }

										{ ! isMenuSelected &&
											hasFinishedInitialLoad && (
												<UnselectedMenuState
													onSelectMenu={ selectMenu }
													onCreate={ selectMenu }
													menus={ menus }
												/>
											) }
										{ isBlockEditorReady && (
											<div
												className="edit-navigation-layout__content-area"
												ref={ contentAreaRef }
											>
												<BlockTools>
													<Editor
														isPending={
															! hasLoadedMenus
														}
														blocks={ blocks }
													/>
												</BlockTools>
											</div>
										) }
									</>
								}
								sidebar={
									hasSidebarEnabled && (
										<ComplementaryArea.Slot scope="core/edit-navigation" />
									)
								}
							/>
							{ isMenuSelected && (
								<Sidebar
									menus={ menus }
									menuId={ selectedMenuId }
									onSelectMenu={ selectMenu }
									onDeleteMenu={ deleteMenu }
									isMenuBeingDeleted={ isMenuBeingDeleted }
								/>
							) }
						</IsMenuNameControlFocusedContext.Provider>
						<UnsavedChangesWarning />
					</BlockEditorProvider>
					<Popover.Slot />
				</SlotFillProvider>
			</ShortcutProvider>
		</ErrorBoundary>
	);
}
