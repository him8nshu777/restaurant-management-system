import { useState, useEffect } from "react";

import DashboardLayout from "../../components/admin/dashboard/DashboardLayout";
import RestaurantProfile from "./RestaurantProfile";
import CreateRestaurant from "./CreateRestaurant";
import Reports from "./Reports";
import Staff from "./Staff";
import { getRestaurants } from "../../services/adminService";
import Floor from "../../pages/dashboard/Floor";
import Area from "../../pages/dashboard/Area";

// ==========================================
// ADMIN DASHBOARD CONTROLLER
// ==========================================
export default function Dashboard() {

    // Default page
    const [activePage, setActivePage] = useState({ type: "reports", });
    // ==========================================
    // RESTAURANT STATE
    // ==========================================
    const [restaurants, setRestaurants] = useState([]);

    const [activeRestaurant, setActiveRestaurant] =
        useState(null);

    // ==========================================
// AUTO UPDATE ACTIVE RESTAURANT
// ==========================================
useEffect(() => {

    if (!activeRestaurant || restaurants.length === 0) {
        return;
    }

    // Find updated object
    const updatedRestaurant =
        restaurants.find(
            (r) => r.id === activeRestaurant.id
        );

    // Update selected restaurant
    if (updatedRestaurant) {

        setActiveRestaurant(
            updatedRestaurant
        );
    }

}, [restaurants]);
    
    // ==========================================
    // FETCH ALL RESTAURANTS
    // ==========================================
    const fetchRestaurants = async () => {

        try {

            const data =
                await getRestaurants();

            setRestaurants(data);

            // Default active branch
            if (data.length > 0 && !activeRestaurant) {

                setActiveRestaurant(data[0]);
            }

        } catch (error) {

            console.log(error);
        }
    };


    // ==========================================
    // LOAD RESTAURANTS
    // ==========================================
    useEffect(() => {

        fetchRestaurants();

    }, []);



    // ==========================================
    // PAGE RENDERER
    // ==========================================
    const renderPage = () => {

        switch (activePage.type) {

            case "staff":
                return <Staff />;

            case "reports":
                return <Reports />;

            case "floors":
                return <Floor />;

            case "areas":
                return <Area />;

            case "restaurant-profile":

                return (
                    <RestaurantProfile
                        restaurant={activePage.restaurant}
                        refreshRestaurants={fetchRestaurants}
                        setActivePage={setActivePage}
                    />

                );
            case "create-restaurant":

                return (
                    <CreateRestaurant
                        refreshRestaurants={fetchRestaurants}
                        setActivePage={setActivePage}
                    />
                );

            default:
                return <Reports />;
        }
    };


    return (

        <DashboardLayout
            activePage={activePage}
            setActivePage={setActivePage}
            restaurants={restaurants}

            activeRestaurant={activeRestaurant}

            setActiveRestaurant={setActiveRestaurant}
        >

            {renderPage()}

        </DashboardLayout>
    );
}