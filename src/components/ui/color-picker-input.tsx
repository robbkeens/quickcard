"use client";

import React from 'react';
import { HexColorPicker } from 'react-colorful';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from '@/lib/utils';

interface ColorPickerInputProps {
    value: string;         // Current color value (e.g., #RRGGBB)
    onChange: (color: string) => void; // Callback when color changes
    disabled?: boolean;
    className?: string;
}

export const ColorPickerInput: React.FC<ColorPickerInputProps> = ({ value, onChange, disabled, className }) => {
    // Basic validation or default for invalid color strings
    const currentColor = /^#([0-9A-F]{3}){1,2}$/i.test(value) ? value : '#ffffff';

    return (
        <Popover>
            <PopoverTrigger asChild disabled={disabled}>
                <Button
                    variant={"outline"}
                    className={cn("w-full justify-start text-left font-normal", className)}
                    aria-label="Pick a color"
                >
                    <div className="flex items-center gap-2">
                        <div
                            className="h-4 w-4 rounded !bg-center !bg-cover transition-all border"
                            style={{ background: currentColor }}
                        />
                        <div className="flex-1 truncate">
                            {value ? value.toUpperCase() : 'Select Color'}
                        </div>
                    </div>
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0 border-0" align="start">
                 {/* // Prevent event bubbling to avoid closing the popover when interacting with the input */}
                <div onClick={(e) => e.stopPropagation()} className="p-4 space-y-3">
                     <HexColorPicker color={currentColor} onChange={onChange} />
                     <Input
                         value={value}
                         onChange={(e) => onChange(e.target.value)}
                         placeholder="#FFFFFF"
                         className="mt-2"
                         disabled={disabled}
                     />
                 </div>
            </PopoverContent>
        </Popover>
    );
};
