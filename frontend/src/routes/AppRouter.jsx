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

import CashierPage from "../pages/cashier/CashierPage";
import POSMainDashboard from "../pages/pos/POSMainDashboard";

import WaiterDashboard from "../pages/waiter/WaiterDashboard";
import KitchenDashboard from "../pages/kitchen/KitchenDashboard";
import ManagerDashboard from "../pages/manager/ManagerDashboard";
import CustomerRegisterPage from "../pages/auth/CustomerRegisterPage";
import CustomerLoginPage from "../pages/auth/CustomerLoginPage";
import CustomerDashboard from "../pages/customer/CustomerDashboard";
import OrderPage from "../pages/customer/OrderPage";
import DeliveryDashboard from "../pages/delivery/deliveryDashboard";
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
                path="/customer/register"
                element={<CustomerRegisterPage />}
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
                    element={<LoginPage />}
                />

                <Route
                    path="/customer/login"
                    element={<CustomerLoginPage />}
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
                            <POSMainDashboard />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/kitchen"
                    element={
                        <ProtectedRoute>
                            <KitchenDashboard />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/cashier"
                    element={
                        <ProtectedRoute>
                            <CashierPage />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/waiter"
                    element={
                        <ProtectedRoute>
                            <WaiterDashboard />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/manager"
                    element={
                        <ProtectedRoute>
                            <ManagerDashboard />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/customer"
                    element={
                        <ProtectedRoute>
                            <CustomerDashboard />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/restaurants/:restaurantId/menu"
                    element={
                        <ProtectedRoute>
                            <OrderPage />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/delivery"
                    element={
                        <ProtectedRoute>
                            <DeliveryDashboard />
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