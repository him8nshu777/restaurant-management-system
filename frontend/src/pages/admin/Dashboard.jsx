import { useState, useEffect } from "react";

import DashboardLayout from "../../components/admin/dashboard/DashboardLayout";
import RestaurantProfile from "./RestaurantProfile";
import CreateRestaurant from "./CreateRestaurant";
import Reports from "./Reports";
import Staff from "./Staff";
import { getRestaurants } from "../../services/adminService";
import Floor from "../../pages/dashboard/Floor";
import Area from "../../pages/dashboard/Area";
import Table from "../dashboard/Table";

import Categories from "../dashboard/menu/Categories";
import Products from "../dashboard/menu/Product";
import Variants from "../dashboard/menu/Variants";
import Addons from "../dashboard/menu/Addons";
import ProductAddons from "../dashboard/menu/ProductAddons";
import Combos from "../dashboard/menu/Combos";
import ComboProducts from "../dashboard/menu/ComboProducts";
import Taxes from "../dashboard/menu/Taxes";
import ProductTaxes from "../dashboard/menu/ProductTaxes";
import ServiceCharges from "../dashboard/menu/ServiceCharges";
import DynamicPricing from "../dashboard/menu/DynamicPricing";
import ProductDynamicPricing from "../dashboard/menu/ProductDynamicPricing";
import Units from "../dashboard/inventory/Units";
import Ingredients from "../dashboard/inventory/Ingredients";
import Suppliers from "../dashboard/inventory/Suppliers";
import Purchases from "../dashboard/inventory/Purchases";
import InventoryTransactions from "../dashboard/inventory/InventoryTransactions";
import ProductRecipes from "../dashboard/inventory/ProductRecipes";
import ComboRecipes from "../dashboard/inventory/ComboRecipes";
import POSDashboard from "../pos/POSDashboard";
import ComboDynamicPricing from "../dashboard/menu/ComboDynamicPricing";
import OrderList from "../dashboard/orders/OrderList";
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

            case "pos-dashboard":
                return <POSDashboard />;

            case "staff":
                return <Staff />;

            case "reports":
                return <Reports />;

            case "floors":
                return <Floor />;

            case "areas":
                return <Area />;

            case "tables":
                return <Table />;

            case "categories":
                return <Categories />;

            case "products":
                return <Products />;

            case "product-variants":
                return <Variants />;

            case "addons":
                return <Addons />;

            case "product-addons":
                return <ProductAddons />;

            case "combos":
                return <Combos />;

            case "combo-products":
                return <ComboProducts />;

            case "taxes":
                return <Taxes />;

            case "product-taxes":
                return <ProductTaxes />;

            case "service-charges":
                return <ServiceCharges />;

            case "dynamic-pricing":
                return <DynamicPricing />;

            case "product-dynamic-pricing":
                return <ProductDynamicPricing />;

            case "combo-dynamic-pricing":
                return <ComboDynamicPricing />;

            case "units":
                return <Units />;

            case "ingredients":
                return <Ingredients />;

            case "suppliers":
                return <Suppliers />;
                
            case "purchases":
                return <Purchases />;

            case "inventory-transaction":
                return <InventoryTransactions />;

            case "product-recipes":
                return <ProductRecipes />;

            case "combo-recipes":
                return <ComboRecipes />;
                
            case "orders":
                return <OrderList />;

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