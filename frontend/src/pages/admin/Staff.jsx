import { useEffect, useState } from "react";

import {
    createStaff,
    getStaffList,
    deleteStaff,
    updateStaff,
} from "../../services/adminService";
import { useSelector, } from "react-redux";

// ==========================================
// STAFF MANAGEMENT PAGE
// ==========================================
export default function Staff() {

    // ==========================================
    // STAFF LIST
    // ==========================================
    const [staffList, setStaffList] = useState([]);


    // ==========================================
    // ALERT MESSAGE
    // ==========================================
    const [alert, setAlert] = useState(null);


    // ==========================================
    // CREATE MODAL STATE
    // ==========================================
    const [showCreateModal, setShowCreateModal] =
        useState(false);


    // ==========================================
    // EDIT MODAL STATE
    // ==========================================
    const [showEditModal, setShowEditModal] =
        useState(false);


    // ==========================================
    // EDITING STAFF
    // ==========================================
    const [selectedStaff, setSelectedStaff] =
        useState(null);


    // ==========================================
    // FORM STATE
    // ==========================================
    const [formData, setFormData] = useState({

        username: "",
        email: "",
        phone: "",
        password: "",
        role: "cashier",
    });

    // ==========================================
    // GET ACTIVE BRANCH
    // ==========================================
    const activeRestaurant =
    useSelector(
        (state) =>
            state.restaurant.activeRestaurant
    );


    // ==========================================
    // FETCH STAFF ON LOAD
    // ==========================================
    useEffect(() => {
        if (activeRestaurant?.id) {
            fetchStaffList();
        }
    }, [activeRestaurant]);


    // ==========================================
    // GET STAFF LIST
    // ==========================================
    const fetchStaffList = async () => {

        try {

            const data = await getStaffList(activeRestaurant?.id);

            setStaffList(data);

        } catch (error) {

            setAlert({
                type: "danger",
                message: "Failed to fetch staff list.",
            });
        }
    };


    // ==========================================
    // HANDLE INPUT CHANGES
    // ==========================================
    const handleChange = (e) => {

        setFormData({

            ...formData,

            [e.target.name]: e.target.value,
        });
    };


    // ==========================================
    // CREATE STAFF
    // ==========================================
    const handleCreateStaff = async (e) => {

        e.preventDefault();

        try {

            await createStaff({
                ...formData,
                restaurant_id:activeRestaurant.id,});

            fetchStaffList();

            setShowCreateModal(false);

            setAlert({
                type: "success",
                message: "Staff created successfully.",
            });

        } catch (error) {

    console.log(
        error.response?.data
    );

    const backendErrors =
        error.response?.data;

    let errorMessage =
        "Failed to create staff.";

    // ==========================================
    // HANDLE DRF VALIDATION ERRORS
    // ==========================================
    if (
        backendErrors &&
        typeof backendErrors === "object"
    ) {

        const firstKey =
            Object.keys(backendErrors)[0];

        const firstValue =
            backendErrors[firstKey];

        // Array error
        if (Array.isArray(firstValue)) {

            errorMessage =
                firstValue[0];
        }

        // String error
        else if (
            typeof firstValue === "string"
        ) {

            errorMessage =
                firstValue;
        }
    }

    setAlert({

        type: "danger",

        message: errorMessage,
    });
}
    };


    // ==========================================
    // OPEN EDIT MODAL
    // ==========================================
    const openEditModal = (staff) => {

        setSelectedStaff(staff);

        setFormData({

            username: staff.username,

            email: staff.email,
        });

        setShowEditModal(true);
    };


    // ==========================================
    // UPDATE STAFF
    // ==========================================
    const handleUpdateStaff = async (e) => {

        e.preventDefault();

        try {

            await updateStaff(
                selectedStaff.id,
                {
                    username: formData.username,
                    email: formData.email,
                }
            );

            fetchStaffList();

            setShowEditModal(false);

            setAlert({
                type: "success",
                message: "Staff updated successfully.",
            });

        } catch (error) {

            setAlert({
                type: "danger",
                message: "Failed to update staff.",
            });
        }
    };


    // ==========================================
    // DELETE STAFF
    // ==========================================
    const handleDeleteStaff = async (staffId) => {

        try {

            await deleteStaff(staffId);

            fetchStaffList();

            setAlert({
                type: "success",
                message: "Staff deactivated successfully.",
            });

        } catch (error) {

            setAlert({
                type: "danger",
                message: "Failed to deactivate staff.",
            });
        }
    };


    return (

        <div>

            {/* ==========================================
                ALERT MESSAGE
            ========================================== */}
            {alert && (

                <div
                    className={`alert alert-${alert.type}`}
                >

                    {alert.message}

                </div>

            )}



            {/* ==========================================
                PAGE HEADER
            ========================================== */}
            <div className="d-flex justify-content-between mb-4">

                <h2 className="fw-bold">
                    Staff Management
                </h2>


                <button
                    className="btn btn-primary"
                    onClick={() => setShowCreateModal(true)}
                >
                    Create Staff
                </button>

            </div>



            {/* ==========================================
                STAFF TABLE
            ========================================== */}
            <div className="card border-0 shadow-sm">

                <div className="card-body">

                    <table className="table align-middle">

                        <thead>

                            <tr>
                                <th>Name</th>
                                <th>Email</th>
                                <th>Role</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>

                        </thead>


                        <tbody>

                            {staffList.map((staff) => (

                                <tr key={staff.id}>

                                    <td>
                                        {staff.username}
                                    </td>

                                    <td>
                                        {staff.email}
                                    </td>

                                    <td>
                                        {staff.role}
                                    </td>

                                    <td>

                                        <span
                                            className={`badge${staff.is_active
                                                ? "bg-success"
                                                : "bg-danger"
                                                }`}>

                                            {staff.is_active
                                                ? "Active"
                                                : "Disabled"}

                                        </span>

                                    </td>

                                    <td>

                                        {/* EDIT BUTTON */}
                                        <button
                                            className="btn btn-warning btn-sm me-2"
                                            onClick={() =>
                                                openEditModal(staff)
                                            }
                                        >
                                            Edit
                                        </button>


                                        {/* DISABLE/ENABLE BUTTON */}
                                        <button
                                            className={`
        btn
        btn-sm
        ${staff.is_active
                                                    ? "btn-danger"
                                                    : "btn-success"
                                                }
    `}
                                            onClick={() =>
                                                handleDeleteStaff(staff.id)
                                            }
                                        >

                                            {staff.is_active
                                                ? "Disable"
                                                : "Enable"}

                                        </button>

                                    </td>

                                </tr>

                            ))}

                        </tbody>

                    </table>

                </div>

            </div>



            {/* ==========================================
                CREATE MODAL
            ========================================== */}
            {showCreateModal && (

                <ModalWrapper
                    title="Create Staff"
                    onClose={() =>
                        setShowCreateModal(false)
                    }
                    onSubmit={handleCreateStaff}
                >

                    <CreateStaffForm
                        formData={formData}
                        handleChange={handleChange}
                    />

                </ModalWrapper>

            )}



            {/* ==========================================
                EDIT MODAL
            ========================================== */}
            {showEditModal && (

                <ModalWrapper
                    title="Edit Staff"
                    onClose={() =>
                        setShowEditModal(false)
                    }
                    onSubmit={handleUpdateStaff}
                >

                    <EditStaffForm
                        formData={formData}
                        handleChange={handleChange}
                    />

                </ModalWrapper>

            )}

        </div>
    );
}



// ==========================================
// REUSABLE MODAL WRAPPER
// ==========================================
function ModalWrapper({

    title,
    children,
    onClose,
    onSubmit,

}) {

    return (

        <div className="modal d-block">

            <div className="modal-dialog">

                <div className="modal-content">

                    <div className="modal-header">

                        <h5 className="modal-title">
                            {title}
                        </h5>

                        <button
                            className="btn-close"
                            onClick={onClose}
                        ></button>

                    </div>


                    <form onSubmit={onSubmit}>

                        <div className="modal-body">

                            {children}

                        </div>


                        <div className="modal-footer">

                            <button
                                type="button"
                                className="btn btn-secondary"
                                onClick={onClose}
                            >
                                Cancel
                            </button>

                            <button
                                type="submit"
                                className="btn btn-primary"
                            >
                                Save
                            </button>

                        </div>

                    </form>

                </div>

            </div>

        </div>
    );
}



// ==========================================
// CREATE STAFF FORM
// ==========================================
function CreateStaffForm({

    formData,
    handleChange,

}) {

    return (

        <>
            <InputField
                label="Username"
                name="username"
                value={formData.username}
                handleChange={handleChange}
            />

            <InputField
                label="Email"
                name="email"
                value={formData.email}
                handleChange={handleChange}
            />

            <InputField
                label="Phone"
                name="phone"
                value={formData.phone}
                handleChange={handleChange}
            />

            <InputField
                label="Password"
                name="password"
                type="password"
                value={formData.password}
                handleChange={handleChange}
            />

            <div className="mb-3">

                <label className="form-label">
                    Role
                </label>

                <select
                    className="form-select"
                    name="role"
                    value={formData.role}
                    onChange={handleChange}
                >

                    <option value="cashier">
                        Cashier
                    </option>

                    <option value="waiter">
                        Waiter
                    </option>

                    <option value="manager">
                        Manager
                    </option>

                    <option value="kitchen">
                        Kitchen
                    </option>

                    <option value="delivery">
                        Delivery
                    </option>

                </select>

            </div>
        </>
    );
}



// ==========================================
// EDIT STAFF FORM
// ==========================================
function EditStaffForm({

    formData,
    handleChange,

}) {

    return (

        <>
            <InputField
                label="Username"
                name="username"
                value={formData.username}
                handleChange={handleChange}
            />

            <InputField
                label="Email"
                name="email"
                value={formData.email}
                handleChange={handleChange}
            />
        </>
    );
}



// ==========================================
// REUSABLE INPUT FIELD
// ==========================================
function InputField({

    label,
    name,
    value,
    handleChange,
    type = "text",

}) {

    return (

        <div className="mb-3">

            <label className="form-label">
                {label}
            </label>

            <input
                type={type}
                className="form-control"
                name={name}
                value={value}
                onChange={handleChange}
                required
            />

        </div>
    );
}