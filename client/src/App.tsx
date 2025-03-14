import "./App.css";
import { Navigate, Route, Routes } from "react-router-dom";
import { Suspense } from "react";
import { useUserContext } from "./contexts/AuthContext";
import ProtectedRoute from "./contexts/ProtectedRoutes";
import useTokenHandler from "./hooks/useTokenHandler";
import NotFound from "./pages/_NotFound";
import Homepage from "./pages/Homepage";
import AdminDashboard from "./pages/admin/AdminDashboard";
import LoadingHydrate from "./motions/LoadingHydrate";
import GuestReservation from "./pages/admin/GuestReservation";
import ManageRooms from "./pages/admin/ManageRooms";
import AdminLayout from "./layout/admin/AdminLayout";
import ForgotPassword from "./pages/ForgotPassword";
import About from "./pages/About";
import Rooms from "./pages/Rooms";
import ManageUsers from "./pages/admin/ManageUsers";
import UserStats from "./pages/admin/UserStats";
import AreaReservations from "./pages/admin/AreaReservations";
import ManageAmenities from "./pages/admin/ManageAmenities";
import Comments from "./pages/admin/Comments";
import Reports from "./pages/admin/Reports";
import RegistrationFlow from "./pages/RegistrationFlow";
import Gallery from "./pages/Gallery";
import GuestProfile from "./pages/guests/GuestProfile";
import Booking from "./pages/Booking";
import ScrollToTop from "./components/ScrollToTop";
import Reservations from "./pages/Reservations";

const App = () => {
  const { isAuthenticated, role, loading } = useUserContext();
  useTokenHandler();

  if (loading) return <LoadingHydrate />;

  return (
    <Suspense fallback={<LoadingHydrate />}>
      <ScrollToTop />
      <Routes>
        <Route
          path="/"
          element={
            isAuthenticated ? (
              role === "admin" ? (
                <Navigate to="/admin" replace />
              ) : (
                <Homepage />
              )
            ) : (
              <Homepage />
            )
          }
        />
        <Route path="/guest/:id" element={<GuestProfile />} />
        <Route path="/registration" element={<RegistrationFlow />} />
        <Route path="/about" element={<About />} />
        <Route path="/reservation" element={<Reservations />} />
        <Route path="/rooms" element={<Rooms />} />
        <Route path="/booking" element={<Booking />} />
        <Route path="/gallery" element={<Gallery />} />
        <Route path="forgot-password" element={<ForgotPassword />} />
        {/* Protected admin routes */}
        <Route element={<ProtectedRoute requiredRole="admin" />}>
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminDashboard />} />
            <Route path="reservations" element={<GuestReservation />} />
            <Route path="rooms" element={<ManageRooms />} />
            <Route path="areas" element={<AreaReservations />} />
            <Route path="amenities" element={<ManageAmenities />} />
            <Route path="comments" element={<Comments />} />
            <Route path="reports" element={<Reports />} />
            <Route path="users" element={<ManageUsers />}>
              <Route path=":id" element={<UserStats />} />
            </Route>
          </Route>
        </Route>
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
};

export default App;
