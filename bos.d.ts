export declare interface BosContext {
  accountId?: string;
  networkId: NetworkId;
}

// export declare var props: any;

export declare var context: BosContext;

export declare const Widget: (params: {
  src: string;
  props: object;
}) => React.ReactNode;

export declare const Markdown: (params: {
  text: string | undefined;
}) => React.ReactNode;
