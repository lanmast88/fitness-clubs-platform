import { Navigate, Route, Routes } from "react-router-dom";

import ProtectedRoute from "./components/ProtectedRoute";
import Account from "./pages/AccountPage";
import ClubPage from "./pages/ClubPage";
import FAQPage from "./pages/FAQPage";
import LoginPage from "./pages/LoginPage";
import MainPage from "./pages/MainPage";
import News from "./pages/NewsPage";
import PromotionsPage from "./pages/PromotionsPage";
import RegistrationForm from "./pages/RegistrationForm";
import TariffsPage from "./pages/TariffsPage";

function App() {
  return (
    <Routes>
      <Route path="/" element={<MainPage />} />
      <Route path="/tariffs" element={<TariffsPage />} />
      <Route path="/promotions" element={<PromotionsPage />} />
      <Route path="/faq" element={<FAQPage />} />
      <Route path="/clubs/:id" element={<ClubPage />} />
      <Route path="/registration" element={<RegistrationForm />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/news" element={<News />} />
      <Route
        path="/account"
        element={
          <ProtectedRoute>
            <Account />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
