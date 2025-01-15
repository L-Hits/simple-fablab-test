import axios from "axios";
import { SetStateAction } from "jotai";
import { SERVER_HOST } from "../states";
import { NavigateFunction } from "react-router-dom";

const axiosInstance = axios.create({
  baseURL: SERVER_HOST,
  withCredentials: true, // 쿠키를 포함하여 요청
});

// CSRF 토큰 가져오기 함수
const getCsrfToken = async () => {
  try {
    const response = await axiosInstance.get("/csrf-token");
    return response.data.csrfToken;
  } catch (error) {
    console.error("CSRF 토큰을 가져오는 중 오류 발생:", error);
    throw new Error("CSRF 토큰을 가져오는 데 실패했습니다.");
  }
};

export const setupAxiosInterceptors = (
  setTestFablabloginState: (
    value: SetStateAction<{ isLoggedIn: boolean; userId: string | null; id: string }>
  ) => void,
  navigate: NavigateFunction
) => {
  axiosInstance.interceptors.response.use(
    (response) => response, // 요청 성공 시
    async (error) => {
      const originalRequest = error.config;

      // AccessToken 만료 시 - 403 에러는 기능은 넘어가는데 권한이 없는 경우
      if (error.response?.status === 403 && !originalRequest._retry) {
        originalRequest._retry = true; // 중복 요청 방지 플래그

        try {
          // CSRF 토큰 가져오기
          const csrfToken = await getCsrfToken();

          // RefreshToken으로 AccessToken 재발급 요청
          const { data } = await axios.post(
            `${SERVER_HOST}/users/token/refresh`,
            {},
            {
              withCredentials: true,
              headers: {
                "X-CSRF-Token": csrfToken, // CSRF 토큰 헤더 추가
              },
            }
          );

          // 재발급된 AccessToken으로 원래 요청 재시도
          return axiosInstance(originalRequest);
        } catch (refreshError) {
          // RefreshToken 만료 시 로그아웃 처리
          if (axios.isAxiosError(refreshError) && refreshError.response?.status === 403) {
            alert("세션이 만료되었습니다. 다시 로그인해주세요.");
            setTestFablabloginState({
              isLoggedIn: false,
              userId: null,
              id: "",
            });

            navigate("/login"); // 로그인 페이지로 이동
          }
        }
      }

      return Promise.reject(error); // 다른 오류 처리
    }
  );
};

export default axiosInstance;

