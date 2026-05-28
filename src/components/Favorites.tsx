import { useState } from "react";
import { Tooltip, OverlayTrigger } from "react-bootstrap";
import { updatePage, sortPages } from "../features/pageSlice";
import { useAppDispatch, useAppSelector } from "../hooks";
import ShowPage from "./ShowPage";
import CardDate from "./CardDate";
import type { DiaryPage } from "../types/page";
import removeFav from "../images/removefav.svg";
import sort from "../images/sort.svg";

export default function Favorites() {
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

  const favoritePages = pagesList.filter(
    (page) => !page.isArchive && page.isFavorite
  );

  return (
    <section>
      <div className="panel-header">
        <h1 className="panel-title">Favorites</h1>
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

      {favoritePages.length === 0 ? (
        <p className="empty-state">
          No favorites yet. Mark any page with the star icon to see it here.
        </p>
      ) : (
        <div className="card-grid">
          {favoritePages.map((data: DiaryPage) => (
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
                  <span className="sbd-badge sbd-badge--favorite">Favorite</span>
                </div>
                <div className="note-card__actions">
                  <OverlayTrigger
                    placement="top"
                    trigger={["hover"]}
                    overlay={<Tooltip>Remove from favorites</Tooltip>}
                  >
                    <button
                      className="icon-btn"
                      aria-label="Remove from favorites"
                      onClick={() =>
                        dispatch(
                          updatePage({
                            pageId: data.pageId,
                            isFavorite: false
                          })
                        )
                      }
                    >
                      <img src={removeFav} alt="" aria-hidden="true" />
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
