import { formatTimeOfDay } from "../utils/date";

interface CardDateProps {
  date: string;
  createdAt?: string;
}

export default function CardDate({ date, createdAt }: CardDateProps) {
  const time = formatTimeOfDay(createdAt);
  return (
    <span className="note-card__date">
      {date}
      {time && ` · ${time}`}
    </span>
  );
}
