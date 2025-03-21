import React from 'react';

interface BaseStatisticProps {
  title: string;
  value: string | number;
  valueStyle?: React.CSSProperties;
  className?: string;
}

const BaseStatistic: React.FC<BaseStatisticProps> = ({
  title,
  value,
  valueStyle,
  className
}) => {
  return (
    <div className={className}>
      <div className="text-sm text-gray-500">{title}</div>
      <div className="text-xl font-semibold" style={valueStyle}>
        {value}
      </div>
    </div>
  );
};

export default BaseStatistic;