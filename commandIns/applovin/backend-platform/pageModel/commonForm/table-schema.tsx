import { ProColumnsType } from "table-render";
import { Action } from "./actions";

const properties: ProColumnsType = $columns$;
export const columns: ProColumnsType = [
  ...properties,
  {
    title: "action",
    key: "action",
    render: (_, record) => <Action key={"ActionSchema" + record.name} />,
  },
];
