import { useState } from "react";
import {
  useNavigate,
  useParams,
  useLocation,
} from "react-router-dom";

import {
  updatePaymentStatus,
} from "../../services/orderService";

export default function PaymentPage({
  order,
  orderId,
  setActivePage,
}) {

  // const { orderId } = useParams();

  const location = useLocation();

  const navigate = useNavigate();

  const [paying, setPaying] = useState(false);

  // const order = location.state?.order;

  if (!order) {
    return (
      <div className="container py-4">
        <div className="alert alert-danger">
          Order data not found.
        </div>
      </div>
    );
  }

  const handlePayment = async () => {

    try {

      setPaying(true);

      await updatePaymentStatus(
        orderId,
        "paid"
      );

      alert("Payment successful");

      // navigate("/orders");
      setActivePage({
  type: "orders",
});

    } catch (error) {

      console.log(error);

      alert("Payment failed");

    } finally {

      setPaying(false);
    }
  };

  return (
    <div className="container py-4">

      <div
        className="card shadow-sm mx-auto"
        style={{ maxWidth: "500px" }}
      >

        <div className="card-body">

          <h3 className="mb-4 text-center">
            Payment
          </h3>

          <hr />

          <div className="mb-3">
            <strong>Order Number:</strong>
            <br />
            {order.order_number}
          </div>

          <div className="mb-3">
            <strong>Payment Method:</strong>
            <br />
            {order.payment_method || "Cash"}
          </div>

          <div className="mb-3">
            <strong>Subtotal:</strong>
            <br />
            ₹{order.subtotal}
          </div>

          <div className="mb-3">
            <strong>Tax:</strong>
            <br />
            ₹{order.tax_amount}
          </div>

          <div className="mb-3">
            <strong>Discount:</strong>
            <br />
            ₹{order.discount_amount}
          </div>

          <div className="mb-4">
            <strong>Total Amount:</strong>

            <h2 className="mt-2 text-success">
              ₹{order.grand_total}
            </h2>
          </div>

          <button
            className="btn btn-success w-100"
            onClick={handlePayment}
            disabled={paying}
          >
            {paying
              ? "Processing..."
              : `Pay ₹${order.grand_total}`}
          </button>

        </div>

      </div>

    </div>
  );
}