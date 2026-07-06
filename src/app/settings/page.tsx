"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import {
  Settings,
  Bell,
  Palette,
  Globe,
  Save,
  User,
  CreditCard,
} from "lucide-react";

const tabs = [
  { id: "general", label: "General", icon: Settings },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "appearance", label: "Appearance", icon: Palette },
  { id: "billing", label: "Billing", icon: CreditCard },
  { id: "team", label: "Team", icon: User },
];

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("general");

  return (
    <div className="animate-fade-in">
      <div className="px-4 pt-4 pb-6 md:px-6 md:pt-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
              Settings
            </h1>
            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
              Manage your account and application preferences
            </p>
          </div>
          <button className="flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-medium text-white shadow-sm hover:bg-indigo-700 transition-colors">
            <Save className="h-3.5 w-3.5" />
            Save Changes
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-6 overflow-x-auto pb-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = tab.id === activeTab;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium whitespace-nowrap transition-all duration-200",
                  isActive
                    ? "bg-zinc-900 text-white shadow-sm dark:bg-zinc-100 dark:text-zinc-900"
                    : "text-zinc-500 hover:text-zinc-800 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:text-zinc-200 dark:hover:bg-zinc-800/60"
                )}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Settings content */}
        <div className="rounded-2xl bg-white/70 dark:bg-zinc-900/70 ring-1 ring-zinc-200/50 dark:ring-zinc-800/50 backdrop-blur-xl shadow-sm p-6">
          {activeTab === "general" && (
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 mb-4">Store Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    { label: "Store Name", value: "EcomDash Store", type: "text" },
                    { label: "Store Email", value: "admin@ecomdash.com", type: "email" },
                    { label: "Currency", value: "USD ($)", type: "select" },
                    { label: "Timezone", value: "UTC (Coordinated Universal Time)", type: "select" },
                  ].map((field) => (
                    <div key={field.label}>
                      <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-1.5 block">{field.label}</label>
                      <div className="flex items-center gap-2 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 px-3 py-2.5 ring-1 ring-zinc-200/50 dark:ring-zinc-700/50">
                        <input
                          type="text"
                          defaultValue={field.value}
                          className="bg-transparent border-none outline-none text-xs text-zinc-800 dark:text-zinc-200 w-full"
                          readOnly
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800">
                <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 mb-2">Language</h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-3">Select your preferred language for the dashboard interface.</p>
                <div className="flex items-center gap-2 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 px-3 py-2.5 ring-1 ring-zinc-200/50 dark:ring-zinc-700/50 max-w-xs">
                  <Globe className="h-4 w-4 text-zinc-400" />
                  <span className="text-xs text-zinc-800 dark:text-zinc-200">English (US)</span>
                </div>
              </div>
            </div>
          )}

          {activeTab === "notifications" && (
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 mb-3">Notification Preferences</h3>
              {[
                { label: "New Orders", desc: "Get notified when a new order is placed", enabled: true },
                { label: "Low Stock Alerts", desc: "Receive alerts when products run low", enabled: true },
                { label: "Customer Signups", desc: "Get notified about new customer registrations", enabled: false },
                { label: "Weekly Reports", desc: "Receive weekly performance summaries", enabled: true },
                { label: "System Updates", desc: "Be informed about platform maintenance and updates", enabled: true },
              ].map((item) => (
                <div key={item.label} className="flex items-center justify-between py-3 border-b border-zinc-100/50 dark:border-zinc-800/50 last:border-0">
                  <div>
                    <p className="text-sm font-medium text-zinc-800 dark:text-zinc-200">{item.label}</p>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">{item.desc}</p>
                  </div>
                  <div className={cn(
                    "h-5 w-9 rounded-full transition-colors duration-200 relative",
                    item.enabled ? "bg-indigo-500" : "bg-zinc-300 dark:bg-zinc-600"
                  )}>
                    <div className={cn(
                      "h-4 w-4 rounded-full bg-white shadow-sm absolute top-0.5 transition-transform duration-200",
                      item.enabled ? "translate-x-4.5 left-0.5" : "left-0.5"
                    )} />
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === "appearance" && (
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 mb-3">Theme</h3>
                <div className="flex gap-3">
                  {[
                    { label: "Light", value: "light", bg: "bg-white", border: "ring-zinc-200" },
                    { label: "Dark", value: "dark", bg: "bg-zinc-900", border: "ring-zinc-700" },
                    { label: "System", value: "system", bg: "bg-gradient-to-r from-white to-zinc-900", border: "ring-zinc-200" },
                  ].map((theme) => (
                    <button
                      key={theme.value}
                      className={cn(
                        "flex flex-col items-center gap-2 rounded-xl p-4 ring-2 transition-all",
                        theme.value === "system" ? theme.border : "ring-zinc-200/50 dark:ring-zinc-700/50",
                        "hover:ring-indigo-400"
                      )}
                    >
                      <div className={cn("h-16 w-24 rounded-lg shadow-sm ring-1 ring-zinc-200/50", theme.bg)} />
                      <span className="text-xs font-medium text-zinc-600 dark:text-zinc-400">{theme.label}</span>
                    </button>
                  ))}
                </div>
              </div>
              <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800">
                <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 mb-2">Sidebar</h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">Toggle between expanded and collapsed sidebar modes using the arrow button at the bottom of the sidebar.</p>
              </div>
            </div>
          )}

          {activeTab === "billing" && (
            <div className="flex items-center justify-center h-40 text-zinc-400 dark:text-zinc-500">
              <div className="flex flex-col items-center gap-2">
                <CreditCard className="h-8 w-8 text-zinc-300 dark:text-zinc-600" />
                <p className="text-sm font-medium">Billing settings coming soon</p>
              </div>
            </div>
          )}

          {activeTab === "team" && (
            <div className="flex items-center justify-center h-40 text-zinc-400 dark:text-zinc-500">
              <div className="flex flex-col items-center gap-2">
                <User className="h-8 w-8 text-zinc-300 dark:text-zinc-600" />
                <p className="text-sm font-medium">Team management coming soon</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
