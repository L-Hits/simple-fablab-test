import { Button, FormControl, Paper, TextField } from "@mui/material";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import React, { useState } from "react";
import axiosInstance from "../utils/axiosInstance";




const Register = () => {
  const navigate = useNavigate();
  //회원가입 시작
  const [id, setId] = useState(""); // 사용자 학번
  const [password, setPassword] = useState(""); // 사용자 비밀번호
  const [name, setName] = useState(""); // 사용자 이름
  const [email, setEmail] = useState(""); // 사용자 이메일
  const [authenticationNumber, setAuthenticationNumber] = useState(""); // 사용자 인증번호
  const [isVerified, setIsVerified] = useState(false); // 인증번호 검증 여부

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
  
  // 인증번호 요청
  const requestVerificationCode = async () => {
    try {
      // Step 1: CSRF 토큰 가져오기
      const csrfToken = await getCsrfToken();

      // Step 2: 인증번호 요청
      await axiosInstance.post(
        "/users/verify-email",
        {
          email,
          purpose: "verifyAccount", // 계정 복구용 인증번호 요청
          id,
          name,
        },
        {
          headers: {
            "X-CSRF-Token": csrfToken, // CSRF 토큰 추가
          }
        }
      );

      // 요청 성공 시 알림
      alert("인증번호가 이메일로 발송되었습니다!");
    } catch (error) {
      // 요청 실패 시 알림
      if (axios.isAxiosError(error) && error.response) {
        alert("이메일 전송 실패: " + (error.response.data?.message || "알 수 없는 오류"));
      } else {
        console.error("요청 오류:", (error as Error).message);
        alert("예기치 않은 오류가 발생했습니다. 나중에 다시 시도해 주세요.");
      }
    }
  };


  // 인증번호 확인
  const verifyCode = async () => {
    try {
      // Step 1: CSRF 토큰 가져오기
      const csrfToken = await getCsrfToken();

      // Step 2: 인증번호 확인 요청
      await axiosInstance.post(
        "/users/verify-code",
        { 
          email, 
          code: authenticationNumber 
        },
        {
          headers: {
            "X-CSRF-Token": csrfToken, // CSRF 토큰 추가
          }
        }
      );

      // 요청 성공 처리
      alert("인증번호 확인 완료!");
      setIsVerified(true); // 인증 성공
    } catch (error) {
      // 요청 실패 처리
      if (axios.isAxiosError(error) && error.response) {
        alert("인증 실패: " + (error.response.data?.message || "알 수 없는 오류"));
      } else {
        console.error("요청 오류:", (error as Error).message);
        alert("예기치 않은 오류가 발생했습니다. 나중에 다시 시도해 주세요.");
      }
    }
  };


  // 회원가입 기능 시작
  const Registerbtn = async (e: React.FormEvent) => {
    e.preventDefault();

    // 사용자가 인증번호를 확인했는지 확인
    if (!isVerified) {
      alert("이메일 인증을 완료해주세요!");
      return;
    }

    try {
      // Step 1: CSRF 토큰 가져오기
      const csrfToken = await getCsrfToken();

      // Step 2: 서버로 회원가입 요청 전송
      await axiosInstance.post(
        "/users/register",
        {
          name: name,
          id: id,
          password: password,
          email: email,
        },
        {
          headers: {
            "X-CSRF-Token": csrfToken, // CSRF 토큰 추가
          },
        }
      );

      // 사용자에게 성공 메시지 보여주기 (UI 반영)
      alert("회원가입이 성공적으로 완료되었습니다!");
      navigate("/login"); // 회원가입 성공 시 로그인 페이지로 이동
    } catch (error) {
      // 서버로부터 반환된 에러 메시지 확인
      if (axios.isAxiosError(error) && error.response) {
        console.error("서버가 오류를 반환했습니다:", error.response.data.message);
        alert(`Error: ${error.response.data.message}`);
      } else {
        if (error instanceof Error) {
          console.error("요청을 보내는 중 오류가 발생했습니다:", error.message);
        } else {
          console.error("요청을 보내는 중 알 수 없는 오류가 발생했습니다.");
        }
        alert("예기치 않은 오류가 발생했습니다. 나중에 다시 시도해 주세요.");
      }
    }
  }; // 회원가입 기능 끝


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
          <h2>회원가입 페이지</h2>
          <TextField
          value={name}
          onChange={(e) => setName(e.target.value)}
          id="name"
          label="이름" />

          <TextField 
          value={id}
          onChange={(e) => setId(e.target.value)}
          id="id"
          label="학번" />

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
          <TextField
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          id="email"
          label="이메일" />
          <Button variant="contained" onClick={requestVerificationCode} fullWidth>
            인증번호 받기
          </Button>
          </Paper>

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
            <TextField
              value={authenticationNumber}
              onChange={(e) => setAuthenticationNumber(e.target.value)}
              id="authenticationNumber"
              label="인증번호"
            />
            <Button variant="contained" fullWidth onClick={verifyCode}>
              인증번호 확인
            </Button>
          </Paper>

          

          <TextField 
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          id="password" 
          type="password" 
          label="비밀번호" />

          <Button variant="contained" fullWidth onClick={Registerbtn}>
            회원가입
          </Button>
          <Link to="/login">이미 계정이 있으신가요?</Link>
        </Paper>
      </FormControl>
    </div>
  );
};

export default Register;
