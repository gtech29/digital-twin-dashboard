'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import HistoricalGraph from './HistoricalGraph';

type DeviceData = {
  [key: string]: string | null;
};

type FullData = {
  plc: DeviceData;
  dnp3: DeviceData;
  sensor: DeviceData;
  jensys?: DeviceData;
  trane?: DeviceData;
};

type Anomaly = {
  id: string;
  index: number;
  value: number;
  status: string;
};

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

function Card({ title, data }: { title: string; data?: DeviceData | null }) {
  const safeData = data || {};
  return (
    <motion.div
      className="bg-white rounded-2xl shadow-lg px-8 py-6 w-80 transform transition duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-blue-200"
      variants={cardVariants}
      transition={{ duration: 0.5, ease: 'easeOut' }}
    >
      <h2 className="text-lg font-bold text-center text-blue-600 uppercase mb-4 tracking-wide">{title}</h2>
      <div className="space-y-2">
        {Object.entries(safeData).map(([label, value]) => (
          <div
            key={label}
            className="flex justify-between text-gray-800 bg-gray-100 px-3 py-1 rounded hover:bg-gray-200 transition"
          >
            <span className="capitalize">{label.replace(/_/g, ' ')}:</span>
            <span className="font-semibold">{value ?? '--'}</span>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

export default function Home() {
  const [data, setData] = useState<FullData | null>(null);
  const [anomalies, setAnomalies] = useState<Anomaly[]>([]);
  const [historicalData, setHistoricalData] = useState<{ time_iso: string; value: number }[]>([]);

  const fetchHistoricalData = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/historical_data?device=plc&param=temperature');
      const json = await res.json();
      setHistoricalData(json);
    } catch (err) {
      console.error('Failed to fetch historical data:', err);
    }
  };

  useEffect(() => {
    const fetchDeviceData = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/device_data');
        const json = await res.json();
        setData(json);
      } catch (err) {
        console.error('Failed to fetch device data:', err);
      }
    };

    const fetchAnomalies = async () => {
      try {
        const fakeAnomalies: Anomaly[] = Array.from({ length: 3 }).map((_, i) => ({
          id: `${Date.now()}-${i}`, // ✅ Unique key
          index: Math.floor(Math.random() * 50),
          value: parseFloat((60 + Math.random() * 40).toFixed(1)),
          status: ['Spike', 'Drop', 'Drift'][Math.floor(Math.random() * 3)],
        }));
        await new Promise(resolve => setTimeout(resolve, 500));
        setAnomalies(fakeAnomalies);
      } catch (err) {
        console.error('Failed to fetch anomaly predictions:', err);
      }
    };

    fetchDeviceData();
    fetchAnomalies();

    const interval = setInterval(() => {
      fetchDeviceData();
      fetchAnomalies();
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  if (!data) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-blue-50">
        <p className="text-gray-600 text-xl animate-pulse">Loading...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen px-6 py-10 bg-blue-50">
      <header className="w-full bg-[#003366] shadow-lg py-6 px-6 mb-12 flex items-center space-x-4 rounded-lg justify-center select-none">
        <svg className="w-12 h-12 text-[#FFD100]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="10" stroke="#FFD100" strokeWidth="2" />
          <line x1="12" y1="2" x2="12" y2="22" stroke="#FFD100" strokeWidth="2" />
          <line x1="2" y1="12" x2="22" y2="12" stroke="#FFD100" strokeWidth="2" />
        </svg>
        <div>
          <h1 className="text-white text-4xl font-extrabold uppercase tracking-wide">Digital Twin Dashboard</h1>
          <p className="text-[#4A90E2] text-sm tracking-wide mt-1">NAVFAC Project & Real-time Device Monitoring</p>
        </div>
      </header>

      <div className="mt-10 grid grid-cols-1 lg:grid-cols-[350px_1fr] gap-8 min-h-[600px] max-w-full px-6">
        {/* Anomaly Sidebar */}
        <div className="bg-white p-6 h-[100vh] sticky top-0 overflow-auto lg:-mx-6">
          <h2 className="text-2xl font-bold text-red-600 mb-4 text-center">Anomaly Detection (PLC Temperature)</h2>
          {anomalies.length === 0 ? (
            <p className="text-gray-500 text-center">No anomalies detected.</p>
          ) : (
            <ul className="divide-y divide-gray-200 max-h-64 overflow-y-auto">
              {anomalies.map((item) => (
                <li
                  key={item.id}
                  className={`flex justify-between px-4 py-2 ${
                    ['Spike', 'Drop', 'Drift'].includes(item.status)
                      ? 'bg-red-50 text-red-600 font-semibold'
                      : 'text-gray-700'
                  }`}
                >
                  <span># {item.index + 1}</span>
                  <span>{item.value} °C</span>
                  <span>{item.status}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Right Content: Cards + Graph */}
        <div className="flex flex-col gap-2 overflow-hidden">
          <div className="px-6">
            <div className="flex overflow-x-auto gap-x-6 pb-2 w-full">
              <Card title="PLC" data={data.plc} />
              <Card title="DNP3 Outstation" data={data.dnp3} />
              <Card title="Sensor" data={data.sensor} />
              <Card title="JENsys" data={data.jensys} />
              <Card title="Trane" data={data.trane} />
            </div>
          </div>
          <div className="mt-8 px-6">
            <div className="p-4 rounded-xl w-full">
              <HistoricalGraph />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
