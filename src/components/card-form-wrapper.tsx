"use client";

import React from 'react';
import { useFormContext } from 'react-hook-form';
import { CardFormProps } from './card-form';

interface Props {
  onChange: (data: any) => void;
}

export const CardFormWrapper: React.FC<CardFormProps & Props> = ({ onChange, ...props }) => {
  const { watch, trigger } = useFormContext();

  React.useEffect(() => {
    trigger()
    onChange(watch());
  }, [watch, onChange, trigger]);

  return (
    <CardForm
      {...props}
    />
  );
};
