"use client";

import React, { useState, useCallback } from 'react';
import { SketchPicker } from 'react-color';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface ColorPickerProps {
    value: string | null | undefined; // Current color value (hex code)
    onChange: (color: string) => void; // Function to call when color changes
    disabled?: boolean;
}

export const ColorPicker: React.FC<ColorPickerProps> = ({ value, onChange, disabled }) => {
    const [displayColorPicker, setDisplayColorPicker] = useState(false);
    const [selectedColor, setSelectedColor] = useState(value || '#FFFFFF');

    const handleColorChange = useCallback((color: any) => { // Use 'any' type for color object
        setSelectedColor(color.hex);
        onChange(color.hex);
    }, [onChange]);

    // Keep the selectedColor state in sync with the value prop (for controlled component behavior)
    React.useEffect(() => {
        setSelectedColor(value || '#FFFFFF');
    }, [value]);

    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button variant="outline" className="w-[100px] justify-start text-left font-normal"
                    disabled={disabled}
                >
                    <span
                        className="block w-2 h-2 rounded-full mr-2"
                        style={{ backgroundColor: selectedColor }}
                    />
                    {selectedColor}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" side="bottom" align="start">
                <SketchPicker
                    color={selectedColor}
                    onChange={handleColorChange}
                    disableAlpha={true} // Disable alpha channel if you only want hex codes
                />
            </PopoverContent>
        </Popover>
    );
};
