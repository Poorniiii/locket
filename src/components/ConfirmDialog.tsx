import { ReactNode } from "react";
import { Modal } from "react-bootstrap";

interface ConfirmDialogProps {
  show: boolean;
  title: string;
  message: ReactNode;
  confirmLabel: string;
  cancelLabel?: string;
  destructive?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmDialog({
  show,
  title,
  message,
  confirmLabel,
  cancelLabel = "Cancel",
  destructive = false,
  onConfirm,
  onCancel
}: ConfirmDialogProps) {
  return (
    <Modal
      className="sbd-modal"
      show={show}
      onHide={onCancel}
      backdrop="static"
    >
      <Modal.Header className="sbd-modal__confirm-header">
        <h2 className="sbd-modal__confirm-title">{title}</h2>
      </Modal.Header>
      <Modal.Body>{message}</Modal.Body>
      <Modal.Footer>
        <button className="sbd-btn sbd-btn--secondary" onClick={onCancel}>
          {cancelLabel}
        </button>
        <button
          className={`sbd-btn ${
            destructive ? "sbd-btn--danger" : "sbd-btn--primary"
          }`}
          onClick={onConfirm}
        >
          {confirmLabel}
        </button>
      </Modal.Footer>
    </Modal>
  );
}
