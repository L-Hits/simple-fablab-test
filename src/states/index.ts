import { atom } from "jotai";

// 백엔드 서버 주소
export const SERVER_HOST = "http://localhost:3002"; // AXIOS 통신 할 서버 주소


// LocalStorage에서 상태를 불러오기
const savedLoginState = JSON.parse(
    localStorage.getItem("testFablabloginState") || "{}"
  );

// 로그인 상태 관리 TODO: 알아서 수정해서 쓰세요
export const testFablabloginStateAtom = atom({
    isLoggedIn: savedLoginState.isLoggedIn || false, // 로그인 상태
    userId: savedLoginState.userId || -1, // 로그인된 사용자의 ID
    id: savedLoginState.id || "", // 로그인된 사용자의 이메일
});

export const selectedSeatAtom = atom<string | null>(null); // 선택된 좌석 상태


