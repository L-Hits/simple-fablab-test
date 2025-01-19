import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Box, Typography, Paper, CircularProgress } from "@mui/material";
import axiosInstance from "../utils/axiosInstance"; // Axios 인스턴스 가져오기

const NoticeContents = () => {
  interface Notice {
    title: string;
    author_name: string;
    content: string;
  }

  const { id } = useParams<{ id: string }>(); // URL에서 공지사항 ID를 가져옴
  const [notice, setNotice] = useState<Notice | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 공지사항 내용 조회 API 시작
  const fetchNotice = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await axiosInstance.get(`/notice/${id}`); // 공지사항 ID를 기반으로 API 호출
      setNotice(response.data.notice);
    } catch (err) {
      console.error("공지사항 데이터를 가져오는 중 오류 발생:", err);
      setError("공지사항 데이터를 불러오는 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };
    // 공지사항 내용 조회 API 끝

  // 조회수 증가 API 시작
  const incrementViews = async () => {
    try {
      const csrfToken = await axiosInstance.get("/csrf-token").then((res) => res.data.csrfToken);
      await axiosInstance.patch(
        `/notice/${id}/increment-views`,
        {},
        {
          headers: {
            "CSRF-Token": csrfToken, // CSRF 토큰 추가
          },
        }
      );
    } catch (err) {
      console.error("조회수 증가 중 오류 발생:", err);
    }
  };
  // 조회수 증가 API 끝

  useEffect(() => {
    fetchNotice(); // 공지사항 데이터 가져오기
    incrementViews(); // 조회수 증가
  }, [id]);

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
      <Link to="/notice" style={{ textDecoration: "none", marginBottom: "20px" }}>
        <Typography variant="h6" color="primary">
          &lt; 공지사항 목록으로
        </Typography>
      </Link>

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", marginTop: "20px" }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Typography color="error" sx={{ marginTop: "20px" }}>
          {error}
        </Typography>
      ) : (
        <Paper sx={{ padding: "20px" }}>
          <Typography variant="h5" gutterBottom>
            제목: {notice?.title}
          </Typography>
          <Typography variant="subtitle1" gutterBottom>
            작성자: {notice?.author_name}
          </Typography>
          <Box
            sx={{
              marginTop: "20px",
              padding: "10px",
              border: "1px solid #ddd",
              borderRadius: "4px",
              backgroundColor: "#f9f9f9",
            }}
          >
            <Typography>{notice?.content}</Typography>
          </Box>
        </Paper>
      )}
    </Box>
  );
};

export default NoticeContents;
