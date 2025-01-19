import { BrowserRouter, Route, Routes } from "react-router";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Main from "./pages/Main";
import ChangePw from "./pages/ChangePw";
import AccountRecovery from "./pages/AccountRecovery";
import MyReservationInfo from "./pages/MyReservationInfo";

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
      </Routes>
    </BrowserRouter>
  );
}

export default App;
