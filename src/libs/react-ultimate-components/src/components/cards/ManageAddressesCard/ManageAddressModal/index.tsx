"use client";

/* eslint-disable react-hooks/set-state-in-effect */
import cep from "cep-promise";
import clsx from "clsx";
import { useEffect, useMemo, useState } from "react";
import MaskedTextInput from "../../../inputs/MaskedTextInput";
import TextInput from "../../../inputs/TextInput";
import GenericModal from "../../../modals/GenericModal";
import type { Address } from "..";

export type ManageAddressFormValues = Omit<Address, "id">;

interface ManageAddressModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (values: ManageAddressFormValues) => void;
  mode: "create" | "edit";
  initialValues?: Address | null;
}

const emptyFormValues: ManageAddressFormValues = {
  label: "",
  address: "",
  residenceNumber: "",
  complement: "",
  neighborhood: "",
  zipCode: "",
  country: "Brasil",
};

const normalizeZipCode = (value: string) => value.replace(/\D/g, "");

const formatZipCode = (value: string) => {
  const digits = normalizeZipCode(value).slice(0, 8);

  if (digits.length <= 5) {
    return digits;
  }

  return `${digits.slice(0, 5)}-${digits.slice(5)}`;
};

const resolveZipCodeErrorMessage = (error: unknown) => {
  if (!error || typeof error !== "object") {
    return "Não foi possível localizar o CEP informado.";
  }

  const cepError = error as {
    type?: string;
  };

  if (cepError.type === "validation_error") {
    return "Informe um CEP válido com 8 dígitos.";
  }

  return "Não foi possível localizar o CEP informado.";
};

export default function ManageAddressModal({
  isOpen,
  onClose,
  onSubmit,
  mode,
  initialValues,
}: ManageAddressModalProps) {
  const [formValues, setFormValues] =
    useState<ManageAddressFormValues>(emptyFormValues);
  const [isFetchingZipCode, setIsFetchingZipCode] = useState(false);
  const [zipCodeErrorMessage, setZipCodeErrorMessage] = useState<string>();
  const [resolvedZipCode, setResolvedZipCode] = useState<string | null>(null);

  const normalizedZipCode = useMemo(
    () => normalizeZipCode(formValues.zipCode),
    [formValues.zipCode]
  );

  useEffect(() => {
    if (initialValues && isOpen) {
      setFormValues({
        label: initialValues.label,
        address: initialValues.address,
        residenceNumber: initialValues.residenceNumber,
        complement: initialValues.complement ?? "",
        neighborhood: initialValues.neighborhood,
        zipCode: initialValues.zipCode,
        country: initialValues.country ?? "Brasil",
      });
      setResolvedZipCode(normalizeZipCode(initialValues.zipCode));
    } else if (isOpen) {
      setFormValues(emptyFormValues);
      setResolvedZipCode(null);
    }

    setIsFetchingZipCode(false);
    setZipCodeErrorMessage(undefined);
  }, [initialValues, isOpen]);

  useEffect(() => {
    if (!isOpen || normalizedZipCode.length !== 8) {
      setIsFetchingZipCode(false);
      return;
    }

    if (resolvedZipCode === normalizedZipCode) {
      return;
    }

    let isCancelled = false;

    const fetchZipCodeData = async () => {
      setIsFetchingZipCode(true);
      setZipCodeErrorMessage(undefined);

      try {
        const zipCodeData = await cep(normalizedZipCode);

        if (isCancelled) {
          return;
        }

        setFormValues((previousValues) => ({
          ...previousValues,
          zipCode: formatZipCode(zipCodeData.cep),
          address: zipCodeData.street || previousValues.address,
          neighborhood: zipCodeData.neighborhood || previousValues.neighborhood,
          country: previousValues.country || "Brasil",
        }));
        setResolvedZipCode(normalizedZipCode);
      } catch (error) {
        if (isCancelled) {
          return;
        }

        setZipCodeErrorMessage(resolveZipCodeErrorMessage(error));
      } finally {
        if (!isCancelled) {
          setIsFetchingZipCode(false);
        }
      }
    };

    void fetchZipCodeData();

    return () => {
      isCancelled = true;
    };
  }, [isOpen, normalizedZipCode, resolvedZipCode]);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;

    if (name === "zipCode") {
      const nextNormalizedZipCode = normalizeZipCode(value);

      setZipCodeErrorMessage(undefined);
      if (nextNormalizedZipCode.length !== 8) {
        setIsFetchingZipCode(false);
      }
      setResolvedZipCode((currentResolvedZipCode) =>
        currentResolvedZipCode === nextNormalizedZipCode
          ? currentResolvedZipCode
          : null
      );
    }

    setFormValues((previousValues) => ({ ...previousValues, [name]: value }));
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onSubmit(formValues);
  };

  const isValid = useMemo(() => {
    return (
      formValues.label.trim() !== "" &&
      formValues.address.trim() !== "" &&
      formValues.residenceNumber.trim() !== "" &&
      formValues.neighborhood.trim() !== "" &&
      formValues.zipCode.trim() !== ""
    );
  }, [formValues]);

  const actionLabel =
    mode === "edit" ? "Salvar alterações" : "Cadastrar endereço";
  const title = mode === "edit" ? "Editar endereço" : "Novo endereço";

  return (
    <GenericModal
      title={title}
      open={isOpen}
      onClose={onClose}
      size="xl"
      className={clsx("max-w-3xl", "[&>div:last-child]:hidden")}
      showCancelButton={false}
      showConfirmButton={false}
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <TextInput
          label="Identificação*"
          name="label"
          value={formValues.label}
          onChange={handleChange}
          placeholder="Casa, trabalho..."
          required
        />

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <MaskedTextInput
            mask="00000-000"
            label="CEP*"
            name="zipCode"
            value={formValues.zipCode}
            onChange={handleChange}
            placeholder="00000-000"
            helperText={
              isFetchingZipCode
                ? "Buscando endereço automaticamente..."
                : "Ao informar o CEP, rua e bairro são preenchidos automaticamente."
            }
            errorMessage={zipCodeErrorMessage}
            required
          />
          <TextInput
            label="Bairro*"
            name="neighborhood"
            value={formValues.neighborhood}
            onChange={handleChange}
            placeholder="Bairro"
            required
          />
        </div>

        <TextInput
          label="Logradouro*"
          name="address"
          value={formValues.address}
          onChange={handleChange}
          placeholder="Rua, avenida..."
          required
        />

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <TextInput
            label="Número*"
            name="residenceNumber"
            value={formValues.residenceNumber}
            onChange={handleChange}
            placeholder="123"
            required
          />
          <TextInput
            label="Complemento"
            name="complement"
            value={formValues.complement}
            onChange={handleChange}
            placeholder="Apartamento, bloco..."
          />
        </div>

        <div className="flex flex-col justify-end gap-3 pt-2 sm:flex-row">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex items-center justify-center rounded-md border border-border-card px-4 py-2 text-xs font-medium text-foreground sm:text-sm"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={!isValid}
            className="inline-flex items-center justify-center rounded-md bg-primary-500 px-4 py-2 text-xs font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60 sm:text-sm"
          >
            {actionLabel}
          </button>
        </div>
      </form>
    </GenericModal>
  );
}
