import {
    BrowserRouter,
    Routes,
    Route,
} from "react-router-dom";

import ProtectedRoute from "../auth/ProtectedRoute";

import HomePage from "../pages/public/HomePage";

import CheckEmailPage from "../pages/auth/CheckEmailPage";
import VerifyEmailPage from "../pages/auth/VerifyEmailPage";
import RegisterPage from "../pages/auth/RegisterPage";

import LoginPage from "../pages/auth/LoginPage";
import ForgotPasswordPage from "../pages/auth/ForgotPasswordPage";
import ResetPasswordPage from "../pages/auth/ResetPasswordPage";
import AccountStatusPage from "../pages/auth/AccountStatusPage";

import Dashboard from "../pages/admin/Dashboard";

import POSPage from "../pages/pos/POSPage";

import KitchenPage from "../pages/kitchen/KitchenPage";

// import WaiterPage from "../pages/waiter/WaiterPage";

// import ReportsPage from "../pages/manager/ReportsPage";

// import DeliveryPage from "../pages/delivery/DeliveryPage";


export default function AppRouter() {

    return (
        <BrowserRouter>

            <Routes>
                <Route
                path="/"
                element={<HomePage />}
                />

                <Route
                path="/register"
                element={<RegisterPage />}
                />

                <Route
                path="/check-email"
                element={<CheckEmailPage />}
                />
                <Route
                path="/verify-email/:uid/:token"
                element={<VerifyEmailPage />}
                />
                <Route
                    path="/login"
                    element={
                            <LoginPage />
                    }
                />
                <Route
                path="/forgot-password"
                element={<ForgotPasswordPage />}
                />

                <Route
                path="/reset-password/:uid/:token"
                element={<ResetPasswordPage />}
                />
                <Route
                path="/account-status"
                element={<AccountStatusPage/>}
                />

                <Route
                    path="/admin"
                    element={
                        <ProtectedRoute>
                            <Dashboard />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/pos"
                    element={
                        <ProtectedRoute>
                            <POSPage />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/kitchen"
                    element={
                        <ProtectedRoute>
                            <KitchenPage />
                        </ProtectedRoute>
                    }
                />

                {/* <Route
          path="/waiter"
          element={<WaiterPage />}
        />

        <Route
          path="/reports"
          element={<ReportsPage />}
        />

        <Route
          path="/delivery"
          element={<DeliveryPage />}
        /> */}

            </Routes>

        </BrowserRouter>
    );
}