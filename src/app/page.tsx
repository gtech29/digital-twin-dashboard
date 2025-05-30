'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

type DeviceData = {
  [key: string]: string | null;
};

type FullData = {
  plc: DeviceData;
  dnp3: DeviceData;
  sensor: DeviceData;
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

export default function Home() {
  const [data, setData] = useState<FullData | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/device_data');
        const json = await res.json();
        setData(json);
      } catch (err) {
        console.error('Failed to fetch device data:', err);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 2000);
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
      <h1 className="text-3xl font-bold text-center text-blue-600 mb-10 tracking-wide uppercase">
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
    </main>
  );
}

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
          <div key={label} className="flex justify-between text-gray-800">
            <span className="font-medium capitalize">{label.replace(/_/g, ' ')}:</span>
            <span className="font-semibold">{value ?? '--'}</span>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
