import { Button, Paper, TextField, FormControl } from "@mui/material";
import { testFablabloginStateAtom, selectedSeatAtom } from "../states";
import { useAtomValue, useSetAtom } from "jotai";
import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { red } from "@mui/material/colors";

import axiosInstance, { setupAxiosInterceptors } from "../utils/axiosInstance"; // 중요 Axios 인스턴스 및 Interceptor 설정 함수 불러오기
import axios from "axios";


interface SeatButtonProps {
  seat_id: number; // 좌석 번호
  isBooked: boolean; // 예약 상태
  name: string; // 좌석 이름
}

// 좌석 버튼 컴포넌트
const SeatButton = ({
  seat_id,
  name,
  isBooked,
  handleSeatSelection,
}: SeatButtonProps & { handleSeatSelection: (seatId: string) => void }) => {
  const isSelected = useAtomValue(selectedSeatAtom) === seat_id.toString();

  return (
    <Button
      variant="contained"
      onClick={() => handleSeatSelection(seat_id.toString())}
      sx={{
        backgroundColor: isBooked ? "gray" : isSelected ? "blue" : "white",
        color: isBooked ? "white" : "black",
      }}
      disabled={isBooked}
    >
      {name}
    </Button>
  );
};

const Main = () => {
  const { isLoggedIn, userId } = useAtomValue(testFablabloginStateAtom); // 로그인 상태 읽기
  const navigate = useNavigate(); // 페이지 이동 함수
  const setTestFablabloginState = useSetAtom(testFablabloginStateAtom); // 상태 업데이트
  
  const [id, setId] = useState(""); // 사용자 학번, db에 저장된 id
  const [name, setName] = useState(""); // 사용자 이름, db에 저장된 name
  const [email, setEmail] = useState(""); // 사용자 이메일, db에 저장된 email
  const [initialEmail, setInitialEmail] = useState(""); // 초기 이메일 저장
  const [password, setPassword] = useState(""); // 사용자 비밀번호
  const [newPassword, setNewPassword] = useState(""); // 사용자 새로운 비밀번호

  const [isVerified, setIsVerified] = useState(false); // 인증번호 검증 여부
  
  const [authenticationNumber, setAuthenticationNumber] = useState(""); // 사용자 인증번호
  
  const selectedSeat = useAtomValue(selectedSeatAtom); // 선택된 좌석
  const setSelectedSeat = useSetAtom(selectedSeatAtom); // 상태 초기화 함수
  const [bookedSeats, setBookedSeats] = useState<string[]>([]); // 예약된 좌석
  const [seats, setSeats] = useState([]); // 좌석 리스트 상태

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
  
  // 사용자 정보 불러오기 시작
  useEffect(() => {
    if (isLoggedIn && userId) {
      // CSRF 토큰 가져오기
      getCsrfToken()
        .then((csrfToken) => {
          // 사용자 정보 요청
          return axiosInstance.get("/users/info", {
            headers: {
              "X-CSRF-Token": csrfToken, // CSRF 토큰 헤더 추가
            },
          });
        })
        .then((response) => {
          const userData = response.data.user;
          setId(userData.id); // 학번 저장
          setName(userData.name); // 이름 저장
          setEmail(userData.email); // 이메일 저장
          setInitialEmail(userData.email); // 초기 이메일 저장
        })
        .catch((error) => {
          console.error("사용자 정보를 불러오는 중 오류 발생:", error);
        });
    }
  }, [isLoggedIn, userId]);
  // 사용자 정보 불러오기 끝
  

  useEffect(() => {   // 로그인 상태 불러오기
    const savedLoginState = localStorage.getItem("testFablabloginState");
    if (savedLoginState) {
      setTestFablabloginState(JSON.parse(savedLoginState));
    }
  }, [setTestFablabloginState]);

  // 토큰 만료 시 로그아웃 처리
  useEffect(() => {
    // Axios Interceptor 초기화
    setupAxiosInterceptors(setTestFablabloginState, navigate);
  }, [setTestFablabloginState, navigate]);

  // 예약된 좌석 가져오기 시작
  useEffect(() => {
    axiosInstance.get("/reservations")
      .then((response) => {
        setBookedSeats(response.data.map((reservation: { seat_id: string }) => reservation.seat_id));
      })
      .catch((error) => {
        console.error("좌석 상태를 가져오는 중 오류 발생:", error);
      });
  }, []);
  // 예약된 좌석 가져오기 끝

  // 좌석 정보 불러오기 시작
  useEffect(() => {
    axiosInstance.get("/seats")
    .then((response) => {
      const updatedSeats = response.data.seats;
      setSeats(updatedSeats); // 좌석 데이터 갱신
      setBookedSeats(
        updatedSeats
          .filter((seat: { state: string }) => seat.state === "book")
          .map((seat: { seat_id: number }) => seat.seat_id.toString())
      );
    })
    .catch((error) => {
      console.error("좌석 데이터를 가져오는 중 오류 발생:", error);
    });
  }, []);
  // 좌석 정보 불러오기 끝

  // 선택된 좌석 상태 업데이트에 유효성 검증 추가
  const handleSeatSelection = (seatId: string) => {
    if (bookedSeats.includes(seatId)) {
      alert("이미 예약된 좌석입니다.");
      console.log(`이미 예약된 좌석입니다. : ${seatId}\n데이터 타입 : `, typeof seatId); 
      return;
    }
    if (selectedSeat === seatId) {
      setSelectedSeat(""); // 같은 좌석을 다시 클릭하면 선택 해제
    } else {
      setSelectedSeat(seatId); // 선택한 좌석 설정
    }
  };
  

  // 로그아웃 기능 구현 시작
  const handleLogoutClick = () => {
    if (!isLoggedIn) {
      alert("로그인이 필요합니다."); // 로그인 상태가 아닌 경우 알림
      return;
    }

    // CSRF 토큰 가져오기
    getCsrfToken()
      .then((csrfToken) => {
        // 로그아웃 요청
        // 이미 쿠키에 저장된 토큰으로 백엔드에서 인증이 되기 때문에 별도의 데이터는 필요없음
        return axiosInstance.post(
          "/users/logout",
          {},
          {
            headers: {
              "X-CSRF-Token": csrfToken, // CSRF 토큰 헤더 추가
            },
          }
        );
      })
      .then((response) => {
        if (response.data.success) {
          // LocalStorage에서 로그인 상태 제거
          localStorage.removeItem("testFablabloginState");

          // Jotai 상태 
          setTestFablabloginState({
            isLoggedIn: false, // 로그인 상태 초기화
            userId: null, // userId 초기화
            id: "", // 학번 초기화
          });

          alert("로그아웃이 성공적으로 완료되었습니다."); // 성공 메시지

          navigate("/login"); // 로그인 페이지로 이동
        } else {
          alert("로그아웃 처리에 실패했습니다."); // 실패 메시지
        }
      })
      .catch((error) => {
        console.error("로그아웃 중 오류 발생:", error);
        alert("로그아웃 중 오류가 발생했습니다. 다시 시도해 주세요."); // 에러 메시지
      });
  }; // 로그아웃 기능 구현 끝

  // 계정 탈퇴 기능 시작
  const handleAccountWithdrawalClick = () => {
    if (!isLoggedIn || !userId) {
      alert("로그인이 필요합니다."); // 로그인 상태가 아닌 경우 알림
      return;
    }

    const confirmWithdrawal = window.confirm("정말로 계정을 탈퇴하시겠습니까?");
    if (!confirmWithdrawal) return;

    // CSRF 토큰 가져오기
    getCsrfToken()
      .then((csrfToken) => {
        // 계정 탈퇴 요청에 CSRF 토큰 포함
        return axiosInstance.patch(
          "/users/account",
          {
            user_Id: userId,
          },
          {
            headers: {
              "X-CSRF-Token": csrfToken, // CSRF 토큰 헤더 추가
            },
          }
        );
      })
      .then((response) => {
        if (response.data.success) {
          // LocalStorage에서 로그인 상태 제거
          localStorage.removeItem("testFablabloginState");

          // Jotai 상태 초기화
          setTestFablabloginState({
            isLoggedIn: false, // 로그인 상태 초기화
            userId: null, // userId 초기화
            id: "", // 학번 초기화
          });

          alert("계정이 성공적으로 탈퇴되었습니다."); // 성공 메시지
          navigate("/login"); // 로그인 페이지로 이동
        } else {
          alert("계정 탈퇴 처리에 실패했습니다."); // 실패 메시지
        }
      })
      .catch((error) => {
        console.error("계정 탈퇴 중 오류 발생:", error);
        alert("계정 탈퇴 중 오류가 발생했습니다. 다시 시도해 주세요."); // 에러 메시지
      });
  }; // 계정 탈퇴 기능 끝


  // 좌석 예약 기능 시작
  const handleReservationClick = () => {
    if (!isLoggedIn) {
      alert("로그인이 필요합니다.");
      return;
    }

    if (!selectedSeat) {
      alert("좌석을 선택해주세요.");
      return;
    }

    // CSRF 토큰 가져오기
    getCsrfToken()
      .then((csrfToken) => {
        // 좌석 예약 요청
        return axiosInstance.post(
          "/reservations",
          {
            userId,
            seat_id: selectedSeat,
            book_date: new Date().toISOString().slice(0, 19).replace("T", " "),
          },
          {
            headers: {
              "X-CSRF-Token": csrfToken, // CSRF 토큰 헤더 추가
            },
          }
        );
      })
      .then((response) => {
        alert(`${response.data.message}`);
        setSelectedSeat(""); // 선택된 좌석 초기화

        // 좌석 정보 새로고침
        return axiosInstance.get("/seats");
      })
      .then((response) => {
        const updatedSeats = response.data.seats;
        setSeats(updatedSeats); // 좌석 데이터 갱신
        setBookedSeats(
          updatedSeats
            .filter((seat: { state: string }) => seat.state === "book")
            .map((seat: { seat_id: number }) => seat.seat_id.toString())
        );
      })
      .catch((error) => {
        console.error("예약 요청 실패:", error);
        if (error.response?.status === 403) {
          alert("CSRF 토큰 오류: 요청을 다시 시도해 주세요.");
        } else {
          alert(`예약에 실패했습니다.\n원인: ${error.response?.data?.message || "알 수 없는 오류"}`);
        }
      });
  }; // 좌석 예약 기능 끝

  // 좌석 퇴실 기능 시작
  const handleExitClick = () => {
    // CSRF 토큰 가져오기
    getCsrfToken()
      .then((csrfToken) => {
        // 좌석 퇴실 API 호출
        return axiosInstance.delete("/reservations", {
          headers: {
            "X-CSRF-Token": csrfToken, // CSRF 토큰 헤더 추가
          },
        });
      })
      .then((response) => {
        alert(response.data.message || "좌석 퇴실이 성공적으로 완료되었습니다.");

        // 좌석 정보 갱신
        return axiosInstance.get("/seats");
      })
      .then((response) => {
        const updatedSeats = response.data.seats;
        setSeats(updatedSeats); // 좌석 데이터 갱신
        setBookedSeats(
          updatedSeats
            .filter((seat: { state: string }) => seat.state === "book")
            .map((seat: { seat_id: number }) => seat.seat_id.toString())
        );
      })
      .catch((error) => {
        console.error("퇴실 처리 중 오류 발생:", error);
        if (error.response?.status === 403) {
          alert("CSRF 토큰 오류: 요청을 다시 시도해 주세요.");
        } else {
          alert(error.response?.data?.message || "퇴실 처리 중 오류가 발생했습니다.");
        }
      });
  }; // 좌석 퇴실 기능 끝
  

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
          purpose: "modifyInfo", // 계정 복구용 인증번호 요청
          id,
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


  // 사용자 정보 수정 기능 시작
  const handleModify = () => {
    if (email !== initialEmail && !isVerified) {
      alert("이메일 변경 시 인증이 필요합니다.");
      return;
    }

    // CSRF 토큰 가져오기
    getCsrfToken()
      .then((csrfToken) => {
        // 사용자 정보 수정 요청
        return axiosInstance.patch(
          "/users/modify",
          {
            name,
            email,
            password,
            newpassword: newPassword,
            isVerified,
          },
          {
            headers: {
              "X-CSRF-Token": csrfToken, // CSRF 토큰 헤더 추가
            },
          }
        );
      })
      .then((response) => {
        alert(response.data.message);
        setPassword(""); // 비밀번호 초기화
        setNewPassword(""); // 새 비밀번호 초기화
        setAuthenticationNumber(""); // 인증번호 초기화
      })
      .catch((error) => {
        console.error("사용자 정보 수정 중 오류 발생:", error);
        alert(error.response?.data?.message || "오류가 발생했습니다.");
      });
    };
    // 사용자 정보 수정 기능 끝


  return (
    <div
      css={{
        height: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
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
        예약 페이지
        <div
          className="seat-container"
          css={{
            display: "flex",
            gap: "10px",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          {seats.map((seat: { seat_id: number; name: string; state: string }) => (
            <SeatButton
              key={seat.seat_id}
              name={seat.name} // 좌석 이름
              seat_id={seat.seat_id} // seat_id 전달
              isBooked={seat.state === "book"} // 예약 상태 확인
              handleSeatSelection={handleSeatSelection} // 좌석 선택 함수 전달
              />
            ))}
        </div>


        <div style={{ display: 'flex', gap: '10px' }}>
          <Button sx={{ fontWeight: 'bold' }} variant="outlined" onClick={handleReservationClick}>
            동의 후 예약
          </Button>
          <Button sx={{ fontWeight: 'bold' }} variant="outlined" onClick={handleExitClick}>
            퇴실하기
          </Button>
        </div>

        {isLoggedIn && <Button onClick={handleLogoutClick} variant="outlined" sx={{ color: red[500] }}>로그아웃</Button>}
        {!isLoggedIn && (
          <Button variant="outlined">
            <Link to={"/login"}>로그인</Link>
          </Button>
        )}

        <Button variant="outlined" onClick={handleAccountWithdrawalClick} sx={{ color: red[500] }}>
          계정 탈퇴
        </Button>
      </Paper>

      <FormControl>
        <Paper
          sx={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "flex-start",
            padding: "20px",
            gap: "20px",
          }}
        >
          <h2>내 정보</h2>
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
            <Button 
            disabled
            variant="contained" 
            fullWidth
            id="id"
            sx={{ justifyContent: "flex-start",
              fontSize: "12pt",
              fontWeight: "bold",
              }}
            >
            학번: {id}
            </Button>

            <Button 
            disabled
            variant="contained"
            fullWidth 
            id="id"
            sx={{ justifyContent: "flex-start",
              fontSize: "12pt",
              fontWeight: "bold",
              }}
            >
            이름: {name}
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
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          id="email" />
          <Button variant="contained" onClick={requestVerificationCode} fullWidth>
            이메일 수정하기
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
          label="현재 비밀번호" />

          <TextField 
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          id="newpassword" 
          type="password" 
          label="새 비밀번호" />

          <Button variant="contained" fullWidth onClick={handleModify}>
            재설정
          </Button>
        </Paper>
      </FormControl>
      
    </div>
  );
};

export default Main;
