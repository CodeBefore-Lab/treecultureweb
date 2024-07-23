import React from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, ReferenceLine, Area } from "recharts";
import { Layout } from "antd";

const { Content } = Layout;

export const Secret = () => {
  const data = [
    { name: "January", sales: 12 },
    { name: "February", sales: 19 },
    { name: "March", sales: 3 },
    { name: "April", sales: 5 },
    { name: "May", sales: 2 },
    { name: "June", sales: 3 },
  ];

  return (
    <Layout className="bg-white h-full w-full">
      <Content className="p-4">
        <div className="text-2xl font-bold text-slate-800">Charts</div>

        <ResponsiveContainer width="100%" height={400} className="grid grid-cols-1 md:grid-cols-2 md:gap-12 ">
          <BarChart
            data={data}
            margin={{
              top: 5,
              right: 30,
              left: 20,
              bottom: 5,
            }}
            barSize={20}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <ReferenceLine y={0} stroke="#000" />
            <Bar dataKey="sales" fill="#8884d8" />
          </BarChart>
          <BarChart
            data={data}
            margin={{
              top: 5,
              right: 30,
              left: 20,
              bottom: 5,
            }}
            barSize={20}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <ReferenceLine y={0} stroke="#000" />
            <Bar dataKey="sales" fill="#8884d8" />
          </BarChart>
          <BarChart
            data={data}
            margin={{
              top: 5,
              right: 30,
              left: 20,
              bottom: 5,
            }}
            barSize={20}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <ReferenceLine y={0} stroke="#000" />
            <Bar dataKey="sales" fill="#8884d8" />
          </BarChart>
        </ResponsiveContainer>
      </Content>
    </Layout>
  );
};

export default Secret;
