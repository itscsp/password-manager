import React, { useState, useRef, useEffect } from 'react';
import { FiAlertTriangle } from 'react-icons/fi';

interface DeleteModalProps {
    username: string;
    onDelete: () => void;
}

const DeleteModal: React.FC<DeleteModalProps> = ({ username, onDelete }) => {
    const [isOpen, setIsOpen] = useState<boolean>(false);
    const [input, setInput] = useState<string>('');
    const modalRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const openModal = () => {
        setIsOpen(true);
    };

    const closeModal = () => {
        setIsOpen(false);
        setInput('');
    };

    const handleDelete = () => {
        onDelete();
        closeModal();
    };

    const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
            closeModal();
        }
    };

    useEffect(() => {
        if (isOpen && inputRef.current) {
            inputRef.current.focus();
        }
    }, [isOpen]);

    const inputClasses = "text-base outline-none border-b-2 border-opred w-full p-4 rounded-md bg-opblack400 hover:bg-opblack500 focus:bg-opblack600 active:bg-opblack700 hover:border-opred-dark focus:border-opred-dark active:border-opred-darker";


    return (
        <>
            <button
                onClick={openModal}
                className="text-white cursor-pointer text-base p-4 rounded-md mb-4 transition-colors duration-300 bg-transparent  border border-opred hover:bg-opredHover focus:bg-opredHover active:bg-opredHover w-full text-center block"
            >
                Delete
            </button>

            {isOpen && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
                    onClick={handleOverlayClick}
                >
                    <div
                        ref={modalRef}
                        className="bg-opblack400 w-full max-w-md mx-4 rounded-lg shadow-lg p-6 relative"
                    >
                        <div className="flex items-center justify-center mb-4">
                            <FiAlertTriangle className="text-red-500" size={40} />
                        </div>
                        <h2 className="text-2xl font-semibold text-center text-white mb-2">
                            Confirm Deletion
                        </h2>
                        <p className="text-center text-gray-300 mb-6">
                            Please type your username{' '}
                            <span className="font-bold text-opred">"{username}"</span> to confirm
                            deletion.
                        </p>
                        <input
                            ref={inputRef}
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            className={inputClasses}
                            placeholder="Enter username"
                        />
                        <div className="flex justify-end space-x-3 mt-4">
                            <button
                                onClick={closeModal}
                                className="px-4 py-2 rounded-md text-gray-300 hover:text-white bg-gray-600 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 transition duration-300"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDelete}
                                disabled={input !== username}
                                className={`px-4 py-2 rounded-md text-white focus:outline-none transition duration-300 ${
                                    input === username
                                        ? 'bg-opred hover:bg-opredHover focus:ring-2 focus:ring-opredHover'
                                        : 'bg-opred cursor-not-allowed'
                                }`}
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default DeleteModal;
