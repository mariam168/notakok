import React from 'react';
import { X, Download, FileWarning } from 'lucide-react';
import { getStaticUrl } from '../services/apiService';

const PreviewModal = ({ isOpen, onClose, item }) => {

    if (!isOpen) return null;

    const renderContent = () => {
        if (!item) return null;
        
        const itemPath = getStaticUrl(item.path);
        const type = item.mimetype ? item.mimetype.split('/')[0] : item.type;

        if (type === 'image') {
            return <img src={itemPath} alt={item.displayName} className="max-w-full max-h-[85vh] object-contain rounded-lg" />;
        }
        if (type === 'video') {
            return <video src={itemPath} controls autoPlay className="max-w-full max-h-[85vh] rounded-lg focus:outline-none"></video>;
        }
        if (type === 'audio') {
            return (
                <div className="p-8 flex flex-col items-center gap-4 bg-neutral-900 rounded-lg">
                    <h3 className="text-xl font-semibold text-white truncate">{item.displayName}</h3>
                    <audio src={itemPath} controls autoPlay className="w-full max-w-md"></audio>
                </div>
            );
        }
        if (item.mimetype === 'application/pdf') {
            return <iframe src={itemPath} title={item.displayName} className="w-full h-[85vh] border-0 rounded-lg" />;
        }
        
        const commonDocTypes = ['application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/vnd.ms-powerpoint', 'application/vnd.openxmlformats-officedocument.presentationml.presentation'];
        if (commonDocTypes.includes(item.mimetype)) {
            const googleViewerUrl = `https://docs.google.com/gview?url=${encodeURIComponent(itemPath)}&embedded=true`;
            return <iframe src={googleViewerUrl} title={item.displayName} className="w-full h-[85vh] border-0 rounded-lg bg-white" />;
        }
        return (
            <div className="text-center p-10 bg-neutral-900 rounded-2xl border border-neutral-800">
                <FileWarning size={48} className="mx-auto text-yellow-500 mb-4" />
                <p className="text-lg font-semibold text-white">Preview not available for this file type.</p>
                <p className="text-sm text-neutral-400 mt-1 truncate max-w-xs">{item.displayName}</p>
                <a 
                    href={itemPath} 
                    download={item.displayName} 
                    className="mt-6 inline-flex items-center gap-2 bg-white text-black px-5 py-2.5 rounded-lg font-semibold hover:bg-neutral-200 transition-colors"
                >
                    <Download size={18} /> Download File
                </a>
            </div>
        );
    };

    return (
        <div 
            className="fixed inset-0 bg-black/80 backdrop-blur-sm flex justify-center items-center z-50 p-4 sm:p-6 md:p-8 animate-in fade-in-0"
            onClick={onClose}
        >
            <div 
                className="bg-neutral-900/50 rounded-2xl shadow-2xl w-full max-w-6xl max-h-[95vh] flex flex-col 
                           animate-in fade-in-0 zoom-in-95"
                onClick={e => e.stopPropagation()}
            >
                <header className="flex justify-between items-center p-4 border-b border-neutral-800 flex-shrink-0">
                    <h3 className="font-semibold text-base text-white truncate mr-4">{item?.displayName}</h3>
                    <div className="flex items-center gap-2">
                        <a 
                            href={item ? getStaticUrl(item.path) : '#'} 
                            download={item?.displayName} 
                            className="p-2 rounded-full text-neutral-300 hover:bg-neutral-800 hover:text-white transition-colors" 
                            title="Download"
                        >
                            <Download size={20} />
                        </a>
                        <button 
                            onClick={onClose} 
                            className="p-2 rounded-full text-neutral-300 hover:bg-neutral-800 hover:text-white transition-colors" 
                            title="Close"
                        >
                            <X size={24} />
                        </button>
                    </div>
                </header>
                <main className="flex-grow flex justify-center items-center p-1 md:p-4 overflow-auto">
                    {renderContent()}
                </main>
            </div>
        </div>
    );
};

export default PreviewModal;