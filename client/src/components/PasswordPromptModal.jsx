import React, { useState, useEffect } from 'react';
import { X, KeyRound, Unlock, Loader2, ShieldAlert } from 'lucide-react';

const PasswordPromptModal = ({ isOpen, onClose, folderName, onSubmit, error, loading }) => {
    const [password, setPassword] = useState('');

    useEffect(() => {
        if (!isOpen) {
            setPassword('');
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        if (password && !loading) {
            onSubmit(password);
        }
    };

    const handleCloseClick = (e) => {
        e.stopPropagation();
        onClose();
    };

    return (
        <div
            className="fixed inset-0 bg-black/80 backdrop-blur-sm flex justify-center items-center z-50 p-4"
            onClick={onClose}
        >
            <div
                className="bg-neutral-900 border border-neutral-800 p-6 sm:p-8 rounded-2xl shadow-2xl w-full max-w-sm
                           relative animate-in fade-in-0 zoom-in-95"
                onClick={e => e.stopPropagation()}
            >
                <button
                    onClick={handleCloseClick}
                    className="absolute top-4 right-4 p-2 rounded-full text-neutral-400 hover:bg-neutral-800 hover:text-white transition-colors z-10"
                >
                    <X size={20} />
                </button>

                <div className="text-center mb-6">
                    <div className="inline-block p-4 bg-neutral-800 border border-neutral-700 rounded-full mb-4 shadow-inner">
                        <KeyRound className="text-white" size={32} />
                    </div>
                    <h2 className="text-2xl font-bold text-white">Password Required</h2>
                    <p className="text-sm text-neutral-400 truncate mt-1">
                        To access "<span className="font-semibold text-white">{folderName}</span>"
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {error && (
                        <div className="flex items-center gap-2 text-red-400 bg-red-900/50 p-3 rounded-lg text-sm animate-in fade-in-0">
                            <ShieldAlert size={18} />
                            <span>{error}</span>
                        </div>
                    )}
                    <div>
                        <label htmlFor="folder-password" className="sr-only">Password</label>
                        <input
                            id="folder-password"
                            type="password"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            placeholder="Enter folder password"
                            required
                            autoFocus
                            className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-lg text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-neutral-900 focus:ring-white transition-all duration-300"
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full px-4 py-3 font-bold text-black bg-white rounded-lg hover:bg-neutral-200 active:scale-95 flex justify-center items-center transition-all duration-300 disabled:bg-neutral-500 disabled:cursor-not-allowed"
                    >
                        {loading ? <Loader2 className="animate-spin" size={18} /> : <Unlock className="mr-2" size={18} />}
                        {loading ? 'Verifying...' : 'Unlock'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default PasswordPromptModal;