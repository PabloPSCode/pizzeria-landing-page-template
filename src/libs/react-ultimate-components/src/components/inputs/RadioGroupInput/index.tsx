"use client";

import clsx from "clsx";
import { forwardRef, useId } from "react";
import type { ReactNode } from "react";

export type Option = {
  label: ReactNode;
  value: string | number;
  description?: ReactNode;
  disabled?: boolean;
};

interface RadioGroupInputProps {
  options: Option[];
  /** Rótulo do campo (exibido acima do input). */
  label: ReactNode;
  /** Texto de ajuda (exibido abaixo do input quando não há erro). */
  helperText?: ReactNode;
  /** Mensagem de erro (prioridade sobre o helperText). */
  errorMessage?: ReactNode;
  /** Classe opcional para o contêiner externo. */
  containerClassName?: string;
  /** Se o grupo de rádio está desabilitado */
  disabled?: boolean;
  /** Nome do grupo para evitar conflito com outros radios na tela. */
  name?: string;
  /** Valor selecionado para modo controlado. */
  value?: string | number | null;
  labelClassName?: string;
  optionsContainerClassName?: string;
  optionClassName?: string;
  optionLabelClassName?: string;
  optionDescriptionClassName?: string;
  radioClassName?: string;
  helperTextClassName?: string;
  errorClassName?: string;
  onSelectOption: (option: Option) => void;
}

const RadioGroupInput = forwardRef<HTMLDivElement, RadioGroupInputProps>(
  (
    {
      options,
      label,
      helperText,
      errorMessage,
      containerClassName,
      disabled,
      name,
      value,
      labelClassName,
      optionsContainerClassName,
      optionClassName,
      optionLabelClassName,
      optionDescriptionClassName,
      radioClassName,
      helperTextClassName,
      errorClassName,
      onSelectOption,
    }: RadioGroupInputProps,
    ref
  ) => {
    const generatedName = useId();
    const radioGroupName = name ?? `radio-group-${generatedName}`;

    return (
      <div ref={ref} className={clsx("flex flex-col gap-2", containerClassName)}>
        <label
          className={clsx(
            "flex font-bold text-md sm:text-lg text-foreground gap-2 items-center",
            labelClassName
          )}
        >
          {label}
        </label>
        <div className={clsx("flex flex-col gap-2", optionsContainerClassName)}>
          {options.map((option) => (
            <label
              key={option.value}
              className={clsx(
                "text-sm sm:text-base flex items-start gap-3 rounded-xl border border-border-card/70 bg-background/70 px-3 py-3 transition",
                "has-checked:border-primary-500 has-checked:bg-primary-500/5",
                option.disabled && "cursor-not-allowed opacity-60",
                optionClassName
              )}
            >
              <input
                type="radio"
                name={radioGroupName}
                value={option.value}
                checked={value === option.value}
                className={clsx(
                  "mt-1 h-4 w-4 shrink-0 accent-primary-500 sm:h-5 sm:w-5",
                  radioClassName
                )}
                onChange={() => onSelectOption(option)}
                disabled={disabled || option.disabled}
              />
              <span className="flex min-w-0 flex-col">
                <span
                  className={clsx(
                    "font-medium text-foreground",
                    optionLabelClassName
                  )}
                >
                  {option.label}
                </span>
                {option.description ? (
                  <span
                    className={clsx(
                      "text-xs sm:text-sm text-foreground/65",
                      optionDescriptionClassName
                    )}
                  >
                    {option.description}
                  </span>
                ) : null}
              </span>
            </label>
          ))}
        </div>
        {errorMessage ? (
          <p className={clsx("text-red-400 text-xs sm:text-sm", errorClassName)}>
            {errorMessage}
          </p>
        ) : helperText && !disabled ? (
          <p
            className={clsx(
              "text-foreground/70 text-xs sm:text-sm mt-2",
              helperTextClassName
            )}
          >
            {helperText}
          </p>
        ) : null}
      </div>
    );
  }
);

RadioGroupInput.displayName = "RadioGroupInput";

export default RadioGroupInput;
