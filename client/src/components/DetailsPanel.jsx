import React from 'react';
import { X, FileText, Clock, HardDrive, Calendar } from 'lucide-react';
import { getStaticUrl, formatDate, formatFileSize } from '../services/apiService'; 

const DetailsPanel = ({ selectedItem, onClose }) => {
    if (!selectedItem) {
        return (
            <div className="w-80 border-l border-neutral-800 p-6 flex flex-col items-center justify-center text-center">
                <FileText size={48} className="text-neutral-600 mb-4" />
                <h3 className="font-semibold text-white">Select an item</h3>
                <p className="text-sm text-neutral-500">Select a file or folder to see its details.</p>
            </div>
        );
    }

    const isFolder = !selectedItem.mimetype;
    const name = isFolder ? selectedItem.name : selectedItem.displayName;

    return (
        <div className="w-80 border-l border-neutral-800 p-6 flex flex-col animate-in slide-in-from-right-10 duration-300">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-bold text-white">Details</h2>
                <button onClick={onClose} className="p-2 rounded-full text-neutral-400 hover:bg-neutral-800">
                    <X size={20} />
                </button>
            </div>

            <div className="flex-grow overflow-y-auto">
                {selectedItem.mimetype && selectedItem.mimetype.startsWith('image/') ? (
                    <div className="w-full h-40 bg-neutral-800 rounded-lg mb-6 overflow-hidden">
                        <img src={getStaticUrl(selectedItem.path)} alt={name} className="w-full h-full object-cover" />
                    </div>
                ) : (
                    <div className="w-full h-40 bg-neutral-800 rounded-lg mb-6 flex items-center justify-center">
                        <FileText size={64} className="text-neutral-600" />
                    </div>
                )}

                <h3 className="font-bold text-xl text-white break-words">{name}</h3>
                <p className="text-sm text-neutral-400 capitalize mt-1">{isFolder ? 'Folder' : selectedItem.type}</p>

                <div className="mt-8 border-t border-neutral-800 pt-6 space-y-4">
                    <h4 className="text-sm font-semibold text-neutral-500 uppercase tracking-wider">Properties</h4>
                    
                    {!isFolder && (
                         <div className="flex items-center text-sm">
                            <HardDrive size={16} className="text-neutral-500 mr-3" />
                            <span className="text-neutral-400">Size:</span>
                            <span className="ml-auto font-medium text-white">{formatFileSize(selectedItem.size)}</span>
                        </div>
                    )}
                   
                    <div className="flex items-center text-sm">
                        <Clock size={16} className="text-neutral-500 mr-3" />
                        <span className="text-neutral-400">Modified:</span>
                        <span className="ml-auto font-medium text-white">{formatDate(selectedItem.updatedAt)}</span>
                    </div>

                     <div className="flex items-center text-sm">
                        <Calendar size={16} className="text-neutral-500 mr-3" />
                        <span className="text-neutral-400">Created:</span>
                        <span className="ml-auto font-medium text-white">{formatDate(selectedItem.createdAt)}</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DetailsPanel;