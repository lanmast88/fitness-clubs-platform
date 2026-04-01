import { Navigate, Route, Routes } from "react-router-dom";
import MainPage from "./pages/MainPage";
import TariffsPage from "./pages/TariffsPage";
import ClubPage from "./pages/ClubPage";
import RegistrationForm from "./pages/RegistrationForm";
import PromotionsPage from "./pages/PromotionsPage";
import FAQPage from "./pages/FAQPage";
import News from "./pages/NewsPage";
import Account from "./pages/AccountPage";

function App() {
  return (
    <Routes>
      <Route path="/" element={<MainPage />} />
      <Route path="/tariffs" element={<TariffsPage />} />
      <Route path="/promotions" element={<PromotionsPage />} />
      <Route path="/faq" element={<FAQPage />} />
      <Route path="/clubs/:id" element={<ClubPage />} />
      <Route path="/registration" element={<RegistrationForm />} />
      <Route path="/news" element={<News />} />
      <Route path="/account" element={<Account />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
