import { useEffect, useRef, useState } from "react";
import { addPage, updatePage } from "../features/pageSlice";
import { useAppDispatch } from "../hooks";
import { todayLocalDate } from "../utils/date";
import {
  Modal,
  ModalTitle,
  ModalBody,
  Button,
  ModalFooter,
  Toast,
  ToastContainer
} from "react-bootstrap";
import "../styles.css";
import close from "../images/close.svg";

interface CreateNewPageProps {
  show: boolean;
  onHide: (value: boolean) => void;
  draftTitle: string;
  draftContent: string;
  draftId: number;
  isDraft: boolean;
  pageId: number;
}

export default function CreateNewPage(props: CreateNewPageProps) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const titleRef = useRef<HTMLInputElement>(null);
  const contentRef = useRef<HTMLTextAreaElement>(null);
  const [saveToast, setSaveToast] = useState(false);
  const [submitToast, setSubmitToast] = useState(false);
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (props.show) {
      setTitle(props.isDraft ? props.draftTitle : "");
      setContent(props.isDraft ? props.draftContent : "");
    }
  }, [props.show, props.isDraft, props.draftTitle, props.draftContent]);

  const isEmpty = !title.trim() && !content.trim();
  const noteDate = todayLocalDate();

  const dispatchAdd = (isSubmitted: boolean) => {
    dispatch(
      addPage({
        pageId: props.pageId,
        pageTitle: title,
        pageContent: content,
        pageDate: noteDate,
        createdAt: new Date().toISOString(),
        isArchive: false,
        isFavorite: false,
        isSubmitted
      })
    );
  };

  const dispatchUpdate = (isSubmitted: boolean) => {
    dispatch(
      updatePage({
        pageId: props.draftId,
        pageTitle: title,
        pageContent: content,
        pageDate: noteDate,
        isArchive: false,
        isFavorite: false,
        isSubmitted
      })
    );
  };

  const closeAfter = (showSaved: boolean) => {
    if (showSaved) setSaveToast(true);
    else setSubmitToast(true);
    props.onHide(false);
  };

  const handleSave = () => {
    if (isEmpty) return;
    dispatchAdd(false);
    closeAfter(true);
  };

  const handleSubmit = () => {
    if (isEmpty) return;
    if (props.isDraft) {
      dispatchUpdate(true);
    } else {
      dispatchAdd(true);
    }
    closeAfter(false);
  };

  const handleUpdate = () => {
    if (isEmpty) return;
    dispatchUpdate(false);
    closeAfter(true);
  };

  const hideNewPage = () => props.onHide(false);

  const focusOnOpen = () => {
    if (props.isDraft) {
      const textarea = contentRef.current;
      if (textarea) {
        textarea.focus();
        const end = textarea.value.length;
        textarea.setSelectionRange(end, end);
      }
    } else {
      titleRef.current?.focus();
    }
  };

  return (
    <div>
      {saveToast && (
        <ToastContainer className="saveToast">
          <Toast
            show={saveToast}
            delay={2000}
            onClose={() => setSaveToast(false)}
            autohide
          >
            <Toast.Body className="saveToastText">Saved</Toast.Body>
          </Toast>
        </ToastContainer>
      )}
      {submitToast && (
        <ToastContainer className="saveToast">
          <Toast
            show={submitToast}
            delay={4000}
            onClose={() => setSubmitToast(false)}
            autohide
          >
            <Toast.Body className="saveToastText">Submitted</Toast.Body>
          </Toast>
        </ToastContainer>
      )}
      <Modal
        className="sbd-modal"
        backdrop="static"
        scrollable
        show={props.show}
        onHide={hideNewPage}
        onEntered={focusOnOpen}
      >
        <ModalTitle>
          <div className="sbd-modal__title-row">
            <input
              ref={titleRef}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              id="noteTitle"
              className="enterTitle"
              type="text"
              placeholder="Enter your title"
            />
            <button
              className="closeButton"
              onClick={hideNewPage}
              aria-label="Close"
            >
              <img src={close} alt="" aria-hidden="true" />
            </button>
          </div>
        </ModalTitle>
        <hr />
        <ModalBody>
          <textarea
            ref={contentRef}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            id="noteContent"
            className="enterNotes"
            placeholder="Enter your note"
          ></textarea>
        </ModalBody>
        <p className="note">Note: Once submitted, page cannot be edited.</p>
        <ModalFooter className="modalFooter">
          {props.isDraft ? (
            <Button
              className="saveNotes"
              onClick={handleUpdate}
              disabled={isEmpty}
            >
              Update
            </Button>
          ) : (
            <Button
              className="saveNotes"
              onClick={handleSave}
              disabled={isEmpty}
            >
              Save
            </Button>
          )}
          <Button
            className="submitNotes"
            onClick={handleSubmit}
            disabled={isEmpty}
          >
            Submit
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
}
