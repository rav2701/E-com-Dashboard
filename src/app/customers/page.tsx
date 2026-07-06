"use client";

import { cn } from "@/lib/utils";
import {
  Users,
  Clock,
  Search,
  Filter,
} from "lucide-react";

const mockCustomers = [
  { name: "Alice Chen", email: "alice@example.com", orders: 12, spent: "$2,847", city: "New York", segment: "VIP" },
  { name: "Marcus Johnson", email: "marcus@example.com", orders: 8, spent: "$1,932", city: "Los Angeles", segment: "Regular" },
  { name: "Sofia Rodriguez", email: "sofia@example.com", orders: 15, spent: "$3,451", city: "Miami", segment: "VIP" },
  { name: "James Wilson", email: "james@example.com", orders: 3, spent: "$529", city: "Chicago", segment: "New" },
  { name: "Emily Davis", email: "emily@example.com", orders: 7, spent: "$1,245", city: "Seattle", segment: "Regular" },
  { name: "David Kim", email: "david@example.com", orders: 22, spent: "$5,678", city: "San Francisco", segment: "VIP" },
  { name: "Lisa Chen", email: "lisa@example.com", orders: 5, spent: "$892", city: "Boston", segment: "Regular" },
  { name: "Tom Brown", email: "tom@example.com", orders: 1, spent: "$159", city: "Denver", segment: "New" },
];

const segmentColors: Record<string, string> = {
  VIP: "bg-purple-100 text-purple-700 dark:bg-purple-950/50 dark:text-purple-300",
  Regular: "bg-blue-100 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300",
  New: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300",
};

export default function CustomersPage() {
  return (
    <div className="animate-fade-in">
      <div className="px-4 pt-4 pb-6 md:px-6 md:pt-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
              Customers
            </h1>
            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
              View and manage your customer relationships
            </p>
          </div>
          <div className="hidden sm:flex items-center gap-2 rounded-xl bg-white/70 px-4 py-2 text-xs text-zinc-500 shadow-sm ring-1 ring-zinc-200/50 dark:bg-zinc-900/70 dark:ring-zinc-800/50">
            <Users className="h-3.5 w-3.5" />
            <span>{mockCustomers.length} active customers</span>
          </div>
        </div>

        {/* Quick stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {[
            { label: "Total Customers", value: "2,847", change: "+12.5%" },
            { label: "Avg. Orders/Customer", value: "8.4", change: "+3.2%" },
            { label: "Avg. Lifetime Value", value: "$1,245", change: "+8.7%" },
          ].map((stat) => (
            <div key={stat.label} className="rounded-2xl bg-white/70 dark:bg-zinc-900/70 ring-1 ring-zinc-200/50 dark:ring-zinc-800/50 backdrop-blur-xl shadow-sm p-5">
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-1">{stat.label}</p>
              <div className="flex items-center justify-between">
                <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">{stat.value}</p>
                <span className="text-[10px] font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 rounded-full px-2 py-0.5">{stat.change}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Search */}
        <div className="flex items-center gap-2 mb-4">
          <div className="flex items-center gap-2 rounded-xl bg-white/70 dark:bg-zinc-900/70 px-3 py-2 ring-1 ring-zinc-200/50 dark:ring-zinc-800/50 flex-1 max-w-xs">
            <Search className="h-4 w-4 text-zinc-400" />
            <input type="text" placeholder="Search customers..." className="bg-transparent border-none outline-none text-xs text-zinc-600 dark:text-zinc-400 w-full placeholder:text-zinc-400" />
          </div>
          <button className="flex items-center gap-1.5 rounded-xl bg-white/70 dark:bg-zinc-900/70 px-3 py-2 text-xs font-medium text-zinc-600 dark:text-zinc-400 ring-1 ring-zinc-200/50 dark:ring-zinc-800/50 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
            <Filter className="h-3.5 w-3.5" />
            Segment
          </button>
        </div>

        {/* Customer list */}
        <div className="rounded-2xl bg-white/70 dark:bg-zinc-900/70 ring-1 ring-zinc-200/50 dark:ring-zinc-800/50 backdrop-blur-xl shadow-sm overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-zinc-100 dark:border-zinc-800">
                <th className="pb-3 px-5 pt-4 font-semibold text-zinc-400 dark:text-zinc-500">Customer</th>
                <th className="pb-3 px-3 pt-4 font-semibold text-zinc-400 dark:text-zinc-500">Location</th>
                <th className="pb-3 px-3 pt-4 font-semibold text-zinc-400 dark:text-zinc-500">Orders</th>
                <th className="pb-3 px-3 pt-4 font-semibold text-zinc-400 dark:text-zinc-500">Total Spent</th>
                <th className="pb-3 px-3 pt-4 font-semibold text-zinc-400 dark:text-zinc-500">Segment</th>
              </tr>
            </thead>
            <tbody>
              {mockCustomers.map((customer) => (
                <tr key={customer.email} className="border-b border-zinc-100/50 transition-colors hover:bg-zinc-50/50 dark:border-zinc-800/50 dark:hover:bg-zinc-800/30 cursor-pointer">
                  <td className="py-3 px-5">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 text-xs font-bold text-indigo-700 dark:from-indigo-900/50 dark:to-purple-900/50 dark:text-indigo-300">
                        {customer.name.split(" ").map(n => n[0]).join("")}
                      </div>
                      <div>
                        <p className="font-medium text-zinc-800 dark:text-zinc-200">{customer.name}</p>
                        <p className="text-[10px] text-zinc-400 dark:text-zinc-500">{customer.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-3 text-zinc-600 dark:text-zinc-400">{customer.city}</td>
                  <td className="py-3 px-3 font-medium text-zinc-800 dark:text-zinc-200">{customer.orders}</td>
                  <td className="py-3 px-3 font-medium text-zinc-800 dark:text-zinc-200">{customer.spent}</td>
                  <td className="py-3 px-3">
                    <span className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-medium ${segmentColors[customer.segment]}`}>
                      {customer.segment}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
