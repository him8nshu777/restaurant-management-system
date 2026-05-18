import { useEffect, useState } from "react";

import { useSelector } from "react-redux";

import {
  getInventoryTransactionList,
  createInventoryTransaction,
  getIngredientList,
} from "../../../services/inventoryService";

export default function InventoryTransactions() {

  const [transactionList, setTransactionList] =
    useState([]);

  const [ingredientList, setIngredientList] =
    useState([]);

  const [alert, setAlert] = useState(null);

  const [showModal, setShowModal] =
    useState(false);

  const [formData, setFormData] = useState({
    ingredient: "",
    transaction_type: "purchase",
    quantity: "",
    note: "",
  });

  const activeRestaurant = useSelector(
    (state) => state.restaurant.activeRestaurant,
  );

  useEffect(() => {

    if (activeRestaurant?.id) {

      fetchTransactionList();

      fetchIngredientList();
    }

  }, [activeRestaurant]);

  const fetchTransactionList = async () => {

    try {

      const data =
        await getInventoryTransactionList(
          activeRestaurant.id
        );

      setTransactionList(data);

    } catch (error) {

      setAlert({
        type: "danger",
        message: "Failed to fetch transactions.",
      });
    }
  };

  const fetchIngredientList = async () => {

    try {

      const data =
        await getIngredientList(
          activeRestaurant.id
        );

      setIngredientList(data);

    } catch (error) {

      console.log(error);
    }
  };

  const handleChange = (e) => {

    setFormData({
      ...formData,

      [e.target.name]: e.target.value,
    });
  };

  const handleCreateTransaction = async (e) => {

    e.preventDefault();

    try {

      await createInventoryTransaction({
        ...formData,

        restaurant_id: activeRestaurant.id,
      });

      fetchTransactionList();

      setShowModal(false);

      setFormData({
        ingredient: "",
        transaction_type: "purchase",
        quantity: "",
        note: "",
      });

      setAlert({
        type: "success",
        message: "Transaction created successfully.",
      });

    } catch (error) {

      setAlert({
        type: "danger",
        message: "Failed to create transaction.",
      });
    }
  };

  return (
    <div>

      {alert && (
        <div className={`alert alert-${alert.type}`}>
          {alert.message}
        </div>
      )}

      <div className="d-flex justify-content-between mb-4">

        <h2 className="fw-bold">
          Inventory Transactions
        </h2>

        <button
          className="btn btn-primary"
          onClick={() => setShowModal(true)}
        >
          Add Transaction
        </button>
      </div>

      <div className="card border-0 shadow-sm">

        <div className="card-body">

          <table className="table">

            <thead>
              <tr>
                <th>Ingredient</th>
                <th>Type</th>
                <th>Quantity</th>
                <th>Note</th>
                <th>Date</th>
              </tr>
            </thead>

            <tbody>

              {transactionList.map((transaction) => (

                <tr key={transaction.id}>

                  <td>
                    {transaction.ingredient_name}
                  </td>

                  <td>
                    <span
                      className={`
                        badge

                        ${
                          transaction.transaction_type === "purchase"
                            ? "bg-success"
                            : transaction.transaction_type === "sale"
                            ? "bg-danger"
                            : "bg-warning"
                        }
                      `}
                    >
                      {transaction.transaction_type}
                    </span>
                  </td>

                  <td>
                    {transaction.quantity}{" "}
                    {transaction.unit_code}
                  </td>

                  <td>
                    {transaction.note || "-"}
                  </td>

                  <td>
                    {new Date(
                      transaction.created_at
                    ).toLocaleDateString()}
                  </td>

                </tr>
              ))}

            </tbody>

          </table>

        </div>

      </div>

      {/* ==========================================
          MODAL
      ========================================== */}
      {showModal && (

        <ModalWrapper
          title="Add Inventory Transaction"
          onClose={() => setShowModal(false)}
          onSubmit={handleCreateTransaction}
        >

          <SelectField
            label="Ingredient"
            name="ingredient"
            value={formData.ingredient}
            handleChange={handleChange}
            options={ingredientList}
          />

          <div className="mb-3">

            <label className="form-label">
              Transaction Type
            </label>

            <select
              className="form-select"
              name="transaction_type"
              value={formData.transaction_type}
              onChange={handleChange}
            >
              <option value="purchase">
                Purchase
              </option>

              <option value="sale">
                Sale
              </option>

              <option value="adjustment">
                Adjustment
              </option>
            </select>

          </div>

          <InputField
            label="Quantity"
            name="quantity"
            value={formData.quantity}
            handleChange={handleChange}
            type="number"
          />

          <TextAreaField
            label="Note"
            name="note"
            value={formData.note}
            handleChange={handleChange}
          />

        </ModalWrapper>
      )}
    </div>
  );
}


// ==========================================
// MODAL
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
// INPUT FIELD
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


// ==========================================
// SELECT FIELD
// ==========================================
function SelectField({
  label,
  name,
  value,
  handleChange,
  options,
}) {

  return (
    <div className="mb-3">

      <label className="form-label">
        {label}
      </label>

      <select
        className="form-select"
        name={name}
        value={value}
        onChange={handleChange}
        required
      >

        <option value="">
          Select Ingredient
        </option>

        {options.map((option) => (

          <option
            key={option.id}
            value={option.id}
          >
            {option.name}
          </option>
        ))}

      </select>

    </div>
  );
}


// ==========================================
// TEXTAREA FIELD
// ==========================================
function TextAreaField({
  label,
  name,
  value,
  handleChange,
}) {

  return (
    <div className="mb-3">

      <label className="form-label">
        {label}
      </label>

      <textarea
        className="form-control"
        rows="3"
        name={name}
        value={value}
        onChange={handleChange}
      />

    </div>
  );
}