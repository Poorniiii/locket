import { useState } from "react";
import { Tooltip, OverlayTrigger } from "react-bootstrap";
import CreateNewPage from "./NewPage";
import { updatePage, deletePage, sortPages } from "../features/pageSlice";
import { useAppDispatch, useAppSelector } from "../hooks";
import ShowPage from "./ShowPage";
import ConfirmDialog from "./ConfirmDialog";
import CardDate from "./CardDate";
import { todayLocalDate } from "../utils/date";
import type { DiaryPage } from "../types/page";
import addArchive from "../images/addarchive.svg";
import addFav from "../images/addfav.svg";
import addnewPage from "../images/newpage.svg";
import removeFav from "../images/removefav.svg";
import editPage from "../images/edit.svg";
import deleteThisPage from "../images/delete.svg";
import sortIcon from "../images/sort.svg";

export default function ListOfNotes() {
  const pagesList = useAppSelector((state) => state.pages.pageData);
  const [newPage, setNewPage] = useState(false);
  const [isShowPage, setShowPage] = useState(false);
  const [draftTitle, setDraftTitle] = useState("");
  const [draftContent, setDraftContent] = useState("");
  const [draftId, setDraftId] = useState(0);
  const [isDraft, setIsDraft] = useState(false);
  const [showTitle, setShowTitle] = useState("");
  const [showContent, setShowContent] = useState("");
  const [showId, setShowId] = useState(0);
  const [pendingDelete, setPendingDelete] = useState<DiaryPage | null>(null);
  const dispatch = useAppDispatch();
  const today = todayLocalDate();

  const openNewPage = () => {
    setNewPage(true);
    setIsDraft(false);
    setDraftTitle("");
    setDraftContent("");
  };

  const openDraft = (id: number, title: string, content: string) => {
    setNewPage(true);
    setIsDraft(true);
    setDraftTitle(title);
    setDraftContent(content);
    setDraftId(id);
  };

  const requestDelete = (page: DiaryPage) => {
    setPendingDelete(page);
  };

  const confirmDelete = () => {
    if (pendingDelete) {
      dispatch(deletePage({ pageId: pendingDelete.pageId }));
    }
    setPendingDelete(null);
  };

  const cancelDelete = () => {
    setPendingDelete(null);
  };

  const sortPagesList = () => {
    dispatch(sortPages());
  };

  const showPage = (id: number, title: string, content: string) => {
    setShowPage(true);
    setShowTitle(title);
    setShowContent(content);
    setShowId(id);
  };

  const visiblePages = pagesList.filter((page) => !page.isArchive);
  const nextPageId =
    pagesList.length > 0
      ? Math.max(...pagesList.map((p) => p.pageId)) + 1
      : 1;

  return (
    <section>
      <div className="panel-header">
        <h1 className="panel-title">Home</h1>
        <div className="panel-actions">
          <OverlayTrigger
            placement="top"
            trigger={["hover"]}
            overlay={<Tooltip>Sort by created date</Tooltip>}
          >
            <button className="sbd-btn sbd-btn--secondary" onClick={sortPagesList}>
              <img src={sortIcon} alt="" aria-hidden="true" />
              Sort
            </button>
          </OverlayTrigger>
          <OverlayTrigger
            placement="top"
            trigger={["hover"]}
            overlay={<Tooltip>Add new page</Tooltip>}
          >
            <button className="sbd-btn sbd-btn--primary" onClick={openNewPage}>
              <img src={addnewPage} alt="" aria-hidden="true" />
              New entry
            </button>
          </OverlayTrigger>
        </div>
      </div>

      <CreateNewPage
        show={newPage}
        onHide={() => setNewPage(false)}
        draftTitle={draftTitle}
        draftContent={draftContent}
        draftId={draftId}
        isDraft={isDraft}
        pageId={nextPageId}
      />
      <ShowPage
        show={isShowPage}
        onHide={() => setShowPage(false)}
        showTitle={showTitle}
        showContent={showContent}
        showId={showId}
      />

      {pagesList.length === 0 ? (
        <section className="welcome-panel" aria-label="How Locket works">
          <h2 className="welcome-panel__title">Welcome to Locket</h2>
          <p className="welcome-panel__lead">
            Your private diary lives only on this device. Every entry is
            encrypted with your password and never sent anywhere.
          </p>
          <dl className="welcome-panel__list">
            <div>
              <dt>Save</dt>
              <dd>Keeps an entry as a draft you can come back to today.</dd>
            </div>
            <div>
              <dt>Submit</dt>
              <dd>Locks the entry in for good. Submitted entries cannot be edited.</dd>
            </div>
            <div>
              <dt>Favorite, Archive, Delete</dt>
              <dd>Per-entry actions in the card footer once you create one.</dd>
            </div>
            <div>
              <dt>Settings</dt>
              <dd>Export an encrypted backup of your diary, or log out.</dd>
            </div>
          </dl>
          <p className="welcome-panel__cta">
            Click <strong>New entry</strong> above to write your first page.
          </p>
        </section>
      ) : visiblePages.length === 0 ? (
        <p className="empty-state">
          Nothing here right now. Archived entries live under{" "}
          <strong>Archives</strong>.
        </p>
      ) : (
        <div className="card-grid">
          {visiblePages.map((data: DiaryPage) => {
            const isEditable =
              !data.isSubmitted && today === data.pageDate;
            return (
              <article className="note-card" key={data.pageId}>
                <button
                  className="note-card__title"
                  onClick={() =>
                    showPage(data.pageId, data.pageTitle, data.pageContent)
                  }
                >
                  {data.pageTitle}
                </button>
                <CardDate date={data.pageDate} createdAt={data.createdAt} />
                <p className="note-card__excerpt">{data.pageContent}</p>
                <div className="note-card__footer">
                  <div className="note-card__badges">
                    <span
                      className={`sbd-badge ${
                        data.isSubmitted
                          ? "sbd-badge--submitted"
                          : "sbd-badge--draft"
                      }`}
                    >
                      {data.isSubmitted ? "Submitted" : "Draft"}
                    </span>
                    {data.isFavorite && (
                      <span className="sbd-badge sbd-badge--favorite">
                        Favorite
                      </span>
                    )}
                  </div>
                  <div className="note-card__actions">
                    <OverlayTrigger
                      placement="top"
                      trigger={["hover"]}
                      overlay={<Tooltip>Archive</Tooltip>}
                    >
                      <button
                        className="icon-btn"
                        aria-label="Archive page"
                        onClick={() =>
                          dispatch(
                            updatePage({
                              pageId: data.pageId,
                              isArchive: true
                            })
                          )
                        }
                      >
                        <img src={addArchive} alt="" aria-hidden="true" />
                      </button>
                    </OverlayTrigger>
                    <OverlayTrigger
                      placement="top"
                      trigger={["hover"]}
                      overlay={
                        <Tooltip>
                          {data.isFavorite
                            ? "Remove from favorites"
                            : "Add to favorites"}
                        </Tooltip>
                      }
                    >
                      <button
                        className="icon-btn"
                        aria-label={
                          data.isFavorite
                            ? "Remove from favorites"
                            : "Add to favorites"
                        }
                        onClick={() =>
                          dispatch(
                            updatePage({
                              pageId: data.pageId,
                              isFavorite: !data.isFavorite
                            })
                          )
                        }
                      >
                        <img
                          src={data.isFavorite ? removeFav : addFav}
                          alt=""
                          aria-hidden="true"
                        />
                      </button>
                    </OverlayTrigger>
                    {isEditable && (
                      <OverlayTrigger
                        placement="top"
                        trigger={["hover"]}
                        overlay={<Tooltip>Edit</Tooltip>}
                      >
                        <button
                          className="icon-btn"
                          aria-label="Edit page"
                          onClick={() =>
                            openDraft(
                              data.pageId,
                              data.pageTitle,
                              data.pageContent
                            )
                          }
                        >
                          <img src={editPage} alt="" aria-hidden="true" />
                        </button>
                      </OverlayTrigger>
                    )}
                    <OverlayTrigger
                      placement="top"
                      trigger={["hover"]}
                      overlay={<Tooltip>Delete</Tooltip>}
                    >
                      <button
                        className="icon-btn icon-btn--danger"
                        aria-label="Delete page"
                        onClick={() => requestDelete(data)}
                      >
                        <img src={deleteThisPage} alt="" aria-hidden="true" />
                      </button>
                    </OverlayTrigger>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}

      <ConfirmDialog
        show={pendingDelete !== null}
        title="Delete this entry?"
        message={
          <p>
            <strong>{pendingDelete?.pageTitle || "This entry"}</strong> will be
            removed permanently. This cannot be undone.
          </p>
        }
        confirmLabel="Delete"
        destructive
        onConfirm={confirmDelete}
        onCancel={cancelDelete}
      />
    </section>
  );
}
