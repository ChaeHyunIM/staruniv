/**
 * 닉네임에서 아바타용 이니셜을 추출한다.
 * - 한글 시작: 첫 글자
 * - 영문 2글자 이하: 그대로 대문자
 * - 영문 3글자 이상: 앞 2글자 대문자
 */
export function getInitials(nickname: string): string {
  if (!nickname) return "";

  const first = nickname[0];
  const isKorean = /[\uAC00-\uD7A3]/.test(first);

  if (isKorean) return first;
  if (nickname.length <= 2) return nickname.toUpperCase();
  return nickname.slice(0, 2).toUpperCase();
}
