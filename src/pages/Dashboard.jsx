import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import {
  ShoppingCart,
  Clock,
  CheckCircle,
  Package,
  Users,
  UserCircle,
  TrendingUp,
  TrendingDown,
  DollarSign
} from 'lucide-react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await api.get('/orders/stats');
      if (response.data.success) {
        setStats(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-600"></div>
      </div>
    );
  }

  const orderStats = [
    {
      title: 'Total Orders',
      value: stats?.orders?.total || 0,
      icon: ShoppingCart,
      color: 'slate',
      bgColor: 'bg-slate-100',
      textColor: 'text-slate-700',
      link: '/orders'
    },
    {
      title: 'Pending Orders',
      value: stats?.orders?.pending || 0,
      icon: Clock,
      color: 'amber',
      bgColor: 'bg-amber-100',
      textColor: 'text-amber-700',
      link: '/orders?status=pending'
    },
    {
      title: 'To Roll',
      value: stats?.orders?.toRoll || 0,
      icon: Package,
      color: 'indigo',
      bgColor: 'bg-indigo-100',
      textColor: 'text-indigo-700',
      link: '/orders?status=to roll'
    },
    {
      title: 'Rolled Orders',
      value: stats?.orders?.rolled || 0,
      icon: TrendingUp,
      color: 'violet',
      bgColor: 'bg-violet-100',
      textColor: 'text-violet-700',
      link: '/orders?status=rolled'
    },
    {
      title: 'Billed Orders',
      value: stats?.orders?.billed || 0,
      icon: DollarSign,
      color: 'orange',
      bgColor: 'bg-orange-100',
      textColor: 'text-orange-700',
      link: '/orders?status=billed'
    },
    {
      title: 'Delivered Orders',
      value: stats?.orders?.delivered || 0,
      icon: CheckCircle,
      color: 'emerald',
      bgColor: 'bg-emerald-100',
      textColor: 'text-emerald-700',
      link: '/orders?status=delivered'
    },
  ];

  const otherStats = [
    {
      title: 'Total Salesmen',
      value: stats?.salesmen || 0,
      icon: Users,
      color: 'slate',
      bgColor: 'bg-slate-100',
      textColor: 'text-slate-700',
      link: '/salesmen'
    },
    {
      title: 'Total Customers',
      value: stats?.customers || 0,
      icon: UserCircle,
      color: 'emerald',
      bgColor: 'bg-emerald-100',
      textColor: 'text-emerald-700',
      link: '/customers'
    },
  ];

  // Prepare data for charts
  const orderStatusData = [
    { name: 'Pending', value: stats?.orders?.pending || 0, color: '#f59e0b' },
    { name: 'To Roll', value: stats?.orders?.toRoll || 0, color: '#6366f1' },
    { name: 'Rolled', value: stats?.orders?.rolled || 0, color: '#8b5cf6' },
    { name: 'Billed', value: stats?.orders?.billed || 0, color: '#f97316' },
    { name: 'Delivered', value: stats?.orders?.delivered || 0, color: '#10b981' },
  ];

  const orderTrendData = stats?.trends || [];

  const performanceData = [
    { name: 'Orders', current: stats?.orders?.total || 0, target: 100 },
    { name: 'Delivered', current: stats?.orders?.delivered || 0, target: 80 },
    { name: 'Customers', current: stats?.customers || 0, target: 50 },
    { name: 'Salesmen', current: stats?.salesmen || 0, target: 10 },
  ];

  const StatCard = ({ stat }) => {
    const Icon = stat.icon;

    return (
      <Link
        to={stat.link}
        className="bg-white/80 backdrop-blur rounded-2xl shadow-sm ring-1 ring-slate-200/70 p-6 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-slate-600 mb-1 font-medium">{stat.title}</p>
            <p className="text-3xl font-bold text-slate-900">{stat.value}</p>
          </div>
          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${stat.bgColor}`}>
            <Icon className={`w-7 h-7 ${stat.textColor}`} />
          </div>
        </div>
      </Link>
    );
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold text-slate-800 mb-2" style={{ fontFamily: "'Inter', 'Segoe UI', sans-serif" }}>Dashboard</h1>
        <p className="text-slate-600 text-lg" style={{ fontFamily: "'Inter', 'Segoe UI', sans-serif" }}>Welcome back! Here's an overview of your business.</p>
      </div>

      {/* Order Statistics */}
      <div>
        <h2 className="text-xl font-semibold text-slate-800 mb-4" style={{ fontFamily: "'Inter', 'Segoe UI', sans-serif" }}>Order Statistics</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {orderStats.map((stat, index) => (
            <StatCard key={index} stat={stat} />
          ))}
        </div>
      </div>

      {/* Other Statistics */}
      <div>
        <h2 className="text-xl font-semibold text-slate-800 mb-4" style={{ fontFamily: "'Inter', 'Segoe UI', sans-serif" }}>Other Statistics</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {otherStats.map((stat, index) => (
            <StatCard key={index} stat={stat} />
          ))}
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Order Status Distribution - Pie Chart */}
        <div className="bg-white/80 backdrop-blur rounded-2xl shadow-sm ring-1 ring-slate-200/70 p-6">
          <h3 className="text-lg font-semibold text-slate-800 mb-4" style={{ fontFamily: "'Inter', 'Segoe UI', sans-serif" }}>Order Status Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={orderStatusData}
                cx="50%"
                cy="50%"
                labelLine={true}
                label={({ cx, cy, midAngle, innerRadius, outerRadius, percent, name }) => {
                  const RADIAN = Math.PI / 180;
                  const radius = outerRadius + 25;
                  const x = cx + radius * Math.cos(-midAngle * RADIAN);
                  const y = cy + radius * Math.sin(-midAngle * RADIAN);
                  
                  return percent > 0 ? (
                    <text
                      x={x}
                      y={y}
                      fill="#475569"
                      textAnchor={x > cx ? 'start' : 'end'}
                      dominantBaseline="central"
                      style={{ fontSize: '12px', fontWeight: '500' }}
                    >
                      {`${name}: ${(percent * 100).toFixed(0)}%`}
                    </text>
                  ) : null;
                }}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {orderStatusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Performance Metrics - Bar Chart */}
        <div className="bg-white/80 backdrop-blur rounded-2xl shadow-sm ring-1 ring-slate-200/70 p-6">
          <h3 className="text-lg font-semibold text-slate-800 mb-4" style={{ fontFamily: "'Inter', 'Segoe UI', sans-serif" }}>Performance vs Target</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={performanceData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="name" stroke="#64748b" style={{ fontSize: '12px' }} />
              <YAxis stroke="#64748b" style={{ fontSize: '12px' }} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'white', 
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                }}
              />
              <Legend />
              <Bar dataKey="current" fill="#64748b" name="Current" radius={[8, 8, 0, 0]} />
              <Bar dataKey="target" fill="#cbd5e1" name="Target" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Order Trends - Area Chart */}
      <div className="bg-white/80 backdrop-blur rounded-2xl shadow-sm ring-1 ring-slate-200/70 p-6">
        <h3 className="text-lg font-semibold text-slate-800 mb-4" style={{ fontFamily: "'Inter', 'Segoe UI', sans-serif" }}>Order Trends (Last 6 Months)</h3>
        <ResponsiveContainer width="100%" height={350}>
          <AreaChart data={orderTrendData}>
            <defs>
              <linearGradient id="colorOrders" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#64748b" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#64748b" stopOpacity={0.1}/>
              </linearGradient>
              <linearGradient id="colorDelivered" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#10b981" stopOpacity={0.1}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="month" stroke="#64748b" style={{ fontSize: '12px' }} />
            <YAxis stroke="#64748b" style={{ fontSize: '12px' }} />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'white', 
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
              }}
            />
            <Legend />
            <Area 
              type="monotone" 
              dataKey="orders" 
              stroke="#64748b" 
              fillOpacity={1} 
              fill="url(#colorOrders)" 
              name="Total Orders"
              strokeWidth={2}
            />
            <Area 
              type="monotone" 
              dataKey="delivered" 
              stroke="#10b981" 
              fillOpacity={1} 
              fill="url(#colorDelivered)" 
              name="Delivered"
              strokeWidth={2}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default Dashboard;
