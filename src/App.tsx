import { BrowserRouter, Route, Routes } from "react-router";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Main from "./pages/Main";
import ChangePw from "./pages/ChangePw";
import AccountRecovery from "./pages/AccountRecovery";
import MyReservationInfo from "./pages/MyReservationInfo";
import NoticeList from "./pages/NoticeList";
import NoticeContents from "./pages/NoticeContents";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Main />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/changepw" element={<ChangePw />} />
        <Route path="/accountrecovery" element={<AccountRecovery />} />
        <Route path="/myreservationinfo" element={<MyReservationInfo />} />
        <Route path="/notice" element={<NoticeList />} />
        <Route path="/notice/:id" element={<NoticeContents />} /> {/* 공지사항 상세 */}
      </Routes>
    </BrowserRouter>
  );
}

export default App;
