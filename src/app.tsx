import { Meta, MetaProvider, Title } from "@solidjs/meta";
import { Router } from "@solidjs/router";
import { FileRoutes } from "@solidjs/start/router";
import { Suspense } from "solid-js";
import Nav from "~/components/nav";
import "~/styles/global.css";

export default function App() {
  return (
    <Router
      root={(props) => (
        <MetaProvider>
          <Title>StarUniv</Title>
          <Meta name="description" content="스타크래프트 대학 리그 선수 티어 및 크루 현황" />
          <Meta name="theme-color" content="#fbfaf9" />
          <a href="#main-content" class="skip-link">
            본문으로 건너뛰기
          </a>
          <Nav />
          <Suspense>{props.children}</Suspense>
        </MetaProvider>
      )}
    >
      <FileRoutes />
    </Router>
  );
}
