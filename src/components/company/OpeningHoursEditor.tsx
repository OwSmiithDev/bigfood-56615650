import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export interface DaySchedule {
  open: string;
  close: string;
  enabled: boolean;
}

export interface OpeningHours {
  monday: DaySchedule;
  tuesday: DaySchedule;
  wednesday: DaySchedule;
  thursday: DaySchedule;
  friday: DaySchedule;
  saturday: DaySchedule;
  sunday: DaySchedule;
}

const dayLabels: Record<keyof OpeningHours, string> = {
  monday: "Segunda-feira",
  tuesday: "Terça-feira",
  wednesday: "Quarta-feira",
  thursday: "Quinta-feira",
  friday: "Sexta-feira",
  saturday: "Sábado",
  sunday: "Domingo",
};

const defaultSchedule: DaySchedule = {
  open: "09:00",
  close: "22:00",
  enabled: false,
};

export const defaultOpeningHours: OpeningHours = {
  monday: { ...defaultSchedule, enabled: true },
  tuesday: { ...defaultSchedule, enabled: true },
  wednesday: { ...defaultSchedule, enabled: true },
  thursday: { ...defaultSchedule, enabled: true },
  friday: { ...defaultSchedule, enabled: true },
  saturday: { ...defaultSchedule, enabled: true },
  sunday: { ...defaultSchedule, enabled: false },
};

interface OpeningHoursEditorProps {
  value: OpeningHours;
  onChange: (hours: OpeningHours) => void;
}

export const OpeningHoursEditor = ({ value, onChange }: OpeningHoursEditorProps) => {
  const updateDay = (day: keyof OpeningHours, field: keyof DaySchedule, newValue: string | boolean) => {
    onChange({
      ...value,
      [day]: {
        ...value[day],
        [field]: newValue,
      },
    });
  };

  return (
    <div className="space-y-3">
      {(Object.keys(dayLabels) as (keyof OpeningHours)[]).map((day) => (
        <div
          key={day}
          className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 p-3 bg-background rounded-lg border border-border"
        >
          <div className="flex items-center justify-between sm:justify-start gap-2 sm:w-40">
            <span className="text-sm font-medium">{dayLabels[day]}</span>
            <Switch
              checked={value[day]?.enabled ?? false}
              onCheckedChange={(checked) => updateDay(day, "enabled", checked)}
            />
          </div>
          
          {value[day]?.enabled && (
            <div className="flex items-center gap-2 flex-1">
              <div className="flex-1">
                <Label className="text-xs text-muted-foreground">Abre</Label>
                <Input
                  type="time"
                  value={value[day]?.open ?? "09:00"}
                  onChange={(e) => updateDay(day, "open", e.target.value)}
                  className="mt-1"
                />
              </div>
              <div className="flex-1">
                <Label className="text-xs text-muted-foreground">Fecha</Label>
                <Input
                  type="time"
                  value={value[day]?.close ?? "22:00"}
                  onChange={(e) => updateDay(day, "close", e.target.value)}
                  className="mt-1"
                />
              </div>
            </div>
          )}
          
          {!value[day]?.enabled && (
            <span className="text-sm text-muted-foreground">Fechado</span>
          )}
        </div>
      ))}
      <p className="text-xs text-muted-foreground mt-2">
        O status "Aberto/Fechado" será atualizado automaticamente baseado nestes horários.
      </p>
    </div>
  );
};
