'use client';

import { useEffect, useState } from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

export default function HistoricalGraph() {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch("http://localhost:5000/api/historical_data?device=plc&param=temperature");
        const json = await res.json();

        // Extract labels and temperatures from array
        const labels = json.map((entry: any) => entry.time_iso);
        const temperatures = json.map((entry: any) => entry.value);

        setData({
          labels: labels,
          datasets: [
            {
              label: "Temperature (°C)",
              data: temperatures,
              borderColor: "rgb(75, 192, 192)",
              backgroundColor: "rgba(75, 192, 192, 0.2)",
            },
          ],
        });
      } catch (error) {
        console.error("Failed to fetch historical data", error);
      }
    }
    fetchData();
  }, []);

  if (!data) return <p>Loading chart...</p>;

  return (
    <div className="bg-white p-6 rounded-xl shadow-lg mt-8 w-full">
      <Line
        data={data}
        options={{
          responsive: true,
          plugins: {
            legend: { position: "top" },
            title: {
              display: true,
              text: "Historical Temperature Data",
            },
          },
        }}
      />
    </div>
  );
}
