export interface Baseresponse<T> {
  statusCode: number;
  message: string;
  isPayable: boolean;
  data: T[];
  isSuccess: boolean;
  reason: string;
  totalCount?:number;
  page?:number;
  pageSize?:number;
}
