import { useState } from "react";

import {
    updateRestaurant,
    deleteRestaurant,
} from "../../services/adminService";


// ==========================================
// RESTAURANT PROFILE PAGE
// ==========================================
export default function RestaurantProfile({

    restaurant,refreshRestaurants,
    setActivePage,

}) {

    // ==========================================
    // EDIT MODE STATE
    // ==========================================
    const [isEditing, setIsEditing] =
        useState(false);


    // ==========================================
    // FORM STATE
    // ==========================================
    const [formData, setFormData] =
        useState({

            name:
                restaurant?.name || "",

            address:
                restaurant?.address || "",
        });


    // ==========================================
    // HANDLE INPUT CHANGE
    // ==========================================
    const handleChange = (e) => {

        setFormData({

            ...formData,

            [e.target.name]:
                e.target.value,
        });
    };


    // ==========================================
// UPDATE RESTAURANT
// ==========================================
const handleUpdate =
    async () => {

        try {

            // Update backend
            const updatedRestaurant =
                await updateRestaurant(
                    restaurant.id,
                    formData
                );
                    console.log(updatedRestaurant);
            alert(
                "Restaurant updated successfully"
            );

            // Reload sidebar data
            await refreshRestaurants();

            // Reload profile page with updated data
            setActivePage({

                type: "restaurant-profile",

                restaurant: updatedRestaurant,
            });

            // Exit edit mode
            setIsEditing(false);

        } catch (error) {

            alert(
                error.response?.data?.detail ||
                "Failed to update restaurant"
            );
        }
    };


        // ==========================================
// DELETE RESTAURANT
// ==========================================
const handleDelete = async () => {

    const confirmDelete =
        window.confirm(
            "Are you sure you want to delete this restaurant?"
        );

    if (!confirmDelete) {

        return;
    }

    try {

        // Delete branch
        await deleteRestaurant(
            restaurant.id
        );

        alert(
            "Restaurant deleted successfully"
        );

        // Full reload after delete
window.location.href = "/admin";

    } catch (error) {

        alert(
            error.response?.data?.detail ||
            "Failed to delete restaurant"
        );
    }
};


    return (

        <div>

            {/* ==========================================
                PAGE HEADER
            ========================================== */}
            <div
                className="
                    d-flex
                    justify-content-between
                    align-items-center
                    mb-4
                "
            >

                <div>

                    <h2 className="fw-bold mb-1">

                        Restaurant Profile

                    </h2>

                    <p className="text-muted">

                        Manage branch details

                    </p>

                </div>


                {/* ==========================================
                    ACTION BUTTONS
                ========================================== */}
                <div
                    className="
                        d-flex
                        gap-2
                    "
                >

                    {/* EDIT BUTTON */}
                    {!isEditing ? (

                        <button
                            className="
                                btn
                                btn-primary
                            "
                            onClick={() =>
                                setIsEditing(true)
                            }
                        >

                            Edit

                        </button>

                    ) : (

                        <button
                            className="
                                btn
                                btn-success
                            "
                            onClick={handleUpdate}
                        >

                            Save

                        </button>
                    )}


                    {/* DELETE BUTTON */}
                    <button
                        className="
                            btn
                            btn-danger
                        "
                        onClick={handleDelete}
                        disabled={restaurant?.is_primary}
                    >

                        {restaurant?.is_primary
        ? "Primary Branch"
        : "Delete"
    }

                    </button>

                </div>

            </div>



            {/* ==========================================
                RESTAURANT DETAILS CARD
            ========================================== */}
            <div
                className="
                    card
                    shadow-sm
                    border-0
                "
            >

                <div className="card-body">

                    <div className="row g-4">

                        {/* ==========================================
                            RESTAURANT NAME
                        ========================================== */}
                        <div className="col-md-6">

                            <label
                                className="
                                    text-muted
                                    small
                                "
                            >

                                Restaurant Name

                            </label>


                            {!isEditing ? (

                                <h5>

                                    {restaurant?.name}

                                </h5>

                            ) : (

                                <input
                                    type="text"
                                    name="name"
                                    className="form-control"
                                    value={formData.name}
                                    onChange={handleChange}
                                />
                            )}

                        </div>



                        {/* ==========================================
                            STATUS
                        ========================================== */}
                        <div className="col-md-6">

                            <label
                                className="
                                    text-muted
                                    small
                                "
                            >

                                Status

                            </label>

                            <h5
                                className="
                                    text-capitalize
                                "
                            >

                                {restaurant?.status}

                            </h5>

                        </div>



                        {/* ==========================================
                            GST NUMBER
                        ========================================== */}
                        <div className="col-md-6">

                            <label
                                className="
                                    text-muted
                                    small
                                "
                            >

                                GST Number

                            </label>

                            <h5>

                                {restaurant?.gst_number}

                            </h5>

                        </div>



                        {/* ==========================================
                            ADDRESS
                        ========================================== */}
                        <div className="col-md-6">

                            <label
                                className="
                                    text-muted
                                    small
                                "
                            >

                                Address

                            </label>


                            {!isEditing ? (

                                <h5>

                                    {restaurant?.address ||
                                        "No address added"}

                                </h5>

                            ) : (

                                <textarea
                                    name="address"
                                    rows="3"
                                    className="form-control"
                                    value={formData.address}
                                    onChange={handleChange}
                                />
                            )}

                        </div>

                    </div>

                </div>

            </div>

        </div>
    );
}