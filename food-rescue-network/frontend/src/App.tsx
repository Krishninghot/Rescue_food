import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { ToastProvider } from "./components/Toast";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Chatbot from "./components/Chatbot";
import ProtectedRoute from "./components/ProtectedRoute";

import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Register from "./pages/Register";
import RestaurantDashboard from "./pages/RestaurantDashboard";
import CreateDonation from "./pages/CreateDonation";
import NGODashboard from "./pages/NGODashboard";
import VolunteerDashboard from "./pages/VolunteerDashboard";
import AdminDashboard from "./pages/AdminDashboard";

export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <BrowserRouter>
          <div className="min-h-screen flex flex-col">
            <Navbar />
            <main className="flex-1">
              <Routes>
                <Route path="/" element={<Landing />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />

                <Route path="/restaurant" element={
                  <ProtectedRoute roles={["restaurant"]}><RestaurantDashboard /></ProtectedRoute>
                } />
                <Route path="/restaurant/new" element={
                  <ProtectedRoute roles={["restaurant"]}><CreateDonation /></ProtectedRoute>
                } />
                <Route path="/ngo" element={
                  <ProtectedRoute roles={["ngo"]}><NGODashboard /></ProtectedRoute>
                } />
                <Route path="/volunteer" element={
                  <ProtectedRoute roles={["volunteer"]}><VolunteerDashboard /></ProtectedRoute>
                } />
                <Route path="/admin" element={
                  <ProtectedRoute roles={["admin"]}><AdminDashboard /></ProtectedRoute>
                } />
              </Routes>
            </main>
            <Footer />
            <Chatbot />
          </div>
        </BrowserRouter>
      </ToastProvider>
    </AuthProvider>
  );
}
