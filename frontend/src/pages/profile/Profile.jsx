import { useEffect, useState } from "react";

import {
  getProfile,
  updateProfile,
  createAddress,
  updateAddress,
  deleteAddress,
} from "../../services/profileService";
import { useSelector } from "react-redux";

// ==========================================
// PROFILE PAGE
// ==========================================
export default function Profile() {
  const [profile, setProfile] = useState(null);

  const [loading, setLoading] = useState(true);

  const [isEditing, setIsEditing] = useState(false);

  const [formData, setFormData] = useState({});

  const [showAddressModal, setShowAddressModal] = useState(false);

  const [editingAddress, setEditingAddress] = useState(null);

  const user = useSelector((state) => state.auth.user);

  const [addressForm, setAddressForm] = useState({
    label: "Home",

    address_line_1: "",

    address_line_2: "",

    landmark: "",

    city: "",

    state: "",

    pincode: "",
    is_default: false,
  });

  const role = profile?.role;

  const isStaff = [
    "restaurant_admin",
    "manager",
    "cashier",
    "waiter",
    "kitchen",
    "delivery",
  ].includes(role);

  const isDelivery = role === "delivery";

  const isCustomer = role === "customer";
  // ==========================================
  // FETCH PROFILE
  // ==========================================
  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const data = await getProfile();

      setProfile(data);

      setFormData({
        first_name: data.first_name || "",

        last_name: data.last_name || "",

        date_of_birth: data.profile?.date_of_birth || "",

        gender: data.profile?.gender || "",

        alternate_phone: data.profile?.alternate_phone || "",

        emergency_contact_name: data.profile?.emergency_contact_name || "",

        emergency_contact_phone: data.profile?.emergency_contact_phone || "",

        vehicle_type: data.delivery_profile?.vehicle_type || "",

        vehicle_number: data.delivery_profile?.vehicle_number || "",

        driving_license_number:
          data.delivery_profile?.driving_license_number || "",
      });
    } catch (error) {
      alert("Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  //   address input handler
  const handleAddressChange = (e) => {
    setAddressForm({
      ...addressForm,

      [e.target.name]: e.target.value,
    });
  };
  // save address
  const handleSaveAddress = async () => {
    try {
      if (editingAddress) {
        await updateAddress(editingAddress.id, addressForm);
      } else {
        await createAddress(addressForm);
      }

      setShowAddressModal(false);

      setEditingAddress(null);

      setAddressForm({
        label: "Home",

        address_line_1: "",

        address_line_2: "",

        landmark: "",

        city: "",

        state: "",

        pincode: "",
      });

      fetchProfile();
    } catch {
      alert("Failed to save address");
    }
  };

  const handleEditAddress = (address) => {
    setEditingAddress(address);

    setAddressForm({
      label: address.label,

      address_line_1: address.address_line_1,

      address_line_2: address.address_line_2,

      landmark: address.landmark,

      city: address.city,

      state: address.state,

      pincode: address.pincode,
      is_default: address.is_default,
    });

    setShowAddressModal(true);
  };

  const handleDeleteAddress = async (id) => {
    if (!window.confirm("Delete this address?")) {
      return;
    }

    try {
      await deleteAddress(id);

      fetchProfile();
    } catch {
      alert("Failed to delete address");
    }
  };

  // ==========================================
  // INPUT CHANGE
  // ==========================================
  const handleChange = (e) => {
    setFormData({
      ...formData,

      [e.target.name]: e.target.value,
    });
  };

  // ==========================================
  // SAVE PROFILE
  // ==========================================
  const handleSave = async () => {
    try {
      const updated = await updateProfile(formData);

      setProfile(updated);

      setIsEditing(false);

      alert("Profile updated successfully");
    } catch (error) {
      console.log(error.response?.data);

      alert(JSON.stringify(error.response?.data));
    }
  };

  if (loading) {
    return <p>Loading...</p>;
  }

  return (
    <div>
      {/* HEADER */}

      <div
        className="
                    d-flex
                    justify-content-between
                    align-items-center
                    mb-4
                "
      >
        <div>
          <h2
            className="
                            fw-bold
                            mb-1
                        "
          >
            My Profile
          </h2>

          <p className="text-muted">Manage account information</p>
        </div>

        {!isEditing ? (
          <button
            className="
                            btn
                            btn-primary
                        "
            onClick={() => setIsEditing(true)}
          >
            Edit
          </button>
        ) : (
          <button
            className="
                            btn
                            btn-success
                        "
            onClick={handleSave}
          >
            Save
          </button>
        )}
      </div>

      {/* CARD */}

      <div
        className="
                    card
                    border-0
                    shadow-sm
                "
      >
        <div className="card-body">
          <div className="row g-4">
            {/* FIRST NAME */}

            <Field
              label="First Name"
              value={profile.first_name}
              editable={isEditing}
              name="first_name"
              formData={formData}
              handleChange={handleChange}
            />

            {/* LAST NAME */}

            <Field
              label="Last Name"
              value={profile.last_name}
              editable={isEditing}
              name="last_name"
              formData={formData}
              handleChange={handleChange}
            />

            {/* EMAIL */}

            <StaticField label="Email" value={profile.email} />

            {/* PHONE */}

            <StaticField label="Phone" value={profile.phone} />

            {/* ROLE */}

            <StaticField label="Role" value={profile.role} />

            {/* DOB */}

            <Field
              label="Date Of Birth"
              value={profile.profile?.date_of_birth}
              editable={isEditing}
              name="date_of_birth"
              type="date"
              formData={formData}
              handleChange={handleChange}
            />

            {/* GENDER */}

            <SelectField
              label="Gender"
              editable={isEditing}
              name="gender"
              value={profile.profile?.gender}
              formData={formData}
              handleChange={handleChange}
              options={[
                { value: "Male", label: "Male" },
                { value: "Female", label: "Female" },
                { value: "Other", label: "Other" },
              ]}
            />

            {/* ALT PHONE */}

            <Field
              label="Alternate Phone"
              value={profile.profile?.alternate_phone}
              editable={isEditing}
              name="alternate_phone"
              formData={formData}
              handleChange={handleChange}
            />

            {/* EMERGENCY */}

            <Field
              label="Emergency Contact Name"
              value={profile.profile?.emergency_contact_name}
              editable={isEditing}
              name="emergency_contact_name"
              formData={formData}
              handleChange={handleChange}
            />

            <Field
              label="Emergency Contact Phone"
              value={profile.profile?.emergency_contact_phone}
              editable={isEditing}
              name="emergency_contact_phone"
              formData={formData}
              handleChange={handleChange}
            />
          </div>
        </div>
      </div>

      {/* STAFF SECTION */}

      {isStaff && profile.staff_profile && (
        <div className="card border-0 shadow-sm mt-4">
          <div className="card-body">
            <h5 className="mb-3">Staff Information</h5>

            <div className="row">
              <StaticField
                label="Employee ID"
                value={profile.staff_profile.employee_id}
              />

              <StaticField
                label="Joining Date"
                value={profile.staff_profile.joining_date}
              />

              <StaticField
                label="Salary"
                value={profile.staff_profile.salary}
              />

              <StaticField
                label="Active Staff"
                value={profile.staff_profile.is_active_staff ? "Yes" : "No"}
              />
            </div>
          </div>
        </div>
      )}

      {/* DELIVERY SECTION */}

      {isDelivery && (
        <div className="card border-0 shadow-sm mt-4">
          <div className="card-body">
            <h5 className="mb-3">Delivery Information</h5>

            <div className="row">
              <SelectField
                label="Vehicle Type"
                editable={isEditing}
                name="vehicle_type"
                value={profile.delivery_profile?.vehicle_type}
                formData={formData}
                handleChange={handleChange}
                options={[
                  { value: "bike", label: "Bike" },
                  { value: "scooter", label: "Scooter" },
                  { value: "car", label: "Car" },
                  { value: "cycle", label: "Cycle" },
                ]}
              />

              <Field
                label="Vehicle Number"
                value={profile.delivery_profile?.vehicle_number}
                editable={isEditing}
                name="vehicle_number"
                formData={formData}
                handleChange={handleChange}
              />

              <Field
                label="Driving License Number"
                value={profile.delivery_profile?.driving_license_number}
                editable={isEditing}
                name="driving_license_number"
                formData={formData}
                handleChange={handleChange}
              />
            </div>
          </div>
        </div>
      )}

      {/* CUSTOMER SECTION */}

      {/* {isCustomer && profile.customer_profile && (
  <div className="card border-0 shadow-sm mt-4">
    <div className="card-body">
      <h5 className="mb-3">Customer Information</h5>

      <div className="row">
        <StaticField
          label="Loyalty Points"
          value={profile.customer_profile.loyalty_points}
        />

        <StaticField
          label="Total Orders"
          value={profile.customer_profile.total_orders}
        />

        <StaticField
          label="Total Spent"
          value={profile.customer_profile.total_spent}
        />

        <StaticField
          label="Last Order"
          value={profile.customer_profile.last_order_date}
        />
      </div>
    </div>
  </div>
)} */}

      {/* ADDRESS SECTION  */}
      <div
        className="
        card
        border-0
        shadow-sm
        mt-4
    "
      >
        <div className="card-body">
          <div
            className="
                d-flex
                justify-content-between
                align-items-center
                mb-3
            "
          >
            <h5 className="mb-0">Addresses</h5>

            <button
              className="
                    btn
                    btn-primary
                    btn-sm
                "
              onClick={() => setShowAddressModal(true)}
            >
              Add Address
            </button>
          </div>

          {profile.addresses?.length === 0 && (
            <div
              className="
                        text-center
                        text-muted
                        py-4
                    "
            >
              No addresses added yet
            </div>
          )}

          {profile.addresses?.map((address) => (
            <div
              key={address.id}
              className="
                            border
                            rounded
                            p-3
                            mb-3
                        "
            >
              <div
                className="
                                d-flex
                                justify-content-between
                            "
              >
                <strong>{address.label}</strong>

                {address.is_default && (
                  <span
                    className="
                                        badge
                                        bg-success
                                    "
                  >
                    Default
                  </span>
                )}
              </div>

              <p className="mb-1">{address.address_line_1}</p>

              {address.address_line_2 && (
                <p className="mb-1">{address.address_line_2}</p>
              )}

              <p className="mb-1">{address.landmark}</p>

              <p className="mb-1">
                {address.city}, {address.state}
              </p>

              <p className="mb-3">{address.pincode}</p>

              <div
                className="
                                d-flex
                                gap-2
                            "
              >
                <button
                  className="
                                    btn
                                    btn-warning
                                    btn-sm
                                "
                  onClick={() => handleEditAddress(address)}
                >
                  Edit
                </button>

                <button
                  className="
                                    btn
                                    btn-danger
                                    btn-sm
                                "
                  onClick={() => handleDeleteAddress(address.id)}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {showAddressModal && (
        <div
          className="
        modal
        d-block
    "
        >
          <div
            className="
            modal-dialog
        "
          >
            <div
              className="
                modal-content
            "
            >
              <div
                className="
                    modal-header
                "
              >
                <h5>{editingAddress ? "Edit Address" : "Add Address"}</h5>

                <button
                  className="
                        btn-close
                    "
                  onClick={() => setShowAddressModal(false)}
                />
              </div>

              <div
                className="
                    modal-body
                "
              >
                <InputField
                  label="Label"
                  name="label"
                  value={addressForm.label}
                  onChange={handleAddressChange}
                />

                <InputField
                  label="Address Line 1"
                  name="address_line_1"
                  value={addressForm.address_line_1}
                  onChange={handleAddressChange}
                />

                <InputField
                  label="Address Line 2"
                  name="address_line_2"
                  value={addressForm.address_line_2}
                  onChange={handleAddressChange}
                />

                <InputField
                  label="Landmark"
                  name="landmark"
                  value={addressForm.landmark}
                  onChange={handleAddressChange}
                />

                <InputField
                  label="City"
                  name="city"
                  value={addressForm.city}
                  onChange={handleAddressChange}
                />

                <InputField
                  label="State"
                  name="state"
                  value={addressForm.state}
                  onChange={handleAddressChange}
                />

                <InputField
                  label="Pincode"
                  name="pincode"
                  value={addressForm.pincode}
                  onChange={handleAddressChange}
                />
              </div>
              <div className="form-check mt-3">
                <input
                  type="checkbox"
                  className="form-check-input"
                  id="is_default"
                  checked={addressForm.is_default || false}
                  onChange={(e) =>
                    setAddressForm({
                      ...addressForm,
                      is_default: e.target.checked,
                    })
                  }
                />

                <label htmlFor="is_default" className="form-check-label">
                  Set As Default Address
                </label>
              </div>

              <div
                className="
                    modal-footer
                "
              >
                <button
                  className="
                        btn
                        btn-secondary
                    "
                  onClick={() => setShowAddressModal(false)}
                >
                  Cancel
                </button>

                <button
                  className="
                        btn
                        btn-primary
                    "
                  onClick={handleSaveAddress}
                >
                  Save Address
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ==========================================
// FIELD
// ==========================================
function Field({
  label,
  value,
  editable,
  name,
  formData,
  handleChange,
  type = "text",
}) {
  return (
    <div className="col-md-6">
      <label
        className="
                    text-muted
                    small
                "
      >
        {label}
      </label>

      {!editable ? (
        <h6>{value || "-"}</h6>
      ) : (
        <input
          type={type}
          className="form-control"
          name={name}
          value={formData[name]}
          onChange={handleChange}
        />
      )}
    </div>
  );
}

function SelectField({
  label,
  editable,
  name,
  value,
  formData,
  handleChange,
  options,
}) {
  return (
    <div className="col-md-6">
      <label className="text-muted small">{label}</label>

      {!editable ? (
        <h6>{value || "-"}</h6>
      ) : (
        <select
          className="form-select"
          name={name}
          value={formData[name]}
          onChange={handleChange}
        >
          <option value="">Select {label}</option>

          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      )}
    </div>
  );
}

// ==========================================
// STATIC FIELD
// ==========================================
function StaticField({ label, value }) {
  return (
    <div className="col-md-6">
      <label
        className="
                    text-muted
                    small
                "
      >
        {label}
      </label>

      <h6>{value || "-"}</h6>
    </div>
  );
}

function InputField({ label, name, value, onChange }) {
  return (
    <div className="mb-3">
      <label
        className="
                    form-label
                "
      >
        {label}
      </label>

      <input
        className="
                    form-control
                "
        name={name}
        value={value}
        onChange={onChange}
      />
    </div>
  );
}
