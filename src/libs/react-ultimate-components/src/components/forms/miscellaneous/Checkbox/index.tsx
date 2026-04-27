"use client";

import CheckBox, { type CheckboxChangeEvent } from "rc-checkbox";
import clsx from "clsx";
import type { ReactNode } from "react";

interface CheckboxProps {
  /** Se o checkbox está marcado ou não */
  checked?: boolean;
  /** Função chamada quando o estado do checkbox muda */
  onChange?: (e: CheckboxChangeEvent) => void;
  /** Texto de ajuda (exibido ao lado do checkbox) */
  helperText?: ReactNode;
  /** Texto complementar exibido abaixo do rótulo. */
  description?: ReactNode;
  /** Mensagem de erro (exibida abaixo do checkbox) */
  errorMessage?: ReactNode;
  /** Se o checkbox está desabilitado */
  disabled?: boolean;
  id?: string;
  name?: string;
  containerClassName?: string;
  wrapperClassName?: string;
  inputClassName?: string;
  labelClassName?: string;
  descriptionClassName?: string;
  errorClassName?: string;
}

export default function Checkbox({
  checked,
  onChange,
  helperText,
  description,
  errorMessage,
  disabled = false,
  id,
  name,
  containerClassName,
  wrapperClassName,
  inputClassName,
  labelClassName,
  descriptionClassName,
  errorClassName,
}: CheckboxProps) {
  return (
    <div className={clsx("block gap-4", containerClassName)}>
      <div className={clsx("flex items-start gap-2 mt-1", wrapperClassName)}>
        <CheckBox
          id={id}
          name={name}
          checked={checked}
          onChange={onChange}
          disabled={disabled}
          className={clsx(
            "mt-0.5 inline-flex items-center justify-center",
            "[&.rc-checkbox-checked_.rc-checkbox-inner]:!bg-primary-600",
            "[&.rc-checkbox-checked_.rc-checkbox-inner]:!border-primary-600",
            "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-400/40",
            inputClassName
          )}
        />
        {(helperText || description) && (
          <span className="flex flex-col">
            {helperText ? (
              <span
                className={clsx(
                  "flex font-medium text-sm sm:text-base text-foreground -mt-[2px]",
                  labelClassName
                )}
              >
                {helperText}
              </span>
            ) : null}
            {description ? (
              <span
                className={clsx(
                  "text-xs sm:text-sm text-foreground/65",
                  descriptionClassName
                )}
              >
                {description}
              </span>
            ) : null}
          </span>
        )}
      </div>
      {errorMessage && (
        <p className={clsx("text-red-400 text-xs sm:text-sm", errorClassName)}>
          {errorMessage}
        </p>
      )}
    </div>
  );
}
