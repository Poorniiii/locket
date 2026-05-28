export interface DiaryPage {
  pageId: number;
  pageTitle: string;
  pageContent: string;
  pageDate: string;
  createdAt?: string;
  isArchive: boolean;
  isFavorite: boolean;
  isSubmitted: boolean;
}

export type PageFilter = "active" | "favorites" | "archives";
