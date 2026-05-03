export function useSeason() {
  const month = new Date().getMonth() + 1 // 1–12

  if (month >= 3 && month <= 5) return {
    name: 'spring', icon: '🌸',
    acc: '#4ade80', acc2: '#f472b6',
  }
  if (month >= 6 && month <= 8) return {
    name: 'summer', icon: '☀️',
    acc: '#fbbf24', acc2: '#06b6d4',
  }
  if (month >= 9 && month <= 11) return {
    name: 'autumn', icon: '🍂',
    acc: '#f97316', acc2: '#a78bfa',
  }
  return {
    name: 'winter', icon: '❄️',
    acc: '#60a5fa', acc2: '#c4b5fd',
  }
}
