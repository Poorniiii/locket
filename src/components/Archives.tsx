import { useState } from "react";
import { Tooltip, OverlayTrigger } from "react-bootstrap";
import { updatePage, sortPages } from "../features/pageSlice";
import { useAppDispatch, useAppSelector } from "../hooks";
import ShowPage from "./ShowPage";
import CardDate from "./CardDate";
import type { DiaryPage } from "../types/page";
import removeArchive from "../images/removearchive.svg";
import sort from "../images/sort.svg";

export default function Archives() {
  const pagesList = useAppSelector((state) => state.pages.pageData);
  const [isShowPage, setShowPage] = useState(false);
  const [showTitle, setShowTitle] = useState("");
  const [showContent, setShowContent] = useState("");
  const [showId, setShowId] = useState(0);
  const dispatch = useAppDispatch();

  const showPage = (id: number, title: string, content: string) => {
    setShowPage(true);
    setShowTitle(title);
    setShowContent(content);
    setShowId(id);
  };

  const archivedPages = pagesList.filter((page) => page.isArchive);

  return (
    <section>
      <div className="panel-header">
        <h1 className="panel-title">Archives</h1>
        <div className="panel-actions">
          <OverlayTrigger
            placement="top"
            trigger={["hover"]}
            overlay={<Tooltip>Sort by created date</Tooltip>}
          >
            <button
              className="sbd-btn sbd-btn--secondary"
              onClick={() => dispatch(sortPages())}
            >
              <img src={sort} alt="" aria-hidden="true" />
              Sort
            </button>
          </OverlayTrigger>
        </div>
      </div>

      <ShowPage
        show={isShowPage}
        onHide={() => setShowPage(false)}
        showTitle={showTitle}
        showContent={showContent}
        showId={showId}
      />

      {archivedPages.length === 0 ? (
        <p className="empty-state">
          No archived pages. Use the archive icon on any page to send it here.
        </p>
      ) : (
        <div className="card-grid">
          {archivedPages.map((data: DiaryPage) => (
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
                  <span className="sbd-badge sbd-badge--archive">Archived</span>
                </div>
                <div className="note-card__actions">
                  <OverlayTrigger
                    placement="top"
                    trigger={["hover"]}
                    overlay={<Tooltip>Unarchive</Tooltip>}
                  >
                    <button
                      className="icon-btn"
                      aria-label="Unarchive page"
                      onClick={() =>
                        dispatch(
                          updatePage({
                            pageId: data.pageId,
                            isArchive: false
                          })
                        )
                      }
                    >
                      <img src={removeArchive} alt="" aria-hidden="true" />
                    </button>
                  </OverlayTrigger>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
