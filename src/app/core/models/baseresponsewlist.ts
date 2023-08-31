export interface Baseresponsewlist<T> {
  statusCode: number;
  message: string;
  isPayable: boolean;
  data: {
    list: T[];
    total?: number;
  };
  isSuccess: boolean;
  reason: string;
}
