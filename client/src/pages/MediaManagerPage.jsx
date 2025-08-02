import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { contentService, getStaticUrl } from '../services/apiService';
import {
    Folder, FileText, Image as ImageIcon, Video, Music, Lock, PlusCircle,
    LogOut, Edit, Trash2, Home, ChevronRight, Loader2, Star, Search,
    RotateCcw, Trash, Users, FolderSymlink, MoreVertical, StarOff, FileX, ShieldAlert, Eye, FileCode,
    Menu, X
} from 'lucide-react';
import AddItemModal from '../components/AddItemModal';
import EditFolderModal from '../components/EditFolderModal';
import EditMediaModal from '../components/EditMediaModal';
import PasswordPromptModal from '../components/PasswordPromptModal';
import ShareModal from '../components/ShareModal';
import PreviewModal from '../components/PreviewModal';

const MediaManagerPage = () => {
    const { user, logout } = useAuth();
    const [isSidebarOpen, setSidebarOpen] = useState(false);
    const [content, setContent] = useState({ folders: [], media: [] });
    const [currentFolderData, setCurrentFolderData] = useState(null);
    const [userRole, setUserRole] = useState('owner');
    const [sidebarFolders, setSidebarFolders] = useState({ myFolders: [], sharedWithMe: [] });
    const [allFoldersForMove, setAllFoldersForMove] = useState([]);
    const [currentFolderId, setCurrentFolderId] = useState('root');
    const [history, setHistory] = useState([{ _id: 'root', name: 'My Drive' }]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [verifiedPasswords, setVerifiedPasswords] = useState({});

    const [passwordModalState, setPasswordModalState] = useState({
        isOpen: false,
        folder: null,
        error: '',
        loading: false,
    });

    const [isAddModalOpen, setAddModalOpen] = useState(false);
    const [isEditFolderModalOpen, setEditFolderModalOpen] = useState(false);
    const [isEditMediaModalOpen, setEditMediaModalOpen] = useState(false);
    const [isShareModalOpen, setShareModalOpen] = useState(false);
    const [isPreviewModalOpen, setPreviewModalOpen] = useState(false);
    const [itemToEdit, setItemToEdit] = useState(null);
    const [itemToPreview, setItemToPreview] = useState(null);
    const [folderToShare, setFolderToShare] = useState(null);
    const [contextMenu, setContextMenu] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [activeFilter, setActiveFilter] = useState('all');
    const [viewMode, setViewMode] = useState('drive');

    const fetchContent = useCallback(async (folderId, currentHistory, passwordAttempt) => {
        setLoading(true);
        setError('');
        const password = passwordAttempt || verifiedPasswords[folderId];
        try {
            const params = { password, view: viewMode, search: searchQuery, type: activeFilter };
            const res = await contentService.getContent(folderId, params);
            setContent({ folders: res.data.folders || [], media: res.data.media || [] });
            setUserRole(res.data.userRole || 'owner');
            setCurrentFolderData(res.data.currentFolder);
            if (passwordAttempt) {
                setVerifiedPasswords(prev => ({ ...prev, [folderId]: passwordAttempt }));
                setPasswordModalState({ isOpen: false, folder: null, error: '', loading: false });
            }
        } catch (err) {
            const errorData = err.response?.data;
            if (errorData?.requiresPassword) {
                const folderName = currentHistory.find(f => f._id === folderId)?.name || 'Locked Folder';
                setPasswordModalState(prev => ({ ...prev, isOpen: true, folder: { _id: folderId, name: folderName }, error: '' }));
                setContent({ folders: [], media: [] });
            } else if (err.response?.status === 401) {
                setPasswordModalState(prev => ({ ...prev, error: errorData.msg || 'Incorrect password', loading: false }));
            } else {
                setError(errorData?.msg || 'Failed to load content');
                setContent({ folders: [], media: [] });
            }
        } finally {
            setLoading(false);
        }
    }, [verifiedPasswords, viewMode, searchQuery, activeFilter]);

    const fetchSidebarData = useCallback(async () => {
        try {
            const [sidebarRes, allFoldersRes] = await Promise.all([
                contentService.getSidebar(),
                contentService.getAllFoldersForNav(),
            ]);
            setSidebarFolders(sidebarRes.data || { myFolders: [], sharedWithMe: [] });
            setAllFoldersForMove(allFoldersRes.data || []);
        } catch (error) {
            console.error("Failed to fetch sidebar or all folders data:", error);
            toast.error("Could not load folder navigation.");
        }
    }, []);

    useEffect(() => {
        const handler = (e) => { if (contextMenu) setContextMenu(null); };
        window.addEventListener('click', handler);
        return () => window.removeEventListener('click', handler);
    }, [contextMenu]);

    useEffect(() => {
        fetchSidebarData();
    }, [fetchSidebarData]);

    useEffect(() => {
        const debounce = setTimeout(() => {
            fetchContent(currentFolderId, history);
        }, 300);
        return () => clearTimeout(debounce);
    }, [currentFolderId, history, fetchContent, searchQuery, activeFilter, viewMode]);

    const refreshAll = useCallback(() => {
        fetchContent(currentFolderId, history);
        fetchSidebarData();
    }, [currentFolderId, history, fetchContent, fetchSidebarData]);

    const handleApiCall = async (apiPromise, successMessage) => {
        await toast.promise(
            apiPromise,
            {
                loading: 'Processing...',
                success: (res) => {
                    refreshAll();
                    return successMessage || 'Operation successful!';
                },
                error: (err) => err.response?.data?.msg || 'An error occurred.',
            }
        );
    };

    const handleFolderClick = (folder) => {
        if (viewMode === 'trash') return;
        setCurrentFolderId(folder._id);
        setHistory(prev => [...prev, { _id: folder._id, name: folder.name }]);
        setSearchQuery('');
        setActiveFilter('all');
        setSidebarOpen(false);
    };

    const handleBreadcrumbClick = (folderId, index) => {
        if (viewMode === 'trash') handleViewChange('drive');
        setCurrentFolderId(folderId);
        setHistory(prev => prev.slice(0, index + 1));
    };

    const handleViewChange = (newView) => {
        setViewMode(newView);
        setCurrentFolderId('root');
        setHistory([{ _id: 'root', name: newView === 'trash' ? 'Recycle Bin' : 'My Drive' }]);
        setSearchQuery('');
        setActiveFilter('all');
        setSidebarOpen(false);
    };

    const handlePasswordSubmit = async (password) => {
        if (!passwordModalState.folder) return;
        setPasswordModalState(prev => ({ ...prev, loading: true, error: '' }));
        await fetchContent(passwordModalState.folder._id, history, password);
    };

    const closePasswordModal = () => {
        setPasswordModalState({ isOpen: false, folder: null, error: '', loading: false });
    };

    const handleShareClick = (item) => {
        setFolderToShare(item);
        setShareModalOpen(true);
    };

    const handleEditClick = (item) => {
        setItemToEdit(item);
        if (item.mimetype) {
            setEditMediaModalOpen(true);
        } else {
            setEditFolderModalOpen(true);
        }
    };

    const handlePreviewClick = (item) => {
        if (item.mimetype) {
            setItemToPreview(item);
            setPreviewModalOpen(true);
        }
    };

    const handleCreateFolder = async (name, password) => {
        await handleApiCall(contentService.createFolder({ name, password, parentFolder: currentFolderId }), 'Folder created!');
        setAddModalOpen(false);
    };

    const handleUploadMedia = async (files, groupName) => {
        const formData = new FormData();
        for (let i = 0; i < files.length; i++) formData.append('files', files[i]);
        formData.append('folderId', currentFolderId);
        if (groupName) formData.append('groupName', groupName);
        await handleApiCall(contentService.uploadMedia(formData), 'Files uploaded!');
        setAddModalOpen(false);
    };

    const handleEditFolder = async (id, data) => {
        await handleApiCall(contentService.updateFolder(id, data), 'Folder updated!');
        setEditFolderModalOpen(false);
        setVerifiedPasswords(prev => {
            const newVerified = { ...prev };
            delete newVerified[id];
            return newVerified;
        });
    };

    const handleEditMedia = async (id, data) => {
        await handleApiCall(contentService.updateMedia(id, data), 'File updated!');
        setEditMediaModalOpen(false);
    };

    const handleSoftDelete = (item) => {
        const promise = item.mimetype ? contentService.softDeleteMedia(item._id) : contentService.softDeleteFolder(item._id);
        handleApiCall(promise, 'Item moved to trash.');
    };

    const handleRestore = (item) => {
        const promise = item.mimetype ? contentService.restoreMedia(item._id) : contentService.restoreFolder(item._id);
        handleApiCall(promise, 'Item restored.');
    };

    const handleToggleFavorite = (item) => {
        handleApiCall(contentService.toggleFavorite(item._id), item.isFavorite ? 'Removed from favorites.' : 'Added to favorites.');
    };

    const handlePermanentDelete = (item) => {
        if (!window.confirm("This action is irreversible. Are you sure you want to permanently delete this item?")) return;
        handleApiCall(contentService.deleteMediaPermanently(item._id), 'File permanently deleted.');
    };

    const handleContextMenu = (e, item) => { e.preventDefault(); e.stopPropagation(); setContextMenu({ x: e.pageX, y: e.pageY, item }); };

    const getFileIcon = (item) => {
        const type = item.mimetype ? item.mimetype.split('/')[0] : item.type;
        if (type === 'video') return <Video className="mx-auto text-neutral-400" size={48} />;
        if (type === 'audio') return <Music className="mx-auto text-neutral-400" size={48} />;
        if (item.mimetype === 'application/pdf') return <FileText className="mx-auto text-red-500" size={48} />;
        if (type === 'text') return <FileCode className="mx-auto text-neutral-400" size={48} />;
        return <FileText className="mx-auto text-neutral-400" size={48} />;
    };

    const isOwnerOfCurrentFolder = currentFolderData ? currentFolderData.user?._id === user?._id : currentFolderId === 'root';
    const canWriteInCurrentView = userRole !== 'viewer';

    const closeEditModal = () => {
        setEditFolderModalOpen(false);
        setEditMediaModalOpen(false);
        setItemToEdit(null);
    };

    const closeShareModal = () => {
        setShareModalOpen(false);
        setFolderToShare(null);
    };

    const closePreviewModal = () => {
        setPreviewModalOpen(false);
        setItemToPreview(null);
    };

    const renderContextMenu = () => {
        if (!contextMenu) return null;
        const { item } = contextMenu;
        const isMedia = !!item.mimetype;
        const isOwner = item.user?._id === user?._id;
        const closeMenu = () => setContextMenu(null);
        return (
            <div style={{ top: contextMenu.y, left: contextMenu.x }} className="absolute bg-neutral-800 border border-neutral-700 rounded-lg shadow-2xl z-50 text-sm w-52 overflow-hidden animate-in fade-in-0 zoom-in-95">
                {viewMode === 'drive' ? (
                    <>
                        {isMedia && <button onClick={() => { handlePreviewClick(item); closeMenu(); }} className="w-full text-left px-4 py-2.5 hover:bg-neutral-700 flex items-center transition-colors duration-150 text-neutral-200"><Eye size={16} className="mr-3" />Preview</button>}
                        {canWriteInCurrentView && <button onClick={() => { handleEditClick(item); closeMenu(); }} className="w-full text-left px-4 py-2.5 hover:bg-neutral-700 flex items-center transition-colors duration-150 text-neutral-200"><Edit size={16} className="mr-3" />Rename / Move</button>}
                        {isMedia && <button onClick={() => { handleToggleFavorite(item); closeMenu(); }} className="w-full text-left px-4 py-2.5 hover:bg-neutral-700 flex items-center transition-colors duration-150 text-neutral-200">{item.isFavorite ? <StarOff size={16} className="mr-3 text-yellow-500" /> : <Star size={16} className="mr-3 text-yellow-500" />}{item.isFavorite ? 'Unfavorite' : 'Favorite'}</button>}
                        {!isMedia && isOwner && <button onClick={() => { handleShareClick(item); closeMenu(); }} className="w-full text-left px-4 py-2.5 hover:bg-neutral-700 flex items-center transition-colors duration-150 text-neutral-200"><Users size={16} className="mr-3" />Share</button>}
                        <div className="my-1 border-t border-neutral-700"></div>
                        {canWriteInCurrentView && <button onClick={() => { handleSoftDelete(item); closeMenu(); }} className="w-full text-left px-4 py-2.5 text-red-400 hover:bg-red-500/10 flex items-center transition-colors duration-150"><Trash2 size={16} className="mr-3" />Move to Trash</button>}
                    </>
                ) : (
                    <>
                        {canWriteInCurrentView && <button onClick={() => { handleRestore(item); closeMenu(); }} className="w-full text-left px-4 py-2.5 hover:bg-neutral-700 flex items-center transition-colors duration-150 text-neutral-200"><RotateCcw size={16} className="mr-3" />Restore</button>}
                        {isOwner && isMedia && <button onClick={() => { handlePermanentDelete(item); closeMenu(); }} className="w-full text-left px-4 py-2.5 text-red-500 hover:bg-red-500/10 flex items-center transition-colors duration-150"><FileX size={16} className="mr-3" />Delete Permanently</button>}
                    </>
                )}
            </div>
        );
    };

    return (
        <div className="flex h-screen bg-black text-neutral-300 font-sans antialiased overflow-hidden">
            <aside className={`fixed inset-y-0 left-0 bg-neutral-900 w-64 border-r border-neutral-800 p-6 flex flex-col shadow-lg transform transition-transform duration-300 ease-in-out z-40
                ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} 
                lg:relative lg:translate-x-0 lg:w-64`}>
                <div className="flex items-center justify-between mb-8">
                    <h1 className="text-2xl font-bold text-white flex items-center">
                        <div className="p-2 bg-neutral-800 rounded-lg mr-3">
                            <ImageIcon className="text-white" size={24} />
                        </div>
                        Notakok
                    </h1>
                    <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-neutral-400 hover:text-white">
                        <X size={24} />
                    </button>
                </div>
                <nav className="flex-grow overflow-y-auto -mr-3 pr-3">
                    <button onClick={() => handleViewChange('drive')} className={`group w-full text-left px-4 py-2.5 rounded-lg font-semibold flex items-center transition-all duration-200 ${viewMode === 'drive' ? 'bg-white text-black' : 'hover:bg-neutral-800 text-neutral-300'}`}>
                        <Home size={18} className="mr-4" /> My Drive
                    </button>
                    <button onClick={() => handleViewChange('trash')} className={`group w-full text-left px-4 py-2.5 rounded-lg font-semibold flex items-center mt-2 transition-all duration-200 ${viewMode === 'trash' ? 'bg-white text-black' : 'hover:bg-neutral-800 text-neutral-300'}`}>
                        <Trash size={18} className="mr-4" /> Recycle Bin
                    </button>
                    <div className="mt-8 pt-6 border-t border-neutral-800">
                        <h3 className="px-4 mb-3 text-sm font-semibold text-neutral-500 uppercase tracking-wider">My Folders</h3>
                        {sidebarFolders?.myFolders?.length === 0 && <p className="px-4 text-sm text-neutral-500">No folders yet.</p>}
                        {sidebarFolders?.myFolders?.map(f => (
                            <button key={f._id} onClick={() => handleFolderClick(f)} className="group w-full text-left px-4 py-2.5 rounded-lg text-sm flex items-center hover:bg-neutral-800 transition-colors duration-200 text-neutral-400 hover:text-white">
                                <Folder className="mr-4 text-neutral-500" size={16} />
                                <span className="truncate">{f.name}</span>
                            </button>
                        ))}
                    </div>
                    <div className="mt-6 pt-6 border-t border-neutral-800">
                        <h3 className="px-4 mb-3 text-sm font-semibold text-neutral-500 uppercase tracking-wider">Shared With Me</h3>
                        {sidebarFolders?.sharedWithMe?.length === 0 && <p className="px-4 text-sm text-neutral-500">No shared folders.</p>}
                        {sidebarFolders?.sharedWithMe?.map(f => (
                            <button key={f._id} onClick={() => handleFolderClick(f)} className="group w-full text-left px-4 py-2.5 rounded-lg text-sm flex items-center hover:bg-neutral-800 transition-colors duration-200 text-neutral-400 hover:text-white">
                                <FolderSymlink className="mr-4 text-neutral-500" size={16} />
                                <span className="truncate">{f.name}</span>
                            </button>
                        ))}
                    </div>
                </nav>
                <div className="border-t border-neutral-800 pt-6 mt-auto flex items-center justify-between">
                    <div>
                        <p className="text-sm font-semibold text-white">{user?.username}</p>
                        <p className="text-xs text-neutral-400">{user?.email}</p>
                    </div>
                    <button onClick={logout} className="text-sm text-neutral-400 hover:text-red-500 transition-colors duration-200 p-2 rounded-full hover:bg-neutral-800" title="Logout">
                        <LogOut size={20} />
                    </button>
                </div>
            </aside>

            <div onClick={() => setSidebarOpen(false)} className={`fixed inset-0 bg-black/60 z-30 lg:hidden ${isSidebarOpen ? 'block' : 'hidden'}`}></div>

            <main className="flex-1 p-4 sm:p-6 md:p-8 flex flex-col bg-black overflow-hidden">
                <header className="flex-shrink-0 flex flex-col md:flex-row justify-between items-start md:items-center mb-6 pb-4 border-b border-neutral-800">
                    <div className="flex items-center">
                        <button onClick={() => setSidebarOpen(true)} className="lg:hidden mr-4 p-2 rounded-md text-neutral-400 hover:bg-neutral-800">
                            <Menu size={28} />
                        </button>
                        <div>
                            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-1 leading-tight">{history[history.length - 1]?.name}</h1>
                            {currentFolderData && <p className="text-xs sm:text-sm text-neutral-500">Owned by <span className="font-medium text-neutral-400">{isOwnerOfCurrentFolder ? 'you' : currentFolderData.user.username}</span></p>}
                        </div>
                    </div>
                    {viewMode !== 'trash' && canWriteInCurrentView && (
                        <button onClick={() => setAddModalOpen(true)} className="bg-white text-black px-4 py-2 sm:px-5 sm:py-2.5 rounded-lg shadow-lg hover:bg-neutral-200 transition-all duration-300 ease-in-out transform active:scale-95 flex items-center mt-4 md:mt-0 font-semibold text-base sm:text-lg self-end md:self-center">
                            <PlusCircle className="mr-2 sm:mr-3" size={20} /> Add New
                        </button>
                    )}
                </header>

                <div className="flex-shrink-0 flex flex-col md:flex-row gap-4 mb-6">
                    <div className="relative flex-grow">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500" size={20} />
                        <input
                            type="text"
                            placeholder="Search in this folder..."
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            className="w-full pl-12 pr-4 py-3 border border-neutral-800 rounded-lg bg-neutral-900 text-neutral-200 placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-white shadow-sm transition-all duration-200"
                        />
                    </div>
                    {viewMode === 'drive' && (
                        <div className="flex items-center gap-1 sm:gap-2 bg-neutral-900 p-1 sm:p-1.5 rounded-lg overflow-x-auto border border-neutral-800">
                            {['all', 'image', 'video', 'audio', 'document', 'favorites'].map(f => (
                                <button
                                    key={f}
                                    onClick={() => setActiveFilter(f)}
                                    className={`px-3 py-1.5 sm:px-4 rounded-md text-xs sm:text-sm font-semibold whitespace-nowrap transition-all duration-200
                                        ${activeFilter === f ? 'bg-white text-black shadow' : 'text-neutral-400 hover:bg-neutral-800 hover:text-white'}
                                    `}
                                >
                                    {f.charAt(0).toUpperCase() + f.slice(1)}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {viewMode === 'drive' && (
                    <nav className="flex-shrink-0 flex items-center flex-wrap gap-y-2 space-x-2 bg-neutral-900 p-3 rounded-lg mb-6 text-sm border border-neutral-800">
                        <Home onClick={() => handleBreadcrumbClick('root', 0)} className="cursor-pointer text-neutral-400 hover:text-white transition-colors duration-200" size={20} />
                        {history.map((f, i) => (
                            <React.Fragment key={f._id}>
                                {i > 0 && <ChevronRight size={16} className="text-neutral-600" />}
                                <button
                                    onClick={() => handleBreadcrumbClick(f._id, i)}
                                    className={`font-medium ${i === history.length - 1 ? 'text-white cursor-default' : 'text-neutral-400 hover:text-white hover:underline'}`}
                                >
                                    {f.name}
                                </button>
                            </React.Fragment>
                        ))}
                    </nav>
                )}

                <div className="flex-grow overflow-y-auto p-2 sm:p-4 bg-neutral-900/50 rounded-lg border border-neutral-800">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center h-full text-neutral-500">
                            <Loader2 className="animate-spin text-white mb-4" size={48} />
                            <p className="text-lg font-medium">Loading content...</p>
                        </div>
                    ) : error ? (
                        <div className="flex flex-col items-center justify-center h-full text-red-400 text-center p-4">
                            <ShieldAlert size={64} className="mb-4" />
                            <p className="text-xl font-semibold">{error}</p>
                            <p className="text-md text-neutral-500 mt-2">Please try again or check permissions.</p>
                        </div>
                    ) : (content?.folders?.length === 0 && content?.media?.length === 0) ? (
                        <div className="flex flex-col items-center justify-center h-full text-neutral-600 text-center p-4">
                            <Folder size={64} className="mb-4" />
                            <p className="text-xl font-semibold">This folder is empty</p>
                            {viewMode === 'drive' && canWriteInCurrentView && <p className="mt-2 text-md">Click "Add New" to upload files or create folders.</p>}
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7 gap-4 md:gap-5">
                            {content?.folders?.map(f => (
                                <div key={f._id} onDoubleClick={() => handleFolderClick(f)} onContextMenu={(e) => handleContextMenu(e, f)} className="bg-neutral-800/50 p-4 border border-neutral-800 rounded-lg text-center cursor-pointer hover:border-neutral-700 hover:bg-neutral-800 transform hover:-translate-y-1 transition-all duration-200 relative group animate-in fade-in-0">
                                    {f.hasPassword ? <Lock size={40} className="mx-auto text-yellow-500" title="Password protected" /> : <Folder size={40} className="mx-auto text-white" />}
                                    <p className="mt-3 text-sm font-semibold text-neutral-200 truncate">{f.name}</p>
                                    <button onClick={(e) => handleContextMenu(e, f)} className="absolute top-2 right-2 p-1.5 rounded-full text-neutral-400 hover:bg-neutral-700 opacity-0 group-hover:opacity-100 transition-opacity duration-200 focus:opacity-100" title="More options">
                                        <MoreVertical size={18} />
                                    </button>
                                </div>
                            ))}
                            {content?.media?.map(m => (
                                <div key={m._id} onDoubleClick={() => handlePreviewClick(m)} onContextMenu={(e) => handleContextMenu(e, m)} className="bg-neutral-800/50 p-3 border border-neutral-800 rounded-lg text-center hover:border-neutral-700 hover:bg-neutral-800 transform hover:-translate-y-1 transition-all duration-200 relative group cursor-pointer animate-in fade-in-0">
                                    {m.isFavorite && <Star size={16} className="absolute top-2 left-2 text-yellow-400 fill-yellow-400 z-10" />}
                                    <div className="h-28 w-full bg-neutral-900 rounded-md overflow-hidden flex items-center justify-center mb-3 shadow-inner">
                                        {(m.mimetype && m.mimetype.startsWith('image/')) ? (
                                            <img src={getStaticUrl(m.path)} alt={m.displayName} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" loading="lazy" />
                                        ) : (
                                            getFileIcon(m)
                                        )}
                                    </div>
                                    <p className="text-sm font-semibold text-neutral-200 truncate">{m.displayName}</p>
                                    <p className="text-xs text-neutral-500 mt-1">{m.type.toUpperCase()}</p>
                                    <button onClick={(e) => handleContextMenu(e, m)} className="absolute top-2 right-2 p-1.5 rounded-full text-neutral-400 hover:bg-neutral-700 opacity-0 group-hover:opacity-100 transition-opacity duration-200 focus:opacity-100" title="More options">
                                        <MoreVertical size={18} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
                {renderContextMenu()}
                <PreviewModal isOpen={isPreviewModalOpen} onClose={closePreviewModal} item={itemToPreview} />
                <AddItemModal isOpen={isAddModalOpen} onClose={() => setAddModalOpen(false)} onCreateFolder={handleCreateFolder} onUploadMedia={handleUploadMedia} />
                <EditFolderModal isOpen={isEditFolderModalOpen} onClose={closeEditModal} folder={itemToEdit} onSave={handleEditFolder} />
                <EditMediaModal isOpen={isEditMediaModalOpen} onClose={closeEditModal} media={itemToEdit} onSave={handleEditMedia} allFolders={allFoldersForMove} />
                <PasswordPromptModal
                    isOpen={passwordModalState.isOpen}
                    onClose={closePasswordModal}
                    folderName={passwordModalState.folder?.name}
                    onSubmit={handlePasswordSubmit}
                    error={passwordModalState.error}
                    loading={passwordModalState.loading}
                />
                <ShareModal isOpen={isShareModalOpen} onClose={closeShareModal} folder={folderToShare} onCollaboratorsUpdate={refreshAll} />
            </main>
        </div>
    );
};

export default MediaManagerPage;