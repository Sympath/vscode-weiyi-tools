export const ActionSchema = {
  type: "object",
  displayType: "row",
  column: 1,
  properties: {
    name: {
      title: "App Name",
      type: "string",
      widget: "input",
    },
    owners: {
      title: "Owners",
      type: "array",
      widget: "multiSelect",
      enum: ["Owner A", "Owner B", "Owner C", "Owner D", "Owner E"],
      enumNames: ["Owner A", "Owner B", "Owner C", "Owner D", "Owner E"],
    },
  },
};
export const AddSchema = {
  type: "object",
  displayType: "row",
  column: 1,
  properties: $AddSchema$,
};
