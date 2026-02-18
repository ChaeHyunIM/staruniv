// @ts-expect-error -- bun 빌트인 모듈은 @types/bun 없이 TS에서 resolve 불가
import { sql } from "bun";

export { sql };
