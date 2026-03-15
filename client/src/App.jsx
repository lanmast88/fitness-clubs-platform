import { Navigate, Route, Routes } from "react-router-dom";
import MainPage from "./pages/MainPage";
import TariffsPage from "./pages/TariffsPage";

function App() {
  return (
    <Routes>
      <Route path="/" element={<MainPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
      <Route path="/tariffs" element={<TariffsPage />} />
    </Routes>
  );
}

export default App;
