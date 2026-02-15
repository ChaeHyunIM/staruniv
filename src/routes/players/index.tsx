import { Navigate, useSearchParams } from "@solidjs/router";

export default function PlayersRedirect() {
  const [searchParams] = useSearchParams();

  const target = () => {
    const params = new URLSearchParams();
    params.set("view", "players");
    if (searchParams.race) params.set("race", searchParams.race as string);
    if (searchParams.tier) params.set("tier", searchParams.tier as string);
    if (searchParams.crew) params.set("crew", searchParams.crew as string);
    if (searchParams.gender) params.set("gender", searchParams.gender as string);
    if (searchParams.search) params.set("search", searchParams.search as string);
    return `/?${params.toString()}`;
  };

  return <Navigate href={target()} />;
}
