import { Paper } from "@mui/material";
import { testFablabloginStateAtom } from "../states";
import { useAtomValue, useSetAtom } from "jotai";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import {
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Typography,
    CircularProgress,
    Box,
  } from "@mui/material";

import axiosInstance from "../utils/axiosInstance"; // 중요 Axios 인스턴스 및 Interceptor 설정 함수 불러오기

const MyReservationInfo = () => {
  const { isLoggedIn } = useAtomValue(testFablabloginStateAtom); // 로그인 상태 읽기
  const setTestFablabloginState = useSetAtom(testFablabloginStateAtom); // 상태 업데이트
  
  interface Reservation {
    state: string;
    book_date: string;
    seat_name: string;
    cancel_reason?: string;
  }
  
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error] = useState(null);

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

  
  // 예약 상태 변환 및 날짜 포맷팅 함수
  const transformReservationData = (data: Reservation[]): Reservation[] => {
    return data.map((reservation) => ({
        ...reservation,
        state:
        reservation.state === "book"
            ? "예약중"
            : reservation.state === "end"
            ? "예약종료"
            : reservation.state === "cancel"
            ? "예약종료"
            : reservation.state,
        book_date: new Date(reservation.book_date).toLocaleString("ko-KR", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        }),
        cancel_reason: reservation.cancel_reason || "-", // 빈 값일 경우 기본값 '-'
    }));
    };


  useEffect(() => {   // 로그인 상태 불러오기
    const savedLoginState = localStorage.getItem("testFablabloginState");
    if (savedLoginState) {
      setTestFablabloginState(JSON.parse(savedLoginState));
    }
  }, [setTestFablabloginState]);

  // 예약 정보 조회 API 시작
  const fetchReservations = () => {
    setLoading(true);

    // CSRF 토큰 가져오기
    getCsrfToken()
    .then((csrfToken) => {
        // CSRF 토큰을 포함하여 API 호출
        return axiosInstance.get(`/users/reservations`, {
        headers: {
            "CSRF-Token": csrfToken, // CSRF 보호를 위한 토큰 헤더 추가
        },
        });
    })
    .then((response) => {
        // 응답 데이터 설정
        const transformedData = transformReservationData(
            response.data.reservations || []
        );
        setReservations(transformedData);
    })
    .catch((err) => {
        console.error("예약 정보를 가져오는 중 오류 발생:", err);
    })
    .finally(() => {
        setLoading(false);
    });
};
// 예약 정보 조회 API 끝

    
    

  useEffect(() => {
    if (isLoggedIn) {
      fetchReservations(); // 로그인 상태일 경우 예약 정보 가져오기
    }
  }, [isLoggedIn]);

  if (!isLoggedIn) {
    return (
      <Typography variant="h6" align="center" color="error">
        로그인이 필요합니다.
      </Typography>
    );
  }

  return (
    <Box
      sx={{
        height: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        flexDirection: "column",
        padding: "20px",
      }}
    >
      <Typography variant="h5" gutterBottom>
        내 예약 정보
      </Typography>
      <Link to="/">메인으로</Link>

      {loading ? (
        <CircularProgress />
      ) : error ? (
        <Typography color="error">{error}</Typography>
      ) : (
        <TableContainer component={Paper} sx={{ maxWidth: 800 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell align="center">예약상태</TableCell>
                <TableCell align="center">예약일시</TableCell>
                <TableCell align="center">좌석</TableCell>
                <TableCell align="center">퇴실사유</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {reservations.map((reservation, index) => (
                <TableRow key={index}>
                  <TableCell align="center">
                    <Typography
                        color={reservation.state === "예약중" ? "error" : "inherit"}
                        >{reservation.state}
                    </Typography>
                  </TableCell>
                  <TableCell align="center">{reservation.book_date}</TableCell>
                  <TableCell align="center">{reservation.seat_name}</TableCell>
                  <TableCell align="center">{reservation.cancel_reason || "-"}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
};

export default MyReservationInfo;
