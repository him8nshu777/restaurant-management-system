import { useEffect, useState } from "react";

import { useSelector } from "react-redux";

import { getKitchenReport } from "../../services/reportService";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts/umd/Recharts";

export default function KitchenReport() {
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
        data = await getKitchenReport(
          restaurantId,
          selectedPeriod,
          startDate,
          endDate,
        );
      } else {
        data = await getKitchenReport(restaurantId, selectedPeriod);
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
  // APPLY CUSTOM RANGE
  // ==========================================
  const handleApplyCustom = () => {
    if (!startDate || !endDate) {
      alert("Please select both dates");

      return;
    }

    fetchReport("custom");
  };

  // ==========================================
  // CHART DATA
  // ==========================================
  const chartData =
    report?.chart?.labels?.map((label, index) => ({
      order: label,
      time: report.chart.times[index],
    })) || [];

  return (
    <div className="container-fluid">
      {/* ======================================
          HEADER
      ====================================== */}
      <div
        className="d-flex
    flex-column
    flex-md-row
    justify-content-between
    align-items-start
    align-items-md-center
    gap-3
    mb-4"
      >
        <h2 className="fw-bold">Kitchen Report</h2>

        <div
           className="d-flex
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
                placeholder="Start Date"
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
                placeholder="End Date"
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

      {/* ======================================
          LOADING
      ====================================== */}
      {loading && <div>Loading report...</div>}

      {/* ======================================
          REPORT
      ====================================== */}
      {report && (
        <>
          {/* ==================================
              SUMMARY CARDS
          ================================== */}
          <div className="row mb-4">
            <div className="col-md-3">
              <div className="card shadow-sm">
                <div className="card-body">
                  <h6>Kitchen Orders</h6>

                  <h3>{report.summary.total_kitchen_orders}</h3>
                </div>
              </div>
            </div>

            <div className="col-md-3">
              <div className="card shadow-sm">
                <div className="card-body">
                  <h6>Avg Prep Time</h6>

                  <h3>{report.summary.average_preparation_time} min</h3>
                </div>
              </div>
            </div>

            <div className="col-md-3">
              <div className="card shadow-sm">
                <div className="card-body">
                  <h6>Delayed Orders</h6>
                  <h3>{report.summary.delayed_orders}</h3>
                </div>
              </div>
            </div>

            <div className="col-md-3">
              <div className="card shadow-sm">
                <div className="card-body">
                  <h6>On Time Orders</h6>

                  <h3>{report.summary.on_time_orders}</h3>
                </div>
              </div>
            </div>
          </div>

          {/* ==================================
              CHART
          ================================== */}
          <div
            className="
              card
              shadow-sm
              mb-4
            "
          >
            <div className="card-body">
              <h5 className="mb-4">Kitchen Preparation Time by Order</h5>

              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={chartData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />

                  <XAxis type="number" />

                  <YAxis type="category" dataKey="order" width={220} />

                  <Tooltip />

                  <Bar dataKey="time" barSize={50} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* ==================================
              TABLE
          ================================== */}
          <div className="card shadow-sm">
            <div className="card-body">
              <h5 className="mb-3">Delayed Orders Analysis</h5>

              <div className="table-responsive">
                <table
                  className="
      table
      table-striped
      align-middle
    "
                >
                  <thead>
                    <tr>
                      <th>Order Number</th>

                      <th>Order Type</th>

                      <th>Items</th>

                      <th>Expected</th>

                      <th>Actual</th>

                      <th>Delay</th>
                    </tr>
                  </thead>

                  <tbody>
                    {report.delayed_orders.length > 0 ? (
                      report.delayed_orders.map((item) => (
                        <tr key={item.order_id}>
                          <td>{item.order_number}</td>

                          <td className="text-capitalize">{item.order_type}</td>

                          <td>{item.items.join(", ")}</td>

                          <td>{item.expected_time} min</td>

                          <td>{item.actual_time} min</td>

                          <td>
                            <span className="text-danger fw-bold">
                              +{item.delay} min
                            </span>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="6" className="text-center">
                          No delayed orders found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
