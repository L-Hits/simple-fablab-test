import { Button, FormControl, Paper, TextField } from "@mui/material";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { useState } from "react";
import { testFablabloginStateAtom } from "../states"; 
import { useAtomValue, useSetAtom } from "jotai"; // useSetAtom 불러오기
import axiosInstance from "../utils/axiosInstance";


const Login = () => {
  const navigate = useNavigate();

  // 로그인 된 상태면 메인 페이지로 이동
  const testFablabloginState = useAtomValue(testFablabloginStateAtom);
  if (testFablabloginState.isLoggedIn) {
    navigate("/");
  }
  
  // 로그인 기능 추가
  const [id, setId] = useState(""); // 사용자 학번
  const [password, setPassword] = useState(""); // 사용자 비밀번호
  
  const setTestFablabloginState = useSetAtom(testFablabloginStateAtom); // 로그인 상태 변경 함수
  const [, setIsLoading] = useState(false); // 로그인 로딩 상태

  // CSRF 토큰 가져오기 함수 *중요 
  const getCsrfToken = () => {
    return axiosInstance
      .get("/csrf-token")
      .then((response) => response.data.csrfToken)
      .catch((error) => {
        console.error("CSRF 토큰을 가져오는 중 오류 발생:", error);
        throw new Error("CSRF 토큰을 가져오는 데 실패했습니다.");
      });
  };

  // 로그인 기능 시작
  const handleLoginClick = async (e: React.FormEvent) => {
    e.preventDefault();

    // 입력값 검증
    if (!id || !password) {
      alert("학번과 비밀번호를 입력해 주세요.");
      return;
    }

    setIsLoading(true); // 로딩 상태 활성화

    try {
      // Step 1: CSRF 토큰 가져오기
      const csrfToken = await getCsrfToken();

      // Step 2: 서버에 로그인 요청
      const response = await axiosInstance.post(
        "/users/login",
        {
          id: id,
          password: password,
        },
        {
          headers: {
            "X-CSRF-Token": csrfToken, // CSRF 토큰 추가
          },
        }
      );

      // Step 3: 로그인 성공 처리
      const { name, userId } = response.data;

      // 로그인 성공 메시지
      alert(`[ ${name} ]님 로그인에 성공했습니다!`);

      // 로그인 상태 업데이트
      const TestFablabloginState = {
        isLoggedIn: true, // 로그인 상태
        id: id, // 학번
        userId: userId, // 사용자 ID
      };

      // Jotai 상태 업데이트
      setTestFablabloginState(TestFablabloginState);

      // LocalStorage에 저장
      localStorage.setItem("testFablabloginState", JSON.stringify(TestFablabloginState));

      // 성공 후 메인 페이지 이동
      navigate("/");
    } catch (error) {
      // 로그인 실패 시 처리
      setId(""); // 학번 초기화

      if (axios.isAxiosError(error) && error.response) {
        console.error("서버 오류:", error.response.data.message);
        alert(error.response.data.message || "로그인 실패");
      } else {
        console.error("요청 오류:", (error as Error).message);
        alert("예기치 않은 오류가 발생했습니다. 나중에 다시 시도해 주세요.");
      }

      // 로그인 실패 시 비밀번호 초기화
      setPassword("");
    } finally {
      setIsLoading(false); // 로딩 상태 비활성화
    }
  }; // 로그인 기능 끝



  return (
    <div
      css={{
        height: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <FormControl>
        <Paper
          sx={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            padding: "20px",
            gap: "20px",
          }}
        >
          <h2>로그인 페이지</h2>
          <TextField 
          id="id" 
          label="학번"
          value={id}
          onChange={(e) => setId(e.target.value)}
          />
          <TextField 
          id="password" 
          type="password" 
          label="비밀번호" 
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          />
          <Button onClick={handleLoginClick} variant="contained" fullWidth >
            로그인
          </Button>
            <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
              <Link to="/accountrecovery">계정 복구</Link>
              <Link to="/changepw">비밀번호 찾기</Link>
            </div>
          <Link to="/register">회원가입</Link>
        </Paper>
      </FormControl>
    </div>
  );
};

export default Login;
