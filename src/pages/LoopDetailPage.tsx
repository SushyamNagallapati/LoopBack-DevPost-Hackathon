import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
    ClipboardDocumentIcon,
    CheckIcon,
    TrashIcon,
    PencilIcon,
    ArrowDownTrayIcon,
    XMarkIcon,
} from '@heroicons/react/24/outline';
import { getLoopById, saveLoop, deleteLoop } from '../lib/storage';
import type { Loop } from '../types';
import { formatDistanceToNow } from 'date-fns';

export default function LoopDetailPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [loop, setLoop] = useState<Loop | null>(null);
    const [isEditingTitle, setIsEditingTitle] = useState(false);
    const [editedTitle, setEditedTitle] = useState('');
    const [copiedField, setCopiedField] = useState<string | null>(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    useEffect(() => {
        if (!id) return;
        const foundLoop = getLoopById(id);
        if (!foundLoop) {
            navigate('/');
            return;
        }
        setLoop(foundLoop);
        setEditedTitle(foundLoop.title);
    }, [id, navigate]);

    const handleTitleSave = () => {
        if (!loop || !editedTitle.trim()) return;

        const updatedLoop: Loop = {
            ...loop,
            title: editedTitle.trim(),
            updatedAt: new Date().toISOString(),
        };

        saveLoop(updatedLoop);
        setLoop(updatedLoop);
        setIsEditingTitle(false);
    };

    const handleDelete = () => {
        if (!id) return;
        deleteLoop(id);
        navigate('/');
    };

    const copyToClipboard = async (text: string, fieldName: string) => {
        try {
            await navigator.clipboard.writeText(text);
            setCopiedField(fieldName);
            setTimeout(() => setCopiedField(null), 2000);
        } catch (error) {
            const textArea = document.createElement('textarea');
            textArea.value = text;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            setCopiedField(fieldName);
            setTimeout(() => setCopiedField(null), 2000);
        }
    };

    const copyAll = async () => {
        if (!loop) return;

        const allText = [
            `Title: ${loop.title}`,
            `Created: ${new Date(loop.createdAt).toLocaleString()}`,
            '',
            `Situation: ${loop.situation}`,
            `Emotion: ${loop.emotion}`,
            `What Matters: ${loop.whatMatters}`,
            '',
            `Smallest Step: ${loop.smallestStep}`,
            `Bolder Step: ${loop.bolderStep}`,
        ];

        if (loop.messageDraft) {
            allText.push('', `Message Draft: ${loop.messageDraft}`);
        }

        await copyToClipboard(allText.join('\n'), 'all');
    };

    const exportJSON = () => {
        if (!loop) return;

        const dataStr = JSON.stringify(loop, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `loop-${loop.id}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    if (!loop) {
        return (
            <div className="min-h-screen bg-gray-950 text-gray-100 flex items-center justify-center">
                <p className="text-gray-400">Loading...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-950 text-gray-100">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                {/* Header */}
                <div className="mb-10">
                    <Link
                        to="/"
                        className="text-blue-500 hover:text-blue-400 text-sm font-medium mb-6 inline-block transition-colors"
                    >
                        ← Back to Home
                    </Link>

                    <div className="flex items-start justify-between mb-4">
                        {isEditingTitle ? (
                            <div className="flex-1 mr-4">
                                <input
                                    type="text"
                                    value={editedTitle}
                                    onChange={(e) => setEditedTitle(e.target.value)}
                                    onBlur={handleTitleSave}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                            handleTitleSave();
                                        } else if (e.key === 'Escape') {
                                            setEditedTitle(loop.title);
                                            setIsEditingTitle(false);
                                        }
                                    }}
                                    className="w-full px-4 py-2 bg-gray-800/50 border border-gray-800 rounded-md text-white text-xl font-medium focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500/50 transition-colors"
                                    autoFocus
                                />
                            </div>
                        ) : (
                            <h1 className="text-xl font-medium text-white mr-4 tracking-tight">{loop.title}</h1>
                        )}
                        <button
                            onClick={() => {
                                if (isEditingTitle) {
                                    handleTitleSave();
                                } else {
                                    setIsEditingTitle(true);
                                }
                            }}
                            className="p-2 text-gray-500 hover:text-gray-300 hover:bg-gray-800/50 rounded-md transition-colors"
                            aria-label={isEditingTitle ? 'Save title' : 'Edit title'}
                        >
                            {isEditingTitle ? (
                                <CheckIcon className="w-4 h-4" />
                            ) : (
                                <PencilIcon className="w-4 h-4" />
                            )}
                        </button>
                    </div>

                    <div className="flex items-center gap-4 text-xs text-gray-500">
                        <time>
                            Created {formatDistanceToNow(new Date(loop.createdAt), { addSuffix: true })}
                        </time>
                        {loop.updatedAt !== loop.createdAt && (
                            <time>
                                Updated {formatDistanceToNow(new Date(loop.updatedAt), { addSuffix: true })}
                            </time>
                        )}
                    </div>
                </div>

                {/* Content */}
                <div className="space-y-4">
                    {/* Situation */}
                    <div className="bg-gray-900/50 border border-gray-800/50 rounded-md p-5">
                        <div className="flex justify-between items-start mb-3">
                            <h2 className="text-sm font-medium text-gray-400 uppercase tracking-wide">Situation</h2>
                            <button
                                onClick={() => copyToClipboard(loop.situation, 'situation')}
                                className="text-gray-500 hover:text-gray-300 transition-colors p-1 -mr-1"
                                aria-label="Copy situation"
                            >
                                {copiedField === 'situation' ? (
                                    <CheckIcon className="w-4 h-4 text-green-400" />
                                ) : (
                                    <ClipboardDocumentIcon className="w-4 h-4" />
                                )}
                            </button>
                        </div>
                        <p className="text-sm text-gray-300 whitespace-pre-wrap leading-relaxed">{loop.situation}</p>
                    </div>

                    {/* Emotion */}
                    <div className="bg-gray-900/50 border border-gray-800/50 rounded-md p-5">
                        <div className="flex justify-between items-start mb-3">
                            <h2 className="text-sm font-medium text-gray-400 uppercase tracking-wide">Emotion</h2>
                            <button
                                onClick={() => copyToClipboard(loop.emotion, 'emotion')}
                                className="text-gray-500 hover:text-gray-300 transition-colors p-1 -mr-1"
                                aria-label="Copy emotion"
                            >
                                {copiedField === 'emotion' ? (
                                    <CheckIcon className="w-4 h-4 text-green-400" />
                                ) : (
                                    <ClipboardDocumentIcon className="w-4 h-4" />
                                )}
                            </button>
                        </div>
                        <span className="inline-block px-2.5 py-1 bg-gray-800/50 border border-gray-800 rounded-md text-xs text-gray-300">
                            {loop.emotion}
                        </span>
                    </div>

                    {/* What Matters */}
                    <div className="bg-gray-900/50 border border-gray-800/50 rounded-md p-5">
                        <div className="flex justify-between items-start mb-3">
                            <h2 className="text-sm font-medium text-gray-400 uppercase tracking-wide">What Matters</h2>
                            <button
                                onClick={() => copyToClipboard(loop.whatMatters, 'whatMatters')}
                                className="text-gray-500 hover:text-gray-300 transition-colors p-1 -mr-1"
                                aria-label="Copy what matters"
                            >
                                {copiedField === 'whatMatters' ? (
                                    <CheckIcon className="w-4 h-4 text-green-400" />
                                ) : (
                                    <ClipboardDocumentIcon className="w-4 h-4" />
                                )}
                            </button>
                        </div>
                        <p className="text-sm text-gray-300 whitespace-pre-wrap leading-relaxed">{loop.whatMatters}</p>
                    </div>

                    {/* Steps */}
                    <div className="space-y-4">
                        <div className="bg-gray-900/50 border border-gray-800/50 rounded-md p-5">
                            <div className="flex justify-between items-start mb-3">
                                <h2 className="text-sm font-medium text-blue-400">Smallest Step</h2>
                                <button
                                    onClick={() => copyToClipboard(loop.smallestStep, 'smallest')}
                                    className="text-gray-500 hover:text-gray-300 transition-colors p-1 -mr-1"
                                    aria-label="Copy smallest step"
                                >
                                    {copiedField === 'smallest' ? (
                                        <CheckIcon className="w-4 h-4 text-green-400" />
                                    ) : (
                                        <ClipboardDocumentIcon className="w-4 h-4" />
                                    )}
                                </button>
                            </div>
                            <p className="text-sm text-gray-300 leading-relaxed">{loop.smallestStep}</p>
                        </div>

                        <div className="bg-gray-900/50 border border-gray-800/50 rounded-md p-5">
                            <div className="flex justify-between items-start mb-3">
                                <h2 className="text-sm font-medium text-blue-400">Bolder Step</h2>
                                <button
                                    onClick={() => copyToClipboard(loop.bolderStep, 'bolder')}
                                    className="text-gray-500 hover:text-gray-300 transition-colors p-1 -mr-1"
                                    aria-label="Copy bolder step"
                                >
                                    {copiedField === 'bolder' ? (
                                        <CheckIcon className="w-4 h-4 text-green-400" />
                                    ) : (
                                        <ClipboardDocumentIcon className="w-4 h-4" />
                                    )}
                                </button>
                            </div>
                            <p className="text-sm text-gray-300 leading-relaxed">{loop.bolderStep}</p>
                        </div>
                    </div>

                    {/* Message Draft */}
                    {loop.messageDraft && (
                        <div className="bg-gray-900/50 border border-gray-800/50 rounded-md p-5">
                            <div className="flex justify-between items-start mb-3">
                                <div>
                                    <h2 className="text-sm font-medium text-gray-400 uppercase tracking-wide">Message Draft</h2>
                                    {loop.messageFor && (
                                        <p className="text-xs text-gray-500 mt-1">For: {loop.messageFor}</p>
                                    )}
                                </div>
                                <button
                                    onClick={() => copyToClipboard(loop.messageDraft || '', 'message')}
                                    className="text-gray-500 hover:text-gray-300 transition-colors p-1 -mr-1"
                                    aria-label="Copy message draft"
                                >
                                    {copiedField === 'message' ? (
                                        <CheckIcon className="w-4 h-4 text-green-400" />
                                    ) : (
                                        <ClipboardDocumentIcon className="w-4 h-4" />
                                    )}
                                </button>
                            </div>
                            <p className="text-sm text-gray-300 whitespace-pre-wrap leading-relaxed">{loop.messageDraft}</p>
                        </div>
                    )}

                    {/* Actions */}
                    <div className="flex flex-wrap gap-3 pt-6 border-t border-gray-800/50">
                        <button
                            onClick={copyAll}
                            className="flex items-center px-5 py-2.5 text-sm font-medium bg-blue-600 hover:bg-blue-600/90 text-white rounded-md transition-colors"
                        >
                            {copiedField === 'all' ? (
                                <>
                                    <CheckIcon className="w-4 h-4 mr-2" />
                                    Copied!
                                </>
                            ) : (
                                <>
                                    <ClipboardDocumentIcon className="w-4 h-4 mr-2" />
                                    Copy All
                                </>
                            )}
                        </button>
                        <button
                            onClick={exportJSON}
                            className="flex items-center px-5 py-2.5 text-sm font-medium bg-gray-800/50 border border-gray-800 hover:bg-gray-800 hover:border-gray-700 text-gray-300 rounded-md transition-colors"
                        >
                            <ArrowDownTrayIcon className="w-4 h-4 mr-2" />
                            Export JSON
                        </button>
                        <button
                            onClick={() => setShowDeleteModal(true)}
                            className="flex items-center px-5 py-2.5 text-sm font-medium bg-red-600 hover:bg-red-600/90 text-white rounded-md transition-colors"
                        >
                            <TrashIcon className="w-4 h-4 mr-2" />
                            Delete Loop
                        </button>
                    </div>
                </div>
            </div>

            {/* Delete Confirmation Modal */}
            {showDeleteModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-gray-900/95 backdrop-blur-sm border border-gray-800/50 rounded-md p-6 max-w-md w-full">
                        <div className="flex items-center justify-between mb-5">
                            <h3 className="text-base font-medium text-white">Delete Loop</h3>
                            <button
                                onClick={() => setShowDeleteModal(false)}
                                className="text-gray-500 hover:text-gray-300 transition-colors p-1"
                                aria-label="Close modal"
                            >
                                <XMarkIcon className="w-5 h-5" />
                            </button>
                        </div>
                        <p className="text-sm text-gray-400 mb-6 leading-relaxed">
                            Are you sure you want to delete this loop? This action cannot be undone.
                        </p>
                        <div className="flex gap-3 justify-end">
                            <button
                                onClick={() => setShowDeleteModal(false)}
                                className="px-5 py-2.5 text-sm font-medium bg-gray-800/50 border border-gray-800 hover:bg-gray-800 hover:border-gray-700 text-gray-300 rounded-md transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDelete}
                                className="px-5 py-2.5 text-sm font-medium bg-red-600 hover:bg-red-600/90 text-white rounded-md transition-colors"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

