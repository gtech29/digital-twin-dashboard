'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import AgentChatBox from './AgentChatBox';

type DeviceData = {
  [key: string]: string | null;
};

type FullData = {
  plc: DeviceData;
  dnp3: DeviceData;
  sensor: DeviceData;
};

type Anomaly = {
  index: number;
  value: number;
  status: string;
};

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.2,
    },
  },
};

function Card({ title, data }: { title: string; data: DeviceData }) {
  return (
    <motion.div
      className="bg-white rounded-2xl shadow-lg px-8 py-6 w-80 transform transition duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-blue-200"
      variants={cardVariants}
      transition={{ duration: 0.5, ease: 'easeOut' }}
    >
      <h2 className="text-lg font-bold text-center text-blue-600 uppercase mb-4 tracking-wide">{title}</h2>
      <div className="space-y-2">
        {Object.entries(data).map(([label, value]) => (
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
        const res = await fetch('http://localhost:5000/api/predictions');
        const json = await res.json();
        if (json.anomalies) setAnomalies(json.anomalies);
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
    <main className="min-h-screen bg-blue-50 px-6 py-10">
      <h1 className="text-4xl font-bold text-center text-blue-700 mb-12 tracking-wide uppercase drop-shadow-md">
        Digital Twin Dashboard
      </h1>

      <motion.div
        className="flex flex-wrap justify-center gap-10"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <Card title="PLC" data={data.plc} />
        <Card title="DNP3 Outstation" data={data.dnp3} />
        <Card title="Sensor" data={data.sensor} />
      </motion.div>

      <div className="mt-16 max-w-3xl mx-auto bg-white rounded-xl shadow p-6">
        <h2 className="text-2xl font-bold text-red-600 mb-4 text-center">
          Anomaly Detection (PLC Temperature)
        </h2>
        {anomalies.length === 0 ? (
          <p className="text-gray-500 text-center">No anomalies detected.</p>
        ) : (
          <ul className="divide-y divide-gray-200 max-h-64 overflow-y-auto">
            {anomalies.map((item) => (
              <li
                key={item.index}
                className={`flex justify-between px-4 py-2 ${
                  item.status === 'anomaly'
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

      <div className="mt-10">
        <AgentChatBox />
      </div>
    </main>
  );
}
