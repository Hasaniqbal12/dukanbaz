"use client";
import Head from "next/head";
import { useState, useEffect } from "react";
import {
  FiDollarSign,
  FiTrendingUp,
  FiClock,
  FiCheckCircle,
  FiXCircle,
  FiDownload,
  FiCalendar,
  FiCreditCard,
  FiTarget,
  FiBarChart,
  FiPieChart,
  FiRefreshCw,
  FiEye,
  FiAlertCircle,
  FiArrowUp,
  FiArrowDown,
  FiPlus
} from "react-icons/fi";

interface SummaryCard {
  label: string;
  amount: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  change: string;
  changeType: 'increase' | 'decrease' | 'neutral';
  bgGradient: string;
}

interface PayoutRecord {
  id: string;
  amount: string;
  numericAmount: number;
  status: 'Paid' | 'Pending' | 'Failed' | 'Processing';
  requested: string;
  paid: string;
  method: string;
  fee: string;
  description: string;
}



const summaryCards: SummaryCard[] = [
  {
    label: "Total Earnings",
    amount: "PKR 6,875,000",
    icon: FiDollarSign,
    color: "blue",
    change: "+12.5%",
    changeType: 'increase',
    bgGradient: "from-blue-500 to-cyan-500"
  },
  {
    label: "This Month",
    amount: "PKR 1,155,000",
    icon: FiTrendingUp,
    color: "green",
    change: "+8.2%",
    changeType: 'increase',
    bgGradient: "from-green-500 to-emerald-500"
  },
  {
    label: "Pending Payouts",
    amount: "PKR 440,000",
    icon: FiClock,
    color: "yellow",
    change: "3 pending",
    changeType: 'neutral',
    bgGradient: "from-yellow-500 to-orange-500"
  },
  {
    label: "Available Balance",
    amount: "PKR 825,000",
    icon: FiTarget,
    color: "purple",
    change: "+15.3%",
    changeType: 'increase',
    bgGradient: "from-purple-500 to-indigo-500"
  },
];

const payoutHistory: PayoutRecord[] = [
  {
    id: "PAYOUT-001",
    amount: "PKR 275,000",
    numericAmount: 275000,
    status: "Paid",
    requested: "2024-05-10",
    paid: "2024-05-12",
    method: "Bank Transfer",
    fee: "PKR 550",
    description: "Monthly payout - April sales"
  },
  {
    id: "PAYOUT-002",
    amount: "$825.00",
    numericAmount: 825,
    status: "Processing",
    requested: "2024-05-20",
    paid: "-",
    method: "PayPal",
    fee: "$8.25",
    description: "Weekly payout - Mid May"
  },
  {
    id: "PAYOUT-003",
    amount: "$1,925.00",
    numericAmount: 1925,
    status: "Failed",
    requested: "2024-04-15",
    paid: "-",
    method: "Bank Transfer",
    fee: "$3.85",
    description: "Monthly payout - March sales"
  },
  {
    id: "PAYOUT-004",
    amount: "$3,300.00",
    numericAmount: 3300,
    status: "Paid",
    requested: "2024-03-28",
    paid: "2024-03-30",
    method: "Bank Transfer",
    fee: "$6.60",
    description: "Monthly payout - February sales"
  },
  {
    id: "PAYOUT-005",
    amount: "$1,100.00",
    numericAmount: 1100,
    status: "Paid",
    requested: "2024-02-10",
    paid: "2024-02-12",
    method: "PayPal",
    fee: "$11.00",
    description: "Monthly payout - January sales"
  },
];



const statusConfig = {
  Paid: { bg: "bg-green-100", text: "text-green-800", icon: FiCheckCircle },
  Pending: { bg: "bg-yellow-100", text: "text-yellow-800", icon: FiClock },
  Processing: { bg: "bg-blue-100", text: "text-blue-800", icon: FiRefreshCw },
  Failed: { bg: "bg-red-100", text: "text-red-800", icon: FiXCircle },
};

export default function EarningsPage() {
  const [selectedTab, setSelectedTab] = useState<'overview' | 'payouts' | 'analytics'>('overview');
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [withdrawMethod, setWithdrawMethod] = useState("bank");
  const [withdrawAccount, setWithdrawAccount] = useState("");
  const [withdrawError, setWithdrawError] = useState("");
  const [withdrawSuccess, setWithdrawSuccess] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  const [statusFilter, setStatusFilter] = useState("all");

  const availableBalance = 4125.00;
  const minWithdraw = 50.00;

  useEffect(() => {
    const timer = setTimeout(() => setIsLoaded(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const filteredPayouts = payoutHistory.filter(payout => 
    statusFilter === "all" || payout.status.toLowerCase() === statusFilter
  );

  const handleWithdraw = (e: React.FormEvent) => {
    e.preventDefault();
    setWithdrawError("");
    setWithdrawSuccess(false);

    const amount = parseFloat(withdrawAmount);
    
    if (!amount || amount < minWithdraw) {
      setWithdrawError(`Minimum withdrawal amount is $${minWithdraw.toFixed(2)}`);
      return;
    }
    
    if (amount > availableBalance) {
      setWithdrawError("Insufficient balance");
      return;
    }
    
    if (!withdrawAccount || withdrawAccount.length < 5) {
      setWithdrawError("Please enter a valid account information");
      return;
    }

    setTimeout(() => {
      setWithdrawSuccess(true);
      console.log("Withdrawal requested:", { amount, method: withdrawMethod, account: withdrawAccount });
      setWithdrawAmount("");
      setWithdrawAccount("");
    }, 1000);
  };

  const getStatusIcon = (status: string) => {
    const StatusIcon = statusConfig[status as keyof typeof statusConfig]?.icon || FiClock;
    return <StatusIcon className="w-4 h-4" />;
  };

  return (
    <>
      <Head>
        <title>Earnings – WholesaleHub</title>
      </Head>
      <div className={`min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 transition-all duration-1000 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}>
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold text-gray-900">Earnings Dashboard</h1>
                <p className="text-gray-600">Track your revenue, manage payouts, and analyze performance</p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <button className="btn-secondary flex items-center gap-2">
                  <FiDownload className="w-4 h-4" />
                  Export Report
                </button>
                <button className="btn-secondary flex items-center gap-2">
                  <FiCalendar className="w-4 h-4" />
                  Date Range
                </button>
                <button className="btn-primary flex items-center gap-2">
                  <FiPlus className="w-4 h-4" />
                  Request Payout
                </button>
              </div>
            </div>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {summaryCards.map((card, index) => (
              <div key={card.label} className={`card-glass p-6 animate-fade-in`} style={{ animationDelay: `${index * 100}ms` }}>
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${card.bgGradient} flex items-center justify-center`}>
                    <card.icon className="w-6 h-6 text-white" />
                  </div>
                  <div className={`flex items-center gap-1 text-sm font-medium ${
                    card.changeType === 'increase' ? 'text-green-600' :
                    card.changeType === 'decrease' ? 'text-red-600' : 'text-gray-600'
                  }`}>
                    {card.changeType === 'increase' && <FiArrowUp className="w-3 h-3" />}
                    {card.changeType === 'decrease' && <FiArrowDown className="w-3 h-3" />}
                    <span>{card.change}</span>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">{card.label}</p>
                  <p className="text-2xl font-bold text-gray-900">{card.amount}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Navigation Tabs */}
          <div className="card-glass p-2 mb-8">
            <div className="flex space-x-1">
              {[
                { id: 'overview', label: 'Overview', icon: FiBarChart },
                { id: 'payouts', label: 'Payout History', icon: FiCreditCard },
                { id: 'analytics', label: 'Analytics', icon: FiPieChart }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setSelectedTab(tab.id as typeof selectedTab)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                    selectedTab === tab.id
                      ? 'bg-blue-500 text-white shadow-lg'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Tab Content */}
          {selectedTab === 'overview' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Withdrawal Form */}
              <div className="lg:col-span-1">
                <div className="card-glass p-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-6">Quick Withdrawal</h2>
                  
                  <form onSubmit={handleWithdraw} className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Available Balance
                      </label>
                      <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                        <span className="text-lg font-bold text-green-700">
                          ${availableBalance.toFixed(2)}
                        </span>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Withdrawal Amount
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                        <input
                          type="number"
                          step="0.01"
                          min={minWithdraw}
                          max={availableBalance}
                          value={withdrawAmount}
                          onChange={(e) => setWithdrawAmount(e.target.value)}
                          className="input-modern pl-8"
                          placeholder="0.00"
                        />
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        Minimum: ${minWithdraw.toFixed(2)}
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Payment Method
                      </label>
                      <div className="space-y-2">
                        <label className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                          <input
                            type="radio"
                            name="method"
                            value="bank"
                            checked={withdrawMethod === "bank"}
                            onChange={(e) => setWithdrawMethod(e.target.value)}
                            className="text-blue-500"
                          />
                          <FiCreditCard className="w-5 h-5 text-gray-600" />
                          <div>
                            <div className="font-medium">Bank Transfer</div>
                            <div className="text-xs text-gray-500">2-3 business days • $2.50 fee</div>
                          </div>
                        </label>
                        <label className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                          <input
                            type="radio"
                            name="method"
                            value="paypal"
                            checked={withdrawMethod === "paypal"}
                            onChange={(e) => setWithdrawMethod(e.target.value)}
                            className="text-blue-500"
                          />
                          <FiCreditCard className="w-5 h-5 text-gray-600" />
                          <div>
                            <div className="font-medium">PayPal</div>
                            <div className="text-xs text-gray-500">1-2 business days • 2.9% fee</div>
                          </div>
                        </label>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        {withdrawMethod === "bank" ? "Bank Account" : "PayPal Email"}
                      </label>
                      <input
                        type={withdrawMethod === "bank" ? "text" : "email"}
                        value={withdrawAccount}
                        onChange={(e) => setWithdrawAccount(e.target.value)}
                        className="input-modern"
                        placeholder={
                          withdrawMethod === "bank" 
                            ? "Enter your bank account number" 
                            : "Enter your PayPal email"
                        }
                      />
                    </div>

                    {withdrawError && (
                      <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                        <FiAlertCircle className="w-4 h-4" />
                        {withdrawError}
                      </div>
                    )}

                    {withdrawSuccess && (
                      <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">
                        <FiCheckCircle className="w-4 h-4" />
                        Withdrawal request submitted successfully!
                      </div>
                    )}

                    <button
                      type="submit"
                      className="btn-primary w-full"
                      disabled={!withdrawAmount || !withdrawAccount}
                    >
                      Request Withdrawal
                    </button>
                  </form>
                </div>
              </div>

              {/* Recent Activity & Quick Stats */}
              <div className="lg:col-span-2 space-y-6">
                {/* Earning Insights */}
                <div className="card-glass p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">Monthly Performance</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">89</div>
                      <div className="text-sm text-gray-500">Orders This Month</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">$65.85</div>
                      <div className="text-sm text-gray-500">Avg. Order Value</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-600">19.1%</div>
                      <div className="text-sm text-gray-500">Growth Rate</div>
                    </div>
                  </div>
                  
                  {/* Simple Chart Placeholder */}
                  <div className="h-48 bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-300">
                    <div className="text-center text-gray-500">
                      <FiBarChart className="w-12 h-12 mx-auto mb-2" />
                      <p>Revenue Chart</p>
                      <p className="text-sm">Integration with chart library needed</p>
                    </div>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="card-glass p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">Quick Actions</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <button className="flex items-center gap-3 p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg hover:from-blue-100 hover:to-blue-200 transition-all">
                      <FiDownload className="w-5 h-5 text-blue-600" />
                      <div className="text-left">
                        <div className="font-medium text-gray-900">Download Tax Report</div>
                        <div className="text-sm text-gray-500">Generate annual summary</div>
                      </div>
                    </button>
                    <button className="flex items-center gap-3 p-4 bg-gradient-to-r from-green-50 to-green-100 rounded-lg hover:from-green-100 hover:to-green-200 transition-all">
                      <FiCreditCard className="w-5 h-5 text-green-600" />
                      <div className="text-left">
                        <div className="font-medium text-gray-900">Payment Settings</div>
                        <div className="text-sm text-gray-500">Manage accounts</div>
                      </div>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {selectedTab === 'payouts' && (
            <div className="card-glass p-6">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
                <h2 className="text-xl font-bold text-gray-900">Payout History</h2>
                <div className="flex gap-3">
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="input-modern"
                  >
                    <option value="all">All Status</option>
                    <option value="paid">Paid</option>
                    <option value="pending">Pending</option>
                    <option value="processing">Processing</option>
                    <option value="failed">Failed</option>
                  </select>

                </div>
              </div>

            <div className="overflow-x-auto">
                <table className="w-full">
                <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-4 px-4 font-semibold text-gray-700">Payout ID</th>
                      <th className="text-left py-4 px-4 font-semibold text-gray-700">Amount</th>
                      <th className="text-left py-4 px-4 font-semibold text-gray-700">Method</th>
                      <th className="text-left py-4 px-4 font-semibold text-gray-700">Status</th>
                      <th className="text-left py-4 px-4 font-semibold text-gray-700">Requested</th>
                      <th className="text-left py-4 px-4 font-semibold text-gray-700">Completed</th>
                      <th className="text-left py-4 px-4 font-semibold text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                    {filteredPayouts.map((payout) => (
                      <tr key={payout.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                        <td className="py-4 px-4">
                          <div>
                            <div className="font-mono text-sm font-medium">{payout.id}</div>
                            <div className="text-xs text-gray-500">{payout.description}</div>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <div>
                            <div className="font-semibold text-gray-900">{payout.amount}</div>
                            <div className="text-xs text-gray-500">Fee: {payout.fee}</div>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-2">
                            {payout.method === "Bank Transfer" ? 
                              <FiCreditCard className="w-4 h-4 text-gray-600" /> : 
                              <FiCreditCard className="w-4 h-4 text-gray-600" />
                            }
                            <span className="text-sm">{payout.method}</span>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${
                            statusConfig[payout.status].bg
                          } ${statusConfig[payout.status].text}`}>
                            {getStatusIcon(payout.status)}
                            {payout.status}
                          </span>
                      </td>
                        <td className="py-4 px-4 text-sm text-gray-600">{payout.requested}</td>
                        <td className="py-4 px-4 text-sm text-gray-600">{payout.paid}</td>
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-2">
                            <button className="p-2 text-gray-400 hover:text-blue-600 transition-colors">
                              <FiEye className="w-4 h-4" />
                            </button>
                            <button className="p-2 text-gray-400 hover:text-green-600 transition-colors">
                              <FiDownload className="w-4 h-4" />
                            </button>
                            {payout.status === 'Failed' && (
                              <button className="p-2 text-gray-400 hover:text-orange-600 transition-colors">
                                <FiRefreshCw className="w-4 h-4" />
                        </button>
                            )}
                          </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          )}

          {selectedTab === 'analytics' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="card-glass p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Revenue Trends</h3>
                <div className="h-64 bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-300">
                  <div className="text-center text-gray-500">
                    <FiTrendingUp className="w-12 h-12 mx-auto mb-2" />
                    <p>Revenue Chart</p>
                    <p className="text-sm">Chart integration needed</p>
                  </div>
                </div>
              </div>

              <div className="card-glass p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Payout Distribution</h3>
                <div className="h-64 bg-gradient-to-br from-green-50 to-blue-50 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-300">
                  <div className="text-center text-gray-500">
                    <FiPieChart className="w-12 h-12 mx-auto mb-2" />
                    <p>Distribution Chart</p>
                    <p className="text-sm">Chart integration needed</p>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-2 card-glass p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Performance Insights</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <FiTarget className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-blue-600">92.5%</div>
                    <div className="text-sm text-gray-600">Payout Success Rate</div>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <FiClock className="w-8 h-8 text-green-600 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-green-600">2.1 days</div>
                    <div className="text-sm text-gray-600">Avg. Payout Time</div>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <FiDollarSign className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-purple-600">$1,245</div>
                    <div className="text-sm text-gray-600">Avg. Monthly Earnings</div>
            </div>
            </div>
              </div>
              </div>
            )}
        </div>
      </div>
    </>
  );
} 