import React from "react";
import StatisticsCard from "./StatisticsCard";
import {
  FireIcon,
  ChartPieIcon,
  ClockIcon,
  CheckCircleIcon,
} from "@/assets/custom-icons";
import { t } from "i18next";

interface QuadrantStatsProps {
  quadrantCounts: number[];
}

const QuadrantStats: React.FC<QuadrantStatsProps> = ({ quadrantCounts }) => (
  <div className="grid grid-cols-2 gap-4">
    <StatisticsCard
      title={t("quadrant.urgent_important")}
      value={quadrantCounts[0]}
      icon={<FireIcon />}
      color="#cf1322"
    />
    <StatisticsCard
      title={t("quadrant.important_not_urgent")}
      value={quadrantCounts[1]}
      icon={<ChartPieIcon />}
      color="#1890ff"
    />
    <StatisticsCard
      title={t("quadrant.urgent_not_important")}
      value={quadrantCounts[2]}
      icon={<ClockIcon />}
      color="#faad14"
    />
    <StatisticsCard
      title={t("quadrant.not_urgent_not_important")}
      value={quadrantCounts[3]}
      icon={<CheckCircleIcon />}
      color="#52c41a"
    />
  </div>
);

export default QuadrantStats;
