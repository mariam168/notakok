import React, { useState, useEffect } from 'react';
import { X, Save, FileEdit, FolderTree } from 'lucide-react';

const EditMediaModal = ({ isOpen, onClose, onSave, media, allFolders }) => {
    const [filename, setFilename] = useState('');
    const [folderId, setFolderId] = useState(null);

    useEffect(() => {
        if (media) {
            setFilename(media.displayName || '');
            setFolderId(media.folder || 'null');
        }
    }, [media]);

    if (!isOpen) return null;

    const buildFolderOptions = (folders, parentId = null, depth = 0) => {
        const options = [];
        if (!Array.isArray(folders)) return options;
        const sortedFolders = [...folders].sort((a, b) => a.name.localeCompare(b.name));
        const children = sortedFolders.filter(f => (f.parentFolder === parentId || (f.parentFolder === null && parentId === null)));

        children.forEach(folder => {
            const prefix = "\u00A0\u00A0".repeat(depth) + "↳ ";
            options.push(
                <option key={folder._id} value={folder._id} className="bg-neutral-800 text-white">
                    {prefix}{folder.name}
                </option>
            );
            options.push(...buildFolderOptions(sortedFolders, folder._id, depth + 1));
        });
        return options;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(media._id, {
            filename,
            folderId: folderId === 'null' ? null : folderId,
        });
    };

    return (
        <div 
            className="fixed inset-0 bg-black/80 backdrop-blur-sm flex justify-center items-center z-50 p-4"
            onClick={onClose}
        >
            <div 
                className="bg-neutral-900 border border-neutral-800 p-6 sm:p-8 rounded-2xl shadow-2xl w-full max-w-md
                           animate-in fade-in-0 zoom-in-95"
                onClick={e => e.stopPropagation()}
            >
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h2 className="text-2xl font-bold text-white">Edit Media</h2>
                        <p className="text-sm text-neutral-400 truncate pr-4">
                            Editing: <span className="font-semibold text-white">{media?.displayName}</span>
                        </p>
                    </div>
                    <button onClick={onClose} className="p-2 rounded-full text-neutral-400 hover:bg-neutral-800 hover:text-white transition-colors">
                        <X size={20} />
                    </button>
                </div>
                
                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label className="text-sm font-medium text-neutral-400 block mb-2 flex items-center">
                            <FileEdit size={14} className="mr-2" /> Filename
                        </label>
                        <input 
                            type="text" 
                            value={filename} 
                            onChange={(e) => setFilename(e.target.value)} 
                            className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-lg text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-neutral-900 focus:ring-white transition-all duration-300" 
                            required 
                        />
                    </div>
                    
                    <div>
                        <label className="text-sm font-medium text-neutral-400 block mb-2 flex items-center">
                           <FolderTree size={14} className="mr-2" /> Move to Folder
                        </label>
                        <select 
                            value={folderId || 'null'} 
                            onChange={(e) => setFolderId(e.target.value)} 
                            className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-neutral-900 focus:ring-white transition-all duration-300 appearance-none"
                        >
                            <option value="null" className="bg-neutral-800 text-white">-- Root Folder --</option>
                            {buildFolderOptions(allFolders, null, 0)}
                        </select>
                    </div>

                    <div className="pt-4">
                        <button 
                            type="submit" 
                            className="w-full px-4 py-3 font-bold text-black bg-white rounded-lg hover:bg-neutral-200 active:scale-95 flex justify-center items-center transition-all duration-300 disabled:bg-neutral-500 disabled:cursor-not-allowed disabled:text-neutral-300"
                        >
                            <Save className="mr-2" size={20} /> Save Changes
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditMediaModal;