// Bos
export declare interface BosContext {
  accountId?: string;
  networkId: NetworkId;
}

export declare var props: any;

export declare var context: BosContext;

export declare const Widget: (params: {
  src: string;
  props: object;
}) => React.ReactNode;

export declare const Markdown: (params: {
  text: string | undefined;
}) => React.ReactNode;

// React
type Dispatch<A> = (value: A) => void;
type SetStateAction<S> = S | ((prevState: S) => S);
export declare function useState<S>(
  initialState: S | (() => S),
): [S, Dispatch<SetStateAction<S>>];

declare const UNDEFINED_VOID_ONLY: unique symbol;
type Destructor = () => void | { [UNDEFINED_VOID_ONLY]: never };
type EffectCallback = () => void | Destructor;
type DependencyList = readonly unknown[];
export declare function useEffect(
  effect: EffectCallback,
  deps?: DependencyList,
): void;
