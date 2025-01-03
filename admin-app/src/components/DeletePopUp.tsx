import React, { useState } from 'react';
import Modal, { Styles } from 'react-modal';
import { baseURL } from '../global';

interface PopupProps {
    onConfirm: () => void;
    table: String;
    name: String | number | null;
    onCancel: () => void;
}

const DeletePopup: React.FC<PopupProps> = ({ onConfirm, table, name, onCancel }) => {
    const [isOpen, setIsOpen] = useState(false);

    const openModal = () => {
        setIsOpen(true);
    };

    const closeModal = () => {
        setIsOpen(false);
    };

    const handleConfirmClick = async (r: String | number | null, u: String | number | null) => {
        const data = {
            username: u,
            role: "DRIVER",
        }

        console.log(data);

        const remove = baseURL + "/api/v1/admin/delete-account";
        const res = await fetch(remove, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                // Add any additional headers if required
            },
            body: JSON.stringify(data),
        });
        closeModal();
    };

    const handleCancelClick = () => {
        onCancel();
        closeModal();
    };

    const customStyles: Styles = {
        overlay: {
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
        },
        content: {
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            maxWidth: '400px',
            backgroundColor: 'white',
            borderRadius: '4px',
            padding: '20px',
        },
    };

    Modal.setAppElement('#root'); // Set the root element of your app

    return (
        <div>
            <div className='flex flex-col items-centre'>
                <h1>{name}</h1>
                <button className='bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 w-16 rounded' onClick={openModal}>🗑️</button>
            </div>
            <Modal isOpen={isOpen} onRequestClose={closeModal} style={customStyles} className="mt-64 z-99">
                <h1>You're about to delete an account:</h1>
                <p>By clicking OK, the {table} account {name} will be deleted.</p>
                <p>Be careful! This action is non-reversible.</p>
                <br></br>
                <button onClick={() => {handleConfirmClick(table, name)}}>OK</button>
                <button onClick={handleCancelClick}>Cancel</button>
            </Modal>
        </div>
    );
};

export default DeletePopup;