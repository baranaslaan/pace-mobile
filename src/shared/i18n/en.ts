/* English catalog. Keys must mirror tr.ts exactly. */

import type { Catalog } from "./tr";

export const en: Catalog = {
  common: {
    start: "Start",
    continue: "Continue",
    finish: "Finish",
    cancel: "Cancel",
    reset: "Reset",
  },

  tone: {
    good: "on track",
    warn: "watch out",
    crit: "critical",
    over: "limit exceeded",
    neutral: "setup needed",
  },

  menu: {
    today: "Today's expenses",
    budget: "Budget & Expenses",
    pace: "Pace",
    recurring: "Recurring",
    settings: "Settings",
    proSub: "Pace + export",
  },

  recurring: {
    title: "Recurring",
    quickSection: "Quick add",
    quickHint: "Save frequent expenses to add them in one tap.",
    quickEmpty: "No templates yet. Coffee, lunch, groceries…",
    scheduledSection: "Scheduled",
    scheduledHint: "Auto-added as an expense when due.",
    scheduledEmpty: "No scheduled expenses yet. Rent, gym…",
    name: "What for?",
    weekly: "Weekly",
    monthly: "Monthly",
    weeklySummary: "Weekly · {day}",
    monthlySummary: "Monthly · day {day}",
    dayOfMonth: "Day of month",
  },

  welcome: {
    title: "Master your daily\nspending pace.",
    subtitle:
      "Enter your budget and fixed expenses once; pace works out how much you can spend each day.",
  },

  budgetStep: {
    title: "What's your budget this month?",
    hint: "The net amount you've set aside to spend this month.",
  },

  subsStep: {
    title: "Any fixed expenses?",
    hint: "Rent, subscriptions, loans… We reserve these up front. You can skip this.",
    whatFor: "What for?",
  },

  recap: {
    title: "All set.",
    hint: "Your daily limit starting today:",
    perDay: "/day",
    point1: "See how much you can spend each day at a glance.",
    point2: "It drops as you spend; spend less and tomorrow grows.",
    point3: "Fixed expenses are reserved up front, out of the daily math.",
    point4: "Go over the limit and the screen turns red to warn you.",
  },

  board: {
    setupOverTitle: "Your fixed expenses exceed your budget",
    setupBudgetTitle: "Set your monthly budget",
    setupOverText:
      "Your expenses ({subs}) are more than your budget ({budget}). Can't compute a daily limit — raise your budget or cut expenses.",
    setupBudgetText:
      "Enter your budget and your daily spending limit is calculated automatically.",
    hint: "••• → Budget & Expenses",
    spent: "spent",
    limit: "limit",
  },

  ring: {
    left: "left",
    perDay: "/ day",
  },

  input: {
    prompt: "What did you spend today?",
    notePlaceholder: "Add a note (optional)",
  },

  history: {
    title: "Today's expenses",
    summaryTotal: "Today's total",
    items: "{n} items",
    empty:
      "No expenses yet today. Close the menu and enter an amount from the home screen to add one here.",
    resetToday: "Reset today",
    confirmReset: "Delete all of today's entries?",
  },

  entry: {
    notePlaceholder: "Add note",
  },

  subs: {
    title: "Budget & Expenses",
    daily: "Your daily limit is",
    reserved: "reserved",
    listLabel: "Fixed expenses",
    empty: "No fixed expenses yet. Rent, subscriptions, loans…",
    freeLimit: "Up to {n} fixed expenses on the free plan.",
    freeLimitTail: " to add unlimited — one-time, lifetime.",
    goPro: "Get Pace Pro",
    whatFor: "What for?",
  },

  budgetField: {
    label: "Monthly budget",
  },

  analytics: {
    title: "Pace",
    spent: "spent",
    dailyAvg: "daily avg",
    pool: "pool",
    weeklyPace: "Weekly pace",
    last7: "last 7 days",
    trendNoData: "No data last week — need a week to compare.",
    trendDown: "You spent {pct}% less than last week. Slowing down 👏",
    trendUp: "You spent {pct}% more than last week. Watch your pace.",
    forecastTitle: "Month-end forecast",
    forecastNone: "No spending yet — pace not set.",
    forecastSurplus: "At this rate you'll have {balance} left at month-end.",
    forecastDeficit: "Heads up — at this rate you'll run out on day {day}.",
    forecastSub: "Projected month-end spend {projected} / pool {pool}",
    recentDays: "Recent days",
    today: "Today",
    weekdays: "Days of the week",
    weekNote: "You spend most on {day} · avg {avg}",
    weekNoData: "Need a bit more data for the weekday breakdown.",
    categories: "Category breakdown",
    pastMonths: "Past months",
    lockTitle: "Pace analysis is in Pace Pro",
    lockText:
      "See your month-end forecast and past spending breakdown. One-time payment, lifetime.",
    goPro: "Get Pace Pro",
  },

  settings: {
    title: "Settings",
    proActive: "Pace Pro active",
    proActiveSub: "All features unlocked · lifetime",
    proIdleSub: "Pace analysis and more · one-time",
    go: "Get",
    notifications: "Notifications",
    dailyReminder: "Daily reminder",
    everyDayAt: "Every day at {time}",
    off: "Off",
    permTitle: "Notifications are off",
    permBody:
      "To get reminders, enable them in Settings → Notifications → pace on your phone.",
    budget: "Budget",
    budgetRow: "Budget & fixed expenses",
    budgetSub: "Monthly {budget} · {n} fixed expenses",
    currency: "Currency",
    language: "Language",
    data: "Data",
    export: "Export expenses",
    exportPreparing: "Preparing…",
    exportSub: "Share as CSV (Excel, Numbers…)",
    noDataTitle: "Nothing to export",
    noDataBody: "Enter a few expenses first.",
    exportFailTitle: "Export failed",
    exportFailBody: "Something went wrong, try again.",
    resetAll: "Reset all data",
    confirmResetText:
      "Budget, fixed expenses and all spending will be deleted; setup starts over. Your Pro stays.",
    dev: "Developer",
    devPro: "Pace Pro (test)",
    devProSub: "Currently: {state} — tap to toggle",
    stateOn: "on",
    stateOff: "off",
    testNotif: "Send test notification",
    testNotifSub: "One-time notification after 5s",
    testSentTitle: "Sent",
    testSentBody:
      "A notification will arrive within 5 seconds (send the app to background).",
    testPermBody: "Enable notification permission first.",
    version: "pace · version {version}",
  },

  paywall: {
    title: "Pace Pro",
    activeTitle: "Pace Pro active 🎉",
    activeSub: "All pace features unlocked. Happy spending.",
    headline: "Master your pace",
    sub: "One-time payment, lifetime access.",
    benefit1: "Month-end budget forecast",
    benefit2: "Past spending breakdown",
    benefit3: "Pace analysis and trends",
    benefit4: "All future Pro features",
    processing: "Processing…",
    buy: "Unlock Pace Pro · {price}",
    fine: "Real purchase is in the mobile app (App Store / Google Play).",
  },

  notif: {
    title: "pace",
    body: "What did you spend today? Check your daily pace.",
    testBody: "Test notification — everything works 👍",
  },

  csv: {
    date: "Date",
    time: "Time",
    category: "Category",
    amount: "Amount",
    note: "Note",
  },

  currency: {
    TRY: "Turkish Lira",
    USD: "US Dollar",
    EUR: "Euro",
    GBP: "Pound Sterling",
  },

  category: {
    market: "Groceries",
    yemek: "Food",
    ulasim: "Transport",
    kahve: "Coffee",
    eglence: "Fun",
    fatura: "Bills",
    saglik: "Health",
    diger: "Other",
  },

  months: [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
  ],
  weekdaysShort: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
  weekdaysFull: [
    "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday",
  ],
};
