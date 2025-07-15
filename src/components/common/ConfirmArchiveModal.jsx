// src/components/common/ConfirmDeleteModal.jsx
const ConfirmArchiveModal = ({
  isOpen,
  title,
  message,
  onConfirm,
  onCancel,
  loading,
}) => {
  if (!isOpen) return null;

  return (
    <dialog className="modal modal-open">
      <div className="modal-box">
        <h3 className="font-bold text-lg">{title || "Confirm Archive"}</h3>
        <p className="py-4 text-sm text-gray-600">
          {message || "Are you sure you want to archive this item?"}
        </p>
        <div className="modal-action justify-end">
          <button className="btn" onClick={onCancel} disabled={loading}>
            Cancel
          </button>
          <button
            className={`btn btn-error ${loading ? "loading" : ""}`}
            onClick={onConfirm}
            disabled={loading}
          >
            {loading ? "Archiving..." : "Archive"}
          </button>
        </div>
      </div>
    </dialog>
  );
};

export default ConfirmArchiveModal;
