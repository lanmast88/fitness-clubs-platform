import { Navigate, Route, Routes } from "react-router-dom";
import MainPage from "./pages/MainPage";
import TariffsPage from "./pages/TariffsPage";
import ClubPage from "./pages/ClubPage";
import RegistrationForm from "./pages/RegistrationForm";
import PromotionsPage from "./pages/PromotionsPage";
import FAQPage from "./pages/FAQPage";
import News from "./pages/NewsPage";

function App() {
  return (
    <Routes>
      <Route path="/" element={<MainPage />} />
      <Route path="/tariffs" element={<TariffsPage />} />
      <Route path="/promotions" element={<PromotionsPage />} />
      <Route path="/faq" element={<FAQPage />} />
      <Route path="/clubs/:id" element={<ClubPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
      <Route path="/registration" element={<RegistrationForm />} />
      <Route path="/news" element={<News />} />
    </Routes>
  );
}

export default App;
