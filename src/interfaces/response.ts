export interface IFailResponseBody {
    status: string;
    message: string;
    details?: any;
  }

export interface ISuccessResponseBody {
    status: string;
    data?: any;
    message?: string;
  }

export interface ISuccessOrFailResponseBody {
    success?: ISuccessResponseBody;
    error?: IFailResponseBody;
  }
