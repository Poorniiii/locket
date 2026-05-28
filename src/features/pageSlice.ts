import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { DiaryPage } from "../types/page";

interface PagesState {
  pageData: DiaryPage[];
  sortAscending: boolean;
}

type UpdatePagePayload = Partial<DiaryPage> & { pageId: number };

const initialState: PagesState = {
  pageData: [],
  sortAscending: false
};

const timeOf = (page: DiaryPage): number =>
  page.createdAt ? new Date(page.createdAt).getTime() : 0;

const sortInPlace = (state: PagesState): void => {
  const dir = state.sortAscending ? 1 : -1;
  state.pageData.sort((a, b) => (timeOf(b) - timeOf(a)) * dir);
};

const pageSlice = createSlice({
  name: "pages",
  initialState,
  reducers: {
    hydratePages: (state, action: PayloadAction<DiaryPage[]>) => {
      state.pageData = action.payload;
      sortInPlace(state);
    },
    resetPages: (state) => {
      state.pageData = [];
      state.sortAscending = false;
    },
    addPage: (state, action: PayloadAction<DiaryPage>) => {
      state.pageData.push(action.payload);
      sortInPlace(state);
    },
    updatePage: (state, action: PayloadAction<UpdatePagePayload>) => {
      state.pageData.forEach((page) => {
        if (page.pageId === action.payload.pageId) {
          if (action.payload.pageTitle !== undefined)
            page.pageTitle = action.payload.pageTitle;
          if (action.payload.pageContent !== undefined)
            page.pageContent = action.payload.pageContent;
          if (action.payload.pageDate !== undefined)
            page.pageDate = action.payload.pageDate;
          if (action.payload.isArchive !== undefined)
            page.isArchive = action.payload.isArchive;
          if (action.payload.isFavorite !== undefined)
            page.isFavorite = action.payload.isFavorite;
          if (action.payload.isSubmitted !== undefined)
            page.isSubmitted = action.payload.isSubmitted;
        }
      });
    },
    deletePage: (state, action: PayloadAction<{ pageId: number }>) => {
      state.pageData = state.pageData.filter(
        (page) => page.pageId !== action.payload.pageId
      );
    },
    sortPages: (state) => {
      state.sortAscending = !state.sortAscending;
      sortInPlace(state);
    }
  }
});

export const {
  hydratePages,
  resetPages,
  addPage,
  updatePage,
  deletePage,
  sortPages
} = pageSlice.actions;

export default pageSlice.reducer;
