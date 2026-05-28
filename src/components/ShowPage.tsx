import { Modal, ModalTitle, ModalBody } from "react-bootstrap";
import "../styles.css";
import close from "../images/close.svg";

interface ShowPageProps {
  show: boolean;
  onHide: (value: boolean) => void;
  showTitle: string;
  showContent: string;
  showId?: number;
}

const ShowPage = (props: ShowPageProps) => {
  const hideNewPage = () => {
    props.onHide(false);
  };

  return (
    <div>
      <Modal
        className="sbd-modal"
        backdrop="static"
        show={props.show}
        onHide={hideNewPage}
      >
        <ModalTitle>
          <div className="sbd-modal__title-row">
            <p id="noteTitle" className="showTitle">
              {props.showTitle}
            </p>
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
          <p id="noteContent" className="showContent">
            {props.showContent}
          </p>
        </ModalBody>
      </Modal>
    </div>
  );
};

export default ShowPage;
