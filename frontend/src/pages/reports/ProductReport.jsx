import { useEffect, useState } from "react";

import { useSelector } from "react-redux";

import { getProductReport }
from "../../services/reportService";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts/umd/Recharts";

export default function ProductReport() {

  const [period, setPeriod] =
    useState("week");

  const [reportType, setReportType] =
    useState("best");

  const [startDate, setStartDate] =
    useState("");

  const [endDate, setEndDate] =
    useState("");

  const [report, setReport] =
    useState(null);

  const activeRestaurant =
    useSelector(
      state =>
      state.restaurant.activeRestaurant
    );

  const user =
    useSelector(
      state => state.auth.user
    );

  const restaurantId =
    user?.role === "restaurant_admin"
      ? activeRestaurant?.id
      : user?.restaurant_id;

  const fetchReport =
    async (
      selectedPeriod = period
    ) => {

      const data =
        await getProductReport(
          restaurantId,
          selectedPeriod,
          reportType,
          startDate,
          endDate
        );

      setReport(data);
    };

  useEffect(() => {

    if (
      restaurantId &&
      period !== "custom"
    ) {
      fetchReport(period);
    }

  }, [
    restaurantId,
    period,
    reportType
  ]);

  const chartData =
    report?.chart?.labels?.map(
      (label, index) => ({
        name: label,
        quantity:
          report.chart.quantities[index],
      })
    ) || [];

  return (

    <div className="container-fluid">

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

        <h2>
          Product Reports
        </h2>

        <div className="w-auto">
  
  {/* Main Filters */}
  <div
    className="
      d-flex
      flex-column
      flex-md-row
      gap-2
      mb-2
    "
  >
    <select
      className="form-select"
      style={{ minWidth: "140px" }}
      value={period}
      onChange={(e) =>
        setPeriod(e.target.value)
      }
    >
      <option value="week">Week</option>
      <option value="month">Month</option>
      <option value="year">Year</option>
      <option value="custom">Custom</option>
    </select>

    <select
      className="form-select"
      value={reportType}
      onChange={(e) =>
        setReportType(e.target.value)
      }
    >
      <option value="best">
        Best Selling
      </option>

      <option value="worst">
        Worst Selling
      </option>
    </select>
  </div>

  {/* Custom Date Filters */}
  {period === "custom" && (
    <>
      {/* Desktop & Tablet */}
      <div
        className="
          d-none
          d-md-flex
          gap-2
        "
      >
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
          onClick={() =>
            fetchReport("custom")
          }
        >
          Apply
        </button>
      </div>

      {/* Mobile */}
      <div className="d-md-none">
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
              onClick={() =>
                fetchReport("custom")
              }
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

      {report && (
        <>
          <div className="row mb-4">

            <div className="col-md-4">
              <div className="card">
                <div className="card-body">

                  <h6>
                    Total Quantity Sold
                  </h6>

                  <h3>
                    {
                      report.summary
                        .total_quantity
                    }
                  </h3>

                </div>
              </div>
            </div>

            <div className="col-md-4">
              <div className="card">
                <div className="card-body">

                  <h6>
                    Unique Products
                  </h6>

                  <h3>
                    {
                      report.summary
                        .unique_products
                    }
                  </h3>

                </div>
              </div>
            </div>

            <div className="col-md-4">
              <div className="card">
                <div className="card-body">

                  <h6>
                    Top Product
                  </h6>

                  <h6>
                    {
                      report.summary
                        .best_product
                    }
                  </h6>

                </div>
              </div>
            </div>

          </div>

          <div className="card shadow-sm">

            <div className="card-body">

              <h5>
                {
                  reportType === "best"
                  ? "Top 10 Products"
                  : "Worst 10 Products"
                }
              </h5>

              <ResponsiveContainer
                width="100%"
                height={200}
              >

                <BarChart
                  data={chartData}
                  layout="vertical"
                >

                  <CartesianGrid
                    strokeDasharray="3 3"
                  />

                  <XAxis
                    type="number"
                  />

                  <YAxis
                    type="category"
                    dataKey="name"
                    width={220}
                  />

                  <Tooltip />

                  <Bar
                    dataKey="quantity" barSize={50}
                  />

                </BarChart>

              </ResponsiveContainer>

            </div>

          </div>

        </>
      )}

    </div>
  );
}