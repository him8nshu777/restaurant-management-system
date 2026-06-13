import { useEffect, useState } from "react";

import { useSelector } from "react-redux";

import { getFinancialReport } from "../../services/reportService";

import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
} from "recharts/umd/Recharts";

export default function FinancialReport() {
  const [period, setPeriod] = useState("week");

  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const [report, setReport] = useState(null);

  const [loading, setLoading] = useState(false);

  const activeRestaurant = useSelector(
    (state) => state.restaurant.activeRestaurant,
  );

  const user = useSelector((state) => state.auth.user);

  const restaurantId =
    user?.role === "restaurant_admin"
      ? activeRestaurant?.id
      : user?.restaurant_id;

  // ==========================================
  // FETCH REPORT
  // ==========================================
  const fetchReport = async (selectedPeriod = period) => {
    try {
      setLoading(true);

      let data;

      if (selectedPeriod === "custom") {
        data = await getFinancialReport(
          restaurantId,
          selectedPeriod,
          startDate,
          endDate,
        );
      } else {
        data = await getFinancialReport(restaurantId, selectedPeriod);
      }

      setReport(data);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // INITIAL LOAD
  // ==========================================
  useEffect(() => {
    if (restaurantId && period !== "custom") {
      fetchReport(period);
    }
  }, [restaurantId, period]);

  // ==========================================
  // CUSTOM DATE
  // ==========================================
  const handleApplyCustom = () => {
    if (!startDate || !endDate) {
      alert("Please select both dates");

      return;
    }

    fetchReport("custom");
  };

  // ==========================================
  // PIE CHART DATA
  // ==========================================
  const pieData =
    report?.order_types?.map((item) => ({
      name: item.order_type.replace("_", " ").toUpperCase(),
      value: Number(item.revenue),
    })) || [];

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28"];

  return (
    <div className="container-fluid">
      {/* ======================================
          HEADER
      ====================================== */}
      <div
        className="
          d-flex
    flex-column
    flex-md-row
    justify-content-between
    align-items-start
    align-items-md-center
    gap-3
    mb-4
        "
      >
        <h2 className="fw-bold">Financial Report</h2>

        <div
          className="
            d-flex
      flex-column
      flex-md-row
      gap-2
      align-items-stretch
    align-items-md-center"
        >
          <select
            className="form-select w-auto"
            value={period}
            onChange={(e) => {
              const value = e.target.value;

              setPeriod(value);

              if (value !== "custom") {
                setStartDate("");
                setEndDate("");
              }
            }}
          >
            <option value="week">This Week</option>

            <option value="month">This Month</option>

            <option value="year">This Year</option>

            <option value="custom">Custom Range</option>
          </select>

          {period === "custom" && (
            <>
        {/* Desktop */}
        <div className="d-none d-md-flex gap-2">
          <input
            type="date"
            className="form-control"
            value={startDate}
            onChange={(e) =>
              setStartDate(e.target.value)
            }
          />

          <input
            type="date"
            className="form-control"
            value={endDate}
            onChange={(e) =>
              setEndDate(e.target.value)
            }
          />

          <button
            className="btn btn-primary"
            onClick={handleApplyCustom}
          >
            Apply
          </button>
        </div>

        {/* Mobile */}
        <div className="d-md-none w-100">
          <div className="row g-2">
            <div className="col-6">
              <input
                type="date"
                className="form-control"
                value={startDate}
                onChange={(e) =>
                  setStartDate(e.target.value)
                }
              />
            </div>

            <div className="col-6">
              <input
                type="date"
                className="form-control"
                value={endDate}
                onChange={(e) =>
                  setEndDate(e.target.value)
                }
              />
            </div>

            <div className="col-12">
              <button
                className="btn btn-primary w-100"
                onClick={handleApplyCustom}
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      </>
          )}
        </div>
      </div>

      {loading && <div>Loading report...</div>}

      {report && (
        <>
          {/* ==================================
              SUMMARY
          ================================== */}
          <div className="row mb-4">
            <div className="col-md-2">
              <div className="card shadow-sm">
                <div className="card-body">
                  <h6>Revenue</h6>

                  <h4>₹{Number(report.summary.revenue).toFixed(2)}</h4>
                </div>
              </div>
            </div>

            <div className="col-md-2">
              <div className="card shadow-sm">
                <div className="card-body">
                  <h6>Orders</h6>

                  <h4>{report.summary.total_orders}</h4>
                </div>
              </div>
            </div>

            <div className="col-md-2">
              <div className="card shadow-sm">
                <div className="card-body">
                  <h6>Avg Order</h6>

                  <h4>
                    ₹{Number(report.summary.average_order_value).toFixed(2)}
                  </h4>
                </div>
              </div>
            </div>

            <div className="col-md-2">
              <div className="card shadow-sm">
                <div className="card-body">
                  <h6>Discounts</h6>

                  <h4>₹{Number(report.summary.discounts).toFixed(2)}</h4>
                </div>
              </div>
            </div>

            <div className="col-md-2">
              <div className="card shadow-sm">
                <div className="card-body">
                  <h6>Taxes</h6>

                  <h4>₹{Number(report.summary.taxes).toFixed(2)}</h4>
                </div>
              </div>
            </div>

            <div className="col-md-2">
              <div className="card shadow-sm">
                <div className="card-body">
                  <h6>Service</h6>

                  <h4>₹{Number(report.summary.service_charges).toFixed(2)}</h4>
                </div>
              </div>
            </div>
          </div>

          {/* ==================================
              ORDER TYPE CHART
          ================================== */}
          <div
            className="
              card
              shadow-sm
              mb-4
            "
          >
            <div className="card-body">
              <h5>Revenue By Order Type</h5>

              <ResponsiveContainer width="100%" height={350}>
                <PieChart>
                  <Pie
                    data={pieData}
                    dataKey="value"
                    nameKey="name"
                    outerRadius={120}
                    label
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={index} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>

                  <Tooltip />

                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* ==================================
              PROFIT & LOSS
          ================================== */}
          <div
            className="
              card
              shadow-sm
              mb-4
            "
          >
            <div className="card-body">
              <h5>Profit & Loss Summary</h5>

              <table className="table">
                <tbody>
                  <tr>
                    <td>Revenue</td>
                    <td>₹{report.summary.revenue}</td>
                  </tr>

                  <tr>
                    <td>Discounts</td>
                    <td>₹{report.summary.discounts}</td>
                  </tr>

                  <tr>
                    <td>Taxes</td>
                    <td>₹{report.summary.taxes}</td>
                  </tr>

                  <tr>
                    <td>Service Charges</td>
                    <td>₹{report.summary.service_charges}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* ==================================
              GST BREAKDOWN
          ================================== */}
          <div
            className="
              card
              shadow-sm
              mb-4
            "
          >
            <div className="card-body">
              <h5>GST Breakdown</h5>

              <table
                className="
                  table
                  table-striped
                "
              >
                <thead>
                  <tr>
                    <th>Tax</th>

                    <th>Amount</th>
                  </tr>
                </thead>

                <tbody>
                  {report.gst_breakdown.map((tax) => (
                    <tr key={tax.name}>
                      <td>{tax.name}</td>

                      <td>₹{Number(tax.amount).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* ==================================
              TOP PRODUCTS
          ================================== */}
          <div
            className="
              card
              shadow-sm
            "
          >
            <div className="card-body">
              <h5>Top Products</h5>

              <table
                className="
                  table
                  table-striped
                "
              >
                <thead>
                  <tr>
                    <th>Product</th>

                    <th>Qty Sold</th>

                    <th>Revenue</th>
                  </tr>
                </thead>

                <tbody>
                  {report.top_products.map((item) => (
                    <tr key={item.name}>
                      <td>{item.name}</td>

                      <td>{item.quantity}</td>

                      <td>₹{Number(item.revenue).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
