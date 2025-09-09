import { createContext, ReactNode, useContext, useRef } from "react";
import { useStore as useZustandStore } from "zustand";
import { persist, PersistOptions, StateStorage } from "zustand/middleware";
import { createStore, StoreApi } from "zustand/vanilla";

type CreateFn<T> = (
  set: StoreApi<T>["setState"],
  get: StoreApi<T>["getState"]
) => T;

type Options<T> = {
  activePersistant?: boolean;
  enablePersist?: boolean;
  persistOptions?: Omit<PersistOptions<T>, "name"> & {
    name: string;
    storage?: StateStorage;
  };
};

type ProviderProps<T> =
  | {
      store: StoreApi<T>;
      children: ReactNode;
      create?: never;
    }
  | {
      create: CreateFn<T>;
      children: ReactNode;
      store?: never;
    };

export function generateZustandContext<T>(opts?: Options<T>) {
  const ctx = createContext<StoreApi<T> | null>(null);

  function Provider(props: ProviderProps<T>) {
    const storeRef = useRef<StoreApi<T> | null>(
      createStore<T>(
        opts?.activePersistant ?? opts?.enablePersist ?? false
          ? persist(
              props.create as any,
              {
                name: opts?.persistOptions?.name,
                ...(opts?.persistOptions ?? {}),
              } as PersistOptions<T>
            )
          : (props.create as any)
      )
    );

    return (
      <ctx.Provider value={storeRef.current}>{props.children}</ctx.Provider>
    );
  }

  function useStore<Sel = T>(selector?: (state: T) => Sel): Sel {
    const store = useContext(ctx);
    if (!store) {
      throw new Error("useStore debe usarse dentro de su <Provider>.");
    }
    return useZustandStore(
      store,
      (selector as any) ?? ((s: T) => s as unknown as Sel)
    );
  }

  return [Provider, useStore] as const;
}
