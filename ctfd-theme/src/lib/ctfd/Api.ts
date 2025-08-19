/* eslint-disable */
/* tslint:disable */
// @ts-nocheck
/*
 * ---------------------------------------------------------------
 * ## THIS FILE WAS GENERATED VIA SWAGGER-TYPESCRIPT-API        ##
 * ##                                                           ##
 * ## AUTHOR: acacode                                           ##
 * ## SOURCE: https://github.com/acacode/swagger-typescript-api ##
 * ---------------------------------------------------------------
 */

/** CsrfTokenResponse **/
export interface CsrfTokenResponse {
  csrf_token: string;
}

export interface UserSolvesSuccessResponse {
  /**
 * Success
 * @default true
 */
  success?: boolean;
  /** Data */
  data: {
    id: number;
    challenge_id?: number;
    challenge: {
      id: number;
      name?: string;
      value?: number;
      category?: string;
    };
    type?: string;
    date?: string;
    team?: {
      id?: number;
      name?: string;
    };
    user?: {
      id?: number;
      name?: string;
    };
  }[];
  /** Meta */
  meta?: {
    count?: number;
  }
}

/** ChallengeAttemptSuccessResponse */
export interface ChallengeAttemptSuccessResponse {
  /**
   * Success
   * @default true
   */
  success?: boolean;
  /** Data */
  data: {
    /** Status */
    status: "correct" | "incorrect" | "already_solved" | "ratelimited" | "paused" | "authentication_required";
    /** Message */
    message?: string;
  };
}

export type TeamSolvesSuccessResponse = UserSolvesSuccessResponse;

/** ScoreboardListSuccessResponse */
export interface ScoreboardListSuccessResponse {
  /**
   * Success
   * @default true
   */
  success?: boolean;
  /** Data */
  data: {
    /** Position */
    pos: number;
    /** Account ID */
    account_id: number;
    /** Account URL */
    account_url?: string;
    /** Account Type */
    account_type?: string;
    /** OAuth ID */
    oauth_id?: number;
    /** Name */
    name?: string;
    /** Score */
    score: number;
    /** Bracket ID */
    bracket_id?: number;
    /** Bracket Name */
    bracket_name?: string;
    /** Members (for team mode) */
    members?: {
      /** ID */
      id: number;
      /** OAuth ID */
      oauth_id?: number;
      /** Name */
      name?: string;
      /** Score */
      score: number;
      /** Bracket ID */
      bracket_id?: number;
      /** Bracket Name */
      bracket_name?: string;
    }[];
  }[];
}

/** ScoreboardDetailSuccessResponse */
export interface ScoreboardDetailSuccessResponse {
  /**
   * Success
   * @default true
   */
  success?: boolean;
  /** Data */
  data: {
    /** Position */
    pos: number;
    /** Account ID */
    account_id: number;
    /** Account URL */
    account_url?: string;
    /** Account Type */
    account_type?: string;
    /** OAuth ID */
    oauth_id?: number;
    /** Name */
    name?: string;
    /** Score */
    score: number;
    /** Bracket ID */
    bracket_id?: number;
    /** Bracket Name */
    bracket_name?: string;
    /** Members (for team mode) */
    members?: {
      /** ID */
      id: number;
      /** OAuth ID */
      oauth_id?: number;
      /** Name */
      name?: string;
      /** Score */
      score: number;
      /** Bracket ID */
      bracket_id?: number;
      /** Bracket Name */
      bracket_name?: string;
    }[];
  }[];
}

export interface TeamMembersSuccessResponse {
  /**
   * Success
   * @default true
   */
  success?: boolean;
  /** Data */
  data: {
    id: number;
    name?: string;
    score?: number;
    team_id?: number;
    bracket_id?: number;
    website?: string;
    affiliation?: string;
    country?: string;
  }[];
}

/** ChallengeListSuccessResponse */
export interface ChallengeListSuccessResponse {
  /**
   * Success
   * @default true
   */
  success?: boolean;
  /** Data */
  data: {
    /** Id */
    id: number;
    /** Name */
    name?: string;
    /** Description */
    description?: string;
    /** Attribution */
    attribution?: string;
    /** Connection Info */
    connection_info?: string;
    /** Next Id */
    next_id?: number;
    /** Max Attempts */
    max_attempts?: number;
    /** Value */
    value?: number;
    /** Category */
    category?: string;
    /** Type */
    type?: string;
    /** State */
    state?: string;
    /** Requirements */
    requirements?: object;
    /** Solves */
    solves?: number;
    /** Solved By Me */
    solved_by_me?: boolean;
  }[];
}

/** APISimpleErrorResponse */
export interface APISimpleErrorResponse {
  /**
   * Success
   * @default false
   */
  success?: boolean;
  /** Errors */
  errors?: string[];
  redirect?: string;
}

/** ChallengeDetailedSuccessResponse */
export interface ChallengeDetailedSuccessResponse {
  /**
   * Success
   * @default true
   */
  success?: boolean;
  /** Challenges */
  data: {
    /** Id */
    id: number;
    /** Name */
    name?: string;
    /** Description */
    description?: string;
    /** Attribution */
    attribution?: string;
    /** Connection Info */
    connection_info?: string;
    /** Next Id */
    next_id?: number;
    /** Max Attempts */
    max_attempts?: number;
    /** Value */
    value?: number;
    /** Category */
    category?: string;
    /** Type */
    type?: string;
    /** State */
    state?: string;
    /** Requirements */
    requirements?: object;
    /** Solves */
    solves?: number;
    /** Solved By Me */
    solved_by_me?: boolean;
    hints?: [
      {
        id?: number;
        title?: string;
        cost?: number;
      }
    ];
    files?: string[];
  };
}

export interface ChallengeSolveSuccessResponse {
  /**
   * Success
   * @default true
   */
  success?: boolean;
  /** Data */
  data: {
    account_id?: number;
    name?: string;
    date?: string;
    account_url?: string;
  }[];
}

/** APISimpleSuccessResponse */
export interface APISimpleSuccessResponse {
  /**
   * Success
   * @default true
   */
  success?: boolean;
  message?: string;
  redirect?: string;
}

/** TagListSuccessResponse */
export interface TagListSuccessResponse {
  /**
   * Success
   * @default true
   */
  success?: boolean;
  /** Data */
  data: {
    /** Id */
    id: number;
    /** Challenge Id */
    challenge_id?: number;
    /** Value */
    value?: string;
  }[];
}

/** TagDetailedSuccessResponse */
export interface TagDetailedSuccessResponse {
  /**
   * Success
   * @default true
   */
  success?: boolean;
  /** Tags */
  data: {
    /** Id */
    id: number;
    /** Challenge Id */
    challenge_id?: number;
    /** Value */
    value?: string;
  };
}

/** TopicListSuccessResponse */
export interface TopicListSuccessResponse {
  /**
   * Success
   * @default true
   */
  success?: boolean;
  /** Data */
  data: {
    /** Id */
    id: number;
    /** Value */
    value?: string;
  }[];
}

/** TopicDetailedSuccessResponse */
export interface TopicDetailedSuccessResponse {
  /**
   * Success
   * @default true
   */
  success?: boolean;
  /** Topics */
  data: {
    /** Id */
    id: number;
    /** Value */
    value?: string;
  };
}

/** AwardListSuccessResponse */
export interface AwardListSuccessResponse {
  /**
   * Success
   * @default true
   */
  success?: boolean;
  /** Data */
  data: {
    /** Id */
    id: number;
    /** User Id */
    user_id?: number;
    /** Team Id */
    team_id?: number;
    /** Type */
    type?: string;
    /** Name */
    name?: string;
    /** Description */
    description?: string;
    /**
     * Date
     * @format date-time
     */
    date?: string;
    /** Value */
    value?: number;
    /** Category */
    category?: string;
    /** Icon */
    icon?: string;
    /** Requirements */
    requirements?: object;
  }[];
}

/** AwardDetailedSuccessResponse */
export interface AwardDetailedSuccessResponse {
  /**
   * Success
   * @default true
   */
  success?: boolean;
  /** Awards */
  data: {
    /** Id */
    id: number;
    /** User Id */
    user_id?: number;
    /** Team Id */
    team_id?: number;
    /** Type */
    type?: string;
    /** Name */
    name?: string;
    /** Description */
    description?: string;
    /**
     * Date
     * @format date-time
     */
    date?: string;
    /** Value */
    value?: number;
    /** Category */
    category?: string;
    /** Icon */
    icon?: string;
    /** Requirements */
    requirements?: object;
  };
}

/** HintListSuccessResponse */
export interface HintListSuccessResponse {
  /**
   * Success
   * @default true
   */
  success?: boolean;
  /** Data */
  data: {
    /** Id */
    id: number;
    /** Title */
    title?: string;
    /** Type */
    type?: string;
    /** Challenge Id */
    challenge_id?: number;
    /** Content */
    content?: string;
    /** Cost */
    cost?: number;
    /** Requirements */
    requirements?: object;
  }[];
}

/** HintDetailedSuccessResponse */
export interface HintDetailedSuccessResponse {
  /**
   * Success
   * @default true
   */
  success?: boolean;
  /** Hints */
  data: {
    /** Id */
    id: number;
    /** Title */
    title?: string;
    /** Type */
    type?: string;
    /** Challenge Id */
    challenge_id?: number;
    /** Content */
    content?: string;
    /** Cost */
    cost?: number;
    /** Requirements */
    requirements?: object;
  };
}

/** FlagListSuccessResponse */
export interface FlagListSuccessResponse {
  /**
   * Success
   * @default true
   */
  success?: boolean;
  /** Data */
  data: {
    /** Id */
    id: number;
    /** Challenge Id */
    challenge_id?: number;
    /** Type */
    type?: string;
    /** Content */
    content?: string;
    /** Data */
    data?: string;
  }[];
}

/** FlagDetailedSuccessResponse */
export interface FlagDetailedSuccessResponse {
  /**
   * Success
   * @default true
   */
  success?: boolean;
  /** Flags */
  data: {
    /** Id */
    id: number;
    /** Challenge Id */
    challenge_id?: number;
    /** Type */
    type?: string;
    /** Content */
    content?: string;
    /** Data */
    data?: string;
  };
}

/** SubmissionListSuccessResponse */
export interface SubmissionListSuccessResponse {
  /**
   * Success
   * @default true
   */
  success?: boolean;
  /** Data */
  data: {
    /** Id */
    id: number;
    /** Challenge Id */
    challenge_id?: number;
    /** User Id */
    user_id?: number;
    /** Team Id */
    team_id?: number;
    /** Ip */
    ip?: string;
    /** Provided */
    provided?: string;
    /** Type */
    type?: string;
    /**
     * Date
     * @format date-time
     */
    date?: string;
  }[];
  /** Meta */
  meta: {
    /** Pagination */
    pagination: {
      /** Page */
      page: number;
      /** Next */
      next: number;
      /** Prev */
      prev: number;
      /** Pages */
      pages: number;
      /** Per Page */
      per_page: number;
      /** Total */
      total: number;
    };
  };
}

/** SubmissionDetailedSuccessResponse */
export interface SubmissionDetailedSuccessResponse {
  /**
   * Success
   * @default true
   */
  success?: boolean;
  /** Submissions */
  data: {
    /** Id */
    id: number;
    /** Challenge Id */
    challenge_id?: number;
    /** User Id */
    user_id?: number;
    /** Team Id */
    team_id?: number;
    /** Ip */
    ip?: string;
    /** Provided */
    provided?: string;
    /** Type */
    type?: string;
    /**
     * Date
     * @format date-time
     */
    date?: string;
  };
}

/** TeamListSuccessResponse */
export interface TeamListSuccessResponse {
  /**
   * Success
   * @default true
   */
  success?: boolean;
  /** Data */
  data: {
    /** Id */
    id: number;
    /** Oauth Id */
    oauth_id?: number;
    /** Name */
    name?: string;
    /** Email */
    email?: string;
    /** Password */
    password?: string;
    /** Secret */
    secret?: string;
    /** Website */
    website?: string;
    /** Affiliation */
    affiliation?: string;
    /** Country */
    country?: string;
    /** Bracket Id */
    bracket_id?: number;
    /** Hidden */
    hidden?: boolean;
    /** Banned */
    banned?: boolean;
    /** Captain Id */
    captain_id?: number;
    /**
     * Created
     * @format date-time
     */
    created?: string;
  }[];
  /** Meta */
  meta: {
    /** Pagination */
    pagination: {
      /** Page */
      page: number;
      /** Next */
      next: number;
      /** Prev */
      prev: number;
      /** Pages */
      pages: number;
      /** Per Page */
      per_page: number;
      /** Total */
      total: number;
    };
  };
}

/** TeamDetailedSuccessResponse */
export interface TeamDetailedSuccessResponse {
  /**
   * Success
   * @default true
   */
  success?: boolean;
  /** Teams */
  data: {
    /** Id */
    id: number;
    /** Oauth Id */
    oauth_id?: number;
    /** Name */
    name?: string;
    /** Email */
    email?: string;
    /** Password */
    password?: string;
    /** Secret */
    secret?: string;
    /** Website */
    website?: string;
    /** Affiliation */
    affiliation?: string;
    /** Country */
    country?: string;
    /** Bracket Id */
    bracket_id?: number;
    /** Hidden */
    hidden?: boolean;
    /** Banned */
    banned?: boolean;
    /** Captain Id */
    captain_id?: number;
    /**
     * Created
     * @format date-time
     */
    created?: string;
    place?: string;
    score?: number;
  };
  errors?: string[];
}

/** UserListSuccessResponse */
export interface UserListSuccessResponse {
  /**
   * Success
   * @default true
   */
  success?: boolean;
  /** Data */
  data: {
    /** Id */
    id: number;
    /** Oauth Id */
    oauth_id?: number;
    /** Name */
    name?: string;
    /** Password */
    password?: string;
    /** Email */
    email?: string;
    /** Type */
    type?: string;
    /** Secret */
    secret?: string;
    /** Website */
    website?: string;
    /** Affiliation */
    affiliation?: string;
    /** Country */
    country?: string;
    /** Bracket Id */
    bracket_id?: number;
    /** Hidden */
    hidden?: boolean;
    /** Banned */
    banned?: boolean;
    /** Verified */
    verified?: boolean;
    /** Language */
    language?: string;
    /** Team Id */
    team_id?: number;
    /**
     * Created
     * @format date-time
     */
    created?: string;
  }[];
  /** Meta */
  meta: {
    /** Pagination */
    pagination: {
      /** Page */
      page: number;
      /** Next */
      next: number;
      /** Prev */
      prev: number;
      /** Pages */
      pages: number;
      /** Per Page */
      per_page: number;
      /** Total */
      total: number;
    };
  };
}

/** UserDetailedSuccessResponse */
export interface UserDetailedSuccessResponse {
  /**
   * Success
   * @default true
   */
  success?: boolean;
  /** Users */
  data: {
    /** Id */
    id: number;
    /** Oauth Id */
    oauth_id?: number;
    /** Name */
    name?: string;
    /** Password */
    password?: string;
    /** Email */
    email?: string;
    /** Type */
    type?: string;
    /** Secret */
    secret?: string;
    /** Website */
    website?: string;
    /** Affiliation */
    affiliation?: string;
    /** Country */
    country?: string;
    /** Bracket Id */
    bracket_id?: number;
    /** Hidden */
    hidden?: boolean;
    /** Banned */
    banned?: boolean;
    /** Verified */
    verified?: boolean;
    /** Language */
    language?: string;
    /** Team Id */
    team_id?: number;
    /**
     * Created
     * @format date-time
     */
    created?: string;
  };
}

/** FileListSuccessResponse */
export interface FileListSuccessResponse {
  /**
   * Success
   * @default true
   */
  success?: boolean;
  /** Data */
  data: {
    /** Id */
    id: number;
    /** Type */
    type?: string;
    /** Location */
    location?: string;
    /** Sha1Sum */
    sha1sum?: string;
  }[];
}

/** FileDetailedSuccessResponse */
export interface FileDetailedSuccessResponse {
  /**
   * Success
   * @default true
   */
  success?: boolean;
  /** Files */
  data: {
    /** Id */
    id: number;
    /** Type */
    type?: string;
    /** Location */
    location?: string;
    /** Sha1Sum */
    sha1sum?: string;
  };
}

/** NotificationListSuccessResponse */
export interface NotificationListSuccessResponse {
  /**
   * Success
   * @default true
   */
  success?: boolean;
  /** Data */
  data: {
    /** Id */
    id: number;
    /** Title */
    title?: string;
    /** Content */
    content?: string;
    /**
     * Date
     * @format date-time
     */
    date?: string;
    /** User Id */
    user_id?: number;
    /** Team Id */
    team_id?: number;
  }[];
}

/** NotificationDetailedSuccessResponse */
export interface NotificationDetailedSuccessResponse {
  /**
   * Success
   * @default true
   */
  success?: boolean;
  /** Notifications */
  data: {
    /** Id */
    id: number;
    /** Title */
    title?: string;
    /** Content */
    content?: string;
    /**
     * Date
     * @format date-time
     */
    date?: string;
    /** User Id */
    user_id?: number;
    /** Team Id */
    team_id?: number;
  };
}

/** ConfigListSuccessResponse */
export interface ConfigListSuccessResponse {
  /**
   * Success
   * @default true
   */
  success?: boolean;
  /** Data */
  data: {
    /** Id */
    id: number;
    /** Key */
    key?: string;
    /** Value */
    value?: string;
  }[];
}

/** ConfigDetailedSuccessResponse */
export interface ConfigDetailedSuccessResponse {
  /**
   * Success
   * @default true
   */
  success?: boolean;
  /** Configs */
  data: {
    /** Id */
    id: number;
    /** Key */
    key?: string;
    /** Value */
    value?: string;
  };
}

/** PageListSuccessResponse */
export interface PageListSuccessResponse {
  /**
   * Success
   * @default true
   */
  success?: boolean;
  /** Data */
  data: {
    /** Id */
    id: number;
    /** Title */
    title?: string;
    /** Route */
    route?: string;
    /** Content */
    content?: string;
    /** Draft */
    draft?: boolean;
    /** Hidden */
    hidden?: boolean;
    /** Auth Required */
    auth_required?: boolean;
    /** Format */
    format?: string;
    /** Link Target */
    link_target?: string;
  }[];
}

/** PageDetailedSuccessResponse */
export interface PageDetailedSuccessResponse {
  /**
   * Success
   * @default true
   */
  success?: boolean;
  /** Pages */
  data: {
    /** Id */
    id: number;
    /** Title */
    title?: string;
    /** Route */
    route?: string;
    /** Content */
    content?: string;
    /** Draft */
    draft?: boolean;
    /** Hidden */
    hidden?: boolean;
    /** Auth Required */
    auth_required?: boolean;
    /** Format */
    format?: string;
    /** Link Target */
    link_target?: string;
  };
}

/** UnlockListSuccessResponse */
export interface UnlockListSuccessResponse {
  /**
   * Success
   * @default true
   */
  success?: boolean;
  /** Data */
  data: {
    /** Id */
    id: number;
    /** User Id */
    user_id?: number;
    /** Team Id */
    team_id?: number;
    /** Target */
    target?: number;
    /**
     * Date
     * @format date-time
     */
    date?: string;
    /** Type */
    type?: string;
  }[];
}

/** UnlockDetailedSuccessResponse */
export interface UnlockDetailedSuccessResponse {
  /**
   * Success
   * @default true
   */
  success?: boolean;
  /** Unlocks */
  data: {
    /** Id */
    id: number;
    /** User Id */
    user_id?: number;
    /** Team Id */
    team_id?: number;
    /** Target */
    target?: number;
    /**
     * Date
     * @format date-time
     */
    date?: string;
    /** Type */
    type?: string;
  };
}

/** TokenListSuccessResponse */
export interface TokenListSuccessResponse {
  /**
   * Success
   * @default true
   */
  success?: boolean;
  /** Data */
  data: {
    /** Id */
    id: number;
    /** Type */
    type?: string;
    /** User Id */
    user_id?: number;
    /**
     * Created
     * @format date-time
     */
    created?: string;
    /**
     * Expiration
     * @format date-time
     */
    expiration?: string;
    /** Description */
    description?: string;
    /** Value */
    value?: string;
  }[];
}

/** TokenDetailedSuccessResponse */
export interface TokenDetailedSuccessResponse {
  /**
   * Success
   * @default true
   */
  success?: boolean;
  /** Tokens */
  data: {
    /** Id */
    id: number;
    /** Type */
    type?: string;
    /** User Id */
    user_id?: number;
    /**
     * Created
     * @format date-time
     */
    created?: string;
    /**
     * Expiration
     * @format date-time
     */
    expiration?: string;
    /** Description */
    description?: string;
    /** Value */
    value?: string;
  };
}

/** ValuelessTokenDetailedSuccessResponse */
export interface ValuelessTokenDetailedSuccessResponse {
  /**
   * Success
   * @default true
   */
  success?: boolean;
  /** Tokens */
  data: {
    /** Id */
    id: number;
    /** Type */
    type?: string;
    /** User Id */
    user_id?: number;
    /**
     * Created
     * @format date-time
     */
    created?: string;
    /**
     * Expiration
     * @format date-time
     */
    expiration?: string;
    /** Description */
    description?: string;
  };
}

/** CommentListSuccessResponse */
export interface CommentListSuccessResponse {
  /**
   * Success
   * @default true
   */
  success?: boolean;
  /** Data */
  data: {
    /** Id */
    id: number;
    /** Type */
    type?: string;
    /** Content */
    content?: string;
    /**
     * Date
     * @format date-time
     */
    date?: string;
    /** Author Id */
    author_id?: number;
  }[];
}

/** CommentDetailedSuccessResponse */
export interface CommentDetailedSuccessResponse {
  /**
   * Success
   * @default true
   */
  success?: boolean;
  /** Comments */
  data: {
    /** Id */
    id: number;
    /** Type */
    type?: string;
    /** Content */
    content?: string;
    /**
     * Date
     * @format date-time
     */
    date?: string;
    /** Author Id */
    author_id?: number;
  };
}

export type QueryParamsType = Record<string | number, any>;
export type ResponseFormat = keyof Omit<Body, "body" | "bodyUsed">;

export interface FullRequestParams extends Omit<RequestInit, "body"> {
  /** set parameter to `true` for call `securityWorker` for this request */
  secure?: boolean;
  /** request path */
  path: string;
  /** content type of request body */
  type?: ContentType;
  /** query params */
  query?: QueryParamsType;
  /** format of response (i.e. response.json() -> format: "json") */
  format?: ResponseFormat;
  /** request body */
  body?: unknown;
  /** base url */
  baseUrl?: string;
  /** request cancellation token */
  cancelToken?: CancelToken;
}

export type RequestParams = Omit<
  FullRequestParams,
  "body" | "method" | "query" | "path"
>;

export interface ApiConfig<SecurityDataType = unknown> {
  baseUrl?: string;
  baseApiParams?: Omit<RequestParams, "baseUrl" | "cancelToken" | "signal">;
  securityWorker?: (
    securityData: SecurityDataType | null,
  ) => Promise<RequestParams | void> | RequestParams | void;
  customFetch?: typeof fetch;
}

export interface HttpResponse<D extends unknown, E extends unknown = unknown>
  extends Response {
  data: D;
  error: E;
}

type CancelToken = Symbol | string | number;

export enum ContentType {
  Json = "application/json",
  FormData = "multipart/form-data",
  UrlEncoded = "application/x-www-form-urlencoded",
  Text = "text/plain",
}

export class HttpClient<SecurityDataType = unknown> {
  public baseUrl: string = "/api/v1";
  private securityData: SecurityDataType | null = null;
  private securityWorker?: ApiConfig<SecurityDataType>["securityWorker"];
  private abortControllers = new Map<CancelToken, AbortController>();
  private customFetch = (...fetchParams: Parameters<typeof fetch>) =>
    fetch(...fetchParams);

  private baseApiParams: RequestParams = {
    credentials: "same-origin",
    headers: {},
    redirect: "follow",
    referrerPolicy: "no-referrer",
  };

  constructor(apiConfig: ApiConfig<SecurityDataType> = {}) {
    Object.assign(this, apiConfig);
  }

  public setSecurityData = (data: SecurityDataType | null) => {
    this.securityData = data;
  };

  protected encodeQueryParam(key: string, value: any) {
    const encodedKey = encodeURIComponent(key);
    return `${encodedKey}=${encodeURIComponent(typeof value === "number" ? value : `${value}`)}`;
  }

  protected addQueryParam(query: QueryParamsType, key: string) {
    return this.encodeQueryParam(key, query[key]);
  }

  protected addArrayQueryParam(query: QueryParamsType, key: string) {
    const value = query[key];
    return value.map((v: any) => this.encodeQueryParam(key, v)).join("&");
  }

  protected toQueryString(rawQuery?: QueryParamsType): string {
    const query = rawQuery || {};
    const keys = Object.keys(query).filter(
      (key) => "undefined" !== typeof query[key],
    );
    return keys
      .map((key) =>
        Array.isArray(query[key])
          ? this.addArrayQueryParam(query, key)
          : this.addQueryParam(query, key),
      )
      .join("&");
  }

  protected addQueryParams(rawQuery?: QueryParamsType): string {
    const queryString = this.toQueryString(rawQuery);
    return queryString ? `?${queryString}` : "";
  }

  private contentFormatters: Record<ContentType, (input: any) => any> = {
    [ContentType.Json]: (input: any) =>
      input !== null && (typeof input === "object" || typeof input === "string")
        ? JSON.stringify(input)
        : input,
    [ContentType.Text]: (input: any) =>
      input !== null && typeof input !== "string"
        ? JSON.stringify(input)
        : input,
    [ContentType.FormData]: (input: any) =>
      Object.keys(input || {}).reduce((formData, key) => {
        const property = input[key];
        formData.append(
          key,
          property instanceof Blob
            ? property
            : typeof property === "object" && property !== null
              ? JSON.stringify(property)
              : `${property}`,
        );
        return formData;
      }, new FormData()),
    [ContentType.UrlEncoded]: (input: any) => this.toQueryString(input),
  };

  protected mergeRequestParams(
    params1: RequestParams,
    params2?: RequestParams,
  ): RequestParams {
    return {
      ...this.baseApiParams,
      ...params1,
      ...(params2 || {}),
      headers: {
        ...(this.baseApiParams.headers || {}),
        ...(params1.headers || {}),
        ...((params2 && params2.headers) || {}),
      },
    };
  }

  protected createAbortSignal = (
    cancelToken: CancelToken,
  ): AbortSignal | undefined => {
    if (this.abortControllers.has(cancelToken)) {
      const abortController = this.abortControllers.get(cancelToken);
      if (abortController) {
        return abortController.signal;
      }
      return void 0;
    }

    const abortController = new AbortController();
    this.abortControllers.set(cancelToken, abortController);
    return abortController.signal;
  };

  public abortRequest = (cancelToken: CancelToken) => {
    const abortController = this.abortControllers.get(cancelToken);

    if (abortController) {
      abortController.abort();
      this.abortControllers.delete(cancelToken);
    }
  };

  public request = async <T = any, E = any>({
    body,
    secure,
    path,
    type = ContentType.Json,
    query,
    format = "json",
    baseUrl,
    cancelToken,
    ...params
  }: FullRequestParams): Promise<HttpResponse<T, E>> => {
    const secureParams =
      ((typeof secure === "boolean" ? secure : this.baseApiParams.secure) &&
        this.securityWorker &&
        (await this.securityWorker(this.securityData))) ||
      {};
    const requestParams = this.mergeRequestParams(params, secureParams);
    const queryString = query && this.toQueryString(query);
    const payloadFormatter = this.contentFormatters[type || ContentType.Json];
    const responseFormat = format || requestParams.format;

    return this.customFetch(
      `${baseUrl || this.baseUrl || ""}${path}${queryString ? `?${queryString}` : ""}`,
      {
        ...requestParams,
        credentials: "include",
        headers: {
          ...(requestParams.headers || {}),
          ...(type && type !== ContentType.FormData
            ? { "Content-Type": type }
            : {}),
        },
        signal:
          (cancelToken
            ? this.createAbortSignal(cancelToken)
            : requestParams.signal) || null,
        body:
          typeof body === "undefined" || body === null
            ? null
            : payloadFormatter(body),
      },
    ).then(async (response) => {
      const r = response.clone() as HttpResponse<T, E>;
      r.data = null as unknown as T;
      r.error = null as unknown as E;

      const data = !responseFormat
        ? r
        : await response[responseFormat]()
          .then((data) => {
            if (r.ok) {
              r.data = data;
            } else {
              r.error = data;
            }
            return r;
          })
          .catch((e) => {
            r.error = e;
            return r;
          });

      if (cancelToken) {
        this.abortControllers.delete(cancelToken);
      }

      if (!response.ok) throw data;
      return data;
    });
  };
}

/**
 * @title API
 * @version v1
 * @baseUrl /api/v1
 */
export class Api<
  SecurityDataType extends unknown,
> extends HttpClient<SecurityDataType> {
  auth = {
    /**
     * @description Endpoint to get a CSRF token
     *
     * @tags auth
     * @name GetCsrfToken
     * @request GET:/csrf_token
     * @secure
     */
    getCsrfToken: (params: RequestParams = {}) =>
      this.request<CsrfTokenResponse, APISimpleErrorResponse>({
        path: `/csrf_token`,
        method: "GET",
        secure: true,
        format: "json",
        ...params,
      }),
    /**
     * @description Endpoint to confirm a user's email address
     * @tags auth
     * @name GetConfirm
     * @request GET:/confirm/{token}
     * @secure
     */
    getConfirm: (token: string, params: RequestParams = {}) =>
      this.request<APISimpleSuccessResponse, APISimpleErrorResponse>({
        path: `/confirm/${token}`,
        method: "GET",
        secure: true,
        format: "json",
        ...params,
      }),
    /**
     * @description Endpoint to request a confirmation email
     * @tags auth
     * @name PostConfirm
     * @request POST:/confirm
     * @secure
     */
    postConfirm: (params: RequestParams = {}) =>
      this.request<APISimpleSuccessResponse, APISimpleErrorResponse>({
        path: `/confirm`,
        method: "POST",
        secure: true,
        format: "json",
        type: ContentType.Json,
        ...params,
      }),
    /**
     * @description Endpoint to login a user
     * @tags auth
     * @name PostLogin
     * @request POST:/login
     * @secure
     */
    postLogin: (
      body?: {
        name?: string;
        password?: string;
      },
      params: RequestParams = {},
    ) =>
      this.request<APISimpleSuccessResponse, APISimpleErrorResponse>({
        path: `/login`,
        method: "POST",
        body: body,
        secure: true,
        format: "json",
        type: ContentType.Json,
        ...params,
      }),
    /**
     * @description Endpoint to logout a user
     * @tags auth
     * @name GetLogout
     * @request GET:/logout
     * @secure
     */
    getLogout: (params: RequestParams = {}) =>
      this.request<APISimpleSuccessResponse, APISimpleErrorResponse>({
        path: `/logout`,
        method: "GET",
        secure: true,
        format: "json",
        ...params,
      }
      ),
    /**
     * @description Endpoint to register a user
     * @tags auth
     * @name PostRegister
     * @request POST:/register
     * @secure
     */
    postRegister: (
      body?: {
        name?: string;
        email?: string;
        password?: string;
        website?: string;
        affiliation?: string;
        country?: string;
        registration_code?: string;
        bracket_id?: number;
      },
      params: RequestParams = {},
    ) =>
      this.request<APISimpleSuccessResponse, APISimpleErrorResponse>({
        path: `/register`,
        method: "POST",
        body: body,
        secure: true,
        format: "json",
        type: ContentType.Json,
        ...params,
      }),
    // TODO: reset password and verify email endpoints
  };
  awards = {
    /**
     * @description Endpoint to list Award objects in bulk
     *
     * @tags awards
     * @name GetAwardList
     * @request GET:/awards
     * @secure
     */
    getAwardList: (
      query?: {
        user_id?: number;
        team_id?: number;
        type?: string;
        value?: number;
        category?: number;
        icon?: number;
        q?: string;
        field?: "name" | "description" | "category" | "icon";
      },
      params: RequestParams = {},
    ) =>
      this.request<AwardListSuccessResponse, APISimpleErrorResponse>({
        path: `/awards`,
        method: "GET",
        query: query,
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * @description Endpoint to create an Award object
     *
     * @tags awards
     * @name PostAwardList
     * @request POST:/awards
     * @secure
     */
    postAwardList: (params: RequestParams = {}) =>
      this.request<AwardListSuccessResponse, APISimpleErrorResponse>({
        path: `/awards`,
        method: "POST",
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * @description Endpoint to get a specific Award object
     *
     * @tags awards
     * @name GetAward
     * @request GET:/awards/{award_id}
     * @secure
     */
    getAward: (awardId: string, params: RequestParams = {}) =>
      this.request<AwardDetailedSuccessResponse, APISimpleErrorResponse>({
        path: `/awards/${awardId}`,
        method: "GET",
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * @description Endpoint to delete an Award object
     *
     * @tags awards
     * @name DeleteAward
     * @request DELETE:/awards/{award_id}
     * @secure
     */
    deleteAward: (awardId: string, params: RequestParams = {}) =>
      this.request<APISimpleSuccessResponse, any>({
        path: `/awards/${awardId}`,
        method: "DELETE",
        secure: true,
        format: "json",
        ...params,
      }),
  };
  brackets = {
    /**
     * No description
     *
     * @tags brackets
     * @name GetBracketList
     * @request GET:/brackets
     * @secure
     */
    getBracketList: (
      query?: {
        name?: string;
        description?: string;
        type?: string;
        q?: string;
        field?: "name" | "description" | "type";
      },
      params: RequestParams = {},
    ) =>
      this.request<void, any>({
        path: `/brackets`,
        method: "GET",
        query: query,
        secure: true,
        ...params,
      }),

    /**
     * No description
     *
     * @tags brackets
     * @name PostBracketList
     * @request POST:/brackets
     * @secure
     */
    postBracketList: (params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/brackets`,
        method: "POST",
        secure: true,
        ...params,
      }),

    /**
     * No description
     *
     * @tags brackets
     * @name DeleteBracket
     * @request DELETE:/brackets/{bracket_id}
     * @secure
     */
    deleteBracket: (bracketId: number, params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/brackets/${bracketId}`,
        method: "DELETE",
        secure: true,
        ...params,
      }),

    /**
     * No description
     *
     * @tags brackets
     * @name PatchBracket
     * @request PATCH:/brackets/{bracket_id}
     * @secure
     */
    patchBracket: (bracketId: number, params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/brackets/${bracketId}`,
        method: "PATCH",
        secure: true,
        ...params,
      }),
  };
  challenges = {
    /**
     * @description Endpoint to get Challenge objects in bulk
     *
     * @tags challenges
     * @name GetChallengeList
     * @request GET:/challenges
     * @secure
     */
    getChallengeList: (
      query?: {
        name?: string;
        max_attempts?: number;
        value?: number;
        category?: string;
        type?: string;
        state?: string;
        q?: string;
        field?: "name" | "description" | "category" | "type" | "state";
      },
      params: RequestParams = {},
    ) =>
      this.request<ChallengeListSuccessResponse, APISimpleErrorResponse>({
        path: `/challenges`,
        method: "GET",
        query: query,
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * @description Endpoint to create a Challenge object
     *
     * @tags challenges
     * @name PostChallengeList
     * @request POST:/challenges
     * @secure
     */
    postChallengeList: (params: RequestParams = {}) =>
      this.request<ChallengeDetailedSuccessResponse, APISimpleErrorResponse>({
        path: `/challenges`,
        method: "POST",
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags challenges
     * @name PostChallengeAttempt
     * @request POST:/challenges/attempt
     * @secure
     */
    postChallengeAttempt: (
      body?: {
        challenge_id?: string,
        submission?: string,
      },
      params: RequestParams = {}) =>
      this.request<ChallengeAttemptSuccessResponse, APISimpleErrorResponse>({
        path: `/challenges/attempt`,
        method: "POST",
        secure: true,
        body: body,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * No description
     *
     * @tags challenges
     * @name GetChallengeTypes
     * @request GET:/challenges/types
     * @secure
     */
    getChallengeTypes: (params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/challenges/types`,
        method: "GET",
        secure: true,
        ...params,
      }),

    /**
     * @description Endpoint to get a specific Challenge object
     *
     * @tags challenges
     * @name GetChallenge
     * @request GET:/challenges/{challenge_id}
     * @secure
     */
    getChallenge: (challengeId: string, params: RequestParams = {}) =>
      this.request<ChallengeDetailedSuccessResponse, APISimpleErrorResponse>({
        path: `/challenges/${challengeId}`,
        method: "GET",
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * @description Endpoint to delete a specific Challenge object
     *
     * @tags challenges
     * @name DeleteChallenge
     * @request DELETE:/challenges/{challenge_id}
     * @secure
     */
    deleteChallenge: (challengeId: string, params: RequestParams = {}) =>
      this.request<APISimpleSuccessResponse, any>({
        path: `/challenges/${challengeId}`,
        method: "DELETE",
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * @description Endpoint to edit a specific Challenge object
     *
     * @tags challenges
     * @name PatchChallenge
     * @request PATCH:/challenges/{challenge_id}
     * @secure
     */
    patchChallenge: (challengeId: string, params: RequestParams = {}) =>
      this.request<ChallengeDetailedSuccessResponse, APISimpleErrorResponse>({
        path: `/challenges/${challengeId}`,
        method: "PATCH",
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags challenges
     * @name GetChallengeFiles
     * @request GET:/challenges/{challenge_id}/files
     * @secure
     */
    getChallengeFiles: (challengeId: string, params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/challenges/${challengeId}/files`,
        method: "GET",
        secure: true,
        ...params,
      }),

    /**
     * No description
     *
     * @tags challenges
     * @name GetChallengeFlags
     * @request GET:/challenges/{challenge_id}/flags
     * @secure
     */
    getChallengeFlags: (challengeId: string, params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/challenges/${challengeId}/flags`,
        method: "GET",
        secure: true,
        ...params,
      }),

    /**
     * No description
     *
     * @tags challenges
     * @name GetChallengeHints
     * @request GET:/challenges/{challenge_id}/hints
     * @secure
     */
    getChallengeHints: (challengeId: string, params: RequestParams = {}) =>
      this.request<HintListSuccessResponse, APISimpleErrorResponse>({
        path: `/challenges/${challengeId}/hints`,
        method: "GET",
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags challenges
     * @name GetChallengeRequirements
     * @request GET:/challenges/{challenge_id}/requirements
     * @secure
     */
    getChallengeRequirements: (
      challengeId: string,
      params: RequestParams = {},
    ) =>
      this.request<void, any>({
        path: `/challenges/${challengeId}/requirements`,
        method: "GET",
        secure: true,
        ...params,
      }),

    /**
     * No description
     *
     * @tags challenges
     * @name GetChallengeSolves
     * @request GET:/challenges/{challenge_id}/solves
     * @secure
     */
    getChallengeSolves: (challengeId: string, params: RequestParams = {}) =>
      this.request<ChallengeSolveSuccessResponse, any>({
        path: `/challenges/${challengeId}/solves`,
        method: "GET",
        secure: true,
        ...params,
      }),

    /**
     * No description
     *
     * @tags challenges
     * @name GetChallengeTags
     * @request GET:/challenges/{challenge_id}/tags
     * @secure
     */
    getChallengeTags: (challengeId: string, params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/challenges/${challengeId}/tags`,
        method: "GET",
        secure: true,
        ...params,
      }),

    /**
     * No description
     *
     * @tags challenges
     * @name GetChallengeTopics
     * @request GET:/challenges/{challenge_id}/topics
     * @secure
     */
    getChallengeTopics: (challengeId: string, params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/challenges/${challengeId}/topics`,
        method: "GET",
        secure: true,
        ...params,
      }),
  };
  comments = {
    /**
     * @description Endpoint to list Comment objects in bulk
     *
     * @tags comments
     * @name GetCommentList
     * @request GET:/comments
     * @secure
     */
    getCommentList: (
      query?: {
        challenge_id?: number;
        user_id?: number;
        team_id?: number;
        page_id?: number;
        q?: string;
        field?: "content";
      },
      params: RequestParams = {},
    ) =>
      this.request<CommentListSuccessResponse, APISimpleErrorResponse>({
        path: `/comments`,
        method: "GET",
        query: query,
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * @description Endpoint to create a Comment object
     *
     * @tags comments
     * @name PostCommentList
     * @request POST:/comments
     * @secure
     */
    postCommentList: (params: RequestParams = {}) =>
      this.request<CommentDetailedSuccessResponse, APISimpleErrorResponse>({
        path: `/comments`,
        method: "POST",
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * @description Endpoint to delete a specific Comment object
     *
     * @tags comments
     * @name DeleteComment
     * @request DELETE:/comments/{comment_id}
     * @secure
     */
    deleteComment: (commentId: string, params: RequestParams = {}) =>
      this.request<APISimpleSuccessResponse, any>({
        path: `/comments/${commentId}`,
        method: "DELETE",
        secure: true,
        format: "json",
        ...params,
      }),
  };
  configs = {
    /**
     * @description Endpoint to get Config objects in bulk
     *
     * @tags configs
     * @name GetConfigList
     * @request GET:/configs
     * @secure
     */
    getConfigList: (
      query?: {
        key?: string;
        value?: string;
        q?: string;
        field?: "key" | "value";
      },
      params: RequestParams = {},
    ) =>
      this.request<ConfigListSuccessResponse, APISimpleErrorResponse>({
        path: `/configs`,
        method: "GET",
        query: query,
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * @description Endpoint to get create a Config object
     *
     * @tags configs
     * @name PostConfigList
     * @request POST:/configs
     * @secure
     */
    postConfigList: (params: RequestParams = {}) =>
      this.request<ConfigDetailedSuccessResponse, APISimpleErrorResponse>({
        path: `/configs`,
        method: "POST",
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * @description Endpoint to get patch Config objects in bulk
     *
     * @tags configs
     * @name PatchConfigList
     * @request PATCH:/configs
     * @secure
     */
    patchConfigList: (params: RequestParams = {}) =>
      this.request<APISimpleSuccessResponse, any>({
        path: `/configs`,
        method: "PATCH",
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags configs
     * @name GetFieldList
     * @request GET:/configs/fields
     * @secure
     */
    getFieldList: (
      query?: {
        type?: string;
        q?: string;
        field?: "description";
      },
      params: RequestParams = {},
    ) =>
      this.request<void, any>({
        path: `/configs/fields`,
        method: "GET",
        query: query,
        secure: true,
        ...params,
      }),

    /**
     * No description
     *
     * @tags configs
     * @name PostFieldList
     * @request POST:/configs/fields
     * @secure
     */
    postFieldList: (params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/configs/fields`,
        method: "POST",
        secure: true,
        ...params,
      }),

    /**
     * No description
     *
     * @tags configs
     * @name GetField
     * @request GET:/configs/fields/{field_id}
     * @secure
     */
    getField: (fieldId: string, params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/configs/fields/${fieldId}`,
        method: "GET",
        secure: true,
        ...params,
      }),

    /**
     * No description
     *
     * @tags configs
     * @name DeleteField
     * @request DELETE:/configs/fields/{field_id}
     * @secure
     */
    deleteField: (fieldId: string, params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/configs/fields/${fieldId}`,
        method: "DELETE",
        secure: true,
        ...params,
      }),

    /**
     * No description
     *
     * @tags configs
     * @name PatchField
     * @request PATCH:/configs/fields/{field_id}
     * @secure
     */
    patchField: (fieldId: string, params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/configs/fields/${fieldId}`,
        method: "PATCH",
        secure: true,
        ...params,
      }),

    /**
     * @description Endpoint to get a specific Config object
     *
     * @tags configs
     * @name GetConfig
     * @request GET:/configs/{config_key}
     * @secure
     */
    getConfig: (configKey: string, params: RequestParams = {}) =>
      this.request<ConfigDetailedSuccessResponse, APISimpleErrorResponse>({
        path: `/configs/${configKey}`,
        method: "GET",
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * @description Endpoint to delete a Config object
     *
     * @tags configs
     * @name DeleteConfig
     * @request DELETE:/configs/{config_key}
     * @secure
     */
    deleteConfig: (configKey: string, params: RequestParams = {}) =>
      this.request<APISimpleSuccessResponse, any>({
        path: `/configs/${configKey}`,
        method: "DELETE",
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * @description Endpoint to edit a specific Config object
     *
     * @tags configs
     * @name PatchConfig
     * @request PATCH:/configs/{config_key}
     * @secure
     */
    patchConfig: (configKey: string, params: RequestParams = {}) =>
      this.request<ConfigDetailedSuccessResponse, APISimpleErrorResponse>({
        path: `/configs/${configKey}`,
        method: "PATCH",
        secure: true,
        format: "json",
        ...params,
      }),
  };
  exports = {
    /**
     * No description
     *
     * @tags exports
     * @name PostExportList
     * @request POST:/exports/raw
     * @secure
     */
    postExportList: (params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/exports/raw`,
        method: "POST",
        secure: true,
        ...params,
      }),
  };
  files = {
    /**
     * @description Endpoint to get file objects in bulk
     *
     * @tags files
     * @name GetFilesList
     * @request GET:/files
     * @secure
     */
    getFilesList: (
      query?: {
        type?: string;
        location?: string;
        q?: string;
        field?: "type" | "location";
      },
      params: RequestParams = {},
    ) =>
      this.request<FileListSuccessResponse, APISimpleErrorResponse>({
        path: `/files`,
        method: "GET",
        query: query,
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * @description Endpoint to get file objects in bulk
     *
     * @tags files
     * @name PostFilesList
     * @request POST:/files
     * @secure
     */
    postFilesList: (
      data: {
        challenge_id?: number;
        challenge?: number;
        page_id?: number;
        page?: number;
        type?: string;
        location?: string;
        /**
         * The file to upload
         * @format binary
         */
        file: File;
      },
      params: RequestParams = {},
    ) =>
      this.request<FileDetailedSuccessResponse, APISimpleErrorResponse>({
        path: `/files`,
        method: "POST",
        body: data,
        secure: true,
        type: ContentType.FormData,
        format: "json",
        ...params,
      }),

    /**
     * @description Endpoint to get a specific file object
     *
     * @tags files
     * @name GetFilesDetail
     * @request GET:/files/{file_id}
     * @secure
     */
    getFilesDetail: (fileId: string, params: RequestParams = {}) =>
      this.request<FileDetailedSuccessResponse, APISimpleErrorResponse>({
        path: `/files/${fileId}`,
        method: "GET",
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * @description Endpoint to delete a file object
     *
     * @tags files
     * @name DeleteFilesDetail
     * @request DELETE:/files/{file_id}
     * @secure
     */
    deleteFilesDetail: (fileId: string, params: RequestParams = {}) =>
      this.request<APISimpleSuccessResponse, any>({
        path: `/files/${fileId}`,
        method: "DELETE",
        secure: true,
        format: "json",
        ...params,
      }),
  };
  flags = {
    /**
     * @description Endpoint to list Flag objects in bulk
     *
     * @tags flags
     * @name GetFlagList
     * @request GET:/flags
     * @secure
     */
    getFlagList: (
      query?: {
        challenge_id?: number;
        type?: string;
        content?: string;
        data?: string;
        q?: string;
        field?: "type" | "content" | "data";
      },
      params: RequestParams = {},
    ) =>
      this.request<FlagListSuccessResponse, APISimpleErrorResponse>({
        path: `/flags`,
        method: "GET",
        query: query,
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * @description Endpoint to create a Flag object
     *
     * @tags flags
     * @name PostFlagList
     * @request POST:/flags
     * @secure
     */
    postFlagList: (params: RequestParams = {}) =>
      this.request<FlagDetailedSuccessResponse, APISimpleErrorResponse>({
        path: `/flags`,
        method: "POST",
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags flags
     * @name GetFlagTypes
     * @request GET:/flags/types
     * @secure
     */
    getFlagTypes: (params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/flags/types`,
        method: "GET",
        secure: true,
        ...params,
      }),

    /**
     * No description
     *
     * @tags flags
     * @name GetFlagType
     * @request GET:/flags/types/{type_name}
     * @secure
     */
    getFlagType: (typeName: string, params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/flags/types/${typeName}`,
        method: "GET",
        secure: true,
        ...params,
      }),

    /**
     * @description Endpoint to get a specific Flag object
     *
     * @tags flags
     * @name GetFlag
     * @request GET:/flags/{flag_id}
     * @secure
     */
    getFlag: (flagId: string, params: RequestParams = {}) =>
      this.request<FlagDetailedSuccessResponse, APISimpleErrorResponse>({
        path: `/flags/${flagId}`,
        method: "GET",
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * @description Endpoint to delete a specific Flag object
     *
     * @tags flags
     * @name DeleteFlag
     * @request DELETE:/flags/{flag_id}
     * @secure
     */
    deleteFlag: (flagId: string, params: RequestParams = {}) =>
      this.request<APISimpleSuccessResponse, any>({
        path: `/flags/${flagId}`,
        method: "DELETE",
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * @description Endpoint to edit a specific Flag object
     *
     * @tags flags
     * @name PatchFlag
     * @request PATCH:/flags/{flag_id}
     * @secure
     */
    patchFlag: (flagId: string, params: RequestParams = {}) =>
      this.request<FlagDetailedSuccessResponse, APISimpleErrorResponse>({
        path: `/flags/${flagId}`,
        method: "PATCH",
        secure: true,
        format: "json",
        ...params,
      }),
  };
  hints = {
    /**
     * @description Endpoint to list Hint objects in bulk
     *
     * @tags hints
     * @name GetHintList
     * @request GET:/hints
     * @secure
     */
    getHintList: (
      query?: {
        type?: string;
        challenge_id?: number;
        content?: string;
        cost?: number;
        q?: string;
        field?: "type" | "content";
      },
      params: RequestParams = {},
    ) =>
      this.request<HintListSuccessResponse, APISimpleErrorResponse>({
        path: `/hints`,
        method: "GET",
        query: query,
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * @description Endpoint to create a Hint object
     *
     * @tags hints
     * @name PostHintList
     * @request POST:/hints
     * @secure
     */
    postHintList: (params: RequestParams = {}) =>
      this.request<HintDetailedSuccessResponse, APISimpleErrorResponse>({
        path: `/hints`,
        method: "POST",
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * @description Endpoint to get a specific Hint object
     *
     * @tags hints
     * @name GetHint
     * @request GET:/hints/{hint_id}
     * @secure
     */
    getHint: (hintId: string, params: RequestParams = {}) =>
      this.request<HintDetailedSuccessResponse, APISimpleErrorResponse>({
        path: `/hints/${hintId}`,
        method: "GET",
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * @description Endpoint to delete a specific Tag object
     *
     * @tags hints
     * @name DeleteHint
     * @request DELETE:/hints/{hint_id}
     * @secure
     */
    deleteHint: (hintId: string, params: RequestParams = {}) =>
      this.request<APISimpleSuccessResponse, any>({
        path: `/hints/${hintId}`,
        method: "DELETE",
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * @description Endpoint to edit a specific Hint object
     *
     * @tags hints
     * @name PatchHint
     * @request PATCH:/hints/{hint_id}
     * @secure
     */
    patchHint: (hintId: string, params: RequestParams = {}) =>
      this.request<HintDetailedSuccessResponse, APISimpleErrorResponse>({
        path: `/hints/${hintId}`,
        method: "PATCH",
        secure: true,
        format: "json",
        ...params,
      }),
  };
  notifications = {
    /**
     * @description Endpoint to get statistics for notification objects in bulk
     *
     * @tags notifications
     * @name HeadNotificantionList
     * @request HEAD:/notifications
     * @secure
     */
    headNotificantionList: (
      query?: {
        title?: string;
        content?: string;
        user_id?: number;
        team_id?: number;
        q?: string;
        field?: "title" | "content";
        since_id?: number;
      },
      params: RequestParams = {},
    ) =>
      this.request<APISimpleSuccessResponse, any>({
        path: `/notifications`,
        method: "HEAD",
        query: query,
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * @description Endpoint to get notification objects in bulk
     *
     * @tags notifications
     * @name GetNotificantionList
     * @request GET:/notifications
     * @secure
     */
    getNotificantionList: (
      query?: {
        title?: string;
        content?: string;
        user_id?: number;
        team_id?: number;
        q?: string;
        field?: "title" | "content";
        since_id?: number;
      },
      params: RequestParams = {},
    ) =>
      this.request<NotificationListSuccessResponse, APISimpleErrorResponse>({
        path: `/notifications`,
        method: "GET",
        query: query,
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * @description Endpoint to create a notification object
     *
     * @tags notifications
     * @name PostNotificantionList
     * @request POST:/notifications
     * @secure
     */
    postNotificantionList: (params: RequestParams = {}) =>
      this.request<NotificationDetailedSuccessResponse, APISimpleErrorResponse>(
        {
          path: `/notifications`,
          method: "POST",
          secure: true,
          format: "json",
          ...params,
        },
      ),

    /**
     * @description Endpoint to get a specific notification object
     *
     * @tags notifications
     * @name GetNotification
     * @request GET:/notifications/{notification_id}
     * @secure
     */
    getNotification: (notificationId: string, params: RequestParams = {}) =>
      this.request<NotificationDetailedSuccessResponse, APISimpleErrorResponse>(
        {
          path: `/notifications/${notificationId}`,
          method: "GET",
          secure: true,
          format: "json",
          ...params,
        },
      ),

    /**
     * @description Endpoint to delete a notification object
     *
     * @tags notifications
     * @name DeleteNotification
     * @request DELETE:/notifications/{notification_id}
     * @secure
     */
    deleteNotification: (notificationId: string, params: RequestParams = {}) =>
      this.request<APISimpleSuccessResponse, any>({
        path: `/notifications/${notificationId}`,
        method: "DELETE",
        secure: true,
        format: "json",
        ...params,
      }),
  };
  pages = {
    /**
     * @description Endpoint to get page objects in bulk
     *
     * @tags pages
     * @name GetPageList
     * @request GET:/pages
     * @secure
     */
    getPageList: (
      query?: {
        id?: number;
        title?: string;
        route?: string;
        draft?: boolean;
        hidden?: boolean;
        auth_required?: boolean;
        q?: string;
        field?: "title" | "route" | "content";
      },
      params: RequestParams = {},
    ) =>
      this.request<PageListSuccessResponse, APISimpleErrorResponse>({
        path: `/pages`,
        method: "GET",
        query: query,
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * @description Endpoint to create a page object
     *
     * @tags pages
     * @name PostPageList
     * @request POST:/pages
     * @secure
     */
    postPageList: (
      Pages: {
        title?: string;
        route?: string;
        content?: string;
        draft?: boolean;
        hidden?: boolean;
        auth_required?: boolean;
        format?: string;
        link_target?: string;
      },
      params: RequestParams = {},
    ) =>
      this.request<PageDetailedSuccessResponse, APISimpleErrorResponse>({
        path: `/pages`,
        method: "POST",
        body: Pages,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * @description Endpoint to read a page object
     *
     * @tags pages
     * @name GetPageDetail
     * @request GET:/pages/{page_id}
     * @secure
     */
    getPageDetail: (pageId: string, params: RequestParams = {}) =>
      this.request<PageDetailedSuccessResponse, APISimpleErrorResponse>({
        path: `/pages/${pageId}`,
        method: "GET",
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * @description Endpoint to delete a page object
     *
     * @tags pages
     * @name DeletePageDetail
     * @request DELETE:/pages/{page_id}
     * @secure
     */
    deletePageDetail: (pageId: string, params: RequestParams = {}) =>
      this.request<APISimpleSuccessResponse, APISimpleErrorResponse>({
        path: `/pages/${pageId}`,
        method: "DELETE",
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * @description Endpoint to edit a page object
     *
     * @tags pages
     * @name PatchPageDetail
     * @request PATCH:/pages/{page_id}
     * @secure
     */
    patchPageDetail: (pageId: string, params: RequestParams = {}) =>
      this.request<PageDetailedSuccessResponse, APISimpleErrorResponse>({
        path: `/pages/${pageId}`,
        method: "PATCH",
        secure: true,
        format: "json",
        ...params,
      }),
  };
  scoreboard = {
    /**
     * @description Endpoint to get scoreboard standings
     *
     * @tags scoreboard
     * @name GetScoreboardList
     * @request GET:/scoreboard
     * @secure
     */
    getScoreboardList: (params: RequestParams = {}) =>
      this.request<ScoreboardListSuccessResponse, APISimpleErrorResponse>({
        path: `/scoreboard`,
        method: "GET",
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * @description Endpoint to get top N teams/users from scoreboard
     *
     * @tags scoreboard
     * @name GetScoreboardDetail
     * @request GET:/scoreboard/top/{count}
     * @secure
     */
    getScoreboardDetail: (count: number, query?: { bracket_id?: string }, params: RequestParams = {}) =>
      this.request<ScoreboardDetailSuccessResponse, APISimpleErrorResponse>({
        path: `/scoreboard/top/${count}`,
        method: "GET",
        query: query,
        secure: true,
        format: "json",
        ...params,
      }),
  };
  shares = {
    /**
     * No description
     *
     * @tags shares
     * @name PostShare
     * @request POST:/shares
     * @secure
     */
    postShare: (params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/shares`,
        method: "POST",
        secure: true,
        ...params,
      }),
  };
  statistics = {
    /**
     * No description
     *
     * @tags statistics
     * @name GetChallengeSolveStatistics
     * @request GET:/statistics/challenges/solves
     * @secure
     */
    getChallengeSolveStatistics: (params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/statistics/challenges/solves`,
        method: "GET",
        secure: true,
        ...params,
      }),

    /**
     * No description
     *
     * @tags statistics
     * @name GetChallengeSolvePercentages
     * @request GET:/statistics/challenges/solves/percentages
     * @secure
     */
    getChallengeSolvePercentages: (params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/statistics/challenges/solves/percentages`,
        method: "GET",
        secure: true,
        ...params,
      }),

    /**
     * No description
     *
     * @tags statistics
     * @name GetChallengePropertyCounts
     * @request GET:/statistics/challenges/{column}
     * @secure
     */
    getChallengePropertyCounts: (column: string, params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/statistics/challenges/${column}`,
        method: "GET",
        secure: true,
        ...params,
      }),

    /**
     * No description
     *
     * @tags statistics
     * @name GetScoresDistribution
     * @request GET:/statistics/scores/distribution
     * @secure
     */
    getScoresDistribution: (params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/statistics/scores/distribution`,
        method: "GET",
        secure: true,
        ...params,
      }),

    /**
     * No description
     *
     * @tags statistics
     * @name GetSubmissionPropertyCounts
     * @request GET:/statistics/submissions/{column}
     * @secure
     */
    getSubmissionPropertyCounts: (column: string, params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/statistics/submissions/${column}`,
        method: "GET",
        secure: true,
        ...params,
      }),

    /**
     * No description
     *
     * @tags statistics
     * @name GetTeamStatistics
     * @request GET:/statistics/teams
     * @secure
     */
    getTeamStatistics: (params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/statistics/teams`,
        method: "GET",
        secure: true,
        ...params,
      }),

    /**
     * No description
     *
     * @tags statistics
     * @name GetUserStatistics
     * @request GET:/statistics/users
     * @secure
     */
    getUserStatistics: (params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/statistics/users`,
        method: "GET",
        secure: true,
        ...params,
      }),

    /**
     * No description
     *
     * @tags statistics
     * @name GetUserPropertyCounts
     * @request GET:/statistics/users/{column}
     * @secure
     */
    getUserPropertyCounts: (column: string, params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/statistics/users/${column}`,
        method: "GET",
        secure: true,
        ...params,
      }),
  };
  submissions = {
    /**
     * @description Endpoint to get submission objects in bulk
     *
     * @tags submissions
     * @name GetSubmissionsList
     * @request GET:/submissions
     * @secure
     */
    getSubmissionsList: (
      query?: {
        challenge_id?: number;
        user_id?: number;
        team_id?: number;
        ip?: string;
        provided?: string;
        type?: string;
        q?: string;
        field?:
        | "challenge_id"
        | "user_id"
        | "team_id"
        | "ip"
        | "provided"
        | "type";
      },
      params: RequestParams = {},
    ) =>
      this.request<SubmissionListSuccessResponse, APISimpleErrorResponse>({
        path: `/submissions`,
        method: "GET",
        query: query,
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * @description Endpoint to create a submission object. Users should interact with the attempt endpoint to submit flags.
     *
     * @tags submissions
     * @name PostSubmissionsList
     * @request POST:/submissions
     * @secure
     */
    postSubmissionsList: (
      Submissions: {
        challenge_id?: number;
        user_id?: number;
        team_id?: number;
        ip?: string;
        provided?: string;
        type?: string;
        /** @format date-time */
        date?: string;
      },
      params: RequestParams = {},
    ) =>
      this.request<SubmissionListSuccessResponse, APISimpleErrorResponse>({
        path: `/submissions`,
        method: "POST",
        body: Submissions,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * @description Endpoint to get a submission object
     *
     * @tags submissions
     * @name GetSubmission
     * @request GET:/submissions/{submission_id}
     * @secure
     */
    getSubmission: (submissionId: string, params: RequestParams = {}) =>
      this.request<SubmissionDetailedSuccessResponse, APISimpleErrorResponse>({
        path: `/submissions/${submissionId}`,
        method: "GET",
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * @description Endpoint to delete a submission object
     *
     * @tags submissions
     * @name DeleteSubmission
     * @request DELETE:/submissions/{submission_id}
     * @secure
     */
    deleteSubmission: (submissionId: string, params: RequestParams = {}) =>
      this.request<APISimpleSuccessResponse, APISimpleErrorResponse>({
        path: `/submissions/${submissionId}`,
        method: "DELETE",
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * @description Endpoint to edit a submission object
     *
     * @tags submissions
     * @name PatchSubmission
     * @request PATCH:/submissions/{submission_id}
     * @secure
     */
    patchSubmission: (submissionId: string, params: RequestParams = {}) =>
      this.request<SubmissionDetailedSuccessResponse, APISimpleErrorResponse>({
        path: `/submissions/${submissionId}`,
        method: "PATCH",
        secure: true,
        format: "json",
        ...params,
      }),
  };
  tags = {
    /**
     * @description Endpoint to list Tag objects in bulk
     *
     * @tags tags
     * @name GetTagList
     * @request GET:/tags
     * @secure
     */
    getTagList: (
      query?: {
        challenge_id?: number;
        value?: string;
        q?: string;
        field?: "challenge_id" | "value";
      },
      params: RequestParams = {},
    ) =>
      this.request<TagListSuccessResponse, APISimpleErrorResponse>({
        path: `/tags`,
        method: "GET",
        query: query,
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * @description Endpoint to create a Tag object
     *
     * @tags tags
     * @name PostTagList
     * @request POST:/tags
     * @secure
     */
    postTagList: (params: RequestParams = {}) =>
      this.request<TagDetailedSuccessResponse, APISimpleErrorResponse>({
        path: `/tags`,
        method: "POST",
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * @description Endpoint to get a specific Tag object
     *
     * @tags tags
     * @name GetTag
     * @request GET:/tags/{tag_id}
     * @secure
     */
    getTag: (tagId: string, params: RequestParams = {}) =>
      this.request<TagDetailedSuccessResponse, APISimpleErrorResponse>({
        path: `/tags/${tagId}`,
        method: "GET",
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * @description Endpoint to delete a specific Tag object
     *
     * @tags tags
     * @name DeleteTag
     * @request DELETE:/tags/{tag_id}
     * @secure
     */
    deleteTag: (tagId: string, params: RequestParams = {}) =>
      this.request<APISimpleSuccessResponse, any>({
        path: `/tags/${tagId}`,
        method: "DELETE",
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * @description Endpoint to edit a specific Tag object
     *
     * @tags tags
     * @name PatchTag
     * @request PATCH:/tags/{tag_id}
     * @secure
     */
    patchTag: (tagId: string, params: RequestParams = {}) =>
      this.request<TagDetailedSuccessResponse, APISimpleErrorResponse>({
        path: `/tags/${tagId}`,
        method: "PATCH",
        secure: true,
        format: "json",
        ...params,
      }),
  };
  teams = {
    /**
     * @description Endpoint to get Team objects in bulk
     *
     * @tags teams
     * @name GetTeamList
     * @request GET:/teams
     * @secure
     */
    getTeamList: (
      query?: {
        affiliation?: string;
        country?: string;
        bracket?: string;
        q?: string;
        field?:
        | "name"
        | "website"
        | "country"
        | "bracket"
        | "affiliation"
        | "email";
      },
      params: RequestParams = {},
    ) =>
      this.request<TeamListSuccessResponse, APISimpleErrorResponse>({
        path: `/teams`,
        method: "GET",
        query: query,
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * @description Endpoint to create a Team object
     *
     * @tags teams
     * @name PostTeamList
     * @request POST:/teams
     * @secure
     */
    postTeamList: (params: RequestParams = {}) =>
      this.request<TeamDetailedSuccessResponse, APISimpleErrorResponse>({
        path: `/teams`,
        method: "POST",
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * @description Endpoint to get the current user's Team object
     *
     * @tags teams
     * @name GetTeamPrivate
     * @request GET:/teams/me
     * @secure
     */
    getTeamPrivate: (
      query?: {
        /** Current Team */
        team_id?: string;
      },
      params: RequestParams = {},
    ) =>
      this.request<TeamDetailedSuccessResponse, APISimpleErrorResponse>({
        path: `/teams/me`,
        method: "GET",
        query: query,
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * @description Endpoint to disband your current team. Can only be used if the team has performed no actions in the CTF.
     *
     * @tags teams
     * @name DeleteTeamPrivate
     * @request DELETE:/teams/me
     * @secure
     */
    deleteTeamPrivate: (
      query?: {
        /** Current Team */
        team_id?: string;
      },
      params: RequestParams = {},
    ) =>
      this.request<APISimpleSuccessResponse, any>({
        path: `/teams/me`,
        method: "DELETE",
        query: query,
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * @description Endpoint to create or join a team
     * 
     * @tags teams
     * @name PostTeamPrivate
     * @request POST:/teams/me
     * @secure
     */
    postTeamPrivate: (
      body?: {
        method?: "create" | "join";
        name?: string;
        password?: string;
      },
      params: RequestParams = {},
    ) =>
      this.request<APISimpleSuccessResponse, APISimpleErrorResponse>({
        path: `/teams/me`,
        method: "POST",
        body: body,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * @description Endpoint to edit the current user's Team object
     *
     * @tags teams
     * @name PatchTeamPrivate
     * @request PATCH:/teams/me
     * @secure
     */
    patchTeamPrivate: (
      body?: {
        name?: string;
        website?: string;
        country?: string;
        bracket_id?: number;
        affiliation?: string;
        // new password
        password?: string;
        // old password
        confirm?: string;
      },
      params: RequestParams = {},
    ) =>
      this.request<TeamDetailedSuccessResponse, APISimpleErrorResponse>({
        path: `/teams/me`,
        method: "PATCH",
        body: body,
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags teams
     * @name GetTeamPrivateAwards
     * @request GET:/teams/me/awards
     * @secure
     */
    getTeamPrivateAwards: (params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/teams/me/awards`,
        method: "GET",
        secure: true,
        ...params,
      }),

    /**
     * No description
     *
     * @tags teams
     * @name GetTeamPrivateFails
     * @request GET:/teams/me/fails
     * @secure
     */
    getTeamPrivateFails: (params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/teams/me/fails`,
        method: "GET",
        secure: true,
        ...params,
      }),
    getTeamPrivateMembers: (params: RequestParams = {}) =>
      this.request<TeamMembersSuccessResponse, APISimpleErrorResponse>({
        path: `/teams/me/members`,
        method: "GET",
        secure: true,
        ...params,
      }),
    /**
     * No description
     *
     * @tags teams
     * @name PostTeamPrivateMembers
     * @request POST:/teams/me/members
     * @secure
     */
    postTeamPrivateMembers: (params: RequestParams = {}) =>
      this.request<TeamMembersSuccessResponse, APISimpleErrorResponse>({
        path: `/teams/me/members`,
        method: "POST",
        secure: true,
        ...params,
      }),

    /**
     * No description
     *
     * @tags teams
     * @name GetTeamPrivateSolves
     * @request GET:/teams/me/solves
     * @secure
     */
    getTeamPrivateSolves: (params: RequestParams = {}) =>
      this.request<TeamSolvesSuccessResponse, APISimpleErrorResponse>({
        path: `/teams/me/solves`,
        method: "GET",
        secure: true,
        ...params,
      }),

    /**
     * @description Endpoint to get a specific Team object
     *
     * @tags teams
     * @name GetTeamPublic
     * @request GET:/teams/{team_id}
     * @secure
     */
    getTeamPublic: (teamId: number, params: RequestParams = {}) =>
      this.request<TeamDetailedSuccessResponse, APISimpleErrorResponse>({
        path: `/teams/${teamId}`,
        method: "GET",
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * @description Endpoint to delete a specific Team object
     *
     * @tags teams
     * @name DeleteTeamPublic
     * @request DELETE:/teams/{team_id}
     * @secure
     */
    deleteTeamPublic: (teamId: number, params: RequestParams = {}) =>
      this.request<APISimpleSuccessResponse, any>({
        path: `/teams/${teamId}`,
        method: "DELETE",
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * @description Endpoint to edit a specific Team object
     *
     * @tags teams
     * @name PatchTeamPublic
     * @request PATCH:/teams/{team_id}
     * @secure
     */
    patchTeamPublic: (teamId: number, params: RequestParams = {}) =>
      this.request<TeamDetailedSuccessResponse, APISimpleErrorResponse>({
        path: `/teams/${teamId}`,
        method: "PATCH",
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags teams
     * @name GetTeamPublicAwards
     * @request GET:/teams/{team_id}/awards
     * @secure
     */
    getTeamPublicAwards: (teamId: string, params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/teams/${teamId}/awards`,
        method: "GET",
        secure: true,
        ...params,
      }),

    /**
     * No description
     *
     * @tags teams
     * @name GetTeamPublicFails
     * @request GET:/teams/{team_id}/fails
     * @secure
     */
    getTeamPublicFails: (teamId: string, params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/teams/${teamId}/fails`,
        method: "GET",
        secure: true,
        ...params,
      }),

    /**
     * No description
     *
     * @tags teams
     * @name DeleteTeamMembers
     * @request DELETE:/teams/{team_id}/members
     * @secure
     */
    deleteTeamMembers: (teamId: string, params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/teams/${teamId}/members`,
        method: "DELETE",
        secure: true,
        ...params,
      }),

    /**
     * No description
     *
     * @tags teams
     * @name GetTeamMembers
     * @request GET:/teams/{team_id}/members
     * @secure
     */
    getTeamMembers: (teamId: string, params: RequestParams = {}) =>
      this.request<TeamMembersSuccessResponse, APISimpleErrorResponse>({
        path: `/teams/${teamId}/members`,
        method: "GET",
        secure: true,
        ...params,
      }),

    /**
     * No description
     *
     * @tags teams
     * @name PostTeamMembers
     * @request POST:/teams/{team_id}/members
     * @secure
     */
    postTeamMembers: (teamId: string, params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/teams/${teamId}/members`,
        method: "POST",
        secure: true,
        ...params,
      }),

    /**
     * No description
     *
     * @tags teams
     * @name GetTeamPublicSolves
     * @request GET:/teams/{team_id}/solves
     * @secure
     */
    getTeamPublicSolves: (teamId: string, params: RequestParams = {}) =>
      this.request<TeamSolvesSuccessResponse, APISimpleErrorResponse>({
        path: `/teams/${teamId}/solves`,
        method: "GET",
        secure: true,
        ...params,
      }),
  };
  tokens = {
    /**
     * @description Endpoint to get token objects in bulk
     *
     * @tags tokens
     * @name GetTokenList
     * @request GET:/tokens
     * @secure
     */
    getTokenList: (params: RequestParams = {}) =>
      this.request<TokenListSuccessResponse, APISimpleErrorResponse>({
        path: `/tokens`,
        method: "GET",
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * @description Endpoint to create a token object
     *
     * @tags tokens
     * @name PostTokenList
     * @request POST:/tokens
     * @secure
     */
    postTokenList: (params: RequestParams = {}) =>
      this.request<TokenDetailedSuccessResponse, APISimpleErrorResponse>({
        path: `/tokens`,
        method: "POST",
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * @description Endpoint to get an existing token object
     *
     * @tags tokens
     * @name GetTokenDetail
     * @request GET:/tokens/{token_id}
     * @secure
     */
    getTokenDetail: (tokenId: string, params: RequestParams = {}) =>
      this.request<
        ValuelessTokenDetailedSuccessResponse,
        APISimpleErrorResponse
      >({
        path: `/tokens/${tokenId}`,
        method: "GET",
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * @description Endpoint to delete an existing token object
     *
     * @tags tokens
     * @name DeleteTokenDetail
     * @request DELETE:/tokens/{token_id}
     * @secure
     */
    deleteTokenDetail: (tokenId: string, params: RequestParams = {}) =>
      this.request<APISimpleSuccessResponse, any>({
        path: `/tokens/${tokenId}`,
        method: "DELETE",
        secure: true,
        format: "json",
        ...params,
      }),
  };
  topics = {
    /**
     * @description Endpoint to delete a specific Topic object of a specific type
     *
     * @tags topics
     * @name DeleteTopicList
     * @request DELETE:/topics
     * @secure
     */
    deleteTopicList: (
      query?: {
        type?: string;
        /** @default 0 */
        target_id?: number;
      },
      params: RequestParams = {},
    ) =>
      this.request<APISimpleSuccessResponse, any>({
        path: `/topics`,
        method: "DELETE",
        query: query,
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * @description Endpoint to list Topic objects in bulk
     *
     * @tags topics
     * @name GetTopicList
     * @request GET:/topics
     * @secure
     */
    getTopicList: (
      query?: {
        value?: string;
        q?: string;
        field?: "value";
      },
      params: RequestParams = {},
    ) =>
      this.request<TopicListSuccessResponse, APISimpleErrorResponse>({
        path: `/topics`,
        method: "GET",
        query: query,
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * @description Endpoint to create a Topic object
     *
     * @tags topics
     * @name PostTopicList
     * @request POST:/topics
     * @secure
     */
    postTopicList: (params: RequestParams = {}) =>
      this.request<TopicDetailedSuccessResponse, APISimpleErrorResponse>({
        path: `/topics`,
        method: "POST",
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * @description Endpoint to get a specific Topic object
     *
     * @tags topics
     * @name GetTopic
     * @request GET:/topics/{topic_id}
     * @secure
     */
    getTopic: (topicId: string, params: RequestParams = {}) =>
      this.request<TopicDetailedSuccessResponse, APISimpleErrorResponse>({
        path: `/topics/${topicId}`,
        method: "GET",
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * @description Endpoint to delete a specific Topic object
     *
     * @tags topics
     * @name DeleteTopic
     * @request DELETE:/topics/{topic_id}
     * @secure
     */
    deleteTopic: (topicId: string, params: RequestParams = {}) =>
      this.request<APISimpleSuccessResponse, any>({
        path: `/topics/${topicId}`,
        method: "DELETE",
        secure: true,
        format: "json",
        ...params,
      }),
  };
  unlocks = {
    /**
     * @description Endpoint to get unlock objects in bulk
     *
     * @tags unlocks
     * @name GetUnlockList
     * @request GET:/unlocks
     * @secure
     */
    getUnlockList: (
      query?: {
        user_id?: number;
        team_id?: number;
        target?: number;
        type?: string;
        q?: string;
        field?: "target" | "type";
      },
      params: RequestParams = {},
    ) =>
      this.request<UnlockListSuccessResponse, APISimpleErrorResponse>({
        path: `/unlocks`,
        method: "GET",
        query: query,
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * @description Endpoint to create an unlock object. Used to unlock hints.
     *
     * @tags unlocks
     * @name PostUnlockList
     * @request POST:/unlocks
     * @secure
     */
    postUnlockList: (
      body?: {
        target?: number;
        type?: string;
      },
      params: RequestParams = {}
    ) =>
      this.request<UnlockDetailedSuccessResponse, APISimpleErrorResponse>({
        path: `/unlocks`,
        method: "POST",
        body: body,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),
  };
  users = {
    /**
     * @description Endpoint to get User objects in bulk
     *
     * @tags users
     * @name GetUserList
     * @request GET:/users
     * @secure
     */
    getUserList: (
      query?: {
        affiliation?: string;
        country?: string;
        bracket?: string;
        q?: string;
        field?:
        | "name"
        | "website"
        | "country"
        | "bracket"
        | "affiliation"
        | "email";
      },
      params: RequestParams = {},
    ) =>
      this.request<UserListSuccessResponse, APISimpleErrorResponse>({
        path: `/users`,
        method: "GET",
        query: query,
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * @description Endpoint to create a User object
     *
     * @tags users
     * @name PostUserList
     * @request POST:/users
     * @secure
     */
    postUserList: (
      query?: {
        /** Whether to send the created user an email with their credentials */
        notify?: string;
      },
      params: RequestParams = {},
    ) =>
      this.request<UserDetailedSuccessResponse, APISimpleErrorResponse>({
        path: `/users`,
        method: "POST",
        query: query,
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * @description Endpoint to get the User object for the current user
     *
     * @tags users
     * @name GetUserPrivate
     * @request GET:/users/me
     * @secure
     */
    getUserPrivate: (params: RequestParams = {}) =>
      this.request<UserDetailedSuccessResponse, APISimpleErrorResponse>({
        path: `/users/me`,
        method: "GET",
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * @description Endpoint to edit the User object for the current user
     *
     * @tags users
     * @name PatchUserPrivate
     * @request PATCH:/users/me
     * @secure
     */
    patchUserPrivate: (
      body?: {
        name?: string;
        email?: string;
        website?: string;
        country?: string;
        language?: string;
        // new password
        password?: string;
        // old password
        confirm?: string;
      },
      params: RequestParams = {}
    ) =>
      this.request<UserDetailedSuccessResponse, APISimpleErrorResponse>({
        path: `/users/me`,
        method: "PATCH",
        body: body,
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags users
     * @name GetUserPrivateAwards
     * @request GET:/users/me/awards
     * @secure
     */
    getUserPrivateAwards: (
      query?: {
        /** User ID */
        user_id?: string;
      },
      params: RequestParams = {},
    ) =>
      this.request<void, any>({
        path: `/users/me/awards`,
        method: "GET",
        query: query,
        secure: true,
        ...params,
      }),

    /**
     * No description
     *
     * @tags users
     * @name GetUserPrivateFails
     * @request GET:/users/me/fails
     * @secure
     */
    getUserPrivateFails: (params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/users/me/fails`,
        method: "GET",
        secure: true,
        ...params,
      }),

    /**
     * No description
     *
     * @tags users
     * @name GetUserPrivateSolves
     * @request GET:/users/me/solves
     * @secure
     */
    getUserPrivateSolves: (params: RequestParams = {}) =>
      this.request<UserSolvesSuccessResponse, APISimpleErrorResponse>({
        path: `/users/me/solves`,
        method: "GET",
        secure: true,
        ...params,
      }),

    /**
     * @description Endpoint to get a specific User object
     *
     * @tags users
     * @name GetUserPublic
     * @request GET:/users/{user_id}
     * @secure
     */
    getUserPublic: (userId: number, params: RequestParams = {}) =>
      this.request<UserDetailedSuccessResponse, APISimpleErrorResponse>({
        path: `/users/${userId}`,
        method: "GET",
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * @description Endpoint to delete a specific User object
     *
     * @tags users
     * @name DeleteUserPublic
     * @request DELETE:/users/{user_id}
     * @secure
     */
    deleteUserPublic: (userId: number, params: RequestParams = {}) =>
      this.request<APISimpleSuccessResponse, any>({
        path: `/users/${userId}`,
        method: "DELETE",
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * @description Endpoint to edit a specific User object
     *
     * @tags users
     * @name PatchUserPublic
     * @request PATCH:/users/{user_id}
     * @secure
     */
    patchUserPublic: (userId: number, params: RequestParams = {}) =>
      this.request<UserDetailedSuccessResponse, APISimpleErrorResponse>({
        path: `/users/${userId}`,
        method: "PATCH",
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags users
     * @name GetUserPublicAwards
     * @request GET:/users/{user_id}/awards
     * @secure
     */
    getUserPublicAwards: (userId: string, params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/users/${userId}/awards`,
        method: "GET",
        secure: true,
        ...params,
      }),

    /**
     * @description Endpoint to email a User object
     *
     * @tags users
     * @name PostUserEmails
     * @request POST:/users/{user_id}/email
     * @secure
     */
    postUserEmails: (userId: number, params: RequestParams = {}) =>
      this.request<APISimpleSuccessResponse, any>({
        path: `/users/${userId}/email`,
        method: "POST",
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags users
     * @name GetUserPublicFails
     * @request GET:/users/{user_id}/fails
     * @secure
     */
    getUserPublicFails: (userId: string, params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/users/${userId}/fails`,
        method: "GET",
        secure: true,
        ...params,
      }),

    /**
     * No description
     *
     * @tags users
     * @name GetUserPublicSolves
     * @request GET:/users/{user_id}/solves
     * @secure
     */
    getUserPublicSolves: (userId: string, params: RequestParams = {}) =>
      this.request<UserSolvesSuccessResponse, any>({
        path: `/users/${userId}/solves`,
        method: "GET",
        secure: true,
        ...params,
      }),
  };
}
