import {
  Box,
  Button,
  Group,
  Select,
  TextInput,
  Grid,
  NumberInput,
} from "@mantine/core";
import { Indicators, PriceType } from "@shared/enums";
import { indicatorOptions } from "@shared/indicator.options";

import { useForm } from "@mantine/form";
import _ from "lodash";

export const IndicatorOptions = ({ indicator }: { indicator: Indicators }) => {
  const form = useForm({
    initialValues: Object.fromEntries(
      Object.entries(indicatorOptions[indicator]).map(([key, value]) => [
        key,
        value.default,
      ])
    ),

    validate: Object.fromEntries(
      Object.entries(indicatorOptions[indicator]).map(([key, value]) => [
        key,
        (toValidation: string) => {
          if (value.validator) {
            console.log(key, value.validator.safeParse(toValidation));
            const validationResult = value.validator.safeParse(toValidation);
            if (validationResult.success) return null;
            return "invalid value";
          }
          return null;
        },
      ])
    ),
  });
  const debouncedValidation = _.debounce(function () {
    console.log(form.values);
    return form.validate();
  }, 100);
  return (
    <Grid>
      {Object.entries(indicatorOptions[indicator]).map(([name, v]) => {
        const { type } = v;
        if (type === "int")
          return (
            <Grid.Col span={4}>
              <NumberInput
                withAsterisk
                label={name}
                step={1}
                placeholder=""
                {...form.getInputProps(name)}
                onChange={(value) => form.setFieldValue(name, value as any)}
              />
            </Grid.Col>
          );
        if (type === PriceType)
          return (
            <Grid.Col span={4}>
              <Select
                label="Select indicator"
                placeholder="indicator"
                data={Object.values(PriceType).map((type) => ({
                  value: type,
                  label: type,
                }))}
                onChange={(value) => form.setFieldValue(name, value as any)}
              />
            </Grid.Col>
          );
      })}
    </Grid>
  );
};
