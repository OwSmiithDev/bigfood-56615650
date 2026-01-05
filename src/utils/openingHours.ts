import type { Json } from "@/integrations/supabase/types";

export interface DaySchedule {
  open: string;
  close: string;
  enabled: boolean;
}

export interface OpeningHours {
  [day: string]: DaySchedule;
}

const dayMap: { [key: number]: string } = {
  0: "sunday",
  1: "monday",
  2: "tuesday",
  3: "wednesday",
  4: "thursday",
  5: "friday",
  6: "saturday",
};

const dayLabelsPortuguese: { [key: string]: string } = {
  sunday: "Domingo",
  monday: "Segunda",
  tuesday: "Terça",
  wednesday: "Quarta",
  thursday: "Quinta",
  friday: "Sexta",
  saturday: "Sábado",
};

export function isWithinOpeningHours(openingHours: OpeningHours | Json | null): boolean {
  if (!openingHours || typeof openingHours !== "object") return false;
  
  const hours = openingHours as OpeningHours;
  const now = new Date();
  
  const dayOfWeek = now.getDay();
  const dayKey = dayMap[dayOfWeek];
  const dayConfig = hours[dayKey];

  if (!dayConfig || !dayConfig.enabled) {
    return false;
  }

  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();
  const currentTimeMinutes = currentHour * 60 + currentMinute;

  const [openHour, openMinute] = dayConfig.open.split(":").map(Number);
  const [closeHour, closeMinute] = dayConfig.close.split(":").map(Number);

  const openTimeMinutes = openHour * 60 + openMinute;
  let closeTimeMinutes = closeHour * 60 + closeMinute;

  // Handle overnight hours (e.g., 18:00 - 02:00)
  if (closeTimeMinutes < openTimeMinutes) {
    return currentTimeMinutes >= openTimeMinutes || currentTimeMinutes < closeTimeMinutes;
  }

  return currentTimeMinutes >= openTimeMinutes && currentTimeMinutes < closeTimeMinutes;
}

export function getNextOpeningTime(openingHours: OpeningHours | Json | null): string | null {
  if (!openingHours || typeof openingHours !== "object") return null;
  
  const hours = openingHours as OpeningHours;
  const now = new Date();
  const currentDayOfWeek = now.getDay();
  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();
  const currentTimeMinutes = currentHour * 60 + currentMinute;

  // Check today first
  const todayKey = dayMap[currentDayOfWeek];
  const todayConfig = hours[todayKey];
  
  if (todayConfig?.enabled) {
    const [openHour, openMinute] = todayConfig.open.split(":").map(Number);
    const openTimeMinutes = openHour * 60 + openMinute;
    
    // If opening time is later today
    if (openTimeMinutes > currentTimeMinutes) {
      return todayConfig.open;
    }
  }

  // Check next 7 days
  for (let i = 1; i <= 7; i++) {
    const nextDay = (currentDayOfWeek + i) % 7;
    const nextDayKey = dayMap[nextDay];
    const nextDayConfig = hours[nextDayKey];
    
    if (nextDayConfig?.enabled) {
      const dayLabel = dayLabelsPortuguese[nextDayKey];
      return `${dayLabel} às ${nextDayConfig.open}`;
    }
  }

  return null;
}
