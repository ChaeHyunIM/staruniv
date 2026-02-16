import { Navigate } from "@solidjs/router";

export default function FARedirect() {
  return <Navigate href="/?view=players&fa=true" />;
}
