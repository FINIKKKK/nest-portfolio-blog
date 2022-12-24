export class SearchPostDto {
  title?: string;
  body?: string;
  category?: number;
  views?: 'DESC' | 'ASC';
  limit?: number;
  take?: number;
}
