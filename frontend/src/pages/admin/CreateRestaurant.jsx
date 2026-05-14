import { useState } from "react";

import {
    createRestaurant,
} from "../../services/adminService";


// ==========================================
// CREATE RESTAURANT PAGE
// ==========================================
export default function CreateRestaurant({

    refreshRestaurants,
    setActivePage,

}) {

    // ==========================================
    // FORM STATE
    // ==========================================
    const [formData, setFormData] = useState({

        name: "",
        gst_number: "",
        address: "",

    });


    // ==========================================
    // HANDLE INPUT CHANGE
    // ==========================================
    const handleChange = (e) => {

        setFormData({

            ...formData,

            [e.target.name]: e.target.value,
        });
    };


    // ==========================================
    // CREATE RESTAURANT
    // ==========================================
    const handleSubmit = async (e) => {

        e.preventDefault();

        try {

            await createRestaurant(formData);

            alert("Restaurant created successfully");

            // Full reload after delete
            window.location.href = "/admin";

        } catch (error) {

            alert(
                error.response?.data?.detail ||
                "Failed to create restaurant"
            );
        }
    };


    return (

        <div>

            <h2 className="fw-bold mb-4">

                Create New Branch

            </h2>


            <div className="card shadow-sm border-0">

                <div className="card-body">

                    <form onSubmit={handleSubmit}>

                        {/* NAME */}
                        <div className="mb-3">

                            <label className="form-label">

                                Restaurant Name

                            </label>

                            <input
                                type="text"
                                name="name"
                                className="form-control"
                                value={formData.name}
                                onChange={handleChange}
                                required
                            />

                        </div>


                        {/* GST */}
                        <div className="mb-3">

                            <label className="form-label">

                                GST Number

                            </label>

                            <input
                                type="text"
                                name="gst_number"
                                className="form-control"
                                value={formData.gst_number}
                                onChange={handleChange}
                                required
                            />

                        </div>


                        {/* ADDRESS */}
                        <div className="mb-3">

                            <label className="form-label">

                                Address

                            </label>

                            <textarea
                                name="address"
                                className="form-control"
                                rows="3"
                                value={formData.address}
                                onChange={handleChange}
                            />

                        </div>


                        <button
                            type="submit"
                            className="btn btn-primary"
                        >

                            Create Branch

                        </button>

                    </form>

                </div>

            </div>

        </div>
    );
}