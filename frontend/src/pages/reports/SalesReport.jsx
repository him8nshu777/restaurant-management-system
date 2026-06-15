import { useEffect, useState } from "react";

import { getSalesReport } from "../../services/reportService";

import { useSelector } from "react-redux";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts/umd/Recharts";

export default function SalesReport() {
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

      // ✅ CASE 1: CUSTOM DATE RANGE
      if (selectedPeriod === "custom") {
        data = await getSalesReport(restaurantId, "custom", startDate, endDate);
      }

      // ✅ CASE 2: NORMAL PERIOD
      else {
        data = await getSalesReport(restaurantId, selectedPeriod);
      }

      setReport(data);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // AUTO LOAD
  // ==========================================
  useEffect(() => {
    if (restaurantId && period !== "custom") {
      fetchReport(period);
    }
  }, [restaurantId, period]);

  // ==========================================
  // CHART DATA
  // ==========================================
  const chartData =
    report?.chart?.labels?.map((label, index) => ({
      label,
      sales: report.chart.sales[index],
    })) || [];

  const handleCustomApply = () => {
    if (!startDate || !endDate) {
      alert("Please select both dates");
      return;
    }

    fetchReport("custom");
  };

  return (
    <div className="container-fluid">
      {/* HEADER */}
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
        <h2 className="fw-bold">Sales Reports</h2>

        {/* DROPDOWN + CUSTOM DATE */}
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

              // reset dates when switching away from custom
              if (value !== "custom") {
                setStartDate("");
                setEndDate("");
                fetchReport(value); // safe auto fetch only for week/month/year
              }
            }}
          >
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="year">This Year</option>
            <option value="custom">Custom Range</option>
          </select>

          {/* ONLY SHOW WHEN CUSTOM */}
          {period === "custom" && (
            <>
              {/* Desktop & Tablet */}
              <div className="d-none d-md-flex gap-2">
                <input
                  type="date"
                  className="form-control"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />

                <input
                  type="date"
                  className="form-control"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />

                <button className="btn btn-primary" onClick={handleCustomApply}>
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
                      onChange={(e) => setStartDate(e.target.value)}
                    />
                  </div>

                  <div className="col-6">
                    <input
                      type="date"
                      className="form-control"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                    />
                  </div>

                  <div className="col-12">
                    <button
                      className="btn btn-primary w-100"
                      onClick={handleCustomApply}
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

      {loading && <div>Loading...</div>}

      {report && (
        <>
          {/* KPI CARDS */}
          <div className="row mb-4">
            <div className="col-md-4">
              <div className="card shadow-sm">
                <div className="card-body">
                  <h6>Total Sales</h6>
                  <h3>₹{report.summary.total_sales}</h3>
                </div>
              </div>
            </div>

            <div className="col-md-4">
              <div className="card shadow-sm">
                <div className="card-body">
                  <h6>Total Orders</h6>
                  <h3>{report.summary.total_orders}</h3>
                </div>
              </div>
            </div>

            <div className="col-md-4">
              <div className="card shadow-sm">
                <div className="card-body">
                  <h6>Avg Order Value</h6>
                  <h3>₹{report.summary.average_order_value}</h3>
                </div>
              </div>
            </div>
          </div>

          {/* CHART */}
          <div className="card shadow-sm">
            <div className="card-body">
              <h5 className="mb-4">Revenue Trend</h5>

              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="label" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="sales" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
