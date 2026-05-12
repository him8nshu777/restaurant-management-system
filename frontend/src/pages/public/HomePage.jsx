import { Navigate, useNavigate } from "react-router-dom";

import { useSelector, useDispatch } from "react-redux";


import { useEffect, useState } from "react";

import { loginSuccess, } from "../../auth/authSlice";

import { getCurrentUser, } from "../../auth/authService";
export default function HomePage() {

    const navigate = useNavigate();
    const [checkingAuth, setCheckingAuth] = useState(true);
    const dispatch = useDispatch();
    const { isAuthenticated, user } =
        useSelector(
            (state) => state.auth
        );
    useEffect(() => {

        const fetchUser =
            async () => {

                if (!isAuthenticated){
                    setCheckingAuth(false);
                    return;
                }

                try {

                    const user =
                        await getCurrentUser();

                    dispatch(
                        loginSuccess({

                            access:
                                localStorage.getItem(
                                    "access"
                                ),

                            refresh:
                                localStorage.getItem(
                                    "refresh"
                                ),

                            user,
                        })
                    );

                } catch (error){

                    // localStorage.clear();
                    console.log(error);
                } finally {

                    setCheckingAuth(false);
                }
            };

        fetchUser();

    }, []);
    if (checkingAuth) {

  return <h1>Loading...</h1>;
}
    if (isAuthenticated) {

        const status =
            user?.restaurant_status;

        if (status === "active") {

            return (
                <Navigate to="/admin" />
            );
        }

        return (
            <Navigate
                to="/account-status"
                state={{
                    status,
                }}
            />
        );
    }

    return (

        <div
            style={{
                minHeight: "100vh",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
                gap: "20px",
            }}
        >

            <h1>
                Restaurant Management System
            </h1>

            <p>
                POS • Kitchen • Inventory • Reports
            </p>

            <div
                style={{
                    display: "flex",
                    gap: "10px",
                }}
            >

                <button
                    onClick={() =>
                        navigate("/login")
                    }
                >
                    Login
                </button>

                <button
                    onClick={() =>
                        navigate("/register")
                    }
                >
                    Register Restaurant
                </button>

            </div>

        </div>
    );
}