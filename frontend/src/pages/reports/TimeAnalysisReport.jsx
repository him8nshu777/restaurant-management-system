import { useEffect, useState } from "react";

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

import {
  getTimeAnalysisReport,
} from "../../services/reportService";

export default function TimeAnalysisReport() {

  const [period, setPeriod] =
    useState("week");

  const [startDate, setStartDate] =
    useState("");

  const [endDate, setEndDate] =
    useState("");

  const [report, setReport] =
    useState(null);

  const activeRestaurant =
    useSelector(
      (state) =>
        state.restaurant.activeRestaurant
    );

  const user =
    useSelector(
      (state) => state.auth.user
    );

  const restaurantId =
    user?.role === "restaurant_admin"
      ? activeRestaurant?.id
      : user?.restaurant_id;

  const fetchReport = async (
    selectedPeriod = period
  ) => {

    try {

      let data;

      if (
        selectedPeriod === "custom"
      ) {

        data =
          await getTimeAnalysisReport(
            restaurantId,
            "custom",
            startDate,
            endDate
          );

      } else {

        data =
          await getTimeAnalysisReport(
            restaurantId,
            selectedPeriod
          );
      }

      setReport(data);

    } catch (error) {

      console.log(error);
    }
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
    period
  ]);

  const chartData =
    report?.chart?.labels?.map(
      (label, index) => ({
        label,
        orders:
          report.chart.orders[index],
      })
    ) || [];

  return (

    <div className="container-fluid">

      <div className="d-flex justify-content-between mb-4">

        <h2>
          Time Analysis
        </h2>

        <div className="d-flex gap-2">

          <select
            className="form-select"
            value={period}
            onChange={(e) =>
              setPeriod(
                e.target.value
              )
            }
          >
            <option value="week">
              Week
            </option>

            <option value="month">
              Month
            </option>

            <option value="year">
              Year
            </option>

            <option value="custom">
              Custom
            </option>
          </select>

          {period === "custom" && (
            <>
              <input
                type="date"
                className="form-control"
                value={startDate}
                onChange={(e) =>
                  setStartDate(
                    e.target.value
                  )
                }
              />

              <input
                type="date"
                className="form-control"
                value={endDate}
                onChange={(e) =>
                  setEndDate(
                    e.target.value
                  )
                }
              />

              <button
                className="btn btn-primary"
                onClick={() =>
                  fetchReport(
                    "custom"
                  )
                }
              >
                Apply
              </button>
            </>
          )}

        </div>

      </div>

      {report && (
        <>
          <div className="row mb-4">

            <div className="col-md-6">

              <div className="card shadow-sm">

                <div className="card-body">

                  <h6>
                    Peak Hour
                  </h6>

                  <h3>
                    {report.peak_hour}
                  </h3>

                  <small>
                    {
                      report.peak_orders
                    } orders
                  </small>

                </div>

              </div>

            </div>

            <div className="col-md-6">

              <div className="card shadow-sm">

                <div className="card-body">

                  <h6>
                    Slow Hour
                  </h6>

                  <h3>
                    {report.slow_hour}
                  </h3>

                  <small>
                    {
                      report.slow_orders
                    } orders
                  </small>

                </div>

              </div>

            </div>

          </div>

          <div className="card shadow-sm">

            <div className="card-body">

              <h5>
                Orders By Hour
              </h5>

              <ResponsiveContainer
                width="100%"
                height={400}
              >

                <BarChart
                  data={chartData}
                >

                  <CartesianGrid
                    strokeDasharray="3 3"
                  />

                  <XAxis
                    dataKey="label"
                  />

                  <YAxis />

                  <Tooltip />

                  <Bar
                    dataKey="orders"
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