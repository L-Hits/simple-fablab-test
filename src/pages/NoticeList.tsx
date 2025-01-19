import { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Box,
  Paper,
  Pagination,
  CircularProgress,
} from "@mui/material";
import { useSearchParams, Link } from "react-router-dom";
import { useAtom } from "jotai";
import { currentPageAtom } from "../states"; // Atom import
import axiosInstance from "../utils/axiosInstance"; // Axios 인스턴스 가져오기

const NoticeList = () => {
  interface Notice {
    notice_id: number;
    title: string;
    date: string;
    views: number;
  }

  const [notices, setNotices] = useState<Notice[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [searchParams, setSearchParams] = useSearchParams();
  const [currentPage, setCurrentPage] = useAtom(currentPageAtom); // Atom 사용
  const noticesPerPage = 10; // 한 페이지당 공지사항 개수

  // 공지사항 목록 조회 API 시작
  const fetchNotices = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await axiosInstance.get("/notice"); // API 호출
      setNotices(response.data.notices || []);
    } catch (err) {
      console.error("공지사항 데이터를 가져오는 중 오류 발생:", err);
      setError("공지사항 데이터를 불러오는 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };
  // 공지사항 목록 조회 API 끝

  useEffect(() => {
    fetchNotices(); // 컴포넌트가 마운트될 때 공지사항 데이터를 가져옴

    // URL에서 페이지 정보 복원
    const page = searchParams.get("page");
    if (page) {
      setCurrentPage(parseInt(page, 10));
    }
  }, []); // 빈 배열로 컴포넌트 마운트 시에만 실행

  // Pagination 계산
  const indexOfLastNotice = currentPage * noticesPerPage;
  const indexOfFirstNotice = indexOfLastNotice - noticesPerPage;
  const currentNotices = notices.slice(indexOfFirstNotice, indexOfLastNotice);

  // 페이지 변경 처리
  const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
    setCurrentPage(value); // Atom 값 업데이트
    setSearchParams({ page: value.toString() }); // URL 업데이트
  };

  return (
    <Box
      sx={{
        maxWidth: 800,
        margin: "0 auto",
        padding: "20px",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Typography variant="h5" gutterBottom>
        공지사항
      </Typography>
      <Link to={'/login'}>메인화면으로</Link>

      {loading ? (
        <CircularProgress />
      ) : error ? (
        <Typography color="error">{error}</Typography>
      ) : (
        <>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell align="center">번호</TableCell>
                  <TableCell align="center">제목</TableCell>
                  <TableCell align="center">작성일자</TableCell>
                  <TableCell align="center">조회수</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {currentNotices.map((notice, index) => (
                  <TableRow key={notice.notice_id}>
                    <TableCell align="center">
                      {(currentPage - 1) * noticesPerPage + index + 1}
                    </TableCell>
                    <TableCell align="center">
                    <Link to={`/notice/${notice.notice_id}`}>{notice.title}</Link> {/* 제목을 클릭 시 상세 페이지로 이동 */}
                    </TableCell>
                    <TableCell align="center">{notice.date}</TableCell>
                    <TableCell align="center">{notice.views}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          <Box sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
            <Pagination
              count={Math.ceil(notices.length / noticesPerPage)}
              page={currentPage}
              onChange={handlePageChange}
            />
          </Box>
        </>
      )}
    </Box>
  );
};

export default NoticeList;
