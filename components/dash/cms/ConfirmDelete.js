"use client";

import Modal from "../Modal";

export default function ConfirmDelete({ item, onCancel, onConfirm, text }) {
    return (
        <Modal
            open={!!item}
            onClose={onCancel}
            title={item ? `Delete “${item.title}”?` : ""}
            size="sm"
            footer={
                <>
                    <button type="button" className="btn-ghost min-h-10 text-[14px]" onClick={onCancel}>
                        Cancel
                    </button>
                    <button type="button" className="btn-primary min-h-10 bg-coral! text-[14px]" onClick={onConfirm}>
                        Delete
                    </button>
                </>
            }
        >
            <p className="text-[15px] text-ink-soft">{text ?? "It is removed from the website. This cannot be undone."}</p>
        </Modal>
    );
}
