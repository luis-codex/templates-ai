import { PropsWithChildren } from "react";

export default function Page({ children }: Readonly<PropsWithChildren>) {
  return <div className="container mx-auto max-sm:px-4">{children}</div>;
}