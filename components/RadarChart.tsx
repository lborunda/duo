import React, { useState, useRef, useEffect } from 'react';

export const capitalize = (s: string) =>
  typeof s === 'string' && s.length > 0 ? s.charAt(0).toUpperCase() + s.slice(1) : '';

interface RadarChartProps {
  data: { name: string; value: number }[];
  onDataChange: (data: { name: string; value: number }[]) => void;
}

export const RadarChart: React.FC<RadarChartProps> = ({ data, onDataChange }) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [draggingPoint, setDraggingPoint] = useState<number | null>(null);
  const size = 300;
  const center = size / 2;
  const radius = center * 0.8;

  if (!data || data.length === 0) {
    return <p className="text-center text-stone-500">No interest data available.</p>;
  }

  const angleSlice = (Math.PI * 2) / data.length;

  const getPointCoords = (value: number, angle: number) => {
    const x = center + radius * value * Math.cos(angle - Math.PI / 2);
    const y = center + radius * value * Math.sin(angle - Math.PI / 2);
    return { x, y };
  };

  const handleMouseMove = (event: MouseEvent | TouchEvent) => {
    if (draggingPoint === null || !svgRef.current) return;
    event.preventDefault();

    const svgPoint = svgRef.current.createSVGPoint();
    const clientX = 'touches' in event ? event.touches[0].clientX : event.clientX;
    const clientY = 'touches' in event ? event.touches[0].clientY : event.clientY;
    svgPoint.x = clientX;
    svgPoint.y = clientY;

    const { x, y } = svgPoint.matrixTransform(svgRef.current.getScreenCTM()?.inverse());
    const dx = x - center;
    const dy = y - center;
    const angle = angleSlice * draggingPoint;
    const projectedLength = dx * Math.cos(angle - Math.PI / 2) + dy * Math.sin(angle - Math.PI / 2);

    let newValue = projectedLength / radius;
    newValue = Math.max(0, Math.min(1, newValue));

    const newData = [...data];
    newData[draggingPoint].value = newValue;
    onDataChange(newData);
  };

  const handleMouseUp = () => {
    setDraggingPoint(null);
  };

  useEffect(() => {
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('touchmove', handleMouseMove, { passive: false });
    document.addEventListener('touchend', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('touchmove', handleMouseMove);
      document.removeEventListener('touchend', handleMouseUp);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [draggingPoint, data]);

  const points = data.map((item, i) => getPointCoords(item.value, angleSlice * i));
  const pathData = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x},${p.y}`).join(' ') + ' Z';

  return (
    <svg ref={svgRef} width="100%" viewBox={`0 0 ${size} ${size}`}>
      {/* Grid circles */}
      <g stroke="#e5e7eb" strokeWidth="1">
        {[...Array(5)].map((_, i) => (
          <circle key={i} cx={center} cy={center} r={(radius / 5) * (i + 1)} fill="none" />
        ))}
      </g>

      {/* Axes and labels */}
      <g>
        {data.map((item, i) => {
          const angle = angleSlice * i;
          const endPoint = getPointCoords(1, angle);
          const labelPoint = getPointCoords(1.15, angle);
          return (
            <g key={item.name}>
              <line x1={center} y1={center} x2={endPoint.x} y2={endPoint.y} stroke="#d1d5db" strokeWidth="1" />
              <text
                x={labelPoint.x}
                y={labelPoint.y}
                textAnchor="middle"
                dominantBaseline="middle"
                fontSize="12"
                fontWeight="500"
                fill="#4b5563"
              >
                {capitalize(item.name)}
              </text>
            </g>
          );
        })}
      </g>

      {/* Data shape and draggable points */}
      <g>
        <path d={pathData} fill="#fb923c" fillOpacity="0.4" stroke="#f97316" strokeWidth="2" />
        {points.map((p, i) => (
          <circle
            key={i}
            cx={p.x}
            cy={p.y}
            r="8"
            fill="white"
            stroke="#f97316"
            strokeWidth="3"
            cursor="pointer"
            onMouseDown={() => setDraggingPoint(i)}
            onTouchStart={() => setDraggingPoint(i)}
          />
        ))}
      </g>
    </svg>
  );
};
