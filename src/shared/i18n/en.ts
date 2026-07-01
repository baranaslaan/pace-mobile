/* English catalog. Keys must mirror tr.ts exactly. */

import type { Catalog } from "./tr";

export const en: Catalog = {
  common: {
    start: "Start",
    continue: "Continue",
    finish: "Finish",
    cancel: "Cancel",
    reset: "Reset",
    pct: "{n}%",
  },

  tone: {
    good: "on track",
    warn: "watch out",
    crit: "critical",
    over: "limit exceeded",
    neutral: "setup needed",
  },

  error: {
    title: "Something went wrong",
    body: "An unexpected error occurred. You can try again.",
    retry: "Try again",
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
    scheduledHint: "Added as that day's expense when due — not reserved up front like a fixed expense.",
    scheduledEmpty: "No scheduled expenses yet. Rent, gym…",
    name: "What for?",
    weekly: "Weekly",
    monthly: "Monthly",
    weeklySummary: "Weekly · {day}",
    monthlySummary: "Monthly · day {day}",
    dayOfMonth: "Day of month",
    quickProTitle: "Unlimited quick templates in Pace Pro",
    quickProText: "Up to {n} quick templates on the free plan. Add unlimited with Pro — one-time, lifetime.",
    proTitle: "Auto-posting is in Pace Pro",
    proText: "Rent, subscriptions, gym… added automatically when due. One-time payment, lifetime.",
    goPro: "Get Pace Pro",
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
    hint: "Rent, subscriptions, loans… reserved from your budget up front. Skip if you like.",
    whatFor: "What for?",
    limitNote: "Up to {n} fixed expenses on the free plan. Unlimited with Pro.",
  },

  recap: {
    title: "All set.",
    hint: "Your daily limit starting today:",
    perDay: "/day",
    proratedNote: "Spread over the {days} days left this month. Next month it spans the full month.",
    point1: "See how much you can spend each day at a glance.",
    point2: "It drops as you spend; spend less and tomorrow grows.",
    point3: "Fixed expenses are reserved up front, out of the daily math.",
    point4: "Go over the limit and the screen turns red to warn you.",
    point5: "Tag expenses by category and see the breakdown in Pace.",
    point6: "Add frequent or regular expenses in one tap, or automatically.",
  },

  features: {
    title: "A few more things",
    subtitle: "Some extras that make Pace yours.",
    alertsTitle: "Budget alerts",
    alertsDesc: "We'll nudge you at 80% and 100% of your budget — before you overspend.",
    categoriesTitle: "Categories & budgets",
    categoriesDesc: "Tag spending, add your own categories, set a monthly limit on each.",
    recurringTitle: "Recurring",
    recurringDesc: "Templates for frequent spends, auto-posting for regular ones.",
    localeTitle: "Language & currency",
    localeDesc: "Turkish/English and any currency — change it anytime.",
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
    rolloverTip:
      "Your limit recalculates daily: underspend and it rises, overspend and it tightens. Tap to dismiss.",
    firstExpenseTip:
      "Add your first expense in the box below — type the amount, done.",
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
    empty: "No expenses yet today. Enter an amount from the home screen and it shows up here.",
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
    listHint: "Deducted from your budget upfront — not counted as daily spending.",
    empty: "No fixed expenses yet. Rent, subscriptions, loans…",
    proTitle: "Unlimited fixed expenses in Pace Pro",
    proText: "Up to {n} fixed expenses on the free plan. Unlimited with Pro — one-time, lifetime.",
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
    biggest: "Biggest expenses",
    categories: "Category breakdown",
    budgetStatus: "Budget status",
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
    budgetAlerts: "Budget alerts",
    budgetAlertsOn: "Alert at 80% and 100% of budget",
    off: "Off",
    permTitle: "Notifications are off",
    permBody:
      "To get reminders, enable them in Settings → Notifications → pace on your phone.",
    budget: "Budget",
    budgetRow: "Budget & fixed expenses",
    budgetSub: "Monthly {budget} · {n} fixed expenses",
    categoryBudgetsRow: "Category budgets",
    categoryBudgetsSub: "Limits on {n} categories",
    categoryBudgetsSubEmpty: "Monthly limit per category",
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
    backup: "Back up",
    backupPreparing: "Preparing…",
    backupSub: "Save all your data to one file (.json)",
    backupNoDataTitle: "Nothing to back up",
    backupNoDataBody: "Finish setup first.",
    backupFailTitle: "Backup failed",
    backupFailBody: "Something went wrong, try again.",
    dataRestore: "Restore from backup",
    dataRestoreSub: "Import a previous .json backup",
    restoreConfirmTitle: "Restore from backup?",
    restoreConfirmBody:
      "All your current data (budget, expenses, fixed costs) will be replaced with the backup. This can't be undone.",
    restoreConfirmCta: "Restore",
    restoreSuccessTitle: "Restored",
    restoreSuccessBody: "Your data was restored from the backup.",
    restoreFailTitle: "Restore failed",
    restoreFailBody: "Couldn't read the file or it isn't a valid pace backup.",
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
    account: "Account",
    restore: "Restore purchases",
    restoreSub: "Already bought Pro? Restore it here",
    restoring: "Restoring…",
    restoreNoneTitle: "No purchases found",
    restoreNoneBody: "No Pace Pro purchase to restore on this Apple ID.",
    restoredTitle: "Pace Pro restored 🎉",
    restoredBody: "All Pro features are unlocked again.",
    legal: "Legal",
    privacy: "Privacy Policy",
    terms: "Terms of Use",
    version: "pace · version {version}",
  },

  paywall: {
    title: "Pace Pro",
    activeTitle: "Pace Pro active 🎉",
    activeSub: "All pace features unlocked. Happy spending.",
    headline: "Master your pace",
    sub: "Pay once for lifetime, or go yearly — your call.",
    benefit1: "Month-end forecast & pace trends",
    benefit2: "Category budgets & limit alerts",
    benefit3: "Spending breakdown & past-month reports",
    benefit4: "Scheduled auto-posting expenses",
    benefit5: "Unlimited fixed expenses + CSV export",
    benefit6: "All future Pro features",
    lifetime: "Lifetime",
    lifetimeNote: "one-time payment",
    annual: "Annual",
    annualNote: "renews yearly",
    bestValue: "Best value",
    founderBadge: "Founder price",
    launchNote: "For the first few — your price, for a little while",
    processing: "Processing…",
    buy: "Unlock Pace Pro · {price}",
    terms: "Terms of Use",
    privacy: "Privacy",
    fine: "The annual plan auto-renews unless turned off at least 24 hours before the period ends; payment is charged to your App Store account. Lifetime is a one-time purchase. You can manage or cancel anytime in your App Store settings.",
  },

  notif: {
    title: "pace",
    body: "What did you spend today? Check your daily pace.",
    testBody: "Test notification — everything works 👍",
  },

  budgetAlert: {
    nearTitle: "You're close to your budget",
    nearBody: "You've used {pct}% of this month's budget.",
    overTitle: "You've gone over budget",
    overBody: "You've used {pct}% of this month's budget.",
    catNearTitle: "You're close to your {cat} budget",
    catNearBody: "You've used {pct}% of your {cat} budget this month.",
    catOverTitle: "You've gone over your {cat} budget",
    catOverBody: "You've used {pct}% of your {cat} budget this month.",
  },

  catBudget: {
    title: "Category budgets",
    intro: "Set a monthly limit per category; we'll alert you at 80% and 100% of it.",
    newPlaceholder: "New category name",
    proTitle: "Category budgets are in Pace Pro",
    proText: "Set a monthly limit per category and get alerts as you approach it. One-time purchase, lifetime.",
    goPro: "Go Pace Pro",
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
