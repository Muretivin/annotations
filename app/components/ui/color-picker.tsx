'use client';


interface ColorPickerProps {
  value: string;
  onChange: (color: string) => void;
}

const ColorPicker = ({ value, onChange }: ColorPickerProps) => {
  const colors = [
    '#FFEB3B', // Yellow
    '#FF9800', // Orange
    '#F44336', // Red
    '#4CAF50', // Green
    '#2196F3', // Blue
    '#9C27B0', // Purple
  ];

  return (
    <div className="flex items-center space-x-1">
      {colors.map((color) => (
        <button
          key={color}
          type="button"
          className={`w-6 h-6 rounded-full ${value === color ? 'ring-2 ring-offset-2 ring-gray-400' : ''}`}
          style={{ backgroundColor: color }}
          onClick={() => onChange(color)}
        />
      ))}
    </div>
  );
};

export { ColorPicker};